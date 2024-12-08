# Human Tasks:
# 1. Ensure AWS credentials are properly configured with necessary permissions
# 2. Configure AWS CLI with appropriate access keys and region
# 3. Verify that the Kubernetes cluster endpoint and credentials are accessible
# 4. Review and validate the AWS region selection based on data residency requirements

# AWS Provider version: 5.0.0
# Kubernetes Provider version: 2.18.0

# Requirement: Provider Configuration
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Configures cloud providers for infrastructure provisioning

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

# AWS provider configuration
provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = "Substack Replica"
      Environment = terraform.workspace
      ManagedBy   = "Terraform"
    }
  }
}

# Kubernetes provider configuration
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_ca_certificate)
  token                  = module.eks.cluster_token

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args = [
      "eks",
      "get-token",
      "--cluster-name",
      module.eks.cluster_name
    ]
  }
}