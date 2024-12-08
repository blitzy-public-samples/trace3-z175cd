# Human Tasks:
# 1. Review and adjust default values based on staging environment requirements
# 2. Ensure AWS credentials are properly configured for staging environment
# 3. Verify that all referenced subnet IDs exist in the staging VPC
# 4. Review and adjust tags according to organization's tagging strategy

# Requirement: Staging Environment Setup
# Location: Technical Specification/4. SYSTEM ARCHITECTURE/Deployment Architecture
# Description: Defines variables for staging environment infrastructure configuration

# EKS Cluster Variables
variable "cluster_name" {
  description = "The name of the EKS cluster for staging environment"
  type        = string
  default     = "staging-eks-cluster"

  validation {
    condition     = can(regex("^[a-zA-Z][-a-zA-Z0-9]*$", var.cluster_name))
    error_message = "Cluster name must start with a letter and can only contain letters, numbers, and hyphens."
  }
}

variable "region" {
  description = "The AWS region for the staging environment"
  type        = string
  default     = "us-east-1"

  validation {
    condition     = can(regex("^[a-z]{2}(-[a-z]+)+-\\d$", var.region))
    error_message = "Region must be a valid AWS region format (e.g., us-west-2, eu-central-1)."
  }
}

variable "environment" {
  description = "The environment name for resource tagging and identification"
  type        = string
  default     = "staging"

  validation {
    condition     = var.environment == "staging"
    error_message = "Environment must be 'staging' for this configuration."
  }
}

# RDS Variables
variable "rds_instance_class" {
  description = "The instance class for the RDS database in staging"
  type        = string
  default     = "db.t3.medium"

  validation {
    condition     = can(regex("^db\\.", var.rds_instance_class))
    error_message = "RDS instance class must start with 'db.'."
  }
}

variable "rds_engine" {
  description = "The database engine for RDS"
  type        = string
  default     = "postgres"

  validation {
    condition     = contains(["postgres", "mysql"], var.rds_engine)
    error_message = "Database engine must be either 'postgres' or 'mysql'."
  }
}

variable "rds_username" {
  description = "The master username for the RDS instance"
  type        = string
  default     = "staging_admin"

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.rds_username))
    error_message = "Username must start with a letter and contain only alphanumeric characters and underscores."
  }
}

# ElastiCache Variables
variable "elasticache_cluster_id" {
  description = "The ID for the ElastiCache cluster"
  type        = string
  default     = "staging-cache"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*$", var.elasticache_cluster_id))
    error_message = "Cluster ID must start with a letter and contain only lowercase letters, numbers, and hyphens."
  }
}

variable "elasticache_engine" {
  description = "The engine for ElastiCache"
  type        = string
  default     = "redis"

  validation {
    condition     = var.elasticache_engine == "redis"
    error_message = "ElastiCache engine must be 'redis' for this configuration."
  }
}

# OpenSearch Variables
variable "opensearch_domain_name" {
  description = "The name of the OpenSearch domain"
  type        = string
  default     = "staging-search"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,27}$", var.opensearch_domain_name))
    error_message = "Domain name must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens."
  }
}

variable "opensearch_instance_type" {
  description = "The instance type for OpenSearch nodes"
  type        = string
  default     = "t3.small.search"

  validation {
    condition     = can(regex("^[a-z][0-9][.][a-z]+[.](search|elasticsearch)$", var.opensearch_instance_type))
    error_message = "Instance type must be a valid OpenSearch instance type."
  }
}

# S3 Variables
variable "s3_bucket_name" {
  description = "The name of the S3 bucket for staging environment"
  type        = string
  default     = "staging-substack-replica-assets"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]*[a-z0-9]$", var.s3_bucket_name))
    error_message = "Bucket name must be lowercase alphanumeric characters, dots, and hyphens."
  }
}

# CloudFront Variables
variable "cloudfront_environment" {
  description = "The environment identifier for CloudFront"
  type        = string
  default     = "staging"

  validation {
    condition     = var.cloudfront_environment == "staging"
    error_message = "CloudFront environment must be 'staging' for this configuration."
  }
}

# Common Tags
variable "tags" {
  description = "Common tags to apply to all resources in staging environment"
  type        = map(string)
  default = {
    Environment = "Staging"
    Project     = "Substack Replica"
    Terraform   = "true"
    ManagedBy   = "DevOps"
  }

  validation {
    condition     = contains(keys(var.tags), "Environment") && var.tags["Environment"] == "Staging"
    error_message = "Tags must include 'Environment' key with value 'Staging'."
  }
}