# Human Tasks:
# 1. Ensure AWS credentials are properly configured with necessary permissions
# 2. Review and adjust instance types and sizes based on production workload requirements
# 3. Verify VPC and subnet configurations are properly set up
# 4. Configure backup retention periods according to compliance requirements
# 5. Review security group settings for all services

# Required Provider Versions
terraform {
  required_providers {
    # hashicorp/aws v5.0.0
    aws = {
      source  = "hashicorp/aws"
      version = "5.0.0"
    }
  }
  required_version = ">= 1.0.0"

  backend "s3" {
    bucket         = "substack-replica-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

# Configure AWS Provider
provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Application = "substack-replica"
      Environment = "production"
      Terraform   = "true"
    }
  }
}

# Requirement: Production Environment Deployment
# Location: Technical Specification/System Design/Deployment Architecture
# Description: EKS cluster for container orchestration
module "eks" {
  source = "../../modules/eks"

  cluster_name = "substack-replica-cluster"
  region       = "us-east-1"
  subnet_ids   = var.subnet_ids
  node_role_arn = var.eks_node_role_arn
  cluster_role_arn = var.eks_cluster_role_arn

  tags = {
    Application = "substack-replica"
    Environment = "production"
  }
}

# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: RDS instance for the primary database
module "rds" {
  source = "../../modules/rds"

  identifier        = "substack-replica-db"
  instance_class    = "db.t3.medium"
  engine            = "postgres"
  engine_version    = "15.3"
  name              = "substackreplica"
  username          = var.db_username
  password          = var.db_password
  storage_encrypted = true
  multi_az         = true

  vpc_security_group_ids = var.db_security_group_ids
  subnet_group_name      = var.db_subnet_group_name

  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  tags = {
    Application = "substack-replica"
    Environment = "production"
  }
}

# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: ElastiCache cluster for caching layer
module "elasticache" {
  source = "../../modules/elasticache"

  cluster_id           = "substack-replica-cache"
  node_type           = "cache.t3.medium"
  vpc_id              = var.vpc_id
  subnet_ids          = var.cache_subnet_ids
  allowed_cidr_blocks = var.cache_allowed_cidr_blocks

  tags = {
    Application = "substack-replica"
    Environment = "production"
  }
}

# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: OpenSearch domain for search functionality
module "opensearch" {
  source = "../../modules/opensearch"

  domain_name    = "substack-replica-search"
  engine_version = "OpenSearch_2.5"
  instance_type  = "t3.medium.search"
  instance_count = 2

  tags = {
    Application = "substack-replica"
    Environment = "production"
  }
}

# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: S3 bucket for static assets and media storage
module "s3" {
  source = "../../modules/s3"

  bucket_name = "substack-replica-assets-prod"
  region      = "us-east-1"
  
  versioning_enabled = true
  logging_enabled    = true
  
  lifecycle_rules = [
    {
      id      = "media_lifecycle"
      enabled = true
      prefix  = "media/"
      expiration_days = 0
      transition_to_standard_ia_days = 30
      transition_to_intelligent_tiering_days = 60
    }
  ]

  cors_rules = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET", "PUT", "POST"]
      allowed_origins = ["https://*.substackreplica.com"]
      expose_headers  = ["ETag"]
      max_age_seconds = 3600
    }
  ]

  tags = {
    Application = "substack-replica"
    Environment = "production"
  }
}

# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: CloudFront distribution for content delivery
module "cloudfront" {
  source = "../../modules/cloudfront"

  environment = "production"
  region      = "us-east-1"

  origin = {
    domain_name = module.s3.bucket_regional_domain_name
    origin_id   = "S3-${module.s3.bucket_name}"
    origin_access_identity = "origin-access-identity/cloudfront/XXXXX"
  }

  default_cache_behavior = {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${module.s3.bucket_name}"
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
    acm_certificate_arn = var.cloudfront_certificate_arn
    ssl_support_method  = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Application = "substack-replica"
    Environment = "production"
  }
}

# Output values for other modules to consume
output "eks_cluster_endpoint" {
  description = "The endpoint for the EKS cluster"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "rds_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = module.rds.db_instance_endpoint
}

output "rds_arn" {
  description = "The ARN of the RDS instance"
  value       = module.rds.db_instance_arn
}

output "elasticache_endpoint" {
  description = "The configuration endpoint for the ElastiCache cluster"
  value       = module.elasticache.elasticache_configuration_endpoint
}

output "opensearch_endpoint" {
  description = "The endpoint for the OpenSearch domain"
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