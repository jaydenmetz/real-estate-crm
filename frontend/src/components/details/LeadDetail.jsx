// File: frontend/src/components/details/LeadDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  UserPlus, Phone, Mail, Globe, Calendar, TrendingUp, Clock,
  MessageCircle, Tag, ThermometerSun, Target, CheckCircle2,
  AlertCircle, BarChart3, Activity, Zap, Award, Home, DollarSign
} from 'lucide-react';
import api from '../../services/api';
import { formatDate, formatPhone, daysSince } from '../../utils/formatters';
import {
  LineChart, Line, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklistItems, setChecklistItems] = useState({});
  const [activities, setActivities] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchLeadDetails();
    fetchActivities();
    fetchCommunications();
    fetchAnalytics();
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      const response = await api.get(`/leads/${id}`);
      setLead(response.data);
      setChecklistItems(response.data.checklist || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lead details:', error);
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get(`/leads/${id}/activities`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchCommunications = async () => {
    try {
      const response = await api.get(`/leads/${id}/communications`);
      setCommunications(response.data);
    } catch (error) {
      console.error('Error fetching communications:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/analytics/lead/${id}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleChecklistToggle = async (category, item) => {
    const updatedChecklist = {
      ...checklistItems,
      [category]: {
        ...checklistItems[category],
        [item]: !checklistItems[category]?.[item]
      }
    };
    
    setChecklistItems(updatedChecklist);
    
    try {
      await api.put(`/leads/${id}/checklist`, { checklist: updatedChecklist });
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const initialContactChecklist = [
    { key: 'initial_response_sent', label: 'Initial Response Sent (within 5 minutes)' },
    { key: 'contact_info_verified', label: 'Contact Information Verified' },
    { key: 'lead_source_documented', label: 'Lead Source Documented' },
    { key: 'initial_needs_identified', label: 'Initial Needs Identified' },
    { key: 'timeline_discussed', label: 'Timeline Discussed' },
    { key: 'budget_range_identified', label: 'Budget Range Identified' },
    { key: 'preferred_communication_noted', label: 'Preferred Communication Method Noted' },
    { key: 'added_to_crm', label: 'Added to CRM System' },
    { key: 'welcome_package_sent', label: 'Welcome Package/Info Sent' },
    { key: 'first_meeting_scheduled', label: 'First Meeting Scheduled' }
  ];

  const qualificationChecklist = [
    { key: 'motivation_assessed', label: 'Motivation Level Assessed' },
    { key: 'financial_capability_verified', label: 'Financial Capability Verified' },
    { key: 'decision_timeline_confirmed', label: 'Decision Timeline Confirmed' },
    { key: 'property_requirements_detailed', label: 'Property Requirements Detailed' },
    { key: 'location_preferences_mapped', label: 'Location Preferences Mapped' },
    { key: 'competition_identified', label: 'Competition/Other Agents Identified' },
    { key: 'pain_points_discovered', label: 'Pain Points Discovered' },
    { key: 'value_proposition_presented', label: 'Value Proposition Presented' },
    { key: 'objections_addressed', label: 'Initial Objections Addressed' },
    { key: 'lead_score_assigned', label: 'Lead Score Assigned' }
  ];

  const nurturingChecklist = [
    { key: 'drip_campaign_enrolled', label: 'Enrolled in Drip Campaign' },
    { key: 'market_updates_subscribed', label: 'Subscribed to Market Updates' },
    { key: 'property_alerts_setup', label: 'Property Alerts Set Up' },
    { key: 'educational_content_sent', label: 'Educational Content Sent' },
    { key: 'success_stories_shared', label: 'Success Stories Shared' },
    { key: 'market_report_sent', label: 'Local Market Report Sent' },
    { key: 'social_media_connected', label: 'Connected on Social Media' },
    { key: 'newsletter_subscribed', label: 'Newsletter Subscription Added' },
    { key: 'periodic_check_ins_scheduled', label: 'Periodic Check-ins Scheduled' },
    { key: 'referral_request_made', label: 'Referral Request Made' }
  ];

  const conversionChecklist = [
    { key: 'buyer_agency_discussed', label: 'Buyer Agency Agreement Discussed' },
    { key: 'listing_agreement_discussed', label: 'Listing Agreement Discussed' },
    { key: 'financing_options_reviewed', label: 'Financing Options Reviewed' },
    { key: 'property_showings_started', label: 'Property Showings Started' },
    { key: 'offer_strategy_developed', label: 'Offer Strategy Developed' },
    { key: 'market_analysis_presented', label: 'Market Analysis Presented' },
    { key: 'contract_terms_explained', label: 'Contract Terms Explained' },
    { key: 'service_agreement_signed', label: 'Service Agreement Signed' },
    { key: 'client_onboarding_complete', label: 'Client Onboarding Complete' },
    { key: 'conversion_celebrated', label: 'Conversion Milestone Celebrated' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'New': 'text-blue-600 bg-blue-50',
      'Contacted': 'text-purple-600 bg-purple-50',
      'Qualified': 'text-green-600 bg-green-50',
      'Nurturing': 'text-yellow-600 bg-yellow-50',
      'Hot': 'text-red-600 bg-red-50',
      'Converted': 'text-emerald-600 bg-emerald-50',
      'Lost': 'text-gray-600 bg-gray-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getTemperatureIcon = (temperature) => {
    const icons = {
      'Cold': <ThermometerSun className="h-5 w-5 text-blue-500" />,
      'Warm': <ThermometerSun className="h-5 w-5 text-yellow-500" />,
      'Hot': <ThermometerSun className="h-5 w-5 text-red-500" />
    };
    return icons[temperature] || <ThermometerSun className="h-5 w-5 text-gray-500" />;
  };

  const getLeadScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const calculateEngagementScore = () => {
    const totalActivities = activities.length;
    const recentActivities = activities.filter(a => 
      daysSince(a.created_at) <= 7
    ).length;
    const communicationCount = communications.length;
    
    // Simple engagement score calculation
    const score = Math.min(100, (totalActivities * 5) + (recentActivities * 10) + (communicationCount * 3));
    return score;
  };

  const getActivityTimeline = () => {
    return activities.slice(0, 10).map(activity => ({
      date: new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      type: activity.type,
      score: activity.engagement_points || 1
    }));
  };

  const getLeadScoreData = () => {
    const score = lead?.lead_score || 0;
    return [
      {
        name: 'Lead Score',
        value: score,
        fill: score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
      }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Lead not found</h2>
        </div>
      </div>
    );
  }

  const engagementScore = calculateEngagementScore();
  const daysSinceContact = lead.last_contact_date ? daysSince(lead.last_contact_date) : null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {lead.first_name} {lead.last_name}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <span>{lead.lead_source}</span>
                <span>•</span>
                <span>{lead.lead_type}</span>
                <span>•</span>
                <span>Added {formatDate(lead.date_created)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getTemperatureIcon(lead.lead_temperature)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.lead_status)}`}>
              {lead.lead_status}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lead Score</p>
                <p className={`text-2xl font-bold ${getLeadScoreColor(lead.lead_score)}`}>
                  {lead.lead_score}/100
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Days Since Contact</p>
                <p className={`text-2xl font-bold ${daysSinceContact > 7 ? 'text-red-600' : 'text-gray-900'}`}>
                  {daysSinceContact !== null ? daysSinceContact : 'Never'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{lead.number_of_contacts || 0}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activities</p>
                <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-gray-900">{engagementScore}%</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Alert if not contacted recently */}
        {daysSinceContact > 7 && lead.lead_status !== 'Converted' && lead.lead_status !== 'Lost' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Follow-up Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This lead hasn't been contacted in {daysSinceContact} days. Consider reaching out to maintain engagement.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact & Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">{lead.email}</span>
                </a>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">{formatPhone(lead.phone)}</span>
                </a>
              )}
              {lead.lead_source && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">Source: {lead.lead_source}</span>
                </div>
              )}
            </div>

            {/* Quick Contact Actions */}
            <div className="mt-6 pt-6 border-t space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                Call Lead
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                Send Email
              </button>
            </div>
          </div>

          {/* Lead Qualification */}
          {lead.qualification && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Qualification Details</h2>
              <div className="space-y-3">
                {lead.qualification.budget_range && (
                  <div>
                    <p className="text-sm text-gray-600">Budget Range</p>
                    <p className="font-medium">${lead.qualification.budget_range.min?.toLocaleString()} - ${lead.qualification.budget_range.max?.toLocaleString()}</p>
                  </div>
                )}
                {lead.qualification.timeline && (
                  <div>
                    <p className="text-sm text-gray-600">Timeline</p>
                    <p className="font-medium">{lead.qualification.timeline}</p>
                  </div>
                )}
                {lead.qualification.motivation && (
                  <div>
                    <p className="text-sm text-gray-600">Motivation Level</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${lead.qualification.motivation}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{lead.qualification.motivation}%</span>
                    </div>
                  </div>
                )}
                {lead.qualification.financing && (
                  <div>
                    <p className="text-sm text-gray-600">Financing</p>
                    <p className="font-medium">{lead.qualification.financing}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Property Interests */}
          {lead.property_interests && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Property Interests</h2>
              <div className="space-y-3">
                {lead.property_interests.property_types && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Property Types</p>
                    <div className="flex flex-wrap gap-2">
                      {lead.property_interests.property_types.map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {lead.property_interests.locations && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Preferred Locations</p>
                    <div className="flex flex-wrap gap-2">
                      {lead.property_interests.locations.map((location, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {lead.property_interests.features && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Must-Have Features</p>
                    <ul className="text-sm space-y-1">
                      {lead.property_interests.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - Checklists */}
        <div className="lg:col-span-1 space-y-6">
          {/* Initial Contact Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Initial Contact</h2>
            <div className="space-y-2">
              {initialContactChecklist.map(item => (
                <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistItems.initialContact?.[item.key] || false}
                    onChange={() => handleChecklistToggle('initialContact', item.key)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checklistItems.initialContact?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Qualification Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Qualification Process</h2>
            <div className="space-y-2">
              {qualificationChecklist.map(item => (
                <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistItems.qualification?.[item.key] || false}
                    onChange={() => handleChecklistToggle('qualification', item.key)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checklistItems.qualification?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Nurturing Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Lead Nurturing</h2>
            <div className="space-y-2">
              {nurturingChecklist.map(item => (
                <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistItems.nurturing?.[item.key] || false}
                    onChange={() => handleChecklistToggle('nurturing', item.key)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checklistItems.nurturing?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Conversion Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Conversion Steps</h2>
            <div className="space-y-2">
              {conversionChecklist.map(item => (
                <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistItems.conversion?.[item.key] || false}
                    onChange={() => handleChecklistToggle('conversion', item.key)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checklistItems.conversion?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Analytics & Activity */}
        <div className="lg:col-span-1 space-y-6">
          {/* Lead Score Visualization */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Lead Score Analysis</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="90%" 
                  barSize={20} 
                  data={getLeadScoreData()}
                >
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise
                    dataKey="value"
                  />
                  <text 
                    x="50%" 
                    y="50%" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    className="text-3xl font-bold"
                    fill={getLeadScoreData()[0].fill}
                  >
                    {lead.lead_score}
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Score Breakdown */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Engagement</span>
                <span className="font-medium">{Math.min(30, activities.length * 2)}/30</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Qualification</span>
                <span className="font-medium">{lead.qualification ? 25 : 0}/30</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Interest Level</span>
                <span className="font-medium">{lead.lead_temperature === 'Hot' ? 20 : lead.lead_temperature === 'Warm' ? 10 : 5}/20</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Timeliness</span>
                <span className="font-medium">{daysSinceContact <= 3 ? 20 : daysSinceContact <= 7 ? 10 : 0}/20</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'email' ? 'bg-blue-100' :
                    activity.type === 'call' ? 'bg-green-100' :
                    activity.type === 'meeting' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    {activity.type === 'email' ? <Mail className="h-4 w-4 text-blue-600" /> :
                     activity.type === 'call' ? <Phone className="h-4 w-4 text-green-600" /> :
                     activity.type === 'meeting' ? <Calendar className="h-4 w-4 text-purple-600" /> :
                     <Activity className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-600">{formatDate(activity.created_at)}</p>
                  </div>
                </div>
              ))}
              
              {activities.length === 0 && (
                <p className="text-sm text-gray-500">No activities recorded yet</p>
              )}
              
              {activities.length > 5 && (
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View all {activities.length} activities
                </button>
              )}
            </div>
          </div>

          {/* Communication History Chart */}
          {communications.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Communication Frequency</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getActivityTimeline()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Campaign Info */}
          {lead.campaign_info && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Campaign Information</h2>
              <div className="space-y-3">
                {lead.campaign_info.name && (
                  <div>
                    <p className="text-sm text-gray-600">Campaign Name</p>
                    <p className="font-medium">{lead.campaign_info.name}</p>
                  </div>
                )}
                {lead.campaign_info.medium && (
                  <div>
                    <p className="text-sm text-gray-600">Medium</p>
                    <p className="font-medium">{lead.campaign_info.medium}</p>
                  </div>
                )}
                {lead.campaign_info.cost && (
                  <div>
                    <p className="text-sm text-gray-600">Acquisition Cost</p>
                    <p className="font-medium">${lead.campaign_info.cost}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Best Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Recommended Actions</h3>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  {daysSinceContact > 3 && <li>• Follow up - it's been {daysSinceContact} days</li>}
                  {lead.lead_temperature === 'Hot' && !lead.next_follow_up_date && <li>• Schedule immediate showing</li>}
                  {lead.lead_score >= 70 && lead.lead_status !== 'Qualified' && <li>• Update status to Qualified</li>}
                  {!lead.assigned_agent && <li>• Assign to specific agent</li>}
                  {communications.length === 0 && <li>• Send initial welcome email</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* Conversion Actions */}
          {lead.lead_status !== 'Converted' && lead.lead_status !== 'Lost' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Convert to Client
                </button>
                <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Appointment
                </button>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Home className="h-4 w-4" />
                  Send Property Matches
                </button>
                <button className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                  <Target className="h-4 w-4" />
                  Update Lead Score
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}