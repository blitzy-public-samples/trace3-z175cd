# AWS Provider version: 5.0.0
# Requirement addressed: Caching Infrastructure
# Location: Technical Specification/System Design/Data Storage
# Description: Implements the caching layer using AWS ElastiCache to enhance application performance and reduce database load

# Human Tasks:
# 1. Ensure VPC and subnet configurations are properly set up before applying
# 2. Review and adjust the node_type based on production workload requirements
# 3. Verify security group rules allow required Redis port access (6379)
# 4. Consider enabling encryption at rest for production deployments
# 5. Review backup retention and maintenance window settings for production use

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.0.0"
    }
  }
}

# ElastiCache Cluster Resource
resource "aws_elasticache_cluster" "example" {
  cluster_id           = var.cluster_id
  engine              = "redis"
  node_type           = var.node_type
  num_cache_nodes     = 1
  parameter_group_name = aws_elasticache_parameter_group.redis_params.name
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name
  port                = 6379

  # Enhanced security and reliability settings
  apply_immediately    = false
  maintenance_window   = "sun:05:00-sun:09:00"
  snapshot_window     = "00:00-05:00"
  snapshot_retention_limit = 7

  # Performance and connectivity settings
  az_mode             = "single-az"
  engine_version      = "6.x"
  notification_topic_arn = var.sns_topic_arn

  tags = merge(
    var.tags,
    {
      Name = "redis-cluster"
      Environment = "production"
      Application = "substack-replica"
    }
  )
}

# ElastiCache Parameter Group
resource "aws_elasticache_parameter_group" "redis_params" {
  family = "redis6.x"
  name   = "${var.cluster_id}-params"
  description = "Custom parameter group for Redis cluster"

  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lru"
  }

  parameter {
    name  = "timeout"
    value = "300"
  }

  tags = var.tags
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "${var.cluster_id}-subnet-group"
  subnet_ids = var.subnet_ids
  description = "Subnet group for Redis cluster"

  tags = var.tags
}

# Security Group for ElastiCache
resource "aws_security_group" "redis_sg" {
  name        = "${var.cluster_id}-sg"
  description = "Security group for Redis cluster"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

# Variables
variable "cluster_id" {
  type        = string
  description = "The ID to use for the ElastiCache cluster"
}

variable "node_type" {
  type        = string
  description = "The compute and memory capacity of the nodes"
  default     = "cache.t3.micro"
}

variable "vpc_id" {
  type        = string
  description = "The VPC ID where the cluster will be deployed"
}

variable "subnet_ids" {
  type        = list(string)
  description = "List of subnet IDs for the ElastiCache subnet group"
}

variable "allowed_cidr_blocks" {
  type        = list(string)
  description = "List of CIDR blocks allowed to access the Redis cluster"
  default     = []
}

variable "sns_topic_arn" {
  type        = string
  description = "ARN of the SNS topic for cluster notifications"
  default     = ""
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to all resources"
  default     = {}
}