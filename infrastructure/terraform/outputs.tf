# Requirement: Infrastructure Outputs
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Exposes critical infrastructure details such as endpoints, ARNs, and IDs 
# for integration with other modules and external systems.

# EKS Cluster Outputs
output "eks_cluster_endpoint" {
  description = "The endpoint for the EKS Kubernetes API server"
  value       = module.eks.cluster_endpoint
  sensitive   = false
}

output "eks_cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.cluster_name
  sensitive   = false
}

# RDS Outputs
output "rds_endpoint" {
  description = "The connection endpoint for the RDS database instance"
  value       = module.rds.db_instance_endpoint
  sensitive   = false
}

output "rds_arn" {
  description = "The ARN of the RDS database instance"
  value       = module.rds.db_instance_arn
  sensitive   = false
}

# ElastiCache Outputs
output "elasticache_cluster_id" {
  description = "The ID of the ElastiCache cluster"
  value       = module.elasticache.elasticache_cluster_id
  sensitive   = false
}

output "elasticache_endpoint" {
  description = "The configuration endpoint for the ElastiCache cluster"
  value       = module.elasticache.elasticache_configuration_endpoint
  sensitive   = false
}

# OpenSearch Outputs
output "opensearch_endpoint" {
  description = "The endpoint for the OpenSearch domain"
  value       = module.opensearch.domain_endpoint
  sensitive   = false
}

output "opensearch_arn" {
  description = "The ARN of the OpenSearch domain"
  value       = module.opensearch.domain_arn
  sensitive   = false
}

# S3 Bucket Outputs
output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = module.s3.bucket_name
  sensitive   = false
}

output "s3_bucket_arn" {
  description = "The ARN of the S3 bucket"
  value       = module.s3.bucket_arn
  sensitive   = false
}

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = module.cloudfront.cloudfront_distribution_id
  sensitive   = false
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = module.cloudfront.cloudfront_domain_name
  sensitive   = false
}