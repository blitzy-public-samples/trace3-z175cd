# AWS S3 Module - Main Configuration
# Provider version: hashicorp/aws v5.0.0
# Addresses requirement: Object Storage Configuration
# Technical Specification/System Design/Infrastructure Requirements

# Human Tasks:
# 1. Ensure AWS credentials are properly configured
# 2. Verify that the target AWS region supports all enabled features
# 3. Review and adjust bucket policies according to security requirements
# 4. Configure logging target bucket if logging is enabled
# 5. Set up replication IAM roles if replication is enabled

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }
}

# Create the S3 bucket with basic configuration
resource "aws_s3_bucket" "bucket" {
  bucket = var.bucket_name
  tags   = var.tags

  # Force destroy is set to false for production safety
  force_destroy = false
}

# Configure bucket ACL
resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.bucket.id
  acl    = var.access_policy
}

# Enable versioning
resource "aws_s3_bucket_versioning" "bucket_versioning" {
  bucket = aws_s3_bucket.bucket.id
  versioning_configuration {
    status = var.versioning_enabled ? "Enabled" : "Disabled"
  }
}

# Configure server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "bucket_encryption" {
  bucket = aws_s3_bucket.bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Configure public access block
resource "aws_s3_bucket_public_access_block" "bucket_public_access_block" {
  bucket = aws_s3_bucket.bucket.id

  block_public_acls       = var.access_policy == "private" ? true : false
  block_public_policy     = var.access_policy == "private" ? true : false
  ignore_public_acls      = var.access_policy == "private" ? true : false
  restrict_public_buckets = var.access_policy == "private" ? true : false
}

# Configure bucket lifecycle rules if specified
resource "aws_s3_bucket_lifecycle_configuration" "bucket_lifecycle" {
  count  = length(var.lifecycle_rules) > 0 ? 1 : 0
  bucket = aws_s3_bucket.bucket.id

  dynamic "rule" {
    for_each = var.lifecycle_rules
    content {
      id     = rule.value.id
      status = rule.value.enabled ? "Enabled" : "Disabled"

      filter {
        prefix = rule.value.prefix
      }

      transition {
        days          = rule.value.transition_to_standard_ia_days
        storage_class = "STANDARD_IA"
      }

      transition {
        days          = rule.value.transition_to_intelligent_tiering_days
        storage_class = "INTELLIGENT_TIERING"
      }

      expiration {
        days = rule.value.expiration_days
      }
    }
  }
}

# Configure CORS if rules are specified
resource "aws_s3_bucket_cors_configuration" "bucket_cors" {
  count  = length(var.cors_rules) > 0 ? 1 : 0
  bucket = aws_s3_bucket.bucket.id

  dynamic "cors_rule" {
    for_each = var.cors_rules
    content {
      allowed_headers = cors_rule.value.allowed_headers
      allowed_methods = cors_rule.value.allowed_methods
      allowed_origins = cors_rule.value.allowed_origins
      expose_headers  = cors_rule.value.expose_headers
      max_age_seconds = cors_rule.value.max_age_seconds
    }
  }
}

# Configure bucket logging if enabled
resource "aws_s3_bucket_logging" "bucket_logging" {
  count  = var.logging_enabled && var.logging_target_bucket != "" ? 1 : 0
  bucket = aws_s3_bucket.bucket.id

  target_bucket = var.logging_target_bucket
  target_prefix = var.logging_target_prefix
}

# Configure replication if enabled
resource "aws_s3_bucket_replication_configuration" "bucket_replication" {
  count  = var.replication_enabled && var.replication_destination_bucket != "" ? 1 : 0
  bucket = aws_s3_bucket.bucket.id
  role   = aws_iam_role.replication[0].arn

  rule {
    id     = "ReplicationRule"
    status = "Enabled"

    destination {
      bucket = var.replication_destination_bucket
    }
  }

  depends_on = [aws_s3_bucket_versioning.bucket_versioning]
}

# Create IAM role for replication if enabled
resource "aws_iam_role" "replication" {
  count = var.replication_enabled && var.replication_destination_bucket != "" ? 1 : 0
  name  = "s3-bucket-replication-${var.bucket_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
      }
    ]
  })
}

# Create bucket policy
data "aws_iam_policy_document" "bucket_policy" {
  statement {
    sid    = "EnforceTLS"
    effect = "Deny"
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.bucket.arn,
      "${aws_s3_bucket.bucket.arn}/*"
    ]
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }

  statement {
    sid    = "EnforceVersioning"
    effect = "Deny"
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions = ["s3:PutBucketVersioning"]
    resources = [
      aws_s3_bucket.bucket.arn
    ]
    condition {
      test     = "StringNotEquals"
      variable = "s3:VersionStatus"
      values   = ["Enabled"]
    }
  }
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.bucket.id
  policy = data.aws_iam_policy_document.bucket_policy.json
}