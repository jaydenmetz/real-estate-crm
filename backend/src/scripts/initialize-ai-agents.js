const { Pool } = require('pg');
const logger = require('../utils/logger');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const agents = [
  {
    id: 'alex',
    name: 'Alex - Executive Assistant',
    role: 'Executive Assistant',
    department: 'Executive',
    disabled_message: 'Alex (Executive Assistant) is currently disabled. Toggle Alex on to enable Claude API access for daily briefings, task management, and team coordination.'
  },
  {
    id: 'sarah',
    name: 'Sarah - Buyer Department Manager',
    role: 'Buyer Manager',
    department: 'Sales',
    disabled_message: 'Sarah (Buyer Department Manager) is currently disabled. Toggle Sarah on to enable Claude API access for buyer lead management and nurturing.'
  },
  {
    id: 'mike',
    name: 'Mike - Listing Department Manager',
    role: 'Listing Manager',
    department: 'Sales',
    disabled_message: 'Mike (Listing Department Manager) is currently disabled. Toggle Mike on to enable Claude API access for listing optimization and marketing.'
  },
  {
    id: 'david',
    name: 'David - Operations Manager',
    role: 'Operations Manager',
    department: 'Operations',
    disabled_message: 'David (Operations Manager) is currently disabled. Toggle David on to enable Claude API access for compliance and transaction coordination.'
  },
  {
    id: 'buyer_lead_qualifier',
    name: 'Buyer Lead Qualifier',
    role: 'Lead Qualifier',
    department: 'Sales',
    disabled_message: 'Buyer Lead Qualifier is currently disabled. Toggle this agent on to enable Claude API access for automated lead qualification and scoring.'
  },
  {
    id: 'buyer_nurture_specialist',
    name: 'Buyer Nurture Specialist',
    role: 'Nurture Specialist',
    department: 'Sales',
    disabled_message: 'Buyer Nurture Specialist is currently disabled. Toggle this agent on to enable Claude API access for automated follow-ups and drip campaigns.'
  },
  {
    id: 'listing_launch_specialist',
    name: 'Listing Launch Specialist',
    role: 'Launch Specialist',
    department: 'Marketing',
    disabled_message: 'Listing Launch Specialist is currently disabled. Toggle this agent on to enable Claude API access for listing preparation and launch campaigns.'
  },
  {
    id: 'listing_marketing_agent',
    name: 'Listing Marketing Agent',
    role: 'Marketing Agent',
    department: 'Marketing',
    disabled_message: 'Listing Marketing Agent is currently disabled. Toggle this agent on to enable Claude API access for marketing content generation and ad copy.'
  },
  {
    id: 'showing_coordinator',
    name: 'Showing Coordinator',
    role: 'Coordinator',
    department: 'Operations',
    disabled_message: 'Showing Coordinator is currently disabled. Toggle this agent on to enable Claude API access for automated showing scheduling and coordination.'
  },
  {
    id: 'transaction_coordinator',
    name: 'Transaction Coordinator',
    role: 'Transaction Coordinator',
    department: 'Operations',
    disabled_message: 'Transaction Coordinator is currently disabled. Toggle this agent on to enable Claude API access for transaction management and milestone tracking.'
  },
  {
    id: 'market_analyst',
    name: 'Market Analyst',
    role: 'Market Analyst',
    department: 'Analytics',
    disabled_message: 'Market Analyst is currently disabled. Toggle this agent on to enable Claude API access for market analysis, CMAs, and pricing recommendations.'
  },
  {
    id: 'financial_analyst',
    name: 'Financial Analyst',
    role: 'Financial Analyst',
    department: 'Analytics',
    disabled_message: 'Financial Analyst is currently disabled. Toggle this agent on to enable Claude API access for commission tracking and financial reporting.'
  },
  {
    id: 'database_specialist',
    name: 'Database Specialist',
    role: 'Database Specialist',
    department: 'Technology',
    disabled_message: 'Database Specialist is currently disabled. Toggle this agent on to enable Claude API access for contact management and data organization.'
  },
  {
    id: 'compliance_officer',
    name: 'Compliance Officer',
    role: 'Compliance Officer',
    department: 'Legal',
    disabled_message: 'Compliance Officer is currently disabled. Toggle this agent on to enable Claude API access for compliance monitoring and regulatory updates.'
  }
];

async function initializeAgents() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🤖 Initializing AI agents as disabled...\n');
    
    for (const agent of agents) {
      // Insert or update agent
      const result = await client.query(`
        INSERT INTO ai_agents (
          id, name, role, department, enabled, disabled_message,
          monthly_token_limit, token_warning_threshold
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          department = EXCLUDED.department,
          enabled = FALSE,
          disabled_message = EXCLUDED.disabled_message,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id, name, enabled
      `, [
        agent.id,
        agent.name,
        agent.role,
        agent.department,
        false, // Always disabled
        agent.disabled_message,
        500000, // 500k tokens per month default
        400000  // Warning at 400k tokens
      ]);
      
      console.log(`✅ ${agent.name}: DISABLED (prevents API charges)`);
    }
    
    // Create some historical token usage data for demo
    const demoDate = new Date();
    demoDate.setDate(demoDate.getDate() - 7);
    
    await client.query(`
      INSERT INTO ai_token_usage (agent_id, date, tokens_used, api_calls, estimated_cost)
      VALUES 
        ('alex', $1, 12500, 25, 0.375),
        ('sarah', $1, 8300, 18, 0.125),
        ('mike', $1, 9200, 20, 0.138)
      ON CONFLICT (agent_id, date) DO NOTHING
    `, [demoDate.toISOString().split('T')[0]]);
    
    await client.query('COMMIT');
    
    console.log('\n✅ All AI agents initialized as DISABLED');
    console.log('📌 To enable an agent and start using Claude API:');
    console.log('   1. Ensure ANTHROPIC_API_KEY is set in .env');
    console.log('   2. Toggle the agent on in the AI Team Dashboard');
    console.log('   3. Monitor token usage to control costs\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing agents:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  initializeAgents()
    .then(() => {
      console.log('✅ AI agents initialization complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Initialization failed:', err);
      process.exit(1);
    });
}

module.exports = { initializeAgents };