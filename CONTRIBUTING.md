# Contributing to Substack Replica

Thank you for your interest in contributing to the Substack Replica platform! This guide will help you get started with contributing to the project, from setting up your development environment to submitting pull requests.

## Table of Contents
- [Introduction](#introduction)
- [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Reporting Issues](#reporting-issues)
- [Requesting Features](#requesting-features)
- [Community Standards](#community-standards)
- [Security Policies](#security-policies)

## Introduction

Substack Replica is an open-source platform that welcomes contributions from developers of all skill levels. Whether you're fixing bugs, adding new features, improving documentation, or suggesting enhancements, your contributions help make this platform better for everyone.

We value:
- Collaborative development
- Clear communication
- Quality code
- Thorough testing
- Comprehensive documentation

## Setting Up the Development Environment

Follow these steps to set up your local development environment:

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/substack-replica.git
   cd substack-replica
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Configure the following required environment variables:
     - `DATABASE_URL`: PostgreSQL connection URL
     - `REDIS_URL`: Redis connection URL
     - `AWS_S3_BUCKET`: S3 bucket for media storage
     - `AWS_ACCESS_KEY_ID`: AWS access key
     - `AWS_SECRET_ACCESS_KEY`: AWS secret key
     - `SMTP_HOST`: Email service host
     - `SMTP_PORT`: Email service port
     - `SMTP_USER`: SMTP username
     - `SMTP_PASS`: SMTP password

4. **Database Setup**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Run Tests**
   ```bash
   npm test
   ```

## Submitting Pull Requests

1. **Create a Branch**
   - For features: `feature/<feature-name>`
   - For bugfixes: `bugfix/<issue-id>`
   - For documentation: `docs/<description>`
   - For performance improvements: `perf/<description>`

2. **Code Standards**
   - Follow the project's TypeScript style guide
   - Maintain 100% test coverage for new code
   - Use meaningful variable and function names
   - Add JSDoc comments for public APIs
   - Follow SOLID principles
   - Keep functions small and focused

3. **Commit Guidelines**
   - Write clear, concise commit messages
   - Use conventional commits format:
     ```
     type(scope): description
     
     [optional body]
     [optional footer]
     ```
   - Types: feat, fix, docs, style, refactor, test, chore

4. **Pull Request Process**
   - Update relevant documentation
   - Add tests for new functionality
   - Ensure all tests pass
   - Update the changelog if applicable
   - Link related issues
   - Add screenshots for UI changes
   - Request review from maintainers

5. **Review Process**
   - Address reviewer feedback promptly
   - Keep discussions constructive
   - Update PR based on suggestions
   - Maintain a clean commit history

## Reporting Issues

When reporting bugs, please include:

1. **Issue Description**
   - Clear, concise description of the problem
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable

2. **Environment Details**
   - Browser version (for frontend issues)
   - Node.js version
   - Operating system
   - Package versions

3. **Additional Context**
   - Error messages
   - Console logs
   - Related issues
   - Possible solutions

## Requesting Features

Feature requests should include:

1. **Problem Statement**
   - Describe the problem you're trying to solve
   - Explain why this feature would be valuable
   - Identify the target users

2. **Proposed Solution**
   - Detailed description of the solution
   - Technical approach if applicable
   - UI/UX mockups if relevant
   - Potential alternatives considered

3. **Implementation Details**
   - Required changes to existing code
   - New components or services needed
   - Security considerations
   - Performance impact

## Community Standards

We maintain a welcoming and inclusive community. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) for detailed guidelines on:
- Expected behavior
- Unacceptable behavior
- Reporting procedures
- Enforcement policies
- Community responsibilities

## Security Policies

For security-related issues:
- Read our [Security Policy](SECURITY.md)
- Report vulnerabilities privately
- Follow responsible disclosure
- Use security best practices
- Keep dependencies updated

Thank you for contributing to Substack Replica! Your efforts help make this platform better for everyone.