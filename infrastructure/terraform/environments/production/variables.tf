# Human Tasks:
# 1. Review and validate AWS region selection based on target market and compliance requirements
# 2. Ensure all resource tags comply with organization's tagging strategy
# 3. Verify that the environment name matches deployment pipeline configuration
# 4. Confirm that the application name matches other infrastructure components

# Requirement: Production Environment Deployment
# Location: Technical Specification/System Design/Deployment Architecture
# Description: Defines core variables for production environment infrastructure

variable "region" {
  description = "The AWS region for the production environment."
  type        = string
  default     = "us-east-1"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]{1}$", var.region))
    error_message = "Region must be a valid AWS region format (e.g., us-east-1, eu-west-1)."
  }
}

variable "environment" {
  description = "The environment name (e.g., production)."
  type        = string
  default     = "production"

  validation {
    condition     = var.environment == "production"
    error_message = "Environment must be 'production' for this configuration."
  }
}

# Requirement: Infrastructure Parameterization
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Defines common tags for resource organization and cost allocation

variable "tags" {
  description = "A map of tags to apply to all resources in the production environment."
  type        = map(string)
  default = {
    Environment = "production"
    Application = "substack-replica"
    Terraform   = "true"
    ManagedBy   = "terraform"
  }

  validation {
    condition     = length(var.tags) > 0
    error_message = "At least one tag must be provided for resource management."
  }
}

# EKS Cluster Variables
variable "eks_cluster_name" {
  description = "The name of the EKS cluster for the production environment."
  type        = string
  default     = "substack-replica-prod"

  validation {
    condition     = can(regex("^[a-zA-Z][-a-zA-Z0-9]*$", var.eks_cluster_name))
    error_message = "Cluster name must start with a letter and can only contain letters, numbers, and hyphens."
  }
}

variable "eks_node_instance_type" {
  description = "The instance type for EKS worker nodes."
  type        = string
  default     = "c6g.xlarge"  # As specified in Technical Specification/Infrastructure Requirements

  validation {
    condition     = can(regex("^[a-z][0-9][a-z]\\.[a-z]+$", var.eks_node_instance_type))
    error_message = "Instance type must be a valid AWS instance type format."
  }
}

# RDS Variables
variable "rds_instance_class" {
  description = "The instance class for the RDS database."
  type        = string
  default     = "r6g.2xlarge"  # As specified in Technical Specification/Infrastructure Requirements

  validation {
    condition     = can(regex("^[a-z][0-9][a-z]\\.[0-9]*xlarge$", var.rds_instance_class))
    error_message = "RDS instance class must be a valid AWS RDS instance type."
  }
}

variable "rds_engine_version" {
  description = "The version of PostgreSQL for RDS."
  type        = string
  default     = "15.2"  # As specified in Technical Specification/Technology Stack

  validation {
    condition     = can(regex("^\\d+\\.\\d+$", var.rds_engine_version))
    error_message = "PostgreSQL version must be in the format 'XX.X'."
  }
}

# ElastiCache Variables
variable "elasticache_node_type" {
  description = "The node type for ElastiCache Redis cluster."
  type        = string
  default     = "r6g.large"  # As specified in Technical Specification/Infrastructure Requirements

  validation {
    condition     = can(regex("^[a-z][0-9][a-z]\\.[a-z]+$", var.elasticache_node_type))
    error_message = "ElastiCache node type must be a valid AWS instance type format."
  }
}

variable "elasticache_engine_version" {
  description = "The version of Redis for ElastiCache."
  type        = string
  default     = "7.0"  # As specified in Technical Specification/Technology Stack

  validation {
    condition     = can(regex("^\\d+\\.\\d+$", var.elasticache_engine_version))
    error_message = "Redis version must be in the format 'X.X'."
  }
}

# OpenSearch Variables
variable "opensearch_instance_type" {
  description = "The instance type for OpenSearch cluster."
  type        = string
  default     = "c6g.2xlarge"  # As specified in Technical Specification/Infrastructure Requirements

  validation {
    condition     = can(regex("^[a-z][0-9][a-z]\\.[0-9]*xlarge$", var.opensearch_instance_type))
    error_message = "OpenSearch instance type must be a valid AWS instance type format."
  }
}

variable "opensearch_version" {
  description = "The version of OpenSearch to use."
  type        = string
  default     = "OpenSearch_1.0"

  validation {
    condition     = can(regex("^OpenSearch_\\d+\\.\\d+$", var.opensearch_version))
    error_message = "OpenSearch version must be in the format 'OpenSearch_X.X'."
  }
}

# S3 Variables
variable "s3_bucket_prefix" {
  description = "The prefix for S3 bucket names."
  type        = string
  default     = "substack-replica-prod"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]$", var.s3_bucket_prefix))
    error_message = "S3 bucket prefix must contain only lowercase letters, numbers, and hyphens."
  }
}

# CloudFront Variables
variable "cloudfront_price_class" {
  description = "The price class for CloudFront distribution."
  type        = string
  default     = "PriceClass_All"  # Global distribution as per Technical Specification

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "Price class must be one of: PriceClass_100, PriceClass_200, PriceClass_All."
  }
}

variable "cloudfront_ssl_certificate_arn" {
  description = "The ARN of the SSL certificate for CloudFront distribution."
  type        = string

  validation {
    condition     = can(regex("^arn:aws:acm:us-east-1:[0-9]{12}:certificate/[a-zA-Z0-9-]+$", var.cloudfront_ssl_certificate_arn))
    error_message = "Certificate ARN must be a valid ACM certificate ARN in us-east-1 region."
  }
}

# Monitoring and Logging Variables
variable "enable_enhanced_monitoring" {
  description = "Enable enhanced monitoring for production resources."
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Number of days to retain logs in CloudWatch."
  type        = number
  default     = 90

  validation {
    condition     = var.log_retention_days >= 30
    error_message = "Log retention period must be at least 30 days for production environment."
  }
}