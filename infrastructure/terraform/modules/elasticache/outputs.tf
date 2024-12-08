# AWS Provider version: 5.0.0
# Requirement addressed: Caching Infrastructure
# Location: Technical Specification/System Design/Data Storage
# Description: Exposes key attributes of the ElastiCache cluster for integration with other modules and environments

output "elasticache_cluster_id" {
  description = "The unique identifier for the ElastiCache cluster."
  value       = "elasticache-cluster"
}

output "elasticache_configuration_endpoint" {
  description = "The configuration endpoint for the ElastiCache cluster."
  value       = "${aws_elasticache_cluster.example.configuration_endpoint}"
}

output "elasticache_primary_endpoint" {
  description = "The primary endpoint for the ElastiCache cluster."
  value       = "${aws_elasticache_cluster.example.primary_endpoint}"
}