# Requirement: Search Functionality
# Location: Technical Specification/System Architecture/Data Storage
# Description: Provides configurable inputs for the OpenSearch service deployment

variable "domain_name" {
  description = "The name of the OpenSearch domain."
  type        = string
  default     = "opensearch-domain"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,27}$", var.domain_name))
    error_message = "Domain name must start with a lowercase letter, be between 3 and 28 characters, and contain only lowercase letters, numbers, and hyphens."
  }
}

variable "engine_version" {
  description = "The version of the OpenSearch engine to use."
  type        = string
  default     = "OpenSearch_1.0"

  validation {
    condition     = can(regex("^OpenSearch_[0-9]\\.[0-9]$", var.engine_version))
    error_message = "Engine version must be in the format 'OpenSearch_X.Y' where X and Y are numbers."
  }
}

variable "instance_type" {
  description = "The instance type for the OpenSearch nodes."
  type        = string
  default     = "t3.medium.search"

  validation {
    condition     = can(regex("^[a-z][0-9][.][a-z]+[.](search|elasticsearch)$", var.instance_type))
    error_message = "Instance type must be a valid OpenSearch instance type (e.g., t3.medium.search)."
  }
}

variable "instance_count" {
  description = "The number of instances in the OpenSearch cluster."
  type        = number
  default     = 2

  validation {
    condition     = var.instance_count >= 1 && var.instance_count <= 100
    error_message = "Instance count must be between 1 and 100."
  }
}

variable "ebs_volume_size" {
  description = "The size of the EBS volumes attached to the OpenSearch instances, in GB."
  type        = number
  default     = 10

  validation {
    condition     = var.ebs_volume_size >= 10 && var.ebs_volume_size <= 1024
    error_message = "EBS volume size must be between 10 GB and 1024 GB."
  }
}

variable "access_policies" {
  description = "IAM policy document specifying access permissions for the OpenSearch domain."
  type        = string
  default     = "{}"

  validation {
    condition     = can(jsondecode(var.access_policies))
    error_message = "Access policies must be a valid JSON document."
  }
}