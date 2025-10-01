#!/usr/bin/env node

/**
 * GPT-4 Function Calling Test Script
 * Tests OpenAPI function calling with real GPT-4 API
 */

const OpenAI = require('openai');
const axios = require('axios');

const API_URL = process.env.API_URL || 'https://api.jaydenmetz.com';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CRM_API_KEY = process.env.CRM_API_KEY || process.env.TEST_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable required');
  process.exit(1);
}

if (!CRM_API_KEY) {
  console.error('❌ CRM_API_KEY environment variable required');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Simplified function definitions (subset of OpenAPI spec)
const functions = [
  {
    type: 'function',
    function: {
      name: 'listEscrows',
      description: 'List all escrow transactions with optional filtering by status, price range, and closing dates',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['active', 'pending', 'closed', 'cancelled'],
            description: 'Filter by escrow status'
          },
          minPrice: {
            type: 'number',
            description: 'Minimum purchase price filter'
          },
          maxPrice: {
            type: 'number',
            description: 'Maximum purchase price filter'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'listListings',
      description: 'List property listings with optional filtering',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['active', 'pending', 'sold', 'withdrawn', 'expired']
          },
          min_price: {
            type: 'number'
          },
          max_price: {
            type: 'number'
          },
          limit: {
            type: 'number'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'listClients',
      description: 'List client contacts with optional filtering',
      parameters: {
        type: 'object',
        properties: {
          client_type: {
            type: 'string',
            enum: ['buyer', 'seller', 'both']
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'closed']
          },
          limit: {
            type: 'number'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getDashboardStats',
      description: 'Get real-time dashboard statistics (active escrows, listings, hot leads, etc.)',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  }
];

// Function execution mapping
async function executeFunctionCall(functionName, args) {
  const headers = {
    'X-API-Key': CRM_API_KEY,
    'Content-Type': 'application/json'
  };

  try {
    switch (functionName) {
      case 'listEscrows':
        const escrowParams = new URLSearchParams();
        if (args.status) escrowParams.append('status', args.status);
        if (args.minPrice) escrowParams.append('minPrice', args.minPrice);
        if (args.maxPrice) escrowParams.append('maxPrice', args.maxPrice);
        if (args.limit) escrowParams.append('limit', args.limit);

        const escrowResponse = await axios.get(
          `${API_URL}/v1/escrows?${escrowParams}`,
          { headers }
        );
        return escrowResponse.data;

      case 'listListings':
        const listingParams = new URLSearchParams();
        if (args.status) listingParams.append('status', args.status);
        if (args.min_price) listingParams.append('minPrice', args.min_price);
        if (args.max_price) listingParams.append('maxPrice', args.max_price);
        if (args.limit) listingParams.append('limit', args.limit);

        const listingResponse = await axios.get(
          `${API_URL}/v1/listings?${listingParams}`,
          { headers }
        );
        return listingResponse.data;

      case 'listClients':
        const clientParams = new URLSearchParams();
        if (args.client_type) clientParams.append('clientType', args.client_type);
        if (args.status) clientParams.append('status', args.status);
        if (args.limit) clientParams.append('limit', args.limit);

        const clientResponse = await axios.get(
          `${API_URL}/v1/clients?${clientParams}`,
          { headers }
        );
        return clientResponse.data;

      case 'getDashboardStats':
        const statsResponse = await axios.get(
          `${API_URL}/v1/health`,
          { headers }
        );
        return statsResponse.data;

      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  } catch (error) {
    return {
      error: error.message,
      status: error.response?.status,
      details: error.response?.data
    };
  }
}

// Test queries
const testQueries = [
  "How many active escrows do I have?",
  "Show me all property listings",
  "List all my clients",
  "What's my dashboard showing right now?",
  "Find escrows over $500,000",
  "Show me active buyer clients"
];

async function runTest(query) {
  console.log('\n' + '='.repeat(80));
  console.log(`🤖 User Query: "${query}"`);
  console.log('='.repeat(80));

  try {
    // Step 1: Call GPT-4 with function definitions
    console.log('\n📤 Calling GPT-4 with function definitions...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful real estate CRM assistant. Use the provided functions to answer user questions about their real estate business.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      tools: functions,
      tool_choice: 'auto'
    });

    const response = completion.choices[0].message;

    // Check if GPT wants to call a function
    if (response.tool_calls && response.tool_calls.length > 0) {
      console.log(`\n✅ GPT-4 decided to call function(s):`);

      for (const toolCall of response.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        console.log(`\n   Function: ${functionName}`);
        console.log(`   Arguments: ${JSON.stringify(args, null, 2)}`);

        // Step 2: Execute the function
        console.log(`\n📡 Executing API call to CRM...`);
        const result = await executeFunctionCall(functionName, args);

        console.log(`\n✅ API Response:`);
        if (result.error) {
          console.log(`   ❌ Error: ${result.error}`);
          console.log(`   Status: ${result.status}`);
        } else {
          console.log(`   Success: ${result.success}`);
          console.log(`   Data count: ${result.data?.length || 0} items`);
          if (result.pagination) {
            console.log(`   Pagination: Page ${result.pagination.page}/${result.pagination.pages}, Total: ${result.pagination.total}`);
          }
        }

        // Step 3: Send result back to GPT for final answer
        console.log(`\n📤 Sending result back to GPT-4 for natural language response...`);
        const secondResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful real estate CRM assistant.'
            },
            {
              role: 'user',
              content: query
            },
            response,
            {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result)
            }
          ]
        });

        const finalAnswer = secondResponse.choices[0].message.content;
        console.log(`\n💬 GPT-4 Final Answer:`);
        console.log(`   ${finalAnswer}`);
      }
    } else {
      // GPT answered directly without calling functions
      console.log(`\n💬 GPT-4 Direct Answer (no function call):`);
      console.log(`   ${response.content}`);
    }

    return {
      success: true,
      query,
      functionCalled: response.tool_calls?.[0]?.function?.name,
      hadFunctionCall: !!response.tool_calls
    };
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    return {
      success: false,
      query,
      error: error.message
    };
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   GPT-4 Function Calling Test Suite                      ║');
  console.log('║                     Real Estate CRM API Integration                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI URL: ${API_URL}`);
  console.log(`GPT Model: gpt-4o`);
  console.log(`Functions: ${functions.length} defined`);
  console.log(`Test Queries: ${testQueries.length}`);

  const results = [];

  for (const query of testQueries) {
    const result = await runTest(query);
    results.push(result);

    // Wait 1 second between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success).length;
  const withFunctionCalls = results.filter(r => r.hadFunctionCall).length;

  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`🔧 Used Function Calling: ${withFunctionCalls}/${results.length}`);

  if (withFunctionCalls > 0) {
    console.log(`\n🎉 GPT-4 Function Calling is WORKING!`);
    console.log(`   The OpenAPI integration successfully enabled AI function calling.`);
  } else {
    console.log(`\n⚠️  GPT-4 did not use function calling.`);
    console.log(`   Check function definitions and query phrasing.`);
  }

  console.log('\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTest, executeFunctionCall };
