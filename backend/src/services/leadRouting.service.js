const logger = require('../utils/logger');

class LeadRoutingService {
  constructor() {
    // Default routing rules
    this.routingRules = {
      roundRobin: {
        enabled: true,
        agents: [],
        currentIndex: 0
      },
      
      scoreBasedRouting: {
        enabled: true,
        rules: [
          { minScore: 80, agentLevel: 'senior' },
          { minScore: 50, agentLevel: 'mid' },
          { minScore: 0, agentLevel: 'junior' }
        ]
      },
      
      territoryBasedRouting: {
        enabled: true,
        territories: {
          'North County': ['agent_nc_001', 'agent_nc_002'],
          'South County': ['agent_sc_001', 'agent_sc_002'],
          'East County': ['agent_ec_001'],
          'West County': ['agent_wc_001', 'agent_wc_002'],
          'Central': ['agent_c_001', 'agent_c_002', 'agent_c_003']
        }
      },
      
      sourceBasedRouting: {
        enabled: true,
        rules: {
          'Referral': 'preferredAgents',
          'Walk-in': 'floorDuty',
          'Website': 'digitalSpecialists',
          'Partner': 'partnerSpecialists'
        }
      },
      
      propertyTypeRouting: {
        enabled: true,
        specialists: {
          'Single Family': ['agent_sf_001', 'agent_sf_002'],
          'Condo': ['agent_condo_001'],
          'Multi-Family': ['agent_mf_001'],
          'Commercial': ['agent_comm_001'],
          'Land': ['agent_land_001']
        }
      },
      
      languageRouting: {
        enabled: true,
        languages: {
          'Spanish': ['agent_001', 'agent_005', 'agent_008'],
          'Mandarin': ['agent_003', 'agent_007'],
          'Vietnamese': ['agent_004'],
          'Tagalog': ['agent_006']
        }
      },
      
      budgetRouting: {
        enabled: true,
        tiers: [
          { minBudget: 1000000, agents: ['agent_luxury_001', 'agent_luxury_002'] },
          { minBudget: 500000, agents: ['agent_mid_001', 'agent_mid_002', 'agent_mid_003'] },
          { minBudget: 0, agents: ['agent_entry_001', 'agent_entry_002'] }
        ]
      }
    };
    
    // Agent availability and capacity
    this.agentCapacity = new Map();
    this.agentAvailability = new Map();
    
    // Mock agent data
    this.agents = [
      {
        id: 'agent_001',
        name: 'John Smith',
        level: 'senior',
        specialties: ['Single Family', 'Luxury'],
        languages: ['English', 'Spanish'],
        territories: ['North County', 'Central'],
        maxActiveLeads: 50,
        currentActiveLeads: 32
      },
      {
        id: 'agent_002',
        name: 'Jane Doe',
        level: 'mid',
        specialties: ['Condo', 'First-Time Buyers'],
        languages: ['English'],
        territories: ['South County'],
        maxActiveLeads: 40,
        currentActiveLeads: 28
      },
      {
        id: 'agent_003',
        name: 'Mike Chen',
        level: 'senior',
        specialties: ['Multi-Family', 'Investment'],
        languages: ['English', 'Mandarin'],
        territories: ['East County', 'Central'],
        maxActiveLeads: 45,
        currentActiveLeads: 41
      }
    ];
  }

  async autoAssignLead(leadData) {
    try {
      logger.info('Auto-assigning lead:', {
        leadId: leadData._id,
        source: leadData.source,
        score: leadData.score,
        location: leadData.location
      });
      
      // Get all potential agents based on routing rules
      const candidates = await this.findCandidateAgents(leadData);
      
      if (candidates.length === 0) {
        logger.warn('No suitable agents found for lead:', leadData._id);
        return null;
      }
      
      // Score and rank candidates
      const rankedCandidates = this.rankCandidates(candidates, leadData);
      
      // Select the best available agent
      const selectedAgent = await this.selectBestAgent(rankedCandidates);
      
      if (selectedAgent) {
        logger.info('Lead assigned to agent:', {
          leadId: leadData._id,
          agentId: selectedAgent.id,
          agentName: selectedAgent.name,
          reason: selectedAgent.selectionReason
        });
        
        // Update agent's lead count
        this.incrementAgentLeadCount(selectedAgent.id);
      }
      
      return selectedAgent;
    } catch (error) {
      logger.error('Error in auto-assign lead:', error);
      throw error;
    }
  }

