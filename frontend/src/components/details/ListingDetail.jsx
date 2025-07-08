// File: frontend/src/components/details/ListingDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Home, Users, Camera, Video, Eye, Heart, Calendar, DollarSign,
  TrendingUp, TrendingDown, MapPin, Bed, Bath, Square, Car,
  Trees, Share2, Download, Clock, AlertCircle, CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklistItems, setChecklistItems] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);

  useEffect(() => {
    fetchListingDetails();
    fetchAnalytics();
    fetchPriceHistory();
  }, [id]);

  const fetchListingDetails = async () => {
    try {
      const response = await api.get(`/listings/${id}`);
      setListing(response.data);
      setChecklistItems(response.data.checklist || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listing details:', error);
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/analytics/listing/${id}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const response = await api.get(`/listings/${id}/price-history`);
      setPriceHistory(response.data);
    } catch (error) {
      console.error('Error fetching price history:', error);
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
      await api.put(`/listings/${id}/checklist`, { checklist: updatedChecklist });
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const preListingChecklist = [
    { key: 'cma_completed', label: 'Comparative Market Analysis Completed' },
    { key: 'listing_agreement_signed', label: 'Listing Agreement Signed' },
    { key: 'property_disclosures', label: 'Property Disclosures Completed' },
    { key: 'prelisting_inspection', label: 'Pre-Listing Inspection Done' },
    { key: 'repairs_completed', label: 'Necessary Repairs Completed' },
    { key: 'staging_consultation', label: 'Staging Consultation Completed' },
    { key: 'professional_photos', label: 'Professional Photos Scheduled' },
    { key: 'marketing_materials', label: 'Marketing Materials Prepared' }
  ];

  const activeListingChecklist = [
    { key: 'mls_active', label: 'Listed on MLS' },
    { key: 'yard_sign_installed', label: 'Yard Sign Installed' },
    { key: 'lockbox_installed', label: 'Lockbox Installed' },
    { key: 'virtual_tour_live', label: 'Virtual Tour Live' },
    { key: 'social_media_posted', label: 'Posted on Social Media' },
    { key: 'broker_tour_scheduled', label: 'Broker Tour Scheduled' },
    { key: 'open_house_scheduled', label: 'Open House Scheduled' },
    { key: 'weekly_updates', label: 'Weekly Updates to Seller' },
    { key: 'showing_feedback', label: 'Showing Feedback Collected' },
    { key: 'price_review', label: 'Price Strategy Reviewed' }
  ];

  const marketingChecklist = [
    { key: 'professional_photos', label: 'Professional Photography' },
    { key: 'drone_photos', label: 'Drone/Aerial Photography' },
    { key: 'virtual_tour', label: '3D Virtual Tour' },
    { key: 'video_walkthrough', label: 'Video Walkthrough' },
    { key: 'flyers_created', label: 'Property Flyers Created' },
    { key: 'email_campaign', label: 'Email Campaign Sent' },
    { key: 'facebook_ads', label: 'Facebook Ads Running' },
    { key: 'instagram_posts', label: 'Instagram Posts Created' },
    { key: 'zillow_featured', label: 'Featured on Zillow' },
    { key: 'realtor_featured', label: 'Featured on Realtor.com' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'text-green-600 bg-green-50',
      'Pending': 'text-yellow-600 bg-yellow-50',
      'Sold': 'text-blue-600 bg-blue-50',
      'Expired': 'text-red-600 bg-red-50',
      'Withdrawn': 'text-gray-600 bg-gray-50',
      'Coming Soon': 'text-purple-600 bg-purple-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const calculatePricePerSqft = () => {
    if (!listing?.list_price || !listing?.square_footage) return 0;
    return listing.list_price / listing.square_footage;
  };

  const calculateMarketingROI = () => {
    if (!listing?.marketing_spent || listing.marketing_spent === 0) return 0;
    const views = listing.online_views || 0;
    const showings = listing.total_showings || 0;
    const engagement = views + (showings * 10); // Weight showings more heavily
    return (engagement / listing.marketing_spent).toFixed(2);
  };

  const getShowingTrend = () => {
    if (!analytics?.showing_trend) return [];
    return analytics.showing_trend.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  };

  const getViewsTrend = () => {
    if (!analytics?.views_trend) return [];
    return analytics.views_trend.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Listing not found</h2>
        </div>
      </div>
    );
  }

  const pricePerSqft = calculatePricePerSqft();
  const marketingROI = calculateMarketingROI();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Home className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{listing.property_address}</h1>
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <span>MLS# {listing.mls_number || 'N/A'}</span>
              <span>•</span>
              <span>{listing.property_type}</span>
              <span>•</span>
              <span>Listed {formatDate(listing.listing_date)}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(listing.listing_status)}`}>
            {listing.listing_status}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">List Price</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(listing.list_price)}</p>
                {listing.original_list_price && listing.original_list_price !== listing.list_price && (
                  <p className="text-xs text-red-600 mt-1">
                    {listing.list_price < listing.original_list_price ? '↓' : '↑'} 
                    {formatCurrency(Math.abs(listing.list_price - listing.original_list_price))}
                  </p>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Days on Market</p>
                <p className="text-2xl font-bold text-gray-900">{listing.days_on_market || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Showings</p>
                <p className="text-2xl font-bold text-gray-900">{listing.total_showings || 0}</p>
                <p className="text-xs text-gray-600 mt-1">This week: {listing.showings_this_week || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Online Views</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(listing.online_views || 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved as Favorite</p>
                <p className="text-2xl font-bold text-gray-900">{listing.saved_favorites || 0}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Property Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Property Features */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Property Features</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="font-semibold">{listing.bedrooms || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="font-semibold">{listing.bathrooms || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Square Feet</p>
                    <p className="font-semibold">{formatNumber(listing.square_footage || 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Garage</p>
                    <p className="font-semibold">{listing.garage || 0} car</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price per sq ft</span>
                    <span className="font-semibold">{formatCurrency(pricePerSqft)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lot Size</span>
                    <span className="font-semibold">{formatNumber(listing.lot_size || 0)} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Year Built</span>
                    <span className="font-semibold">{listing.year_built || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pool</span>
                    <span className="font-semibold">{listing.pool ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sellers */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Property Owners</h2>
            {listing.sellers?.length > 0 ? (
              <div className="space-y-3">
                {listing.sellers.map(seller => (
                  <Link 
                    key={seller.id} 
                    to={`/clients/${seller.id}`}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{seller.name}</p>
                      <p className="text-xs text-gray-600">{seller.email}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No sellers linked</p>
            )}
          </div>

          {/* Marketing Budget */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Marketing Investment</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Budget</span>
                <span className="font-semibold">{formatCurrency(listing.marketing_budget || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Spent</span>
                <span className="font-semibold">{formatCurrency(listing.marketing_spent || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency((listing.marketing_budget || 0) - (listing.marketing_spent || 0))}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ROI Score</span>
                  <span className="font-semibold">{marketingROI}x</span>
                </div>
              </div>
            </div>

            {/* Marketing Budget Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(((listing.marketing_spent || 0) / (listing.marketing_budget || 1)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Commission Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Commission Structure</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Listing Commission</span>
                <span className="font-semibold">{listing.listing_commission || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Buyer Agent Commission</span>
                <span className="font-semibold">{listing.buyer_agent_commission || 0}%</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Commission</span>
                  <span className="font-semibold text-blue-600">
                    {(listing.listing_commission || 0) + (listing.buyer_agent_commission || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Checklists */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pre-Listing Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Pre-Listing Checklist</h2>
            <div className="space-y-2">
              {preListingChecklist.map(item => (
                <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistItems.preListing?.[item.key] || false}
                    onChange={() => handleChecklistToggle('preListing', item.key)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checklistItems.preListing?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Listing Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Active Listing Tasks</h2>
            <div className="space-y-2">
              {activeListingChecklist.map(item => (
                <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistItems.activeListing?.[item.key] || false}
                    onChange={() => handleChecklistToggle('activeListing', item.key)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checklistItems.activeListing?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Marketing Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Marketing Checklist</h2>
            <div className="space-y-2">
              {marketingChecklist.map(item => (
                <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistItems.marketing?.[item.key] || false}
                    onChange={() => handleChecklistToggle('marketing', item.key)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checklistItems.marketing?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Analytics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Price History */}
          {priceHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Price History</h2>
              <div className="space-y-3">
                {priceHistory.map((price, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{formatCurrency(price.price)}</p>
                      <p className="text-xs text-gray-600">{formatDate(price.date)}</p>
                    </div>
                    {index > 0 && (
                      <div className={`flex items-center gap-1 ${price.price < priceHistory[index-1].price ? 'text-red-600' : 'text-green-600'}`}>
                        {price.price < priceHistory[index-1].price ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                        <span className="text-sm font-medium">
                          {formatCurrency(Math.abs(price.price - priceHistory[index-1].price))}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Showing Activity Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Showing Activity</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getShowingTrend()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="showings" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Online Views Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Online Engagement</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getViewsTrend()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Marketing Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Marketing Performance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Professional Photos</span>
                </div>
                <span className={`text-sm font-medium ${listing.professional_photos ? 'text-green-600' : 'text-gray-400'}`}>
                  {listing.professional_photos ? 'Complete' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Virtual Tour</span>
                </div>
                <span className={`text-sm font-medium ${listing.virtual_tour_link ? 'text-green-600' : 'text-gray-400'}`}>
                  {listing.virtual_tour_link ? 'Live' : 'Not Available'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Social Media</span>
                </div>
                <span className={`text-sm font-medium ${checklistItems.marketing?.social_media_posted ? 'text-green-600' : 'text-gray-400'}`}>
                  {checklistItems.marketing?.social_media_posted ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {listing.virtual_tour_link && (
                  <a 
                    href={listing.virtual_tour_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Video className="h-4 w-4" />
                    View Virtual Tour
                  </a>
                )}
                <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                  <Download className="h-4 w-4" />
                  Download Marketing Report
                </button>
                <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                  <Share2 className="h-4 w-4" />
                  Share Listing
                </button>
              </div>
            </div>
          </div>

          {/* Market Alert */}
          {listing.days_on_market > 30 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Extended Market Time</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This property has been on the market for {listing.days_on_market} days. 
                    Consider reviewing pricing strategy or increasing marketing efforts.
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