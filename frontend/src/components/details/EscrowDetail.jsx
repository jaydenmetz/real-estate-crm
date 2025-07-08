// File: frontend/src/components/details/EscrowDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Home, Users, FileText, Calendar, DollarSign, CheckCircle2, 
  AlertCircle, Clock, TrendingUp, Building, Phone, Mail,
  MapPin, Briefcase, Calculator, PieChart
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function EscrowDetail() {
  const { id } = useParams();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklistItems, setChecklistItems] = useState({});
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchEscrowDetails();
    fetchAnalytics();
  }, [id]);

  const fetchEscrowDetails = async () => {
    try {
      const response = await api.get(`/escrows/${id}`);
      setEscrow(response.data);
      setChecklistItems(response.data.checklist || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching escrow details:', error);
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/analytics/escrow/${id}`);
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
      await api.put(`/escrows/${id}/checklist`, { checklist: updatedChecklist });
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const buyerChecklist = [
    { key: 'earnest_money_deposited', label: 'Earnest Money Deposited' },
    { key: 'loan_application_submitted', label: 'Loan Application Submitted' },
    { key: 'home_inspection_ordered', label: 'Home Inspection Ordered' },
    { key: 'home_inspection_completed', label: 'Home Inspection Completed' },
    { key: 'appraisal_ordered', label: 'Appraisal Ordered' },
    { key: 'appraisal_completed', label: 'Appraisal Completed' },
    { key: 'loan_approval_received', label: 'Loan Approval Received' },
    { key: 'homeowners_insurance_obtained', label: 'Homeowners Insurance Obtained' },
    { key: 'final_walkthrough_scheduled', label: 'Final Walkthrough Scheduled' },
    { key: 'closing_documents_reviewed', label: 'Closing Documents Reviewed' }
  ];

  const sellerChecklist = [
    { key: 'property_disclosures_completed', label: 'Property Disclosures Completed' },
    { key: 'title_report_ordered', label: 'Title Report Ordered' },
    { key: 'title_cleared', label: 'Title Cleared' },
    { key: 'repairs_completed', label: 'Requested Repairs Completed' },
    { key: 'home_warranty_purchased', label: 'Home Warranty Purchased' },
    { key: 'utilities_transfer_arranged', label: 'Utilities Transfer Arranged' },
    { key: 'moving_arrangements_made', label: 'Moving Arrangements Made' },
    { key: 'final_water_reading', label: 'Final Water Reading Scheduled' },
    { key: 'keys_prepared', label: 'Keys and Garage Openers Prepared' },
    { key: 'property_vacant', label: 'Property Vacant and Clean' }
  ];

  const agentChecklist = [
    { key: 'purchase_agreement_executed', label: 'Purchase Agreement Fully Executed' },
    { key: 'contingencies_tracked', label: 'All Contingencies Being Tracked' },
    { key: 'commission_agreement_signed', label: 'Commission Agreement Signed' },
    { key: 'vendor_contacts_shared', label: 'Vendor Contacts Shared with Client' },
    { key: 'weekly_updates_sent', label: 'Weekly Status Updates Sent' },
    { key: 'closing_statement_reviewed', label: 'Closing Statement Reviewed' },
    { key: 'closing_gift_prepared', label: 'Closing Gift Prepared' },
    { key: 'testimonial_requested', label: 'Testimonial/Review Requested' },
    { key: 'referral_request_made', label: 'Referral Request Made' },
    { key: 'post_closing_followup', label: 'Post-Closing Follow-up Scheduled' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'text-green-600 bg-green-50',
      'Pending': 'text-yellow-600 bg-yellow-50',
      'Closed': 'text-blue-600 bg-blue-50',
      'Cancelled': 'text-red-600 bg-red-50',
      'On Hold': 'text-gray-600 bg-gray-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getDaysUntilClosing = () => {
    if (!escrow?.closing_date) return null;
    const today = new Date();
    const closing = new Date(escrow.closing_date);
    const diffTime = closing - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateCommissionBreakdown = () => {
    if (!escrow?.gross_commission) return [];
    
    const data = [
      { name: 'Listing Side', value: escrow.gross_commission / 2 },
      { name: 'Buying Side', value: escrow.gross_commission / 2 }
    ];
    
    if (escrow.commission_adjustments) {
      data.push({ name: 'Adjustments', value: Math.abs(escrow.commission_adjustments) });
    }
    
    return data;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Escrow not found</h2>
        </div>
      </div>
    );
  }

  const daysUntilClosing = getDaysUntilClosing();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{escrow.property_address}</h1>
            </div>
            <p className="text-gray-600">Escrow #{escrow.escrow_number || escrow.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(escrow.escrow_status)}`}>
            {escrow.escrow_status}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Purchase Price</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(escrow.purchase_price)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Days to Close</p>
                <p className="text-2xl font-bold text-gray-900">
                  {daysUntilClosing !== null ? (
                    daysUntilClosing >= 0 ? `${daysUntilClosing} days` : 'Closed'
                  ) : 'TBD'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gross Commission</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(escrow.gross_commission)}</p>
              </div>
              <Calculator className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Commission</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(escrow.net_commission)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details and People */}
        <div className="lg:col-span-1 space-y-6">
          {/* Transaction Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Property Type</dt>
                <dd className="text-sm font-medium text-gray-900">{escrow.property_type || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Loan Amount</dt>
                <dd className="text-sm font-medium text-gray-900">{formatCurrency(escrow.loan_amount)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Down Payment</dt>
                <dd className="text-sm font-medium text-gray-900">{formatCurrency(escrow.down_payment)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">EMD Amount</dt>
                <dd className="text-sm font-medium text-gray-900">{formatCurrency(escrow.earnest_money_deposit)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Lead Source</dt>
                <dd className="text-sm font-medium text-gray-900">{escrow.lead_source || 'Not specified'}</dd>
              </div>
            </dl>
          </div>

          {/* People Involved */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">People Involved</h2>
            
            {/* Buyers */}
            {escrow.buyers?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Buyers</h3>
                {escrow.buyers.map(buyer => (
                  <Link 
                    key={buyer.id} 
                    to={`/clients/${buyer.id}`}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{buyer.name}</p>
                      <p className="text-xs text-gray-600">{buyer.email}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Sellers */}
            {escrow.sellers?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sellers</h3>
                {escrow.sellers.map(seller => (
                  <Link 
                    key={seller.id} 
                    to={`/clients/${seller.id}`}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{seller.name}</p>
                      <p className="text-xs text-gray-600">{seller.email}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Service Providers */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Service Providers</h3>
              <div className="space-y-2">
                {escrow.escrow_officer && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Escrow:</span>
                    <span className="font-medium">{escrow.escrow_officer.name}</span>
                  </div>
                )}
                {escrow.loan_officer && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Lender:</span>
                    <span className="font-medium">{escrow.loan_officer.name}</span>
                  </div>
                )}
                {escrow.title_company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Title:</span>
                    <span className="font-medium">{escrow.title_company.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Important Dates */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Important Dates</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Acceptance Date</span>
                <span className="text-sm font-medium">{formatDate(escrow.acceptance_date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">EMD Due</span>
                <span className="text-sm font-medium">{formatDate(escrow.emd_due_date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Inspection Deadline</span>
                <span className="text-sm font-medium">{formatDate(escrow.inspection_deadline)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Appraisal Deadline</span>
                <span className="text-sm font-medium">{formatDate(escrow.appraisal_deadline)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Loan Contingency</span>
                <span className="text-sm font-medium">{formatDate(escrow.loan_contingency_deadline)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Closing Date</span>
                <span className="text-sm font-medium text-blue-600">{formatDate(escrow.closing_date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Checklists */}
        <div className="lg:col-span-1 space-y-6">
          {/* Buyer Checklist */}
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

          {/* Seller Checklist */}
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

          {/* Agent Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Agent Checklist</h2>
            <div className="space-y-2">
              {agentChecklist.map(item => (
                <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistItems.agent?.[item.key] || false}
                    onChange={() => handleChecklistToggle('agent', item.key)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checklistItems.agent?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Analytics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Commission Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Commission Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={calculateCommissionBreakdown()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {calculateCommissionBreakdown().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Progress Overview</h2>
            <div className="space-y-4">
              {Object.entries({
                'Buyer Tasks': buyerChecklist,
                'Seller Tasks': sellerChecklist,
                'Agent Tasks': agentChecklist
              }).map(([category, items]) => {
                const completed = items.filter(item => 
                  checklistItems[category.toLowerCase().split(' ')[0]]?.[item.key]
                ).length;
                const percentage = (completed / items.length) * 100;

                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{category}</span>
                      <span className="text-gray-900 font-medium">{completed}/{items.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Loan approval received</p>
                  <p className="text-xs text-gray-600">2 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Appraisal report uploaded</p>
                  <p className="text-xs text-gray-600">5 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Inspection contingency removed</p>
                  <p className="text-xs text-gray-600">1 week ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Indicators */}
          {daysUntilClosing !== null && daysUntilClosing < 10 && daysUntilClosing >= 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Closing Date Approaching</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Only {daysUntilClosing} days until closing. Ensure all tasks are completed and documents are ready.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}