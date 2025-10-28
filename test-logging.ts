import logger from './src/utils/logger';
import { requestLogger } from './src/middleware/requestLogger';

// Test logging dasar
console.log('Testing basic logging...');

logger.info('Aplikasi dimulai');
logger.warn('Ini adalah peringatan');
logger.error('Ini adalah pesan error');

// Simulasi request logging
console.log('\nTesting request logging...');
const mockC = {
  req: {
    method: 'GET',
    path: '/test',
    header: (name: string) => name === 'user-agent' ? 'TestAgent/1.0' : '127.0.0.1',
    raw: {
      headers: { get: () => 'TestAgent/1.0' },
      socket: { remoteAddress: '127.0.0.1' }
    }
  },
  res: { status: 200 }
};

const mockNext = async () => {
  console.log('Next middleware called');
};

requestLogger(mockC, mockNext).then(() => {
  console.log('Request logging test complete');
});

console.log('\nLogging tests completed. Check the console output and logs/app.log file for details.');