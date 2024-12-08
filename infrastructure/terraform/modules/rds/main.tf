# AWS Provider version: 5.0.0
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }
}

# Human Tasks:
# 1. Ensure KMS key is created and accessible for RDS encryption if custom key is needed
# 2. Configure VPC security groups with appropriate database access rules
# 3. Set up DB subnet group in target VPC for RDS deployment
# 4. Store database password securely in AWS Secrets Manager or SSM Parameter Store
# 5. Review backup window timing to ensure it doesn't conflict with peak usage

# RDS instance resource
# Requirement: Database Hosting
# Location: Technical Specification/4. SYSTEM ARCHITECTURE/Cloud Services
resource "aws_db_instance" "main" {
  # Instance specifications
  identifier           = "substack-replica-db"
  instance_class      = var.instance_class
  allocated_storage   = 100  # Initial storage in GB
  max_allocated_storage = 1000  # Enables autoscaling up to 1TB
  storage_type        = "gp3"  # General purpose SSD
  
  # Engine configuration
  engine             = var.engine
  engine_version     = var.engine_version
  
  # Database settings
  db_name            = var.name
  username           = var.username
  password           = var.password
  
  # High availability configuration
  multi_az           = var.multi_az
  
  # Security settings
  storage_encrypted  = var.storage_encrypted
  kms_key_id         = var.kms_key_id
  vpc_security_group_ids = var.vpc_security_group_ids
  db_subnet_group_name = var.subnet_group_name
  
  # Backup configuration
  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = "Mon:04:00-Mon:05:00"  # After backup window
  
  # Performance and monitoring
  monitoring_interval = 60  # Enhanced monitoring enabled
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn
  performance_insights_enabled = true
  performance_insights_retention_period = 7  # Days
  
  # Network settings
  publicly_accessible = false
  port               = 5432
  
  # Parameter group
  parameter_group_name = aws_db_parameter_group.main.name
  
  # Tags
  tags = {
    Name        = "substack-replica-db"
    Environment = "production"
    Terraform   = "true"
  }
  
  # Deletion protection
  deletion_protection = true
  
  # Skip final snapshot on destroy for dev/test (should be true in production)
  skip_final_snapshot = false
  final_snapshot_identifier = "substack-replica-final-snapshot"
}

# RDS parameter group
resource "aws_db_parameter_group" "main" {
  family = "postgres15"
  name   = "substack-replica-params"
  
  description = "Custom parameter group for Substack Replica RDS instance"
  
  # Optimize for application workload
  parameter {
    name  = "max_connections"
    value = "1000"
  }
  
  parameter {
    name  = "shared_buffers"
    value = "{DBInstanceClassMemory/4}"
  }
  
  parameter {
    name  = "work_mem"
    value = "16384"
  }
  
  parameter {
    name  = "maintenance_work_mem"
    value = "2097152"
  }
}

# IAM role for enhanced monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "rds-monitoring-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

# Attach the enhanced monitoring policy to the role
resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# Outputs for other modules to consume
# Requirement: Infrastructure Parameterization
# Location: Technical Specification/System Design/Infrastructure Requirements
output "db_instance_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.main.endpoint
}

output "db_instance_arn" {
  description = "The ARN of the RDS instance"
  value       = aws_db_instance.main.arn
}