# Requirement: Infrastructure Outputs
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Provides output values for the Kubernetes cluster, such as its endpoint 
# and name, to facilitate integration with other infrastructure components.

output "cluster_endpoint" {
  description = "The endpoint for the EKS cluster"
  value       = aws_eks_cluster.cluster.endpoint
  sensitive   = false
}

output "cluster_name" {
  description = "The name of the EKS cluster"
  value       = var.cluster_name
  sensitive   = false
}

output "cluster_region" {
  description = "The AWS region where the EKS cluster is deployed"
  value       = var.region
  sensitive   = false
}

output "cluster_arn" {
  description = "The ARN of the EKS cluster"
  value       = aws_eks_cluster.cluster.arn
  sensitive   = false
}

output "cluster_certificate_authority_data" {
  description = "The base64 encoded certificate data required to communicate with the cluster"
  value       = aws_eks_cluster.cluster.certificate_authority[0].data
  sensitive   = true
}

output "cluster_platform_version" {
  description = "The platform version of the EKS cluster"
  value       = aws_eks_cluster.cluster.platform_version
  sensitive   = false
}

output "cluster_status" {
  description = "The status of the EKS cluster"
  value       = aws_eks_cluster.cluster.status
  sensitive   = false
}

output "cluster_security_group_id" {
  description = "The security group ID attached to the EKS cluster"
  value       = aws_eks_cluster.cluster.vpc_config[0].cluster_security_group_id
  sensitive   = false
}