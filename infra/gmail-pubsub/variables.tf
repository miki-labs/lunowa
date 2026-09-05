variable "project_id" {
  description = "Google Cloud project that owns the Gmail watch topic."
  type        = string
}

variable "topic_name" {
  description = "Pub/Sub topic name supplied to Gmail users.watch."
  type        = string
  default     = "lunowa-gmail"
}

variable "subscription_name" {
  description = "Authenticated push subscription name."
  type        = string
  default     = "lunowa-gmail-push"
}

variable "push_service_account_id" {
  description = "Account ID used by Pub/Sub to mint callback OIDC tokens."
  type        = string
  default     = "lunowa-gmail-push"
}

variable "push_endpoint" {
  description = "Externally reachable HTTPS /api/providers/gmail/pubsub URL."
  type        = string

  validation {
    condition     = can(regex("^https://[^/]+/api/providers/gmail/pubsub$", var.push_endpoint))
    error_message = "push_endpoint must be the deployed HTTPS Gmail Pub/Sub callback."
  }
}

variable "oidc_audience" {
  description = "Exact audience verified by the Gmail Pub/Sub callback."
  type        = string

  validation {
    condition     = can(regex("^https://", var.oidc_audience))
    error_message = "oidc_audience must be an HTTPS audience."
  }
}
