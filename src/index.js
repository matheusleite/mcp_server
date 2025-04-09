const MCPServer = require("./core/MCPServer");
const config = require("./config");
const logger = require("./utils/logger");
const { EvolutionProvider, ExampleProvider } = require("./providers");

/**
 * Create and configure providers
 */
function setupProviders() {
  const providers = [];
  
  // Setup Evolution provider if enabled
  if (config.providers.evolution.enabled) {
    providers.push(new EvolutionProvider(config.providers.evolution));
  }
  
  // Setup Example provider if enabled
  if (config.providers.example.enabled) {
    providers.push(new ExampleProvider(config.providers.example));
  }
  
  // Add more providers here
  
  return providers;
}

/**
 * Main function to start the server
 */
async function main() {
  try {
    // Create MCP Server
    const server = new MCPServer(config.server);
    
    // Register providers
    const providers = setupProviders();
    for (const provider of providers) {
      server.registerProvider(provider);
    }
    
    // Start the server
    await server.start();
    
    logger.info("MCP Server running");
  } catch (error) {
    logger.error("Fatal error:", error);
    process.exit(1);
  }
}

/**
 * CLI execution for testing tools directly
 */
async function runCliCommand() {
  const args = process.argv.slice(2);
  const toolName = args[0];
  const toolArgs = args[1] ? JSON.parse(args[1]) : {};
  
  logger.info(`Running tool ${toolName} with args:`, toolArgs);
  
  try {
    // Setup providers
    const providers = setupProviders();
    const providerManager = new (require("./core/ProviderManager"))();
    
    // Register providers
    for (const provider of providers) {
      providerManager.registerProvider(provider);
    }
    
    // Initialize providers
    await providerManager.initializeProviders();
    
    // Execute the tool
    const result = await providerManager.executeTool(toolName, toolArgs);
    console.log(JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    logger.error(`Error executing ${toolName}:`, error);
    process.exit(1);
  }
}

// Check if running in CLI mode or server mode
if (process.argv.length > 2) {
  runCliCommand();
} else {
  main();
} 