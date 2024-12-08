# Human Tasks:
# 1. Ensure AWS credentials are properly configured with necessary permissions for EKS cluster creation
# 2. Verify that the provided subnet IDs exist in the target VPC
# 3. Confirm that the node role ARN has the required EKS permissions attached

# Requirement: Infrastructure Parameterization
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: These variables enable flexible and reusable EKS module configuration across environments

variable "cluster_name" {
  description = "The name of the EKS cluster"
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z][-a-zA-Z0-9]*$", var.cluster_name))
    error_message = "Cluster name must start with a letter and can only contain letters, numbers, and hyphens."
  }
}

variable "region" {
  description = "The AWS region where the EKS cluster will be deployed"
  type        = string

  validation {
    condition     = can(regex("^[a-z]{2}(-[a-z]+)+-\\d$", var.region))
    error_message = "Region must be a valid AWS region format (e.g., us-west-2, eu-central-1)."
  }
}

variable "subnet_ids" {
  description = "The list of subnet IDs for the EKS cluster"
  type        = list(string)

  validation {
    condition     = length(var.subnet_ids) >= 2
    error_message = "At least two subnets are required for high availability."
  }

  validation {
    condition     = alltrue([for id in var.subnet_ids : can(regex("^subnet-[a-f0-9]{8,}$", id))])
    error_message = "All subnet IDs must be valid AWS subnet ID format (subnet-*)."
  }
}

variable "node_role_arn" {
  description = "The ARN of the IAM role for the EKS node group"
  type        = string

  validation {
    condition     = can(regex("^arn:aws:iam::\\d{12}:role/.+$", var.node_role_arn))
    error_message = "Node role ARN must be a valid IAM role ARN format."
  }
}

variable "tags" {
  description = "A map of tags to apply to the EKS cluster and its resources"
  type        = map(string)
  default     = {}

  validation {
    condition     = alltrue([for k, v in var.tags : can(regex("^[\\w+\\-_.:/@]+$", k)) && can(regex("^[\\w+\\-_.:/@]+$", v))])
    error_message = "Tags must only contain alphanumeric characters, spaces, and the following special characters: + - _ . : / @ "
  }
}