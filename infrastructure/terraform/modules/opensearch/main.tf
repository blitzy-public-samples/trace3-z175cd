# AWS Provider version 5.0.0
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.0.0"
    }
  }
}

# Human Tasks:
# 1. Ensure AWS credentials are properly configured
# 2. Review and adjust the access policies based on your VPC and security requirements
# 3. Configure VPC endpoints if OpenSearch is deployed in a private subnet
# 4. Set up CloudWatch alarms for monitoring OpenSearch metrics
# 5. Review and adjust instance type and EBS volume size based on production workload

# OpenSearch domain resource
# Requirement: Search Functionality - Implements OpenSearch service for full-text search, content indexing, and analytics
resource "aws_opensearch_domain" "this" {
  domain_name    = var.domain_name
  engine_version = var.engine_version

  cluster_config {
    instance_type          = var.instance_type
    instance_count        = var.instance_count
    zone_awareness_enabled = true # Enable multi-AZ for high availability

    zone_awareness_config {
      availability_zone_count = 2
    }
  }

  ebs_options {
    ebs_enabled = true
    volume_size = var.ebs_volume_size
    volume_type = "gp3"          # Using gp3 for better performance and cost-effectiveness
    iops        = 3000           # Default IOPS for gp3
  }

  encrypt_at_rest {
    enabled = true               # Enable encryption at rest for security
  }

  node_to_node_encryption {
    enabled = true               # Enable node-to-node encryption
  }

  domain_endpoint_options {
    enforce_https       = true   # Force HTTPS for all traffic
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07" # Enforce minimum TLS 1.2
  }

  advanced_security_options {
    enabled                        = true
    internal_user_database_enabled = false # Use IAM for authentication
    master_user_options {
      master_user_iam_arn = data.aws_caller_identity.current.arn
    }
  }

  access_policies = var.access_policies

  tags = {
    Name        = var.domain_name
    Environment = terraform.workspace
    Terraform   = "true"
  }

  # Advanced options for performance optimization
  advanced_options = {
    "rest.action.multi.allow_explicit_index" = "true"
    "indices.fielddata.cache.size"          = "40"
    "indices.query.bool.max_clause_count"    = "1024"
  }
}

# Get current AWS account identity for IAM configurations
data "aws_caller_identity" "current" {}

# Output the OpenSearch domain endpoint
output "domain_endpoint" {
  description = "The endpoint of the OpenSearch domain"
  value       = aws_opensearch_domain.this.endpoint
}

# Output the OpenSearch domain ARN
output "domain_arn" {
  description = "The ARN of the OpenSearch domain"
  value       = aws_opensearch_domain.this.arn
}

# Additional outputs for integration with other services
output "kibana_endpoint" {
  description = "The endpoint for Kibana"
  value       = aws_opensearch_domain.this.kibana_endpoint
}

output "domain_id" {
  description = "The ID of the OpenSearch domain"
  value       = aws_opensearch_domain.this.domain_id
}