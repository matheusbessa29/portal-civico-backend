import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_DIR = process.env.LOG_FILE_PATH || path.join(process.cwd(), 'logs');

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} ${level}: ${message}`;
        if (Object.keys(meta).length > 0 && meta.constructor === Object) {
            msg += ` ${JSON.stringify(meta, null, 2)}`;
        }
        return msg;
    })
);

// Custom format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: LOG_LEVEL,
    defaultMeta: { service: 'portal-civico' },
    transports: [
        // Console output (development)
        new winston.transports.Console({
            format: consoleFormat,
            silent: process.env.NODE_ENV === 'test',
        }),

        // File output - All logs
        new DailyRotateFile({
            filename: path.join(LOG_DIR, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: process.env.LOG_MAX_FILES || '30d',
            format: fileFormat,
            level: 'info',
        }),

        // File output - Errors only
        new DailyRotateFile({
            filename: path.join(LOG_DIR, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: process.env.LOG_MAX_FILES || '30d',
            format: fileFormat,
            level: 'error',
        }),

        // File output - Collections
        new DailyRotateFile({
            filename: path.join(LOG_DIR, 'collection-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: process.env.LOG_MAX_FILES || '30d',
            format: fileFormat,
            level: 'debug',
        }),
    ],
});

// Helper functions for structured logging
export const log = {
    info: (message: string, meta?: Record<string, any>) => {
        logger.info(message, meta);
    },

    error: (message: string, error?: Error | unknown, meta?: Record<string, any>) => {
        if (error instanceof Error) {
            logger.error(message, {
                ...meta,
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                }
            });
        } else {
            logger.error(message, { ...meta, error });
        }
    },

    warn: (message: string, meta?: Record<string, any>) => {
        logger.warn(message, meta);
    },

    debug: (message: string, meta?: Record<string, any>) => {
        logger.debug(message, meta);
    },

    // Specific log types for collectors
    collection: {
        start: (collectorName: string, meta?: Record<string, any>) => {
            logger.info(`🚀 Collection started: ${collectorName}`, {
                collector: collectorName,
                type: 'collection_start',
                ...meta,
            });
        },

        success: (collectorName: string, stats: {
            itemsCollected: number;
            itemsNew: number;
            itemsUpdated: number;
            executionTimeMs: number;
        }) => {
            logger.info(`✓ Collection completed: ${collectorName}`, {
                collector: collectorName,
                type: 'collection_success',
                ...stats,
            });
        },

        error: (collectorName: string, error: Error, meta?: Record<string, any>) => {
            logger.error(`✗ Collection failed: ${collectorName}`, error, {
                collector: collectorName,
                type: 'collection_error',
                ...meta,
            });
        },

        retry: (collectorName: string, attempt: number, maxAttempts: number) => {
            logger.warn(`↻ Collection retry: ${collectorName} (attempt ${attempt}/${maxAttempts})`, {
                collector: collectorName,
                type: 'collection_retry',
                attempt,
                maxAttempts,
            });
        },
    },
};

export default logger;