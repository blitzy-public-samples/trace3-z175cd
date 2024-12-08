# Human Tasks:
# 1. Create an S3 bucket for storing Terraform state with versioning enabled
# 2. Create a DynamoDB table for state locking with a primary key named "LockID"
# 3. Ensure proper IAM permissions are configured for accessing the S3 bucket and DynamoDB table
# 4. Verify that the AWS credentials have necessary permissions for state management
# 5. Consider enabling server-side encryption for the S3 bucket if not already enabled

# Requirement: State Management
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Configures the Terraform backend to store the state file in a remote location,
# enabling collaboration and ensuring consistency across deployments.
terraform {
  backend "s3" {
    # Use variables from variables.tf for backend configuration
    bucket         = "${var.state_bucket_name}"
    key            = "${var.state_key}"
    region         = "${var.region}"
    
    # Enable DynamoDB state locking for collaboration
    dynamodb_table = "${var.lock_table_name}"
    
    # Enable encryption for state file
    encrypt        = true
    
    # Additional security and performance settings
    # Force SSL/TLS for all API operations
    force_path_style = false
    
    # Enable server-side encryption with AWS managed keys
    server_side_encryption = "AES256"
    
    # Enable versioning for state file history
    versioning = true
    
    # Retry settings for improved reliability
    max_retries = 5
    
    # Enable consistency for improved reliability
    skip_credentials_validation = false
    skip_region_validation     = false
    skip_metadata_api_check    = false
  }
}