/**
 * Leads Entity Configuration
 *
 * Complete configuration for the leads entity including:
 * - Dashboard layout and stats
 * - Detail page widgets and sections
 * - Forms and validation
 * - API endpoints
 * - Permissions
 */

import { createEntityConfig } from '../../utils/config/createEntityConfig';
import { api } from '../../services/api.service';
import { createSortFunction } from '../../utils/sortUtils';

// Import widget components
import ContactWidget from '../../components/details/leads/components/ContactWidget';
import QualificationWidget from '../../components/details/leads/components/QualificationWidget';
import EngagementWidget from '../../components/details/leads/components/EngagementWidget';

export const leadsConfig = createEntityConfig({
  // ========================================
  // ENTITY METADATA
  // ========================================
  entity: {
    name: 'lead',
    namePlural: 'leads',
    label: 'Lead',
    labelPlural: 'Leads',
    icon: 'PersonAdd',
    color: '#f57c00',
    colorGradient: {
      start: '#f57c00',
      end: '#ffb74d'
    }
  },

  // ========================================
  // API CONFIGURATION
  // ========================================
  api: {
    baseEndpoint: '/leads',
    getAll: (params) => api.leadsAPI.getAll(params),
    getById: (id) => api.leadsAPI.getById(id),
    create: (data) => api.leadsAPI.create(data),
    update: (id, data) => api.leadsAPI.update(id, data),
    delete: (id) => api.leadsAPI.delete(id),
    endpoints: {
      list: '/leads',
      get: '/leads/:id',
      create: '/leads',
      update: '/leads/:id',
      delete: '/leads/:id',
      stats: '/leads/stats',
      activities: '/leads/:id/activities',
      communications: '/leads/:id/communications'
    },
    idField: 'id',
    queryParams: {
      status: 'status',
      scope: 'scope',
      sortBy: 'sortBy',
      sortOrder: 'sortOrder',
      page: 'page',
      limit: 'limit',
      startDate: 'startDate',
      endDate: 'endDate'
    }
  },

  // ========================================
  // DASHBOARD CONFIGURATION
  // ========================================
  dashboard: {
    // Hero Card Configuration
    hero: {
      dateRangeFilters: ['1D', '1M', '1Y', 'YTD', 'Custom'],
      defaultDateRange: '1M',
      showYearSelector: true,
      ctaButtons: [
        { label: 'New Lead', action: 'create', icon: 'Add' },
        { label: 'Analytics', action: 'analytics', icon: 'Assessment' }
      ]
    },

    // Stats Configuration
    stats: [
      // New Tab Stats
      {
        id: 'total_new_leads',
        label: 'TOTAL LEADS',
        calculation: (_data, helpers) => helpers.countByStatus('new'),
        format: 'number',
        icon: 'PersonAdd',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['new']
      },
      {
        id: 'new_this_month',
        label: 'TOTAL THIS MONTH\'S',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return data.filter(item => {
            const status = item.lead_status;
            const createdDate = new Date(item.created_at || item.createdAt);
            return status?.toLowerCase() === 'new' && createdDate >= monthStart;
          }).length;
        },
        format: 'number',
        icon: 'Schedule',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['new']
      },
      {
        id: 'hot_leads',
        label: 'HOT LEADS',
        calculation: (data) => {
          return data.filter(item => {
            const status = item.lead_status;
            const temp = item.lead_temperature;
            return status?.toLowerCase() === 'new' && temp?.toLowerCase() === 'hot';
          }).length;
        },
        format: 'number',
        icon: 'Whatshot',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['new']
      },
      {
        id: 'avg_lead_score',
        label: 'AVG LEAD SCORE',
        calculation: (data) => {
          const newLeads = data.filter(item => item.lead_status?.toLowerCase() === 'new');
          if (newLeads.length === 0) return 0;
          const totalScore = newLeads.reduce((sum, item) => sum + (parseInt(item.lead_score) || 0), 0);
          return Math.round(totalScore / newLeads.length);
        },
        format: 'number',
        icon: 'Star',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['new']
      },

      // Contacted Tab Stats
      {
        id: 'total_contacted',
        label: 'TOTAL LEADS',
        calculation: (_data, helpers) => helpers.countByStatus('contacted'),
        format: 'number',
        icon: 'Phone',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['contacted']
      },
      {
        id: 'contacted_this_month',
        label: 'TOTAL THIS MONTH\'S',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return data.filter(item => {
            const status = item.lead_status;
            const lastContactDate = item.last_contact_date ? new Date(item.last_contact_date) : null;
            return status?.toLowerCase() === 'contacted' && lastContactDate && lastContactDate >= monthStart;
          }).length;
        },
        format: 'number',
        icon: 'Schedule',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['contacted']
      },
      {
        id: 'needs_followup',
        label: 'NEEDS FOLLOW-UP',
        calculation: (data) => {
          const today = new Date().toDateString();
          return data.filter(item => {
            const status = item.lead_status;
            const followUpDate = item.next_follow_up ? new Date(item.next_follow_up).toDateString() : null;
            return status?.toLowerCase() === 'contacted' && followUpDate && followUpDate <= today;
          }).length;
        },
        format: 'number',
        icon: 'Notifications',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['contacted']
      },
      {
        id: 'warm_leads',
        label: 'WARM LEADS',
        calculation: (data) => {
          return data.filter(item => {
            const status = item.lead_status;
            const temp = item.lead_temperature;
            return status?.toLowerCase() === 'contacted' && temp?.toLowerCase() === 'warm';
          }).length;
        },
        format: 'number',
        icon: 'LocalFireDepartment',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['contacted']
      },

      // Qualified Tab Stats
      {
        id: 'total_qualified',
        label: 'TOTAL LEADS',
        calculation: (_data, helpers) => helpers.countByStatus('qualified'),
        format: 'number',
        icon: 'CheckCircle',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['qualified']
      },
      {
        id: 'qualified_this_month',
        label: 'TOTAL THIS MONTH\'S',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return data.filter(item => {
            const status = item.lead_status;
            const updatedDate = new Date(item.updated_at || item.updatedAt);
            return status?.toLowerCase() === 'qualified' && updatedDate >= monthStart;
          }).length;
        },
        format: 'number',
        icon: 'Schedule',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['qualified']
      },
      {
        id: 'ready_to_convert',
        label: 'READY TO CONVERT',
        calculation: (data) => {
          return data.filter(item => {
            const status = item.lead_status;
            const score = parseInt(item.lead_score) || 0;
            return status?.toLowerCase() === 'qualified' && score >= 80;
          }).length;
        },
        format: 'number',
        icon: 'TrendingUp',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['qualified']
      },
      {
        id: 'avg_qualification_time',
        label: 'AVG DAYS TO QUALIFY',
        calculation: (data) => {
          const qualified = data.filter(item => item.lead_status?.toLowerCase() === 'qualified');
          if (qualified.length === 0) return 0;
          const totalDays = qualified.reduce((sum, item) => {
            const created = new Date(item.created_at || item.createdAt);
            const updated = new Date(item.updated_at || item.updatedAt);
            const days = Math.floor((updated - created) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0);
          return Math.round(totalDays / qualified.length);
        },
        format: 'number',
        icon: 'Timer',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['qualified']
      },

      // Converted Tab Stats
      {
        id: 'total_converted',
        label: 'TOTAL CONVERTED',
        calculation: (_data, helpers) => helpers.countByStatus('converted'),
        format: 'number',
        icon: 'Stars',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['converted']
      },
      {
        id: 'converted_this_month',
        label: 'TOTAL THIS MONTH\'S',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return data.filter(item => {
            const status = item.lead_status;
            const updatedDate = new Date(item.updated_at || item.updatedAt);
            return status?.toLowerCase() === 'converted' && updatedDate >= monthStart;
          }).length;
        },
        format: 'number',
        icon: 'Schedule',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['converted']
      },
      {
        id: 'conversion_rate',
        label: 'CONVERSION RATE',
        calculation: (data) => {
          const total = data.length;
          const converted = data.filter(item => item.lead_status?.toLowerCase() === 'converted').length;
          return total > 0 ? ((converted / total) * 100).toFixed(1) : 0;
        },
        format: 'percent',
        icon: 'PercentIcon',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['converted']
      },
      {
        id: 'avg_conversion_time',
        label: 'AVG DAYS TO CONVERT',
        calculation: (data) => {
          const converted = data.filter(item => item.lead_status?.toLowerCase() === 'converted');
          if (converted.length === 0) return 0;
          const totalDays = converted.reduce((sum, item) => {
            const created = new Date(item.created_at || item.createdAt);
            const updated = new Date(item.updated_at || item.updatedAt);
            const days = Math.floor((updated - created) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0);
          return Math.round(totalDays / converted.length);
        },
        format: 'number',
        icon: 'Timeline',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['converted']
      },

      // All Leads Tab Stats
      {
        id: 'total_leads',
        label: 'TOTAL LEADS',
        calculation: (data) => data.length,
        format: 'number',
        icon: 'Dashboard',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['all']
      },
      {
        id: 'leads_this_month',
        label: 'TOTAL THIS MONTH\'S',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return data.filter(item => {
            const createdDate = new Date(item.created_at || item.createdAt);
            return createdDate >= monthStart;
          }).length;
        },
        format: 'number',
        icon: 'Schedule',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['all']
      },
      {
        id: 'overall_conversion_rate',
        label: 'CONVERSION RATE',
        calculation: (data) => {
          const total = data.length;
          const converted = data.filter(item => item.lead_status?.toLowerCase() === 'converted').length;
          return total > 0 ? ((converted / total) * 100).toFixed(1) : 0;
        },
        format: 'percent',
        icon: 'TrendingUp',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['all']
      },
      {
        id: 'avg_lead_value',
        label: 'AVG LEAD SCORE',
        calculation: (data) => {
          if (data.length === 0) return 0;
          const totalScore = data.reduce((sum, item) => sum + (parseInt(item.lead_score) || 0), 0);
          return Math.round(totalScore / data.length);
        },
        format: 'number',
        icon: 'Star',
        color: '#f57c00',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['all']
      }
    ],

    // Status Tabs Configuration
    statusTabs: [
      { value: 'new', label: 'New', preferredViewMode: 'large' },
      { value: 'contacted', label: 'Contacted', preferredViewMode: 'large' },
      { value: 'qualified', label: 'Qualified', preferredViewMode: 'medium' },
      { value: 'converted', label: 'Converted', preferredViewMode: 'medium' },
      { value: 'All', label: 'All Leads', preferredViewMode: 'small' },
      { value: 'archived', label: 'Archived', preferredViewMode: 'small' }
    ],
    defaultStatus: 'new',

    // Scope Filter Configuration
    getScopeOptions: (user) => {
      if (!user) {
        return [
          { value: 'user', label: 'My Leads' },
          { value: 'team', label: 'Team Leads' },
          { value: 'broker', label: 'Broker Leads' }
        ];
      }

      const firstName = user.firstName || user.first_name || 'My';
      const lastName = user.lastName || user.last_name || '';
      const fullName = lastName ? `${firstName} ${lastName}` : (user.username || firstName);
      const teamName = user.teamName || user.team_name || 'Team';
      const brokerName = user.brokerName || user.broker_name || 'Broker';

      return [
        {
          value: 'user',
          label: `${firstName}'s Leads`,
          fullLabel: fullName
        },
        {
          value: 'team',
          label: `${teamName}'s Leads`,
          fullLabel: teamName
        },
        {
          value: 'broker',
          label: `${brokerName}'s Leads`,
          fullLabel: brokerName
        }
      ];
    },
    defaultScope: 'user',

    // Sort Options Configuration
    sortOptions: [
      { value: 'created_at', label: 'Date Added' },
      { value: 'updated_at', label: 'Last Updated' },
      { value: 'lead_score', label: 'Lead Score' },
      { value: 'first_name', label: 'First Name' },
      { value: 'last_name', label: 'Last Name' },
      { value: 'last_contact_date', label: 'Last Contact' },
      { value: 'next_follow_up', label: 'Follow-Up Date' }
    ],
    defaultSort: 'created_at',

    // View Modes Configuration
    viewModes: [
      { value: 'card', label: 'Card', icon: 'GridView' },
      { value: 'large', label: 'Full Width', icon: 'ViewList' },
      { value: 'calendar', label: 'Calendar', icon: 'CalendarToday' }
    ],
    defaultViewMode: 'card', // 4 cards per row

    // Archive Configuration
    showArchive: true,
    archiveLabel: 'Archive',

    // Card Configuration
    card: {
      component: 'LeadCard',
      props: {
        showStatus: true,
        showActions: true,
        showScore: true,
        showTemperature: true,
        showSource: true,
        showTimeline: true
      }
    }
  },

  // ========================================
  // UTILS
  // ========================================
  utils: {
    // Sort leads using centralized sort utility
    // Automatically handles: status fields, dates, currency, strings
    // Status priority is derived from category sortOrder in statusCategories.js
    sortBy: createSortFunction('leads'),

    formatters: {
      date: (value) => {
        if (!value) return 'N/A';
        return new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      },
      status: (value) => {
        const statusMap = {
          'new': 'New',
          'contacted': 'Contacted',
          'qualified': 'Qualified',
          'converted': 'Converted',
          'lost': 'Lost'
        };
        return statusMap[value?.toLowerCase()] || value;
      },
      temperature: (value) => {
        const tempMap = {
          'hot': 'Hot',
          'warm': 'Warm',
          'cold': 'Cold'
        };
        return tempMap[value?.toLowerCase()] || value;
      },
      score: (value) => {
        const score = parseInt(value) || 0;
        return `${score}/100`;
      }
    }
  },

  // ========================================
  // DETAIL PAGE CONFIGURATION
  // ========================================
  detail: {
    hero: {
      titleField: 'name',
      subtitleField: 'lead_source',
      statusField: 'status',
      displayIdField: 'lead_id',
      placeholderIcon: '🎯',
      statusColors: {
        new: '#2196f3',
        contacted: '#ff9800',
        qualified: '#4caf50',
        converted: '#9c27b0',
        lost: '#f44336'
      },
      stats: [
        { label: 'Qualification', field: 'qualification_score', format: 'number', suffix: '%' },
        { label: 'Lead Source', field: 'lead_source', format: 'text' },
        { label: 'Budget', field: 'budget', format: 'currency' },
        { label: 'Timeline', field: 'timeline', format: 'text' }
      ]
    },

    widgets: [
      {
        id: 'contact',
        title: 'Contact',
        component: ContactWidget,
        props: {}
      },
      {
        id: 'qualification',
        title: 'Qualification',
        component: QualificationWidget,
        props: {}
      },
      {
        id: 'engagement',
        title: 'Engagement',
        component: EngagementWidget,
        props: {}
      }
    ],

    leftSidebar: {
      title: 'Quick Actions',
      sections: []
    },

    rightSidebar: {
      title: 'Smart Context',
      sections: []
    },

    activityFeed: {
      enabled: true,
      title: 'Live Activity'
    }
  }
});

export default leadsConfig;
