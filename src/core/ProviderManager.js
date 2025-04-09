const logger = require("../utils/logger");

/**
 * Manages all tool providers in the system
 */
class ProviderManager {
  constructor() {
    this.providers = {};
    this.toolMappings = {};
  }

  /**
   * Register a provider
   * @param {BaseProvider} provider - Provider instance
   */
  registerProvider(provider) {
    if (!provider || !provider.name) {
      logger.error("Cannot register provider: missing name or invalid provider");
      return false;
    }

    if (this.providers[provider.name]) {
      logger.warn(`Provider ${provider.name} is already registered, it will be overwritten`);
    }

    this.providers[provider.name] = provider;
    logger.info(`Registered provider: ${provider.name}`);
    
    // Map all tools from this provider
    this._mapProviderTools(provider);
    
    return true;
  }

  /**
   * Initialize all registered providers
   */
  async initializeProviders() {
    logger.info("Initializing all providers...");
    const results = [];
    
    for (const [name, provider] of Object.entries(this.providers)) {
      if (provider.isEnabled()) {
        try {
          const result = await provider.initialize();
          results.push({ name, success: result });
          logger.info(`Provider ${name} initialized successfully`);
        } catch (error) {
          results.push({ name, success: false, error: error.message });
          logger.error(`Failed to initialize provider ${name}:`, error);
        }
      } else {
        logger.info(`Provider ${name} is disabled, skipping initialization`);
        results.push({ name, success: false, disabled: true });
      }
    }
    
    return results;
  }

  /**
   * Get all tool definitions from all providers
   */
  getAllToolDefinitions() {
    const tools = [];
    
    for (const provider of Object.values(this.providers)) {
      if (provider.isEnabled()) {
        tools.push(...provider.getToolDefinitions());
      }
    }
    
    return tools;
  }

  /**
   * Execute a tool with given arguments
   */
  async executeTool(toolName, args) {
    const mapping = this.toolMappings[toolName];
    
    if (!mapping) {
      throw new Error(`Tool ${toolName} not found in any provider`);
    }
    
    const provider = this.providers[mapping.provider];
    
    if (!provider) {
      throw new Error(`Provider ${mapping.provider} not found`);
    }
    
    return provider.executeTool(mapping.originalName, args);
  }

  /**
   * Map all tools from a provider to the tool mappings
   */
  _mapProviderTools(provider) {
    if (!provider.isEnabled()) {
      return;
    }
    
    const tools = provider.getToolDefinitions();
    
    for (const tool of tools) {
      const toolName = tool.name;
      
      // Store a mapping from tool name to provider
      this.toolMappings[toolName] = {
        provider: provider.name,
        originalName: toolName
      };
      
      logger.debug(`Mapped tool ${toolName} to provider ${provider.name}`);
    }
  }
}

module.exports = ProviderManager; 