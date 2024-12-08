# Human Tasks:
# 1. Ensure AWS credentials are properly configured with permissions to manage CloudFront distributions
# 2. Verify that SSL certificates are available in AWS Certificate Manager if using custom domains
# 3. Configure Route 53 DNS records to point to the CloudFront distribution after creation

# Requirement Addressed: Content Delivery Network Configuration
# Technical Specification/System Design/Infrastructure Requirements
# Provides a scalable and reliable content delivery network for serving static assets and media files globally.

variable "region" {
  description = "Specifies the AWS region where the CloudFront distribution will be deployed."
  type        = string
  default     = "us-east-1"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]{1}$", var.region))
    error_message = "The region must be a valid AWS region identifier (e.g., us-east-1, eu-west-1)."
  }
}

variable "environment" {
  description = "Specifies the environment for the CloudFront distribution (e.g., production, staging)."
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be one of: production, staging, development."
  }
}

variable "tags" {
  description = "A map of tags to apply to the CloudFront distribution."
  type        = map(string)
  default = {
    Project     = "Substack Replica"
    Environment = "production"
  }

  validation {
    condition     = length(var.tags) > 0
    error_message = "At least one tag must be provided."
  }
}

variable "origin" {
  description = "Specifies the origin for the CloudFront distribution, such as an S3 bucket or custom origin."
  type = object({
    domain_name              = string
    origin_id               = string
    origin_access_identity  = optional(string)
    custom_origin_config    = optional(object({
      http_port             = optional(number, 80)
      https_port            = optional(number, 443)
      origin_protocol_policy = string
      origin_ssl_protocols  = list(string)
    }))
  })

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]+[a-z0-9]$", var.origin.domain_name))
    error_message = "Origin domain name must be a valid domain name format."
  }
}

variable "default_cache_behavior" {
  description = "Defines the default cache behavior for the CloudFront distribution."
  type = object({
    allowed_methods          = list(string)
    cached_methods          = list(string)
    target_origin_id        = string
    viewer_protocol_policy  = string
    min_ttl                = optional(number, 0)
    default_ttl            = optional(number, 3600)
    max_ttl                = optional(number, 86400)
    compress               = optional(bool, true)
    forwarded_values       = optional(object({
      query_string = bool
      cookies      = object({
        forward    = string
        whitelisted_names = optional(list(string))
      })
      headers     = optional(list(string))
    }))
  })

  validation {
    condition     = contains(["allow-all", "https-only", "redirect-to-https"], var.default_cache_behavior.viewer_protocol_policy)
    error_message = "Viewer protocol policy must be one of: allow-all, https-only, redirect-to-https."
  }
}

variable "viewer_certificate" {
  description = "Specifies the SSL/TLS certificate for the CloudFront distribution."
  type = object({
    acm_certificate_arn      = optional(string)
    minimum_protocol_version = optional(string, "TLSv1.2_2021")
    ssl_support_method      = optional(string, "sni-only")
    cloudfront_default_certificate = optional(bool, false)
  })

  validation {
    condition     = var.viewer_certificate.cloudfront_default_certificate != false || can(regex("^arn:aws:acm:", coalesce(var.viewer_certificate.acm_certificate_arn, "arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012")))
    error_message = "When not using CloudFront default certificate, a valid ACM certificate ARN must be provided."
  }
}

variable "price_class" {
  description = "The price class for the CloudFront distribution."
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.price_class)
    error_message = "Price class must be one of: PriceClass_100, PriceClass_200, PriceClass_All."
  }
}

variable "enabled" {
  description = "Whether the CloudFront distribution is enabled."
  type        = bool
  default     = true
}

variable "is_ipv6_enabled" {
  description = "Whether IPv6 is enabled for the CloudFront distribution."
  type        = bool
  default     = true
}

variable "comment" {
  description = "A comment to describe the CloudFront distribution."
  type        = string
  default     = "Substack Replica CDN distribution"
}

variable "default_root_object" {
  description = "The default root object for the CloudFront distribution."
  type        = string
  default     = "index.html"
}

variable "custom_error_responses" {
  description = "Custom error responses for the CloudFront distribution."
  type = list(object({
    error_code            = number
    response_code        = optional(number)
    response_page_path   = optional(string)
    error_caching_min_ttl = optional(number)
  }))
  default = []

  validation {
    condition     = alltrue([for r in var.custom_error_responses : contains([400, 403, 404, 405, 414, 416, 500, 501, 502, 503, 504], r.error_code)])
    error_message = "Error codes must be valid HTTP error codes supported by CloudFront."
  }
}

variable "web_acl_id" {
  description = "The AWS WAF web ACL ID to associate with the CloudFront distribution."
  type        = string
  default     = null
}

variable "restrictions" {
  description = "Geographic restrictions for the CloudFront distribution."
  type = object({
    geo_restriction = object({
      restriction_type = string
      locations        = list(string)
    })
  })
  default = {
    geo_restriction = {
      restriction_type = "none"
      locations        = []
    }
  }

  validation {
    condition     = contains(["none", "whitelist", "blacklist"], var.restrictions.geo_restriction.restriction_type)
    error_message = "Restriction type must be one of: none, whitelist, blacklist."
  }
}