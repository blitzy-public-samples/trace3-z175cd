# Requirement: Database Hosting
# Location: Technical Specification/4. SYSTEM ARCHITECTURE/Cloud Services
# Purpose: Exposes critical attributes of the RDS instance for integration with other modules

output "db_instance_endpoint" {
  description = "The endpoint of the RDS instance, used for database connectivity."
  value       = aws_db_instance.main.endpoint
}

output "db_instance_arn" {
  description = "The ARN of the RDS instance, used for resource identification."
  value       = aws_db_instance.main.arn
}