# Human Tasks:
# 1. Ensure AWS credentials are properly configured with permissions to manage CloudFront distributions
# 2. Verify that SSL certificates are available in AWS Certificate Manager if using custom domains
# 3. Configure Route 53 DNS records to point to the CloudFront distribution after creation
# 4. Review and adjust cache behaviors and TTL settings based on application needs
# 5. Ensure WAF rules are properly configured if web_acl_id is provided

# AWS Provider version 5.0.0
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }
}

# Requirement Addressed: Content Delivery Network Configuration
# Technical Specification/System Design/Infrastructure Requirements
# Provides a scalable and reliable content delivery network for serving static assets and media files globally.
resource "aws_cloudfront_distribution" "main" {
  # Basic Distribution Settings
  enabled             = var.enabled
  is_ipv6_enabled     = var.is_ipv6_enabled
  comment             = var.comment
  default_root_object = var.default_root_object
  web_acl_id          = var.web_acl_id
  price_class         = var.price_class
  
  # Origin Configuration
  origin {
    domain_name = var.origin.domain_name
    origin_id   = var.origin.origin_id

    dynamic "s3_origin_config" {
      for_each = var.origin.origin_access_identity != null ? [1] : []
      content {
        origin_access_identity = var.origin.origin_access_identity
      }
    }

    dynamic "custom_origin_config" {
      for_each = var.origin.custom_origin_config != null ? [1] : []
      content {
        http_port              = var.origin.custom_origin_config.http_port
        https_port             = var.origin.custom_origin_config.https_port
        origin_protocol_policy = var.origin.custom_origin_config.origin_protocol_policy
        origin_ssl_protocols   = var.origin.custom_origin_config.origin_ssl_protocols
      }
    }
  }

  # Default Cache Behavior
  default_cache_behavior {
    allowed_methods  = var.default_cache_behavior.allowed_methods
    cached_methods   = var.default_cache_behavior.cached_methods
    target_origin_id = var.default_cache_behavior.target_origin_id

    viewer_protocol_policy = var.default_cache_behavior.viewer_protocol_policy
    compress              = var.default_cache_behavior.compress

    min_ttl     = var.default_cache_behavior.min_ttl
    default_ttl = var.default_cache_behavior.default_ttl
    max_ttl     = var.default_cache_behavior.max_ttl

    dynamic "forwarded_values" {
      for_each = var.default_cache_behavior.forwarded_values != null ? [1] : []
      content {
        query_string = var.default_cache_behavior.forwarded_values.query_string
        
        cookies {
          forward           = var.default_cache_behavior.forwarded_values.cookies.forward
          whitelisted_names = var.default_cache_behavior.forwarded_values.cookies.whitelisted_names
        }

        headers = var.default_cache_behavior.forwarded_values.headers
      }
    }
  }

  # Viewer Certificate Configuration
  viewer_certificate {
    acm_certificate_arn            = var.viewer_certificate.acm_certificate_arn
    cloudfront_default_certificate = var.viewer_certificate.cloudfront_default_certificate
    minimum_protocol_version       = var.viewer_certificate.minimum_protocol_version
    ssl_support_method            = var.viewer_certificate.ssl_support_method
  }

  # Geographic Restrictions
  restrictions {
    geo_restriction {
      restriction_type = var.restrictions.geo_restriction.restriction_type
      locations        = var.restrictions.geo_restriction.locations
    }
  }

  # Custom Error Responses
  dynamic "custom_error_response" {
    for_each = var.custom_error_responses
    content {
      error_code            = custom_error_response.value.error_code
      response_code         = custom_error_response.value.response_code
      response_page_path    = custom_error_response.value.response_page_path
      error_caching_min_ttl = custom_error_response.value.error_caching_min_ttl
    }
  }

  # Tags
  tags = merge(
    var.tags,
    {
      Name        = "cloudfront-distribution-${var.environment}"
      Environment = var.environment
    }
  )

  # Ensure the distribution is created in the specified region
  provider = aws.global
}

# Provider configuration for CloudFront (must be in us-east-1)
provider "aws" {
  alias  = "global"
  region = "us-east-1"  # CloudFront requires certificates from us-east-1 region
}