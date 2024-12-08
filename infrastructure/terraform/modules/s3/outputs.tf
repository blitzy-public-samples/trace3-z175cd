# Outputs for S3 Module
# Addresses requirement: Object Storage Configuration
# Technical Specification/System Design/Infrastructure Requirements
# Provider version: hashicorp/aws v5.0.0

output "bucket_name" {
  description = "The name of the S3 bucket"
  value       = var.bucket_name
}

output "bucket_arn" {
  description = "The ARN (Amazon Resource Name) of the S3 bucket"
  value       = aws_s3_bucket.bucket.arn
}

output "region" {
  description = "The AWS region where the S3 bucket is created"
  value       = var.region
}

output "bucket_domain_name" {
  description = "The bucket domain name of the S3 bucket"
  value       = aws_s3_bucket.bucket.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "The regional domain name of the S3 bucket"
  value       = aws_s3_bucket.bucket.bucket_regional_domain_name
}

output "bucket_id" {
  description = "The ID of the S3 bucket"
  value       = aws_s3_bucket.bucket.id
}

output "bucket_hosted_zone_id" {
  description = "The Route 53 Hosted Zone ID for the S3 bucket's region"
  value       = aws_s3_bucket.bucket.hosted_zone_id
}

output "bucket_tags" {
  description = "The tags applied to the S3 bucket"
  value       = aws_s3_bucket.bucket.tags_all
}

output "bucket_versioning_status" {
  description = "The versioning status of the S3 bucket"
  value       = aws_s3_bucket_versioning.bucket_versioning.versioning_configuration[0].status
}

output "bucket_encryption_status" {
  description = "The encryption configuration status of the S3 bucket"
  value       = aws_s3_bucket_server_side_encryption_configuration.bucket_encryption.rule[0].apply_server_side_encryption_by_default[0].sse_algorithm
}