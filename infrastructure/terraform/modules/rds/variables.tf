# Requirement: Infrastructure Parameterization
# Location: Technical Specification/System Design/Infrastructure Requirements
# This file defines the input variables for configuring the RDS instance with flexible parameters

variable "instance_class" {
  description = "The instance class for the RDS database."
  type        = string
  default     = "db.t3.medium"

  validation {
    condition     = can(regex("^db\\.", var.instance_class))
    error_message = "The instance_class value must be a valid RDS instance class, starting with 'db.'."
  }
}

variable "engine" {
  description = "The database engine to use for the RDS instance."
  type        = string
  default     = "postgres"

  validation {
    condition     = contains(["postgres", "mysql", "mariadb", "oracle-se2", "sqlserver-se"], var.engine)
    error_message = "The engine must be a valid RDS engine type."
  }
}

variable "engine_version" {
  description = "The version of the database engine."
  type        = string
  default     = "15.2"
}

variable "name" {
  description = "The name of the database to create."
  type        = string
  default     = "substack_replica"

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.name))
    error_message = "The database name must start with a letter and contain only alphanumeric characters and underscores."
  }
}

variable "username" {
  description = "The master username for the RDS instance."
  type        = string
  default     = "admin"

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.username))
    error_message = "The username must start with a letter and contain only alphanumeric characters and underscores."
  }
}

variable "password" {
  description = "The master password for the RDS instance."
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^[a-zA-Z0-9!@#$%^&*()_+=-]{8,}$", var.password))
    error_message = "The password must be at least 8 characters long and contain valid characters."
  }
}

variable "multi_az" {
  description = "Specifies whether the RDS instance is deployed across multiple availability zones."
  type        = bool
  default     = true
}

variable "storage_encrypted" {
  description = "Specifies whether the RDS instance storage is encrypted."
  type        = bool
  default     = true
}

variable "kms_key_id" {
  description = "The ARN of the KMS key to use for encryption."
  type        = string
  default     = null

  validation {
    condition     = var.kms_key_id == null || can(regex("^arn:aws:kms:", var.kms_key_id))
    error_message = "The KMS key ID must be a valid ARN starting with 'arn:aws:kms:'."
  }
}

variable "backup_retention_period" {
  description = "The number of days to retain backups for the RDS instance."
  type        = string
  default     = "7"

  validation {
    condition     = can(regex("^[0-9]+$", var.backup_retention_period))
    error_message = "The backup retention period must be a valid number of days."
  }
}

variable "backup_window" {
  description = "The daily time range during which automated backups are created."
  type        = string
  default     = "03:00-04:00"

  validation {
    condition     = can(regex("^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$", var.backup_window))
    error_message = "The backup window must be in the format HH:MM-HH:MM."
  }
}

variable "vpc_security_group_ids" {
  description = "A list of VPC security group IDs to associate with the RDS instance."
  type        = list(string)
  default     = []

  validation {
    condition     = alltrue([for sg in var.vpc_security_group_ids : can(regex("^sg-", sg))])
    error_message = "All security group IDs must be valid and start with 'sg-'."
  }
}

variable "subnet_group_name" {
  description = "The name of the DB subnet group to use for the RDS instance."
  type        = string
  default     = null

  validation {
    condition     = var.subnet_group_name == null || can(regex("^[a-zA-Z0-9-]+$", var.subnet_group_name))
    error_message = "The subnet group name must contain only alphanumeric characters and hyphens."
  }
}