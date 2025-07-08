// File: frontend/src/components/details/ClientDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, Phone, Mail, MapPin, Calendar, DollarSign, Home, FileText,
  TrendingUp, Clock, MessageCircle, Tag, Heart, Star, Award, Target,
  CheckCircle2, AlertCircle, Users, Briefcase, Gift
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';
import {
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklistItems, setChecklistItems] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchClientDetails();
    fetchTransactions();
    fetchCommunications();
    fetchNotes();
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      const response = await api.get(`/clients/${id}`);
      setClient(response.data);
      setChecklistItems(response.data.checklist || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching client details:', error);
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get(`/clients/${id}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchCommunications = async () => {
    try {
      const response = await api.get(`/clients/${id}/communications`);
      setCommunications(response.data);
    } catch (error) {
      console.error('Error fetching communications:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/clients/${id}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
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
      await api.put(`/clients/${id}/checklist`, { checklist: updatedChecklist });
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const buyerChecklist = [
    { key: 'pre_approval_obtained', label: 'Pre-Approval Letter Obtained' },
    { key: 'needs_assessment_complete', label: 'Needs Assessment Completed' },
    { key: 'buyer_agency_signed', label: 'Buyer Agency Agreement Signed' },
    { key: 'property_requirements_documented', label: 'Property Requirements Documented' },
    { key: 'search_criteria_defined', label: 'Search Criteria Defined' },
    { key: 'preferred_neighborhoods_identified', label: 'Preferred Neighborhoods Identified' },
    { key: 'showing_schedule_set', label: 'Showing Schedule Established' },
    { key: 'feedback_system_explained', label: 'Feedback System Explained' },
    { key: 'offer_strategy_discussed', label: 'Offer Strategy Discussed' },
    { key: 'closing_process_explained', label: 'Closing Process Explained' }
  ];

  const sellerChecklist = [
    { key: 'listing_presentation_complete', label: 'Listing Presentation Completed' },
    { key: 'cma_presented', label: 'CMA Presented and Discussed' },
    { key: 'listing_agreement_signed', label: 'Listing Agreement Signed' },
    { key: 'property_condition_assessed', label: 'Property Condition Assessment' },
    { key: 'staging_consultation_done', label: 'Staging Consultation Completed' },
    { key: 'marketing_plan_approved', label: 'Marketing Plan Approved' },
    { key: 'pricing_strategy_agreed', label: 'Pricing Strategy Agreed Upon' },
    { key: 'disclosure_documents_complete', label: 'Disclosure Documents Completed' },
    { key: 'showing_instructions_set', label: 'Showing Instructions Established' },
    { key: 'communication_preferences_noted', label: 'Communication Preferences Noted' }
  ];

  const relationshipChecklist = [
    { key: 'initial_consultation_done', label: 'Initial Consultation Completed' },
    { key: 'contact_info_verified', label: 'Contact Information Verified' },
    { key: 'communication_preferences_set', label: 'Communication Preferences Set' },
    { key: 'added_to_newsletter', label: 'Added to Newsletter List' },
    { key: 'social_media_connected', label: 'Connected on Social Media' },
    { key: 'birthday_noted', label: 'Birthday/Anniversary Noted' },
    { key: 'family_info_documented', label: 'Family Information Documented' },
    { key: 'interests_hobbies_noted', label: 'Interests & Hobbies Noted' },
    { key: 'referral_potential_assessed', label: 'Referral Potential Assessed' },
    { key: 'long_term_goals_discussed', label: 'Long-term Goals Discussed' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'text-green-600 bg-green-50',
      'Inactive': 'text-gray-600 bg-gray-50',
      'Hot Lead': 'text-red-600 bg-red-50',
      'Nurture': 'text-yellow-600 bg-yellow-50',
      'Past Client': 'text-blue-600 bg-blue-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getClientTypeIcon = (type) => {
    const icons = {
      'Buyer': <Home className="h-4 w-4" />,
      'Seller': <Tag className="h-4 w-4" />,
      'Both': <Users className="h-4 w-4" />,
      'Investor': <TrendingUp className="h-4 w-4" />,
      'Renter': <Clock className="h-4 w-4" />
    };
    return icons[type] || <User className="h-4 w-4" />;
  };

  const calculateLifetimeValue = () => {
    return transactions.reduce((sum, t) => sum + (t.commission_earned || 0), 0);
  };

  const getTransactionTimeline = () => {
    return transactions.map(t => ({
      date: new Date(t.closing_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: t.purchase_price,
      commission: t.commission_earned
    }));
  };

  const getCommunicationStats = () => {
    const stats = communications.reduce((acc, comm) => {
      acc[comm.type] = (acc[comm.type] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Client not found</h2>
        </div>
      </div>
    );
  }

  const lifetimeValue = calculateLifetimeValue();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {client.preferred_name || `${client.first_name} ${client.last_name}`}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <div className="flex items-center gap-1">
                  {getClientTypeIcon(client.client_type)}
                  <span>{client.client_type || 'Client'}</span>
                </div>
                <span>•</span>
                <span>Client since {formatDate(client.created_at)}</span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.client_status)}`}>
            {client.client_status}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lifetime Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(lifetimeValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Communications</p>
                <p className="text-2xl font-bold text-gray-900">{communications.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Referrals Made</p>
                <p className="text-2xl font-bold text-gray-900">{client.referrals_made || 0}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact & Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <a href={`mailto:${client.email}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{client.email}</span>
              </a>
              <a href={`tel:${client.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{formatPhone(client.phone)}</span>
              </a>
              {client.alternate_phone && (
                <a href={`tel:${client.alternate_phone}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">{formatPhone(client.alternate_phone)} (Alt)</span>
                </a>
              )}
              {client.address && (
                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="text-sm">
                    <p>{client.address.street}</p>
                    <p>{client.address.city}, {client.address.state} {client.address.zipCode}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Communication Preferences</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Preferred Method</span>
                  <span className="font-medium">{client.preferred_contact_method || 'Any'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Best Time</span>
                  <span className="font-medium">{client.best_time_to_contact || 'Anytime'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demographics */}
          {client.demographics && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Demographics</h2>
              <div className="space-y-3">
                {client.demographics.age_range && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Age Range</span>
                    <span className="font-medium">{client.demographics.age_range}</span>
                  </div>
                )}
                {client.demographics.occupation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Occupation</span>
                    <span className="font-medium">{client.demographics.occupation}</span>
                  </div>
                )}
                {client.demographics.household_size && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Household Size</span>
                    <span className="font-medium">{client.demographics.household_size}</span>
                  </div>
                )}
                {client.demographics.income_range && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Income Range</span>
                    <span className="font-medium">{client.demographics.income_range}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferences */}
          {client.preferences && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Property Preferences</h2>
              <div className="space-y-3">
                {client.preferences.property_types && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Property Types</p>
                    <div className="flex flex-wrap gap-2">
                      {client.preferences.property_types.map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {client.preferences.price_range && (
                  <div>
                    <p className="text-sm text-gray-600">Price Range</p>
                    <p className="font-medium">
                      {formatCurrency(client.preferences.price_range.min)} - {formatCurrency(client.preferences.price_range.max)}
                    </p>
                  </div>
                )}
                {client.preferences.preferred_areas && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Preferred Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {client.preferences.preferred_areas.map((area, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag, index) => (
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
          {/* Buyer Checklist */}
          {(client.client_type === 'Buyer' || client.client_type === 'Both') && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Buyer Checklist</h2>
              <div className="space-y-2">
                {buyerChecklist.map(item => (
                  <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistItems.buyer?.[item.key] || false}
                      onChange={() => handleChecklistToggle('buyer', item.key)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm ${checklistItems.buyer?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Seller Checklist */}
          {(client.client_type === 'Seller' || client.client_type === 'Both') && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Seller Checklist</h2>
              <div className="space-y-2">
                {sellerChecklist.map(item => (
                  <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistItems.seller?.[item.key] || false}
                      onChange={() => handleChecklistToggle('seller', item.key)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm ${checklistItems.seller?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Relationship Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Relationship Building</h2>
            <div className="space-y-2">
              {relationshipChecklist.map(item => (
                <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistItems.relationship?.[item.key] || false}
                    onChange={() => handleChecklistToggle('relationship', item.key)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checklistItems.relationship?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Analytics & Activity */}
        <div className="lg:col-span-1 space-y-6">
          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map(transaction => (
                  <Link
                    key={transaction.id}
                    to={`/escrows/${transaction.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{transaction.property_address}</p>
                        <p className="text-xs text-gray-600">{transaction.transaction_type} • {formatDate(transaction.closing_date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(transaction.purchase_price)}</p>
                        <p className="text-xs text-green-600">+{formatCurrency(transaction.commission_earned)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No transactions yet</p>
            )}
          </div>

          {/* Transaction Timeline Chart */}
          {transactions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Transaction Timeline</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTransactionTimeline()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Communication Stats */}
          {communications.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Communication Breakdown</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={getCommunicationStats()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getCommunicationStats().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Notes</h2>
            <div className="space-y-3">
              {notes.slice(0, 3).map(note => (
                <div key={note.id} className="border-l-4 border-blue-400 pl-3">
                  <p className="text-sm text-gray-900">{note.content}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {note.created_by} • {formatDate(note.created_at)}
                  </p>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-sm text-gray-500">No notes yet</p>
              )}
              {notes.length > 3 && (
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View all {notes.length} notes
                </button>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Recommended Next Steps</h3>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  {client.client_status === 'Active' && transactions.length === 0 && (
                    <li>• Schedule property showings</li>
                  )}
                  {!checklistItems.relationship?.birthday_noted && (
                    <li>• Add birthday for personalized outreach</li>
                  )}
                  {communications.length === 0 && (
                    <li>• Send welcome email</li>
                  )}
                  {client.referrals_made === 0 && transactions.length > 0 && (
                    <li>• Request referrals from satisfied client</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}