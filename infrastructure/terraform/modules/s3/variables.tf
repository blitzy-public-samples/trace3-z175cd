# This file defines input variables for configuring the S3 module
# Addresses requirement: Object Storage Configuration
# Technical Specification/System Design/Infrastructure Requirements

variable "bucket_name" {
  description = "The name of the S3 bucket."
  type        = string
  default     = "my-default-bucket"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]*[a-z0-9]$", var.bucket_name))
    error_message = "Bucket name must be lowercase alphanumeric characters, dots, and hyphens, start and end with alphanumeric."
  }
}

variable "region" {
  description = "The AWS region where the S3 bucket will be created."
  type        = string
  default     = "us-east-1"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]{1}$", var.region))
    error_message = "Region must be a valid AWS region format (e.g., us-east-1, eu-west-1)."
  }
}

variable "tags" {
  description = "Tags to apply to the S3 bucket."
  type        = map(string)
  default = {
    Environment = "Development"
    Project     = "Substack Replica"
  }

  validation {
    condition     = length(var.tags) > 0
    error_message = "At least one tag must be provided."
  }
}

variable "access_policy" {
  description = "The access control policy for the S3 bucket."
  type        = string
  default     = "private"

  validation {
    condition     = contains(["private", "public-read", "authenticated-read"], var.access_policy)
    error_message = "Access policy must be one of: private, public-read, or authenticated-read."
  }
}

# Optional variables for enhanced bucket configuration
variable "versioning_enabled" {
  description = "Enable versioning for the S3 bucket."
  type        = bool
  default     = true
}

variable "encryption_enabled" {
  description = "Enable server-side encryption for the S3 bucket."
  type        = bool
  default     = true
}

variable "lifecycle_rules" {
  description = "List of lifecycle rules to be applied to the bucket."
  type = list(object({
    enabled                                = bool
    id                                    = string
    prefix                                = string
    expiration_days                       = number
    transition_to_standard_ia_days        = number
    transition_to_intelligent_tiering_days = number
  }))
  default = []
}

variable "cors_rules" {
  description = "List of CORS rules to be applied to the bucket."
  type = list(object({
    allowed_headers = list(string)
    allowed_methods = list(string)
    allowed_origins = list(string)
    expose_headers  = list(string)
    max_age_seconds = number
  }))
  default = []
}

variable "replication_enabled" {
  description = "Enable cross-region replication for the S3 bucket."
  type        = bool
  default     = false
}

variable "replication_destination_bucket" {
  description = "ARN of the destination bucket for cross-region replication."
  type        = string
  default     = ""
}

variable "logging_enabled" {
  description = "Enable access logging for the S3 bucket."
  type        = bool
  default     = true
}

variable "logging_target_bucket" {
  description = "Target bucket for access logs."
  type        = string
  default     = ""
}

variable "logging_target_prefix" {
  description = "Prefix for access logs."
  type        = string
  default     = "logs/"
}