const { z } = require("zod");
const BaseProvider = require("../core/BaseProvider");
const HttpClient = require("../utils/httpClient");
const logger = require("../utils/logger");

// Schemas para validação com Zod
const schemas = {
  echo: z.object({
    message: z.string(),
  }),
  calculate: z.object({
    operation: z.enum(["add", "subtract", "multiply", "divide"]),
    a: z.number(),
    b: z.number(),
  }),
};

/**
 * Example Provider - Demonstração de como criar um novo provider
 */
class ExampleProvider extends BaseProvider {
  constructor(config) {
    super("example", config);
    this.enabled = config.enabled !== false;
    
    // Register all tools
    this._registerTools();
  }
  
  /**
   * Register all Example tools
   */
  _registerTools() {
    // Echo Tool
    this.registerTool(
      "echo",
      {
        name: "echo",
        description: "Ecoa uma mensagem de volta",
        inputSchema: {
          type: "object",
          properties: {
            message: { type: "string", description: "Mensagem para ecoar de volta" },
          },
          required: ["message"],
        },
      },
      this._echo.bind(this),
      schemas.echo
    );
    
    // Calculate Tool
    this.registerTool(
      "calculate",
      {
        name: "calculate",
        description: "Executa uma operação matemática simples",
        inputSchema: {
          type: "object",
          properties: {
            operation: { 
              type: "string", 
              enum: ["add", "subtract", "multiply", "divide"],
              description: "Operação matemática a ser executada" 
            },
            a: { type: "number", description: "Primeiro operando" },
            b: { type: "number", description: "Segundo operando" },
          },
          required: ["operation", "a", "b"],
        },
      },
      this._calculate.bind(this),
      schemas.calculate
    );
  }
  
  /**
   * Echo tool implementation
   */
  async _echo(args) {
    return {
      content: [{
        type: "text",
        text: `Echo: ${args.message}`,
      }],
    };
  }
  
  /**
   * Calculate tool implementation
   */
  async _calculate(args) {
    const { operation, a, b } = args;
    let result;
    
    switch (operation) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        if (b === 0) {
          throw new Error("Cannot divide by zero");
        }
        result = a / b;
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    return {
      content: [{
        type: "text",
        text: `Result of ${a} ${operation} ${b} = ${result}`,
      }],
    };
  }
}

module.exports = ExampleProvider; 