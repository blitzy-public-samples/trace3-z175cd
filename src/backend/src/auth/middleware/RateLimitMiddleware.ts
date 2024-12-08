/**
 * @fileoverview Implements rate-limiting middleware to protect API endpoints from abuse.
 * 
 * Requirements Addressed:
 * - Rate Limiting (Technical Specification/Security Considerations/Security Controls)
 *   Implements rate-limiting to restrict the number of API requests from a single source
 *   within a specified time frame.
 * 
 * Human Tasks:
 * 1. Configure Redis instance with appropriate memory allocation for rate limiting
 * 2. Set up Redis monitoring alerts for rate limit violations
 * 3. Review and adjust rate limit thresholds based on production metrics
 * 4. Configure network security rules to allow Redis access from application servers
 */

// express-rate-limit v6.7.0
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { initializeRedis } from '../../common/config/redis';
import { logError } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Interface for rate limit options
 */
interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Maximum number of requests per window
  message?: string; // Custom error message
  standardHeaders?: boolean; // Return rate limit info in headers
  legacyHeaders?: boolean; // Enable legacy rate limit headers
  skipFailedRequests?: boolean; // Don't count failed requests
  skipSuccessfulRequests?: boolean; // Don't count successful requests
}

/**
 * Creates an Express middleware function for rate-limiting API requests.
 * Uses Redis for distributed rate limiting across multiple application instances.
 * 
 * @param options - Configuration options for the rate limiter
 * @returns Express middleware function
 */
export const rateLimitMiddleware = (options: RateLimitOptions = {}) => {
  const redis = initializeRedis();

  // Default configuration values aligned with technical specification
  const defaultOptions: RateLimitOptions = {
    windowMs: 60 * 1000, // 1 minute window
    max: 100, // 100 requests per minute per IP
    message: 'Too many requests, please try again later',
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    skipFailedRequests: false, // Count all requests
    skipSuccessfulRequests: false // Count all requests
  };

  // Merge provided options with defaults
  const finalOptions = { ...defaultOptions, ...options };

  try {
    return rateLimit({
      ...finalOptions,
      // Custom store implementation using Redis
      store: {
        init: () => {
          // Optional store initialization
        },
        // Increment request count for IP
        increment: async (key: string) => {
          try {
            const multi = redis.multi();
            multi.incr(key);
            multi.pexpire(key, finalOptions.windowMs || defaultOptions.windowMs);
            const results = await multi.exec();
            return results ? (results[0][1] as number) : 1;
          } catch (error) {
            logError('Rate limit increment failed', {
              error: error instanceof Error ? error.message : 'Unknown error',
              key,
              timestamp: new Date().toISOString()
            });
            return 1; // Fail open to prevent blocking legitimate traffic
          }
        },
        // Decrement request count for IP (used when skipSuccessfulRequests/skipFailedRequests is true)
        decrement: async (key: string) => {
          try {
            await redis.decr(key);
          } catch (error) {
            logError('Rate limit decrement failed', {
              error: error instanceof Error ? error.message : 'Unknown error',
              key,
              timestamp: new Date().toISOString()
            });
          }
        },
        // Reset request count for IP
        resetKey: async (key: string) => {
          try {
            await redis.del(key);
          } catch (error) {
            logError('Rate limit key reset failed', {
              error: error instanceof Error ? error.message : 'Unknown error',
              key,
              timestamp: new Date().toISOString()
            });
          }
        }
      },
      // Custom handler for rate limit exceeded
      handler: (req: Request, res: Response) => {
        logError('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          method: req.method,
          timestamp: new Date().toISOString(),
          errorCode: ERROR_CODES.FORBIDDEN
        });

        res.status(429).json({
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: finalOptions.message,
            retryAfter: Math.ceil(finalOptions.windowMs! / 1000) // Seconds until reset
          }
        });
      },
      // Custom key generator using IP and optional user ID
      keyGenerator: (req: Request) => {
        const userId = req.user?.id || '';
        return `rate_limit:${req.ip}:${userId}`;
      },
      // Skip rate limiting for certain requests (e.g., health checks)
      skip: (req: Request) => {
        return req.path === '/health' || req.path === '/metrics';
      }
    });
  } catch (error) {
    // Log initialization error
    logError('Rate limit middleware initialization failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    // Return a pass-through middleware to prevent application failure
    return (req: Request, res: Response, next: Function) => next();
  }
};