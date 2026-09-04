data "google_project" "current" {
  project_id = var.project_id
}

resource "google_project_service" "pubsub" {
  project            = var.project_id
  service            = "pubsub.googleapis.com"
  disable_on_destroy = false
}

resource "google_pubsub_topic" "gmail" {
  name       = var.topic_name
  project    = var.project_id
  depends_on = [google_project_service.pubsub]
}

# Gmail cannot publish watch notifications until this Google-managed identity
# has topic-level publish authority.
resource "google_pubsub_topic_iam_member" "gmail_api_publisher" {
  project = var.project_id
  topic   = google_pubsub_topic.gmail.name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:gmail-api-push@system.gserviceaccount.com"
}

resource "google_service_account" "pubsub_push" {
  project      = var.project_id
  account_id   = var.push_service_account_id
  display_name = "Lunowa Gmail authenticated Pub/Sub push"
}

# Authenticated push requires the Pub/Sub service agent to mint an OIDC token
# as the selected callback identity.
resource "google_service_account_iam_member" "pubsub_oidc_token_creator" {
  service_account_id = google_service_account.pubsub_push.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:service-${data.google_project.current.number}@gcp-sa-pubsub.iam.gserviceaccount.com"
  depends_on         = [google_project_service.pubsub]
}

resource "google_pubsub_subscription" "gmail_push" {
  name    = var.subscription_name
  project = var.project_id
  topic   = google_pubsub_topic.gmail.id

  ack_deadline_seconds = 30

  push_config {
    push_endpoint = var.push_endpoint

    oidc_token {
      service_account_email = google_service_account.pubsub_push.email
      audience              = var.oidc_audience
    }
  }

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  depends_on = [
    google_pubsub_topic_iam_member.gmail_api_publisher,
    google_service_account_iam_member.pubsub_oidc_token_creator
  ]
}
