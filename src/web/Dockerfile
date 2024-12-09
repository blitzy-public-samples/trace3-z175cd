# Requirement: Containerization and Deployment
# Location: Technical Specification/6. TECHNOLOGY STACK/Development & Deployment
# Description: Base image selection for optimal Node.js runtime environment
FROM node:23-alpine

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Set working directory
WORKDIR /app

# Requirement: Frontend Framework and Libraries
# Location: Technical Specification/6. TECHNOLOGY STACK/Frontend Libraries
# Description: Install dependencies using yarn for consistent builds
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy application files
COPY . .

# Create production build
# Requirement: Frontend Framework and Libraries
# Location: Technical Specification/6. TECHNOLOGY STACK/Frontend Libraries
# Description: Builds the Next.js application for production deployment
RUN yarn build

# Remove development dependencies to reduce image size
RUN yarn install --production --ignore-scripts --prefer-offline --frozen-lockfile

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Expose application port
EXPOSE 3000

# Configure health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
# Requirement: Containerization and Deployment
# Location: Technical Specification/6. TECHNOLOGY STACK/Development & Deployment
# Description: Runs the Next.js application in production mode
CMD ["yarn", "start"]