# Substack Replica Backend

A robust, scalable backend system for the Substack Replica platform built with Node.js, Express, TypeScript, and PostgreSQL.

## Table of Contents

- [Introduction](#introduction)
- [Setup Instructions](#setup-instructions)
- [Architecture Overview](#architecture-overview)
- [Testing](#testing)
- [Contribution Guidelines](#contribution-guidelines)

## Introduction

The backend system serves as the core infrastructure for the Substack Replica platform, providing essential services for content management, user authentication, payment processing, and analytics. Built with modern technologies and best practices, it ensures scalability, security, and maintainability.

### Key Features

- Content Management System
- User Authentication and Authorization
- Payment Processing with Stripe Integration
- Analytics and Metrics
- Email Delivery System
- Media Storage and Management

## Setup Instructions

### Prerequisites

- Node.js (>= 18.0.0)
- npm (>= 8.0.0)
- Docker and Docker Compose
- PostgreSQL (>= 15)
- Redis (>= 7)

### Environment Configuration

1. Clone the repository
2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Configure the following environment variables:
```
# Database Configuration
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>

# Redis Configuration
REDIS_URL=redis://<username>:<password>@<host>:<port>

# Storage Configuration
STORAGE_BUCKET=<bucket_name>
AWS_ACCESS_KEY_ID=<aws_access_key_id>
AWS_SECRET_ACCESS_KEY=<aws_secret_access_key>

# Authentication Configuration
JWT_SECRET=<jwt_secret>
JWT_EXPIRATION=1h

# Payment Configuration
STRIPE_API_KEY=<stripe_api_key>
STRIPE_WEBHOOK_SECRET=<stripe_webhook_secret>
```

### Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development environment using Docker Compose:
```bash
docker-compose up -d
```

3. Run database migrations:
```bash
npm run migrate
```

4. Start the development server:
```bash
npm run dev
```

The server will be available at `http://localhost:3000`.

## Architecture Overview

### System Components

1. **API Layer**
   - Express.js server with TypeScript
   - Route handlers and controllers
   - Input validation and error handling
   - Authentication middleware

2. **Database Layer**
   - PostgreSQL for primary data storage
   - Redis for caching and session management
   - Database migrations and schema management

3. **Service Layer**
   - Content management services
   - Authentication services
   - Payment processing services
   - Analytics services

4. **External Integrations**
   - AWS S3 for media storage
   - Stripe for payment processing
   - SMTP for email delivery

### Microservices Architecture

The backend is organized into the following microservices:

- **Content Service**: Manages posts, comments, and publications
- **Authentication Service**: Handles user authentication and authorization
- **Payment Service**: Processes payments and manages subscriptions
- **Analytics Service**: Tracks and processes platform metrics
- **Delivery Service**: Handles email notifications and content distribution

## Testing

### Running Tests

1. Unit Tests:
```bash
npm run test:unit
```

2. Integration Tests:
```bash
npm run test:integration
```

3. End-to-End Tests:
```bash
npm run test:e2e
```

4. Run all tests with coverage:
```bash
npm test
```

### Test Coverage Requirements

- Minimum coverage: 85% for all modules
- Critical paths: 100% coverage required
- Integration tests for all API endpoints

## Contribution Guidelines

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Maintain consistent file and folder structure
- Write comprehensive documentation and comments

### Git Workflow

1. Create a feature branch from `develop`:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit using conventional commits:
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve issue"
```

3. Push your changes and create a pull request
4. Ensure all tests pass and code coverage meets requirements
5. Request code review from team members

### Pull Request Requirements

- Detailed description of changes
- Link to related issues
- Test coverage report
- Documentation updates if needed
- Passing CI/CD pipeline

For more detailed information about the backend system, please refer to the technical specification document.