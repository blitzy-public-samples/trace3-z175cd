# Human Tasks:
# 1. Ensure AWS credentials are properly configured with necessary permissions for EKS cluster creation
# 2. Verify VPC has proper configuration for EKS (DNS hostnames and resolution enabled)
# 3. Confirm that the security groups allow required EKS communication
# 4. Review node instance types and autoscaling configuration for production workload requirements

# Required Provider Versions
terraform {
  required_providers {
    # hashicorp/aws v5.0.0
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
    # hashicorp/kubernetes v2.18.0
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.18.0"
    }
  }
  required_version = ">= 1.0.0"
}

# Requirement: Kubernetes Cluster Management
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Creates the main EKS cluster with specified configuration
resource "aws_eks_cluster" "cluster" {
  name     = var.cluster_name
  role_arn = var.cluster_role_arn
  version  = "1.27"  # Latest stable version as of configuration

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true
    security_group_ids      = []  # Uses default EKS-created security group
  }

  enabled_cluster_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]

  encryption_config {
    provider {
      key_arn = aws_kms_key.eks.arn
    }
    resources = ["secrets"]
  }

  kubernetes_network_config {
    service_ipv4_cidr = "172.20.0.0/16"
    ip_family         = "ipv4"
  }

  tags = merge(
    var.tags,
    {
      "kubernetes.io/cluster/${var.cluster_name}" = "owned"
    }
  )

  depends_on = [
    aws_kms_key.eks
  ]
}

# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: KMS key for EKS cluster encryption
resource "aws_kms_key" "eks" {
  description             = "KMS key for EKS cluster ${var.cluster_name} encryption"
  deletion_window_in_days = 7
  enable_key_rotation    = true

  tags = var.tags
}

# Requirement: Kubernetes Cluster Management
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Creates the managed node group for the EKS cluster
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.cluster.name
  node_group_name = "${var.cluster_name}-main"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.subnet_ids

  scaling_config {
    desired_size = 2
    min_size     = 1
    max_size     = 5
  }

  update_config {
    max_unavailable = 1
  }

  instance_types = ["t3.medium"]
  capacity_type  = "ON_DEMAND"
  disk_size      = 50

  labels = {
    "role" = "application"
  }

  remote_access {
    ec2_ssh_key = null  # Disabled for security, use AWS Systems Manager Session Manager instead
  }

  taint {
    key    = "CriticalAddonsOnly"
    value  = "true"
    effect = "NO_SCHEDULE"
  }

  launch_template {
    name    = aws_launch_template.node.name
    version = aws_launch_template.node.latest_version
  }

  tags = merge(
    var.tags,
    {
      "kubernetes.io/cluster/${var.cluster_name}" = "owned"
    }
  )

  lifecycle {
    create_before_destroy = true
    ignore_changes       = [scaling_config[0].desired_size]
  }

  depends_on = [
    aws_eks_cluster.cluster
  ]
}

# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: Launch template for EKS nodes with custom configuration
resource "aws_launch_template" "node" {
  name_prefix   = "${var.cluster_name}-node-"
  instance_type = "t3.medium"

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"  # IMDSv2 required for security
    http_put_response_hop_limit = 1
  }

  monitoring {
    enabled = true
  }

  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      volume_size           = 50
      volume_type          = "gp3"
      delete_on_termination = true
      encrypted            = true
    }
  }

  tag_specifications {
    resource_type = "instance"
    tags = merge(
      var.tags,
      {
        "kubernetes.io/cluster/${var.cluster_name}" = "owned"
      }
    )
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    /etc/eks/bootstrap.sh ${var.cluster_name} \
      --container-runtime containerd \
      --kubelet-extra-args '--max-pods=110'
    EOF
  )

  lifecycle {
    create_before_destroy = true
  }
}

# Requirement: Infrastructure as Code
# Location: Technical Specification/System Design/Infrastructure Requirements
# Description: CloudWatch Log Group for EKS cluster logs
resource "aws_cloudwatch_log_group" "eks" {
  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = 30
  tags             = var.tags
}