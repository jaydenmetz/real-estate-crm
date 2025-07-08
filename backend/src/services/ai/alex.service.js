const axios = require('axios');
const logger = require('../../utils/logger');
const { query } = require('../../config/database');
const { format } = require('date-fns');

class AlexService {
  constructor() {
    this.name = 'Alex - Executive Assistant';
    this.model = 'claude-3-opus-20240229';
    this.enabled = true;
    this.conversationContext = new Map();
  }

  async processMessage(message, type, userId) {
    try {
      let context = this.conversationContext.get(userId) || [];
      
      context.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      let systemPrompt = this.getSystemPrompt(type, message);
      
      const relevantData = await this.gatherRelevantData(message, userId);
      
      if (relevantData) {
        systemPrompt += `\n\nCurrent data context: ${JSON.stringify(relevantData)}`;
      }

      const response = await this.callClaudeAPI(systemPrompt, context);
      
      context.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });

      if (context.length > 20) {
        context = context.slice(-20);
      }
      
      this.conversationContext.set(userId, context);

      return response;

    } catch (error) {
      logger.error('Error processing Alex message:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
    }
  }

  getSystemPrompt(type, message) {
    const basePrompt = `You are Alex, an executive assistant for a real estate agent. You are helpful, professional, and proactive. You have access to all business data and can help with:

- Daily briefings and summaries
- Scheduling and calendar management  
- Lead and client management
- Transaction updates
- Market insights
- Task prioritization

Keep responses concise but informative. Always be action-oriented and suggest next steps when appropriate.`;

    if (message.toLowerCase().includes('brief') || message.toLowerCase().includes('summary')) {
      return basePrompt + '\n\nThe user is asking for a briefing or summary. Provide a concise, well-structured overview of the most important items.';
    }
    
    if (message.toLowerCase().includes('urgent') || message.toLowerCase().includes('priority')) {
      return basePrompt + '\n\nThe user is asking about urgent or priority items. Focus on time-sensitive matters and suggest immediate actions.';
    }
    
    if (message.toLowerCase().includes('schedule') || message.toLowerCase().includes('calendar')) {
      return basePrompt + '\n\nThe user is asking about scheduling. Provide clear calendar information and suggest optimizations.';
    }

    return basePrompt;
  }

  async gatherRelevantData(message, userId) {
    try {
      const data = {};
      
      if (message.toLowerCase().includes('appointment') || message.toLowerCase().includes('schedule')) {
        data.todayAppointments = await this.getTodayAppointments();
      }
      
      if (message.toLowerCase().includes('lead') || message.toLowerCase().includes('new')) {
        data.recentLeads = await this.getRecentLeads();
      }
      
      if (message.toLowerCase().includes('closing') || message.toLowerCase().includes('escrow')) {
        data.upcomingClosings = await this.getUpcomingClosings();
      }
      
      if (message.toLowerCase().includes('urgent') || message.toLowerCase().includes('task')) {
        data.urgentTasks = await this.getUrgentTasks();
      }

      return Object.keys(data).length > 0 ? data : null;
    } catch (error) {
      logger.error('Error gathering relevant data:', error);
      return null;
    }
  }

  async callClaudeAPI(systemPrompt, context) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...context.slice(-10)
      ];

      // Mock response for development - replace with actual Anthropic API call
      const mockResponses = [
        "Good morning! I've reviewed your schedule and you have 3 appointments today. Your 10 AM listing presentation is your priority.",
        "Here's your daily briefing: 2 new leads came in overnight, you have 3 showings scheduled, and the Henderson closing is tomorrow at 2 PM.",
        "I found 4 urgent tasks that need your attention: Follow up with the Smith offer, review the Johnson contract, and call the title company about the Wilson closing.",
        "Your calendar looks busy today. I recommend blocking 30 minutes at lunch for lead follow-ups and moving your 4 PM call to tomorrow if possible.",
        "I've been monitoring your pipeline. The Martinez listing has been active for 45 days with minimal showings - consider a price adjustment strategy."
      ];

      return mockResponses[Math.floor(Math.random() * mockResponses.length)];

      // Uncomment and configure for actual Anthropic API:
      /*
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.model,
          max_tokens: 1000,
          messages: messages
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      return response.data.content[0].text;
      */
    } catch (error) {
      logger.error('Claude API error:', error);
      throw error;
    }
  }

  async generateWelcomeMessage() {
    try {
      const currentTime = format(new Date(), 'h:mm a');
      const greeting = this.getTimeBasedGreeting();
      
      return `${greeting}! It's ${currentTime}. I'm Alex, your executive assistant. How can I help you today? 

Quick actions:
- Say "briefing" for today's overview
- Say "urgent" for priority tasks  
- Say "schedule" for your calendar
- Ask me anything about your business!`;
    } catch (error) {
      logger.error('Error generating welcome message:', error);
      return "Hello! I'm Alex, your executive assistant. How can I help you today?";
    }
  }

  getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  async getTodayAppointments() {
    try {
      // Mock data - replace with actual database query
      return [
        { time: '10:00 AM', title: 'Listing Presentation - Smith Property', type: 'listing' },
        { time: '2:00 PM', title: 'Buyer Consultation - Johnson Family', type: 'consultation' },
        { time: '4:30 PM', title: 'Property Showing - Downtown Condo', type: 'showing' }
      ];
    } catch (error) {
      logger.error('Error fetching today appointments:', error);
      return [];
    }
  }

  async getUrgentTasks() {
    try {
      // Mock data - replace with actual database query
      return [
        { description: 'Follow up on Wilson contract terms', deadline: new Date() },
        { description: 'Review Henderson inspection report', deadline: new Date() },
        { description: 'Call title company about Martinez closing', deadline: new Date() }
      ];
    } catch (error) {
      logger.error('Error fetching urgent tasks:', error);
      return [];
    }
  }

  async getRecentLeads() {
    try {
      // Mock data - replace with actual database query
      return [
        { name: 'Sarah Chen', source: 'Website', time: '2 hours ago' },
        { name: 'Mike Rodriguez', source: 'Referral', time: '4 hours ago' }
      ];
    } catch (error) {
      logger.error('Error fetching recent leads:', error);
      return [];
    }
  }

  async getUpcomingClosings() {
    try {
      // Mock data - replace with actual database query
      return [
        { property: '123 Main St', buyer: 'Henderson Family', date: 'Tomorrow 2:00 PM' },
        { property: '456 Oak Ave', buyer: 'Wilson LLC', date: 'Friday 10:00 AM' }
      ];
    } catch (error) {
      logger.error('Error fetching upcoming closings:', error);
      return [];
    }
  }

  async generateDailyBriefing() {
    try {
      const [appointments, urgentTasks, newLeads, closings] = await Promise.all([
        this.getTodayAppointments(),
        this.getUrgentTasks(),
        this.getRecentLeads(),
        this.getUpcomingClosings()
      ]);

      return `📊 Daily Briefing - ${format(new Date(), 'EEEE, MMMM d')}

🕒 Today's Schedule (${appointments.length} appointments):
${appointments.map(apt => `• ${apt.time}: ${apt.title}`).join('\n')}

⚠️ Urgent Tasks (${urgentTasks.length}):
${urgentTasks.map(task => `• ${task.description}`).join('\n')}

🆕 New Leads (${newLeads.length}):
${newLeads.map(lead => `• ${lead.name} via ${lead.source} (${lead.time})`).join('\n')}

🏠 Upcoming Closings:
${closings.map(closing => `• ${closing.property} - ${closing.date}`).join('\n')}

Have a productive day! Let me know if you need anything else.`;
    } catch (error) {
      logger.error('Error generating daily briefing:', error);
      return 'Sorry, I encountered an error generating your daily briefing. Please try again.';
    }
  }

  async getTodaySchedule() {
    try {
      const appointments = await this.getTodayAppointments();
      
      if (appointments.length === 0) {
        return "You have no appointments scheduled for today. Great time to focus on lead follow-up!";
      }

      return `📅 Today's Schedule:

${appointments.map(apt => `• ${apt.time}: ${apt.title}`).join('\n')}

${appointments.length > 2 ? '\n⚡ Looks like a busy day! Consider blocking time for lunch and lead follow-ups.' : ''}`;
    } catch (error) {
      logger.error('Error getting today schedule:', error);
      return 'Sorry, I encountered an error fetching your schedule.';
    }
  }
  
  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new AlexService();