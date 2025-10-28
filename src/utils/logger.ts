import pino from 'pino';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Membuat direktori logs jika belum ada
const logsDir = join(process.cwd(), 'logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

// Konfigurasi logger berdasarkan environment
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        }
      }
    : {
        target: 'pino/file',
        options: {
          destination: join(logsDir, 'app.log'),
        }
      },
  serializers: {
    // Menambahkan serializer khusus untuk menangani error
    error(err: any) {
      return {
        type: err.constructor.name,
        message: err.message,
        stack: err.stack,
        ...err
      };
    }
  }
});

export default logger;