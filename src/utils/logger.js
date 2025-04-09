const config = require("../config");

/**
 * Simple logger utility with different log levels
 */
const logger = {
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  warn: (message, ...args) => {
    if (["debug", "info", "warn"].includes(config.logging.level)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  info: (message, ...args) => {
    if (["debug", "info"].includes(config.logging.level)) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  debug: (message, ...args) => {
    if (config.logging.level === "debug") {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
};

module.exports = logger; 