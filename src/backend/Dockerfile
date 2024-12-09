# Requirements Addressed:
# - Containerization (Technical Specification/System Design/Deployment Architecture/Containerization)
#   Ensures the backend service is containerized for deployment in Kubernetes and Docker environments.
# - Environment Configuration (Technical Specification/System Architecture/Cross-Cutting Concerns)
#   Ensures the Docker container is configured with the necessary environment variables and dependencies.

# Human Tasks:
# 1. Ensure all required environment variables are properly configured in deployment environment
# 2. Configure appropriate resource limits in Kubernetes deployment
# 3. Set up monitoring for container health and performance
# 4. Review and adjust security settings for production deployment
# 5. Configure proper logging collection from containers

# Use Node.js 18 Alpine as base image for a lightweight runtime environment
# node v18-alpine
FROM node:23-alpine

# Set working directory
WORKDIR /usr/src/app

# Install production dependencies first
# This layer will be cached unless package.json or package-lock.json changes
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Install development dependencies for TypeScript compilation
# These will be removed after build
RUN npm ci

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/

# Copy environment configuration template
COPY .env.example ./

# Build TypeScript code
RUN npm run build && \
    # Remove development dependencies and TypeScript source after build
    npm prune --production && \
    rm -rf src/ && \
    rm -rf node_modules/@types && \
    rm tsconfig.json

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Create non-root user for security
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Expose port 3000
EXPOSE 3000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "run", "start"]