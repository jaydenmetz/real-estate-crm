const { query } = require('../../config/database');
const logger = require('../../utils/logger');
const axios = require('axios');

/**
 * Base class for all AI agents with enable/disable functionality
 */
class BaseAIAgent {
  constructor(agentId, name, model = 'claude-3-haiku-20240307') {
    this.agentId = agentId;
    this.name = name;
    this.model = model;
    this.enabled = false; // Default to disabled
    this.conversationContext = new Map();
  }

  /**
   * Check if agent is enabled in database
   */
  async checkEnabled() {
    try {
      const result = await query(
        'SELECT enabled, disabled_message FROM ai_agents WHERE id = $1',
        [this.agentId]
      );
      
      if (result.rows.length > 0) {
        this.enabled = result.rows[0].enabled;
        this.disabledMessage = result.rows[0].disabled_message;
        return this.enabled;
      }
      
      // If agent not in database, insert as disabled
      await query(
        `INSERT INTO ai_agents (id, name, role, enabled, disabled_message) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          this.agentId, 
          this.name, 
          this.constructor.name, 
          false,
          `${this.name} is currently disabled. Toggle ${this.name} on to enable Claude API access.`
        ]
      );
      
      return false;
    } catch (error) {
      logger.error(`Error checking agent enabled status for ${this.agentId}:`, error);
      return false;
    }
  }

  /**
   * Process message with enable check
   */
  async processMessage(message, type, userId) {
    try {
      // Check if agent is enabled
      const isEnabled = await this.checkEnabled();
      
      if (!isEnabled) {
        return {
          success: false,
          error: 'AGENT_DISABLED',
          message: this.disabledMessage || `${this.name} is currently disabled. Toggle ${this.name} on to enable Claude API access.`,
          agentId: this.agentId,
          agentName: this.name
        };
      }

      // Track token usage before making API call
      const startTokens = await this.getMonthlyTokenUsage();
      
      // Call the actual implementation in child class
      const response = await this.processEnabledMessage(message, type, userId);
      
      // Track token usage after API call
      await this.trackTokenUsage(response.tokensUsed || 0);
      
      return {
        success: true,
        data: response,
        agentId: this.agentId,
        agentName: this.name
      };
      
    } catch (error) {
      logger.error(`Error in ${this.name} processMessage:`, error);
      
      // Check if it's an API key error
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'API_KEY_ERROR',
          message: 'Claude API key is invalid or missing. Please check your ANTHROPIC_API_KEY environment variable.',
          agentId: this.agentId,
          agentName: this.name
        };
      }
      
      return {
        success: false,
        error: 'PROCESSING_ERROR',
        message: `${this.name} encountered an error processing your request. Please try again.`,
        agentId: this.agentId,
        agentName: this.name
      };
    }
  }

  /**
   * To be implemented by child classes
   */
  async processEnabledMessage(message, type, userId) {
    throw new Error('processEnabledMessage must be implemented by child class');
  }

  /**
   * Call Claude API with token tracking
   */
  async callClaudeAPI(systemPrompt, messages = []) {
    if (!this.enabled) {
      throw new Error('Agent is disabled');
    }

    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      logger.warn(`No ANTHROPIC_API_KEY found. Returning mock response for ${this.name}`);
      return this.getMockResponse();
    }

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.model,
          max_tokens: 1024,
          system: systemPrompt,
          messages: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      const tokensUsed = response.data.usage?.total_tokens || 0;
      
      return {
        content: response.data.content[0].text,
        tokensUsed: tokensUsed
      };
    } catch (error) {
      logger.error(`Claude API error for ${this.name}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get mock response when API is disabled or unavailable
   */
  getMockResponse() {
    return {
      content: `[Mock Response from ${this.name}] I'm currently in demo mode. Enable me to use the Claude API for real responses.`,
      tokensUsed: 0
    };
  }

  /**
   * Track token usage in database
   */
  async trackTokenUsage(tokens) {
    if (tokens === 0) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Update or insert token usage
      await query(
        `INSERT INTO ai_token_usage (agent_id, date, tokens_used, api_calls, estimated_cost)
         VALUES ($1, $2, $3, 1, $4)
         ON CONFLICT (agent_id, date) 
         DO UPDATE SET 
           tokens_used = ai_token_usage.tokens_used + $3,
           api_calls = ai_token_usage.api_calls + 1,
           estimated_cost = ai_token_usage.estimated_cost + $4`,
        [
          this.agentId, 
          today, 
          tokens,
          this.calculateCost(tokens)
        ]
      );
      
      // Update agent total tokens
      await query(
        `UPDATE ai_agents 
         SET tokens_used = tokens_used + $1, 
             last_active = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [tokens, this.agentId]
      );
      
      // Check if approaching limit
      const usage = await this.getMonthlyTokenUsage();
      const agent = await query('SELECT monthly_token_limit FROM ai_agents WHERE id = $1', [this.agentId]);
      const limit = agent.rows[0]?.monthly_token_limit || 500000;
      
      if (usage > limit * 0.8) {
        logger.warn(`Agent ${this.name} is at ${Math.round(usage/limit*100)}% of monthly token limit`);
      }
      
    } catch (error) {
      logger.error(`Error tracking token usage for ${this.name}:`, error);
    }
  }

  /**
   * Get monthly token usage
   */
  async getMonthlyTokenUsage() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const result = await query(
        `SELECT SUM(tokens_used) as total 
         FROM ai_token_usage 
         WHERE agent_id = $1 AND date >= $2`,
        [this.agentId, startOfMonth.toISOString().split('T')[0]]
      );
      
      return parseInt(result.rows[0]?.total || 0);
    } catch (error) {
      logger.error(`Error getting monthly usage for ${this.name}:`, error);
      return 0;
    }
  }

  /**
   * Calculate cost based on model and tokens
   */
  calculateCost(tokens) {
    // Anthropic pricing per 1M tokens (as of 2024)
    const pricing = {
      'claude-3-opus-20240229': { input: 15, output: 75 },
      'claude-3-sonnet-20240229': { input: 3, output: 15 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 }
    };
    
    const modelPricing = pricing[this.model] || pricing['claude-3-haiku-20240307'];
    // Estimate 50/50 input/output ratio
    const estimatedCost = (tokens * 0.5 * modelPricing.input + tokens * 0.5 * modelPricing.output) / 1000000;
    
    return estimatedCost;
  }

  /**
   * Enable the agent
   */
  async enable() {
    try {
      await query(
        'UPDATE ai_agents SET enabled = TRUE WHERE id = $1',
        [this.agentId]
      );
      this.enabled = true;
      logger.info(`${this.name} has been enabled`);
      return true;
    } catch (error) {
      logger.error(`Error enabling ${this.name}:`, error);
      return false;
    }
  }

  /**
   * Disable the agent
   */
  async disable() {
    try {
      await query(
        'UPDATE ai_agents SET enabled = FALSE WHERE id = $1',
        [this.agentId]
      );
      this.enabled = false;
      logger.info(`${this.name} has been disabled`);
      return true;
    } catch (error) {
      logger.error(`Error disabling ${this.name}:`, error);
      return false;
    }
  }
}

module.exports = BaseAIAgent;