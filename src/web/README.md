# Substack Replica Frontend Application

This document provides essential information for setting up, running, and contributing to the frontend web application.

## Overview

The Substack Replica frontend is a Next.js-based web application that provides a platform for content creation, subscription management, and content delivery. The application is built using modern web technologies including:

- Next.js 13.x for server-side rendering and routing
- React 18.x for UI components
- TypeScript 4.9.x for type safety
- TailwindCSS 3.x for styling
- Redux Toolkit for state management
- ProseMirror for rich text editing

## Prerequisites

- Node.js >= 18.x
- npm >= 8.x
- Docker (optional, for containerized development)

## Setup Instructions

1. Clone the repository and navigate to the frontend directory:
```bash
git clone <repository-url>
cd src/web
```

2. Install dependencies:
```bash
yarn install
```

3. Copy the environment variables template:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_API_KEY=your_stripe_key
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_IMAGE_CDN_URL=your_cdn_url
```

5. Start the development server:
```bash
yarn dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `yarn dev`: Starts the development server
- `yarn build`: Creates a production build
- `yarn start`: Runs the production build
- `yarn lint`: Runs ESLint for code quality checks
- `yarn test`: Executes the test suite

## Environment Configuration

The application supports different environment configurations:

- Development: `.env.local`
- Staging: `.env.staging`
- Production: `.env.production`

Required environment variables:
- `NEXT_PUBLIC_API_URL`: Backend API endpoint
- `NEXT_PUBLIC_STRIPE_API_KEY`: Stripe public key for payments
- `NEXT_PUBLIC_ANALYTICS_ID`: Analytics tracking ID
- `NEXT_PUBLIC_IMAGE_CDN_URL`: CDN URL for image optimization

## Docker Support

The application can be run using Docker for consistent development environments.

1. Build the Docker image:
```bash
docker build -t substack-replica-web .
```

2. Run using Docker Compose:
```bash
docker-compose up
```

The containerized application will be available at `http://localhost:3000`.

## Project Structure

```
src/web/
├── components/     # Reusable React components
├── pages/         # Next.js pages and API routes
├── public/        # Static assets
├── src/
│   ├── lib/       # Utility functions and API clients
│   ├── store/     # Redux store configuration
│   ├── styles/    # Global styles and Tailwind configuration
│   ├── types/     # TypeScript type definitions
│   └── utils/     # Helper functions and utilities
├── tests/         # Test files and test utilities
└── ...
```

## Testing

The application uses Jest and React Testing Library for testing. Run tests using:

```bash
yarn test
```

Test files should be placed in the `tests` directory with the `.test.tsx` extension.

## Contributing

1. Create a new branch for your feature/fix:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and ensure:
   - All tests pass
   - Code follows the project's style guide
   - New features include appropriate tests
   - Documentation is updated as needed

3. Submit a pull request with a clear description of your changes

## Production Deployment

1. Build the production image:
```bash
docker build -t substack-replica-web:prod --target production .
```

2. Configure production environment variables
3. Deploy using your preferred hosting service (Vercel, AWS, etc.)
4. Ensure SSL certificates are properly configured
5. Set up CDN for static assets

## Troubleshooting

Common issues and solutions:

1. **Build Errors**
   - Ensure Node.js version matches requirements
   - Clear `.next` directory and node_modules
   - Verify all dependencies are installed

2. **Environment Variables**
   - Check that all required variables are set
   - Verify variable names match the .env.example template

3. **Docker Issues**
   - Ensure Docker daemon is running
   - Check port availability (3000)
   - Verify Docker Compose configuration

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)