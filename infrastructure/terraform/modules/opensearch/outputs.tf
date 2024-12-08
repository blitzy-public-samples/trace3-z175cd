# Requirement: Search Functionality
# Location: Technical Specification/System Architecture/Data Storage
# Description: Exposes critical attributes of the OpenSearch service for infrastructure integration

output "domain_endpoint" {
  description = "The endpoint of the OpenSearch domain"
  value       = aws_opensearch_domain.this.endpoint
}

output "domain_arn" {
  description = "The ARN of the OpenSearch domain"
  value       = aws_opensearch_domain.this.arn
}