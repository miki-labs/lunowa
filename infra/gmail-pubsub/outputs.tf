output "gmail_pubsub_topic" {
  description = "Set as GMAIL_PUBSUB_TOPIC."
  value       = google_pubsub_topic.gmail.id
}

output "gmail_pubsub_service_account" {
  description = "Set as GMAIL_PUBSUB_SERVICE_ACCOUNT."
  value       = google_service_account.pubsub_push.email
}

output "gmail_pubsub_audience" {
  description = "Set as GMAIL_PUBSUB_AUDIENCE."
  value       = var.oidc_audience
}
