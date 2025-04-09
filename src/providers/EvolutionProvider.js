const { z } = require("zod");
const BaseProvider = require("../core/BaseProvider");
const HttpClient = require("../utils/httpClient");
const logger = require("../utils/logger");

// Schemas para validação com Zod
const schemas = {
  enviaMensagem: z.object({
    number: z.string(),
    mensagem: z.string(),
  }),
  criaGrupo: z.object({
    subject: z.string(),
    description: z.string().optional(),
    participants: z.array(z.string()),
  }),
  buscaGrupos: z.object({
    getParticipants: z.boolean().optional().default(false),
  }),
  buscaParticipantesGrupo: z.object({
    groupJid: z.string(),
  }),
};

/**
 * Evolution API Provider
 */
class EvolutionProvider extends BaseProvider {
  constructor(config) {
    super("evolution", config);
    this.enabled = config.enabled !== false;
    
    // Configuration values
    this.instancia = config.instancia;
    this.apikey = config.apikey;
    this.apiBase = config.apiBase;
    
    if (!this.instancia || !this.apikey || !this.apiBase) {
      logger.warn("Evolution provider missing required configuration (instancia, apikey, or apiBase)");
      this.enabled = false;
    }
    
    // Create HTTP client with base configuration
    this.httpClient = new HttpClient({
      headers: {
        "Content-Type": "application/json",
        "apikey": this.apikey,
      },
    });
    
    // Register all tools
    this._registerTools();
  }
  
  /**
   * Register all Evolution tools
   */
  _registerTools() {
    // Envia Mensagem
    this.registerTool(
      "envia_mensagem",
      {
        name: "envia_mensagem",
        description: "Envia mensagem de texto via API Evolution",
        inputSchema: {
          type: "object",
          properties: {
            number: { type: "string", description: "Número do destinatário com DDI e DDD" },
            mensagem: { type: "string", description: "Texto da mensagem a ser enviada" },
          },
          required: ["number", "mensagem"],
        },
      },
      this._enviaMensagem.bind(this),
      schemas.enviaMensagem
    );
    
    // Cria Grupo
    this.registerTool(
      "cria_grupo",
      {
        name: "cria_grupo",
        description: "Cria um grupo via API Evolution",
        inputSchema: {
          type: "object",
          properties: {
            subject: { type: "string", description: "Nome do grupo" },
            description: { type: "string", description: "Descrição do grupo" },
            participants: {
              type: "array",
              items: { type: "string" },
              description: "Participantes do grupo (números com DDI/DDD)"
            },
          },
          required: ["subject", "participants"],
        },
      },
      this._criaGrupo.bind(this),
      schemas.criaGrupo
    );
    
    // Busca Grupos
    this.registerTool(
      "busca_grupos",
      {
        name: "busca_grupos",
        description: "Busca todos os grupos da instância com opção de listar participantes.",
        inputSchema: {
          type: "object",
          properties: {
            getParticipants: {
              type: "boolean",
              description: "Listar participantes dos grupos?",
              default: false,
            },
          },
          required: [],
        },
      },
      this._buscaGrupos.bind(this),
      schemas.buscaGrupos
    );
    
    // Busca Participantes do Grupo
    this.registerTool(
      "busca_participantes_grupo",
      {
        name: "busca_participantes_grupo",
        description: "Busca participantes específicos de um grupo pela instância.",
        inputSchema: {
          type: "object",
          properties: {
            groupJid: { type: "string", description: "Identificador do grupo" },
          },
          required: ["groupJid"],
        },
      },
      this._buscaParticipantesGrupo.bind(this),
      schemas.buscaParticipantesGrupo
    );
  }
  
  /**
   * Envia mensagem tool implementation
   */
  async _enviaMensagem(args) {
    const url = `http://${this.apiBase}/message/sendText/${this.instancia}`;
    
    try {
      const response = await this.httpClient.post(url, {
        number: args.number,
        text: args.mensagem,
      });
      
      return {
        content: [{
          type: "text",
          text: `Mensagem enviada com sucesso para ${args.number}.\nResposta: ${JSON.stringify(response.data)}`,
        }],
      };
    } catch (error) {
      logger.error("Erro ao enviar mensagem:", error);
      throw new Error(`Falha ao enviar mensagem: ${error.message}`);
    }
  }
  
  /**
   * Cria grupo tool implementation
   */
  async _criaGrupo(args) {
    const url = `http://${this.apiBase}/group/create/${this.instancia}`;
    
    try {
      const response = await this.httpClient.post(url, {
        subject: args.subject,
        description: args.description,
        participants: args.participants,
      });
      
      return {
        content: [{
          type: "text",
          text: `Grupo criado com sucesso!\nResposta: ${JSON.stringify(response.data)}`,
        }],
      };
    } catch (error) {
      logger.error("Erro ao criar grupo:", error);
      throw new Error(`Falha ao criar grupo: ${error.message}`);
    }
  }
  
  /**
   * Busca grupos tool implementation
   */
  async _buscaGrupos(args) {
    const url = `http://${this.apiBase}/group/fetchAllGroups/${this.instancia}?getParticipants=${args.getParticipants}`;
    
    try {
      const response = await this.httpClient.get(url);
      
      return {
        content: [{
          type: "text",
          text: `Grupos obtidos com sucesso:\n${JSON.stringify(response.data, null, 2)}`,
        }],
      };
    } catch (error) {
      logger.error("Erro ao buscar grupos:", error);
      throw new Error(`Falha ao buscar grupos: ${error.message}`);
    }
  }
  
  /**
   * Busca participantes grupo tool implementation
   */
  async _buscaParticipantesGrupo(args) {
    const url = `http://${this.apiBase}/group/participants/${this.instancia}?groupJid=${args.groupJid}`;
    
    try {
      const response = await this.httpClient.get(url);
      
      return {
        content: [{
          type: "text",
          text: `Participantes obtidos com sucesso:\n${JSON.stringify(response.data, null, 2)}`,
        }],
      };
    } catch (error) {
      logger.error("Erro ao buscar participantes:", error);
      throw new Error(`Falha ao buscar participantes: ${error.message}`);
    }
  }
}

module.exports = EvolutionProvider; 