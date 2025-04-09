const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const logger = require("../utils/logger");
const ProviderManager = require("./ProviderManager");

/**
 * MCP Server implementation that manages providers and tools
 */
class MCPServer {
  constructor(serverConfig, providerManager) {
    this.config = serverConfig;
    this.providerManager = providerManager || new ProviderManager();
    
    // Create the MPC server
    this.server = new Server(
      { name: this.config.name, version: this.config.version },
      { capabilities: { tools: {} } }
    );
    
    // Set up request handlers
    this._setupRequestHandlers();
  }
  
  /**
   * Set up MPC request handlers
   */
  _setupRequestHandlers() {
    // Handler for listing tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.info("Client requested tool list");
      const tools = this.providerManager.getAllToolDefinitions();
      return { tools };
    });
    
    // Handler for calling tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.info(`Client called tool: ${name}`);
      
      try {
        return await this.providerManager.executeTool(name, args);
      } catch (error) {
        logger.error(`Error executing tool ${name}:`, error);
        throw error;
      }
    });
  }
  
  /**
   * Register a provider with the server
   */
  registerProvider(provider) {
    return this.providerManager.registerProvider(provider);
  }
  
  /**
   * Initialize all providers
   */
  async initializeProviders() {
    return this.providerManager.initializeProviders();
  }
  
  /**
   * Start the MPC server with the given transport
   */
  async start(transport = null) {
    // Initialize providers first
    await this.initializeProviders();
    
    // Default to stdio transport if not provided
    if (!transport) {
      transport = new StdioServerTransport();
    }
    
    // Connect the server to the transport
    await this.server.connect(transport);
    logger.info(`MPC Server started (${this.config.name} v${this.config.version})`);
  }
}

module.exports = MCPServer; 