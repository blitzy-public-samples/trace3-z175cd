# Human Tasks:
# 1. Ensure AWS credentials are properly configured with necessary permissions
# 2. Review and adjust resource configurations based on environment requirements
# 3. Verify network configurations (VPC, subnets) are properly set up
# 4. Configure DNS records for CloudFront distribution
# 5. Set up monitoring and alerting for all provisioned resources
# 6. Review and adjust auto-scaling configurations for production workloads

# AWS Provider version: 5.0.0
# Kubernetes Provider version: 2.18.0

# Requirement: Infrastructure Orchestration
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Main Terraform configuration for orchestrating the Substack Replica platform's infrastructure

# Import required provider configurations
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.0.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.18.0"
    }
  }
}

# EKS Cluster Module
# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
module "eks" {
  source = "./modules/eks"

  cluster_name    = var.eks_cluster_name
  region         = var.region
  subnet_ids     = var.subnet_ids
  node_role_arn  = var.node_role_arn
  tags           = var.tags
}

# RDS Database Module
# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
module "rds" {
  source = "./modules/rds"

  instance_class = var.db_instance_class
  name          = var.db_name
  username      = var.db_username
  password      = var.db_password
  multi_az      = true
  tags          = var.tags
}

# ElastiCache Module
# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
module "elasticache" {
  source = "./modules/elasticache"

  cluster_id           = "substack-replica-cache"
  node_type           = var.cache_node_type
  vpc_id              = var.vpc_id
  subnet_ids          = var.subnet_ids
  allowed_cidr_blocks = var.cache_allowed_cidr_blocks
  tags                = var.tags
}

# OpenSearch Module
# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
module "opensearch" {
  source = "./modules/opensearch"

  domain_name     = var.opensearch_domain_name
  engine_version  = "OpenSearch_1.0"
  instance_type   = "t3.medium.search"
  instance_count  = 2
  ebs_volume_size = 100
  tags           = var.tags
}

# S3 Storage Module
# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
module "s3" {
  source = "./modules/s3"

  bucket_name        = var.content_bucket_name
  region            = var.region
  versioning_enabled = true
  encryption_enabled = true
  logging_enabled    = true
  access_policy     = "private"
  tags              = var.tags

  lifecycle_rules = [
    {
      id                                    = "archive-old-content"
      enabled                              = true
      prefix                               = "content/"
      expiration_days                      = 3650
      transition_to_standard_ia_days       = 90
      transition_to_intelligent_tiering_days = 180
    }
  ]

  cors_rules = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
      allowed_origins = ["*"]
      expose_headers  = ["ETag"]
      max_age_seconds = 3600
    }
  ]
}

# CloudFront CDN Module
# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
module "cloudfront" {
  source = "./modules/cloudfront"

  environment = var.environment
  region     = var.region
  tags       = var.tags

  origin = {
    domain_name = module.s3.bucket_regional_domain_name
    origin_id   = "S3Origin"
    origin_access_identity = "origin-access-identity/cloudfront/XXXXX"
  }

  default_cache_behavior = {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    min_ttl               = 0
    default_ttl           = 3600
    max_ttl               = 86400
    compress              = true
    forwarded_values = {
      query_string = false
      cookies = {
        forward = "none"
      }
    }
  }

  viewer_certificate = {
    cloudfront_default_certificate = true
    minimum_protocol_version      = "TLSv1.2_2021"
  }

  custom_error_responses = [
    {
      error_code         = 403
      response_code      = 404
      response_page_path = "/404.html"
    },
    {
      error_code         = 404
      response_code      = 404
      response_page_path = "/404.html"
    }
  ]

  restrictions = {
    geo_restriction = {
      restriction_type = "none"
      locations        = []
    }
  }
}