  async findCandidateAgents(leadData) {
    const candidates = new Set();
    
    // Territory-based candidates
    if (this.routingRules.territoryBasedRouting.enabled && leadData.location) {
      const territory = this.detectTerritory(leadData.location);
      if (territory && this.routingRules.territoryBasedRouting.territories[territory]) {
        this.routingRules.territoryBasedRouting.territories[territory].forEach(agentId => {
          candidates.add(agentId);
        });
      }
    }
    
    // Score-based candidates
    if (this.routingRules.scoreBasedRouting.enabled && leadData.score) {
      const requiredLevel = this.getRequiredAgentLevel(leadData.score);
      this.agents
        .filter(agent => agent.level === requiredLevel || this.isHigherLevel(agent.level, requiredLevel))
        .forEach(agent => candidates.add(agent.id));
    }
    
    // Source-based candidates
    if (this.routingRules.sourceBasedRouting.enabled && leadData.source) {
      const sourceGroup = this.routingRules.sourceBasedRouting.rules[leadData.source];
      if (sourceGroup) {
        // In production, this would look up agents in the specified group
        this.agents.forEach(agent => candidates.add(agent.id));
      }
    }
    
    // Property type specialists
    if (this.routingRules.propertyTypeRouting.enabled && leadData.propertyType) {
      const specialists = this.routingRules.propertyTypeRouting.specialists[leadData.propertyType];
      if (specialists) {
        specialists.forEach(agentId => candidates.add(agentId));
      }
    }
    
    // Language requirements
    if (this.routingRules.languageRouting.enabled && leadData.preferredLanguage) {
      const languageAgents = this.routingRules.languageRouting.languages[leadData.preferredLanguage];
      if (languageAgents) {
        languageAgents.forEach(agentId => candidates.add(agentId));
      }
    }
    
    // Budget-based routing
    if (this.routingRules.budgetRouting.enabled && leadData.budget) {
      const tier = this.routingRules.budgetRouting.tiers.find(t => leadData.budget >= t.minBudget);
      if (tier) {
        tier.agents.forEach(agentId => candidates.add(agentId));
      }
    }
    
    // Convert to array of agent objects
    return Array.from(candidates).map(agentId => 
      this.agents.find(agent => agent.id === agentId)
    ).filter(agent => agent && this.isAgentAvailable(agent));
  }

