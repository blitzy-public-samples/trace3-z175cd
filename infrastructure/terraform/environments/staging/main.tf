# Human Tasks:
# 1. Ensure AWS credentials are properly configured for staging environment
# 2. Review and adjust resource configurations based on staging workload requirements
# 3. Verify that all referenced subnet IDs exist in the staging VPC
# 4. Configure DNS records for CloudFront distribution after deployment
# 5. Set up monitoring and alerting for staging environment resources

# AWS Provider version: 5.0.0
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }
}

# Requirement: Staging Environment Setup
# Location: Technical Specification/4. SYSTEM ARCHITECTURE/Deployment Architecture
# Description: Configures the staging environment infrastructure

# EKS Module - Kubernetes Cluster
module "eks" {
  source = "../../modules/eks"

  cluster_name = var.cluster_name
  region       = var.region
  subnet_ids   = var.subnet_ids
  tags = merge(var.tags, {
    Environment = var.environment
    Component   = "kubernetes"
  })
}

# RDS Module - Database
module "rds" {
  source = "../../modules/rds"

  instance_class = var.rds_instance_class
  engine        = var.rds_engine
  name          = "staging_db"
  username      = var.rds_username
  tags = merge(var.tags, {
    Environment = var.environment
    Component   = "database"
  })
}

# ElastiCache Module - Redis Cache
module "elasticache" {
  source = "../../modules/elasticache"

  cluster_id = var.elasticache_cluster_id
  engine     = var.elasticache_engine
  node_type  = "cache.t3.micro" # Smaller instance for staging
  tags = merge(var.tags, {
    Environment = var.environment
    Component   = "cache"
  })
}

# OpenSearch Module - Search Service
module "opensearch" {
  source = "../../modules/opensearch"

  domain_name     = var.opensearch_domain_name
  instance_type   = var.opensearch_instance_type
  instance_count  = 1 # Single instance for staging
  ebs_volume_size = 10 # Smaller volume for staging
  tags = merge(var.tags, {
    Environment = var.environment
    Component   = "search"
  })
}

# S3 Module - Object Storage
module "s3" {
  source = "../../modules/s3"

  bucket_name = var.s3_bucket_name
  region      = var.region
  access_policy = "private"
  versioning_enabled = true
  encryption_enabled = true
  logging_enabled    = true
  tags = merge(var.tags, {
    Environment = var.environment
    Component   = "storage"
  })
}

# CloudFront Module - CDN
module "cloudfront" {
  source = "../../modules/cloudfront"

  environment = var.cloudfront_environment
  origin = {
    domain_name = module.s3.bucket_regional_domain_name
    origin_id   = "S3-${var.s3_bucket_name}"
    origin_access_identity = "origin-access-identity/cloudfront/ABCDEF123456"
  }
  default_cache_behavior = {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.s3_bucket_name}"
    viewer_protocol_policy = "redirect-to-https"
    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
    compress    = true
    forwarded_values = {
      query_string = false
      cookies = {
        forward = "none"
      }
    }
  }
  viewer_certificate = {
    cloudfront_default_certificate = true
  }
  price_class = "PriceClass_100" # Use cheaper price class for staging
  enabled     = true
  is_ipv6_enabled = true
  comment     = "Staging CDN distribution for Substack Replica"
  tags = merge(var.tags, {
    Environment = var.environment
    Component   = "cdn"
  })
}

# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Output values for resource integration

output "eks_cluster_endpoint" {
  description = "The endpoint for the EKS cluster"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "rds_endpoint" {
  description = "The endpoint of the RDS instance"
  value       = module.rds.db_instance_endpoint
}

output "elasticache_endpoint" {
  description = "The endpoint of the ElastiCache cluster"
  value       = module.elasticache.elasticache_configuration_endpoint
}

output "opensearch_endpoint" {
  description = "The endpoint of the OpenSearch domain"
  value       = module.opensearch.domain_endpoint
}

output "s3_bucket" {
  description = "The name of the S3 bucket"
  value       = module.s3.bucket_name
}

output "cloudfront_domain" {
  description = "The domain name of the CloudFront distribution"
  value       = module.cloudfront.distribution_domain_name
}