# Requirement Addressed: Content Delivery Network Outputs
# Technical Specification/System Design/Infrastructure Requirements
# Exposes critical CloudFront distribution details such as distribution ID and domain name 
# for integration with other modules and environments.

output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.id
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.domain_name
}