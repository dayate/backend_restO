import { ErrorHandler } from 'hono';
import logger from '../utils/logger';
import errorLogger from '../utils/errorLogger';

export const errorHandler: ErrorHandler = (error, c) => {
  const errorData = {
    msg: 'Unhandled application error',
    error: error.message,
    stack: error.stack,
    method: c.req.method,
    url: c.req.path,
    userAgent: c.req.header('user-agent'),
  };

  // Log ke console dan file umum
  logger.error(errorData);
  
  // Log ke file error khusus
  errorLogger.error(errorData);

  // Return appropriate error response
  return c.json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  }, 500);
};