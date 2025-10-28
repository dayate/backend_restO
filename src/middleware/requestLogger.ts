import { MiddlewareHandler } from 'hono';
import logger from '../utils/logger';

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  
  // Log request
  logger.info({
    method: c.req.method,
    url: c.req.path,
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.req.header('x-client-ip') || c.req.raw.headers.get('cf-connecting-ip') || c.req.raw.socket?.remoteAddress,
    userAgent: c.req.header('user-agent'),
    query: (() => {
      try {
        return c.req.query();
      } catch {
        return {};
      }
    })(),
    headers: {
      'content-type': c.req.header('content-type'),
      'content-length': c.req.header('content-length'),
    }
  }, 'Incoming request');

  await next();

  const ms = Date.now() - start;
  
  // Log response
  logger.info({
    statusCode: c.res.status,
    method: c.req.method,
    url: c.req.path,
    durationMs: ms,
    responseSize: c.res.headers ? (c.res.headers.get('content-length') || 0) : 0
  }, 'Request completed');
};