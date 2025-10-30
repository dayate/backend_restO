import logger from "../src/utils/logger";

// Membuat beberapa log untuk pengujian
logger.info("Test info log");
logger.warn("Test warning log");
logger.error("Test error log");

// Test error logger
import errorLogger from "../src/utils/errorLogger";
errorLogger.error({
  msg: "Test error log to error file",
  error: "This is a test error",
});

console.log("Test logs created. Check logs/app.log and logs/error.log files.");
