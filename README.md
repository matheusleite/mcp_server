# Multi-Provider MCP Server

A robust and extensible Model Context Protocol (MCP) server that supports multiple tool providers. This server enables AI models to utilize tools from different service providers through a standardized interface.

## Features

- Modular architecture for easy extension with new providers
- Centralized configuration management
- Provider-specific tool implementations
- CLI mode for direct tool testing
- Comprehensive error handling and logging

## Supported Providers

Currently, the server supports the following providers:

- **Evolution API**: Tools for WhatsApp messaging and group management

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
4. Configure your environment variables in the `.env` file

### Running the Server

Start the server in development mode:

```bash
npm run dev
```

Or in production:

```bash
npm start
```

### Using CLI Mode for Testing Tools

You can directly test any tool by running:

```bash
npm run tool <tool_name> '<json_args>'
```

Example:

```bash
npm run tool envia_mensagem '{"number":"5511999999999","mensagem":"Hello world!"}'
```

## Adding a New Provider

1. Create a new provider class in the `src/providers` directory, extending `BaseProvider`
2. Implement the required tools and their handlers
3. Register your provider in `src/providers/index.js`
4. Add provider configuration in `src/config/index.js`
5. Update `.env.example` with new variables

### Provider Template

```javascript
const BaseProvider = require('../core/BaseProvider');

class MyNewProvider extends BaseProvider {
  constructor(config) {
    super('provider-name', config);
    this._registerTools();
  }
  
  _registerTools() {
    // Register your tools here
  }
}

module.exports = MyNewProvider;
```

## Architecture

```
├── src/
│   ├── config/             # Configuration settings
│   ├── core/               # Core server functionality
│   │   ├── BaseProvider.js # Base class for providers
│   │   ├── MCPServer.js    # MCP server implementation
│   │   └── ProviderManager.js # Manages all providers
│   ├── providers/          # Provider implementations
│   │   ├── EvolutionProvider.js  # Evolution API provider
│   │   └── index.js        # Provider exports
│   ├── utils/              # Utility functions
│   │   ├── httpClient.js   # HTTP client wrapper
│   │   └── logger.js       # Logging utility
│   └── index.js            # Application entry point
├── .env                    # Environment variables
├── .env.example            # Environment variables template
└── package.json            # Project metadata
```

## License

ISC 