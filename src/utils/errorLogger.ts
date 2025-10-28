import pino from 'pino';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Membuat direktori logs jika belum ada
const logsDir = join(process.cwd(), 'logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

// Logger khusus untuk error
const errorLogger = pino({
  level: 'error',
  transport: {
    target: 'pino/file',
    options: {
      destination: join(logsDir, 'error.log'),
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

export default errorLogger;