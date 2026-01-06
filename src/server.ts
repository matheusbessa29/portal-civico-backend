import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { closePool } from './config/database.config';
import { log } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create Express app
const app: Application = express();

// ========================================
// Middleware
// ========================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging (simple version)
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        log.info(`${req.method} ${req.path} - ${res.statusCode}`, {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
        });
    });

    next();
});

// ========================================
// Routes
// ========================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        version: '0.1.0',
    });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.json({
        message: 'Portal Cívico API',
        version: '0.1.0',
        environment: NODE_ENV,
        endpoints: {
            health: '/health',
            api: '/api/v1',
            docs: '/api/docs',
        },
    });
});

// API routes (will be implemented later)
// app.use('/api/v1', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    log.error('Unhandled error', err, {
        method: req.method,
        path: req.path,
        body: req.body,
    });

    res.status(500).json({
        error: 'Internal Server Error',
        message: NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
    });
});

// ========================================
// Server Startup
// ========================================

async function startServer() {
    try {
        log.info('🏛️  Portal Cívico - Starting server...');
        log.info(`Environment: ${NODE_ENV}`);

        // Test database connection
        log.info('Testing database connection...');
        //const dbConnected = await testConnection();

        //if (!dbConnected) {
        //    throw new Error('Database connection failed');
        //}

        // Start HTTP server
        const server = app.listen(PORT, () => {
            log.info(`✓ Server running at http://${HOST}:${PORT}`);
            log.info(`✓ Environment: ${NODE_ENV}`);
            log.info(`✓ Press CTRL+C to stop`);
        });

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            log.info(`\n${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                log.info('✓ HTTP server closed');

                // Close database pool
                await closePool();

                log.info('✓ Graceful shutdown completed');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                log.error('✗ Forcing shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Handle uncaught errors
        process.on('uncaughtException', (error: Error) => {
            log.error('✗ Uncaught Exception', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason: any) => {
            log.error('✗ Unhandled Rejection', reason);
            process.exit(1);
        });

    } catch (error) {
        log.error('✗ Failed to start server', error as Error);
        process.exit(1);
    }
}

// Start the server
if (require.main === module) {
    startServer();
}

export default app;