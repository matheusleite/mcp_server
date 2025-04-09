const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config();

/**
 * Server configuration settings
 */
const config = {
  server: {
    name: "multi-provider-tools-server",
    version: "1.0.0",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
  providers: {
    evolution: {
      enabled: process.env.EVOLUTION_ENABLED === "true" || true,
      instancia: process.env.EVOLUTION_INSTANCIA,
      apikey: process.env.EVOLUTION_APIKEY,
      apiBase: process.env.EVOLUTION_API_BASE || "sua_url_evolution",
    },
    example: {
      enabled: process.env.EXAMPLE_ENABLED === "true" || true,
    },
    // Add other providers here
  }
};

module.exports = config; 