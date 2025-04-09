const { z } = require("zod");
const logger = require("../utils/logger");

/**
 * Base provider class that all provider implementations should extend
 */
class BaseProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.tools = [];
    this.schemas = {};
    this.handlers = {};
    this.enabled = true;
  }

  /**
   * Initialize the provider
   */
  async initialize() {
    if (!this.isEnabled()) {
      logger.info(`Provider ${this.name} is disabled, skipping initialization`);
      return false;
    }
    
    logger.info(`Initializing provider: ${this.name}`);
    return true;
  }

  /**
   * Check if the provider is enabled
   */
  isEnabled() {
    return this.enabled !== false;
  }

  /**
   * Register a tool with this provider
   * @param {string} name - Tool name
   * @param {object} definition - Tool definition 
   * @param {function} handler - Tool handler function
   * @param {object} schema - Zod schema for validation
   */
  registerTool(name, definition, handler, schema) {
    if (!name || !definition || !handler) {
      logger.error(`Failed to register tool: missing required parameters`);
      return false;
    }

    // Add the tool definition
    this.tools.push(definition);
    
    // Store the schema for validation
    if (schema) {
      this.schemas[name] = schema;
    }
    
    // Store the handler function
    this.handlers[name] = handler;
    
    logger.info(`Registered tool: ${name} from provider ${this.name}`);
    return true;
  }

  /**
   * Get all tool definitions from this provider
   */
  getToolDefinitions() {
    return this.tools;
  }

  /**
   * Get a tool handler by name
   */
  getToolHandler(name) {
    return this.handlers[name];
  }

  /**
   * Validate arguments against the tool's schema
   */
  validateArgs(toolName, args) {
    const schema = this.schemas[toolName];
    if (!schema) {
      return args; // No schema, return args as is
    }
    
    try {
      return schema.parse(args);
    } catch (error) {
      logger.error(`Validation error for tool ${toolName}:`, error.errors);
      throw error;
    }
  }

  /**
   * Run a tool with the given arguments
   */
  async executeTool(toolName, args) {
    if (!this.isEnabled()) {
      throw new Error(`Provider ${this.name} is disabled`);
    }
    
    const handler = this.getToolHandler(toolName);
    if (!handler) {
      throw new Error(`Tool ${toolName} not found in provider ${this.name}`);
    }
    
    try {
      // Validate arguments
      const validatedArgs = this.validateArgs(toolName, args);
      
      // Execute the tool
      return await handler(validatedArgs);
    } catch (error) {
      logger.error(`Error executing tool ${toolName}:`, error);
      throw error;
    }
  }
}

module.exports = BaseProvider; 