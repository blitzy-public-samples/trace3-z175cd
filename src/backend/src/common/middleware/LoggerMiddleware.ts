/**
 * @fileoverview Middleware for logging HTTP requests and responses, including metadata 
 * such as request method, URL, status code, and response time.
 * 
 * Requirements Addressed:
 * - Logging and Monitoring (Technical Specification/Cross-Cutting Concerns/Logging):
 *   Implements a centralized logging mechanism to capture application events, errors,
 *   and debugging information through HTTP request/response logging.
 * 
 * Human Tasks:
 * - Ensure proper network timeout configurations are set in the production environment
 * - Configure any IP filtering or rate limiting if needed
 * - Set up monitoring alerts for response times exceeding thresholds
 */

import { Request, Response, NextFunction } from 'express'; // express v4.18.2
import { logInfo, logError } from '../utils/logger';

/**
 * Middleware function to log HTTP requests and responses with detailed metadata.
 * Captures timing information and logs both incoming requests and their corresponding responses.
 */
const LoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();

    // Extract request metadata
    const requestMetadata = {
        requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.socket.remoteAddress,
        referrer: req.headers.referer || req.headers.referrer,
        userId: (req as any).user?.id, // If auth middleware adds user info
        contentType: req.headers['content-type'],
        contentLength: req.headers['content-length'],
    };

    // Log incoming request
    logInfo(`Incoming ${req.method} request to ${req.originalUrl || req.url}`, {
        ...requestMetadata,
        query: req.query,
        params: req.params,
        // Don't log sensitive body data like passwords
        body: req.method !== 'GET' ? '(request body omitted)' : undefined
    });

    // Capture response data using response event listeners
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        // Log response details
        logInfo(`Completed ${req.method} request to ${req.originalUrl || req.url}`, {
            ...requestMetadata,
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            duration: `${duration}ms`,
            responseHeaders: {
                'content-type': res.getHeader('content-type'),
                'content-length': res.getHeader('content-length')
            }
        });
    });

    // Handle errors in the request-response cycle
    res.on('error', (error: Error) => {
        logError(`Error processing ${req.method} request to ${req.originalUrl || req.url}`, {
            ...requestMetadata,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            duration: `${Date.now() - startTime}ms`
        });
    });

    // Continue to next middleware
    next();
};

export default LoggerMiddleware;