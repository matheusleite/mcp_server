const axios = require("axios");
const logger = require("./logger");

/**
 * HTTP client for making API requests with standardized error handling
 */
class HttpClient {
  constructor(baseConfig = {}) {
    this.client = axios.create(baseConfig);
    
    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error("Request error:", error);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error(`API Error: ${error.response.status} ${error.response.statusText}`);
          logger.debug("Error response data:", error.response.data);
        } else if (error.request) {
          logger.error("No response received from API");
        } else {
          logger.error("Error setting up request:", error.message);
        }
        return Promise.reject(error);
      }
    );
  }
  
  async get(url, config = {}) {
    return this.client.get(url, config);
  }
  
  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }
  
  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }
  
  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }
}

module.exports = HttpClient; 