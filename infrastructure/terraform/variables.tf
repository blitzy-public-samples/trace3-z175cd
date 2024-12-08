# Human Tasks:
# 1. Ensure AWS credentials are properly configured with necessary permissions
# 2. Configure state bucket and DynamoDB table for state locking before deployment
# 3. Review and adjust default values based on environment requirements
# 4. Verify region selection aligns with data residency requirements
# 5. Ensure all required tags are defined according to organization standards

# Requirement: Infrastructure Parameterization
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Defines global variables for consistent infrastructure configuration
variable "region" {
  description = "The AWS region where resources will be deployed."
  type        = string
  default     = "us-east-1"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-\\d$", var.region))
    error_message = "Region must be a valid AWS region format (e.g., us-east-1, eu-west-1)."
  }
}

# Requirement: Environment-Specific Configuration
# Location: Technical Specification/System Design/Deployment Architecture
# Description: Enables environment-based resource configuration
variable "environment" {
  description = "Specifies the environment for the deployment (e.g., production, staging)."
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be one of: production, staging, development."
  }
}

# Requirement: Infrastructure Parameterization
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Provides consistent resource tagging across infrastructure
variable "tags" {
  description = "A map of tags to apply to all resources."
  type        = map(string)
  default = {
    Project     = "Substack Replica"
    Environment = "production"
    Terraform   = "true"
    ManagedBy   = "terraform"
  }

  validation {
    condition     = alltrue([for k, v in var.tags : can(regex("^[\\w+\\-_.:/@]+$", k)) && can(regex("^[\\w+\\-_.:/@]+$", v))])
    error_message = "Tags must only contain alphanumeric characters, spaces, and the following special characters: + - _ . : / @"
  }
}

# Requirement: Infrastructure Parameterization
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Configures Terraform state management
variable "state_bucket_name" {
  description = "The name of the S3 bucket for storing the Terraform state file."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]*[a-z0-9]$", var.state_bucket_name))
    error_message = "State bucket name must be a valid S3 bucket name, containing only lowercase letters, numbers, dots, and hyphens."
  }
}

variable "state_key" {
  description = "The path within the bucket for the Terraform state file."
  type        = string

  validation {
    condition     = can(regex("^[\\w-/]+\\.tfstate$", var.state_key))
    error_message = "State key must be a valid path ending with .tfstate"
  }
}

variable "lock_table_name" {
  description = "The DynamoDB table for state locking and consistency."
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z0-9_.-]+$", var.lock_table_name))
    error_message = "Lock table name must contain only alphanumeric characters, underscores, dots, and hyphens."
  }
}

# Additional variables for module configuration
# These variables are used by the imported module variables

# EKS Module Variables
variable "eks_cluster_name" {
  description = "The name of the EKS cluster."
  type        = string
  default     = "substack-replica-cluster"

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]*$", var.eks_cluster_name))
    error_message = "Cluster name must start with a letter and can only contain letters, numbers, and hyphens."
  }
}

# RDS Module Variables
variable "db_instance_class" {
  description = "The instance class for the RDS database."
  type        = string
  default     = "db.t3.medium"

  validation {
    condition     = can(regex("^db\\.", var.db_instance_class))
    error_message = "The instance_class value must be a valid RDS instance class, starting with 'db.'."
  }
}

# OpenSearch Module Variables
variable "opensearch_domain_name" {
  description = "The name of the OpenSearch domain."
  type        = string
  default     = "substack-replica-search"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,27}$", var.opensearch_domain_name))
    error_message = "Domain name must start with a lowercase letter, be between 3 and 28 characters, and contain only lowercase letters, numbers, and hyphens."
  }
}

# S3 Module Variables
variable "content_bucket_name" {
  description = "The name of the S3 bucket for storing content assets."
  type        = string
  default     = "substack-replica-content"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]*[a-z0-9]$", var.content_bucket_name))
    error_message = "Bucket name must be a valid S3 bucket name, containing only lowercase letters, numbers, dots, and hyphens."
  }
}