  rankCandidates(candidates, leadData) {
    return candidates.map(agent => {
      let score = 0;
      const reasons = [];
      
      // Capacity score (agents with more availability score higher)
      const capacityRatio = 1 - (agent.currentActiveLeads / agent.maxActiveLeads);
      score += capacityRatio * 30;
      if (capacityRatio > 0.5) reasons.push('High capacity');
      
      // Territory match
      if (leadData.location && this.agentInTerritory(agent, leadData.location)) {
        score += 20;
        reasons.push('Territory match');
      }
      
      // Specialty match
      if (leadData.propertyType && agent.specialties.includes(leadData.propertyType)) {
        score += 25;
        reasons.push('Property type specialist');
      }
      
      // Language match
      if (leadData.preferredLanguage && agent.languages.includes(leadData.preferredLanguage)) {
        score += 15;
        reasons.push('Language match');
      }
      
      // Experience level for high-value leads
      if (leadData.score > 70 && agent.level === 'senior') {
        score += 10;
        reasons.push('Senior agent for high-value lead');
      }
      
      return {
        ...agent,
        matchScore: score,
        selectionReason: reasons.join(', ')
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  async selectBestAgent(rankedCandidates) {
    // If round-robin is enabled and no clear winner
    if (this.routingRules.roundRobin.enabled && 
        rankedCandidates.length > 1 && 
        rankedCandidates[0].matchScore - rankedCandidates[1].matchScore < 10) {
      
      // Apply round-robin among top candidates
      const topCandidates = rankedCandidates.filter(c => 
        c.matchScore >= rankedCandidates[0].matchScore - 10
      );
      
      const index = this.routingRules.roundRobin.currentIndex % topCandidates.length;
      this.routingRules.roundRobin.currentIndex++;
      
      return topCandidates[index];
    }
    
    // Otherwise, return the highest scoring candidate
    return rankedCandidates[0];
  }

  detectTerritory(location) {
    // Simple territory detection based on location string
    if (!location) return null;
    
    const locationLower = location.toLowerCase();
    
    if (locationLower.includes('north') || locationLower.includes('carlsbad') || locationLower.includes('oceanside')) {
      return 'North County';
    } else if (locationLower.includes('south') || locationLower.includes('chula vista') || locationLower.includes('national city')) {
      return 'South County';
    } else if (locationLower.includes('east') || locationLower.includes('el cajon') || locationLower.includes('santee')) {
      return 'East County';
    } else if (locationLower.includes('west') || locationLower.includes('point loma') || locationLower.includes('ocean beach')) {
      return 'West County';
    } else if (locationLower.includes('downtown') || locationLower.includes('hillcrest') || locationLower.includes('mission valley')) {
      return 'Central';
    }
    
    return 'Central'; // Default
  }

  getRequiredAgentLevel(score) {
    for (const rule of this.routingRules.scoreBasedRouting.rules) {
      if (score >= rule.minScore) {
        return rule.agentLevel;
      }
    }
    return 'junior';
  }

  isHigherLevel(agentLevel, requiredLevel) {
    const levels = { junior: 1, mid: 2, senior: 3 };
    return levels[agentLevel] > levels[requiredLevel];
  }

  isAgentAvailable(agent) {
    // Check if agent has capacity
    if (agent.currentActiveLeads >= agent.maxActiveLeads) {
      return false;
    }
    
    // Check if agent is currently available (mock implementation)
    const currentHour = new Date().getHours();
    const isWorkingHours = currentHour >= 8 && currentHour < 18;
    
    // In production, this would check actual availability status
    return isWorkingHours;
  }

  agentInTerritory(agent, location) {
    const territory = this.detectTerritory(location);
    return agent.territories && agent.territories.includes(territory);
  }

  incrementAgentLeadCount(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (agent) {
      agent.currentActiveLeads++;
    }
  }

  async updateRoutingRules(updates) {
    try {
      // Deep merge updates with existing rules
      Object.keys(updates).forEach(key => {
        if (this.routingRules[key]) {
          this.routingRules[key] = {
            ...this.routingRules[key],
            ...updates[key]
          };
        }
      });
      
      logger.info('Routing rules updated:', updates);
      
      return {
        success: true,
        updatedRules: Object.keys(updates)
      };
    } catch (error) {
      logger.error('Error updating routing rules:', error);
      throw error;
    }
  }

  async getRoutingRules() {
    return {
      rules: this.routingRules,
      activeRuleCount: Object.values(this.routingRules).filter(rule => rule.enabled).length,
      agents: this.agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        level: agent.level,
        capacity: {
          max: agent.maxActiveLeads,
          current: agent.currentActiveLeads,
          available: agent.maxActiveLeads - agent.currentActiveLeads
        }
      }))
    };
  }

  async reassignLead(leadId, fromAgentId, toAgentId, reason) {
    try {
      logger.info('Reassigning lead:', {
        leadId,
        fromAgentId,
        toAgentId,
        reason
      });
      
      // Update agent lead counts
      const fromAgent = this.agents.find(a => a.id === fromAgentId);
      const toAgent = this.agents.find(a => a.id === toAgentId);
      
      if (fromAgent) {
        fromAgent.currentActiveLeads--;
      }
      
      if (toAgent) {
        toAgent.currentActiveLeads++;
      }
      
      return {
        success: true,
        fromAgent: fromAgent?.name,
        toAgent: toAgent?.name,
        reason
      };
    } catch (error) {
      logger.error('Error reassigning lead:', error);
      throw error;
    }
  }

  async getAgentWorkload(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    return {
      agentId: agent.id,
      agentName: agent.name,
      workload: {
        maxCapacity: agent.maxActiveLeads,
        currentLeads: agent.currentActiveLeads,
        availableCapacity: agent.maxActiveLeads - agent.currentActiveLeads,
        utilizationPercentage: Math.round((agent.currentActiveLeads / agent.maxActiveLeads) * 100)
      },
      specialties: agent.specialties,
      territories: agent.territories,
      languages: agent.languages
    };
  }

  async balanceWorkload() {
    try {
      const overloadedAgents = this.agents.filter(agent => 
        agent.currentActiveLeads / agent.maxActiveLeads > 0.9
      );
      
      const underloadedAgents = this.agents.filter(agent => 
        agent.currentActiveLeads / agent.maxActiveLeads < 0.5
      );
      
      logger.info('Workload balance check:', {
        overloadedCount: overloadedAgents.length,
        underloadedCount: underloadedAgents.length
      });
      
      // In production, this would trigger actual lead reassignments
      
      return {
        overloadedAgents: overloadedAgents.map(a => ({
          id: a.id,
          name: a.name,
          utilization: Math.round((a.currentActiveLeads / a.maxActiveLeads) * 100)
        })),
        underloadedAgents: underloadedAgents.map(a => ({
          id: a.id,
          name: a.name,
          utilization: Math.round((a.currentActiveLeads / a.maxActiveLeads) * 100)
        })),
        recommendedActions: overloadedAgents.length > 0 ? 
          'Consider reassigning leads from overloaded agents' : 
          'Workload is well balanced'
      };
    } catch (error) {
      logger.error('Error balancing workload:', error);
      throw error;
    }
  }
}

module.exports = new LeadRoutingService();