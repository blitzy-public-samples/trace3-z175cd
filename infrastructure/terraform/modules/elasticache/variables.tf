# AWS Provider version: 5.0.0
# Requirement addressed: Caching Infrastructure
# Location: Technical Specification/System Design/Data Storage
# Description: Provides configurable parameters for the ElastiCache module to enhance application performance and reduce database load

# Human Tasks:
# 1. Review and adjust default values based on specific environment requirements
# 2. Ensure subnet_ids are properly configured for the target VPC
# 3. Validate tag values match organization's tagging strategy
# 4. Consider adding additional environment-specific tags

variable "cluster_id" {
  type        = string
  description = "The unique identifier for the ElastiCache cluster."
  default     = "elasticache-cluster"

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]*$", var.cluster_id))
    error_message = "The cluster_id must start with a letter and can only contain letters, numbers, and hyphens."
  }
}

variable "engine" {
  type        = string
  description = "The caching engine to use, such as Redis or Memcached."
  default     = "redis"

  validation {
    condition     = contains(["redis", "memcached"], var.engine)
    error_message = "The engine must be either 'redis' or 'memcached'."
  }
}

variable "node_type" {
  type        = string
  description = "The instance type for the ElastiCache nodes."
  default     = "cache.t3.micro"

  validation {
    condition     = can(regex("^cache\\.[a-z0-9]+\\.[a-z0-9]+$", var.node_type))
    error_message = "The node_type must be a valid ElastiCache instance type (e.g., cache.t3.micro)."
  }
}

variable "subnet_ids" {
  type        = list(string)
  description = "A list of subnet IDs for the ElastiCache cluster."
  default     = []

  validation {
    condition     = length(var.subnet_ids) > 0
    error_message = "At least one subnet ID must be provided for the ElastiCache cluster."
  }
}

variable "vpc_id" {
  type        = string
  description = "The VPC ID where the ElastiCache cluster will be deployed."

  validation {
    condition     = can(regex("^vpc-[a-f0-9]+$", var.vpc_id))
    error_message = "The vpc_id must be a valid VPC ID (e.g., vpc-12345678)."
  }
}

variable "allowed_cidr_blocks" {
  type        = list(string)
  description = "List of CIDR blocks allowed to access the ElastiCache cluster."
  default     = []

  validation {
    condition     = alltrue([for cidr in var.allowed_cidr_blocks : can(cidrhost(cidr, 0))])
    error_message = "All elements must be valid CIDR blocks."
  }
}

variable "sns_topic_arn" {
  type        = string
  description = "ARN of the SNS topic for cluster notifications."
  default     = ""

  validation {
    condition     = var.sns_topic_arn == "" || can(regex("^arn:aws:sns:[a-z0-9-]+:[0-9]{12}:.+$", var.sns_topic_arn))
    error_message = "If provided, the SNS topic ARN must be valid."
  }
}

variable "tags" {
  type        = map(string)
  description = "A map of tags to apply to the ElastiCache resources."
  default = {
    Environment = "production"
    Application = "substack-replica"
  }

  validation {
    condition     = length(var.tags) > 0
    error_message = "At least one tag must be provided."
  }
}

variable "maintenance_window" {
  type        = string
  description = "Preferred maintenance window for the ElastiCache cluster."
  default     = "sun:05:00-sun:09:00"

  validation {
    condition     = can(regex("^(mon|tue|wed|thu|fri|sat|sun):[0-9]{2}:[0-9]{2}-(mon|tue|wed|thu|fri|sat|sun):[0-9]{2}:[0-9]{2}$", var.maintenance_window))
    error_message = "Maintenance window must be in the format 'ddd:hh:mm-ddd:hh:mm'."
  }
}

variable "snapshot_retention_limit" {
  type        = number
  description = "Number of days for which ElastiCache will retain automatic snapshots."
  default     = 7

  validation {
    condition     = var.snapshot_retention_limit >= 0 && var.snapshot_retention_limit <= 35
    error_message = "Snapshot retention limit must be between 0 and 35 days."
  }
}

variable "apply_immediately" {
  type        = bool
  description = "Whether to apply changes immediately or during the next maintenance window."
  default     = false
}

variable "engine_version" {
  type        = string
  description = "Version number of the cache engine."
  default     = "6.x"

  validation {
    condition     = can(regex("^[0-9]+\\.x$", var.engine_version))
    error_message = "Engine version must be in the format 'X.x'."
  }
}