// File: frontend/src/components/details/AppointmentDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Video, Users, FileText, CheckCircle2,
  AlertCircle, Phone, Mail, Car, Home, Briefcase, Target,
  MessageSquare, Star, TrendingUp, Navigation, Edit3, Coffee
} from 'lucide-react';
import api from '../../services/api';
import { formatDate, formatTime } from '../../utils/formatters';
import {
  BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function AppointmentDetail() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklistItems, setChecklistItems] = useState({});
  const [attendees, setAttendees] = useState([]);
  const [relatedProperty, setRelatedProperty] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAppointmentDetails();
    fetchAnalytics();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await api.get(`/appointments/${id}`);
      setAppointment(response.data);
      setChecklistItems(response.data.checklist || {});
      setAttendees(response.data.attendees || []);
      
      // Fetch related property if exists
      if (response.data.property_address) {
        fetchRelatedProperty(response.data.property_address);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      setLoading(false);
    }
  };

  const fetchRelatedProperty = async (address) => {
    try {
      const response = await api.get(`/properties/search?address=${encodeURIComponent(address)}`);
      if (response.data && response.data.length > 0) {
        setRelatedProperty(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching related property:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/analytics/appointments/${id}`);
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
      await api.put(`/appointments/${id}/checklist`, { checklist: updatedChecklist });
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const preAppointmentChecklist = [
    { key: 'appointment_confirmed', label: 'Appointment Confirmed with All Parties' },
    { key: 'location_directions_sent', label: 'Location/Directions Sent' },
    { key: 'parking_info_provided', label: 'Parking Information Provided' },
    { key: 'documents_prepared', label: 'Necessary Documents Prepared' },
    { key: 'property_info_reviewed', label: 'Property Information Reviewed' },
    { key: 'client_needs_reviewed', label: 'Client Needs & Preferences Reviewed' },
    { key: 'comps_prepared', label: 'Comparable Properties Prepared' },
    { key: 'reminder_sent', label: 'Reminder Sent (24 hours prior)' },
    { key: 'weather_checked', label: 'Weather Conditions Checked' },
    { key: 'backup_plan_ready', label: 'Backup Plan Ready (if needed)' }
  ];

  const duringAppointmentChecklist = [
    { key: 'arrived_early', label: 'Arrived 15 Minutes Early' },
    { key: 'property_walkthrough', label: 'Complete Property Walkthrough' },
    { key: 'features_highlighted', label: 'Key Features Highlighted' },
    { key: 'questions_answered', label: 'All Questions Answered' },
    { key: 'neighborhood_discussed', label: 'Neighborhood Amenities Discussed' },
    { key: 'next_steps_outlined', label: 'Next Steps Clearly Outlined' },
    { key: 'feedback_gathered', label: 'Initial Feedback Gathered' },
    { key: 'photos_taken', label: 'Photos/Notes Taken (if permitted)' },
    { key: 'safety_protocols_followed', label: 'Safety Protocols Followed' },
    { key: 'professional_demeanor', label: 'Professional Demeanor Maintained' }
  ];

  const postAppointmentChecklist = [
    { key: 'thank_you_sent', label: 'Thank You Message Sent' },
    { key: 'feedback_documented', label: 'Detailed Feedback Documented' },
    { key: 'crm_updated', label: 'CRM System Updated' },
    { key: 'followup_scheduled', label: 'Follow-up Meeting Scheduled' },
    { key: 'additional_info_sent', label: 'Additional Information Sent' },
    { key: 'team_debriefed', label: 'Team Debriefed (if applicable)' },
    { key: 'client_preferences_noted', label: 'Client Preferences Updated' },
    { key: 'comparable_analysis_sent', label: 'Comparable Analysis Sent' },
    { key: 'social_media_posted', label: 'Social Media Update Posted' },
    { key: 'referral_requested', label: 'Referral Request Made (if appropriate)' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'text-blue-600 bg-blue-50',
      'Confirmed': 'text-green-600 bg-green-50',
      'In Progress': 'text-yellow-600 bg-yellow-50',
      'Completed': 'text-gray-600 bg-gray-50',
      'Cancelled': 'text-red-600 bg-red-50',
      'Rescheduled': 'text-purple-600 bg-purple-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getAppointmentTypeIcon = (type) => {
    const icons = {
      'Property Showing': <Home className="h-5 w-5" />,
      'Listing Presentation': <Briefcase className="h-5 w-5" />,
      'Buyer Consultation': <Users className="h-5 w-5" />,
      'Open House': <Home className="h-5 w-5" />,
      'Closing': <FileText className="h-5 w-5" />,
      'Inspection': <CheckCircle2 className="h-5 w-5" />,
      'Virtual Meeting': <Video className="h-5 w-5" />,
      'Coffee Meeting': <Coffee className="h-5 w-5" />
    };
    return icons[type] || <Calendar className="h-5 w-5" />;
  };

  const calculateDuration = () => {
    if (!appointment?.start_time || !appointment?.end_time) return 0;
    const start = new Date(`1970-01-01T${appointment.start_time}`);
    const end = new Date(`1970-01-01T${appointment.end_time}`);
    return Math.round((end - start) / (1000 * 60)); // Duration in minutes
  };

  const getTimeUntilAppointment = () => {
    if (!appointment?.date || !appointment?.start_time) return null;
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.start_time}`);
    const now = new Date();
    const diff = appointmentDateTime - now;
    
    if (diff < 0) return { isPast: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, isPast: false };
  };

  const getAttendanceStats = () => {
    const confirmed = attendees.filter(a => a.confirmed).length;
    const pending = attendees.filter(a => !a.confirmed).length;
    
    return [
      { name: 'Confirmed', value: confirmed },
      { name: 'Pending', value: pending }
    ];
  };

  const COLORS = ['#10B981', '#F59E0B'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Appointment not found</h2>
        </div>
      </div>
    );
  }

  const duration = calculateDuration();
  const timeUntil = getTimeUntilAppointment();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getAppointmentTypeIcon(appointment.appointment_type)}
              <h1 className="text-3xl font-bold text-gray-900">{appointment.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(appointment.date)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
              </div>
              <span>•</span>
              <span>{duration} minutes</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>

        {/* Time Until Appointment */}
        {timeUntil && !timeUntil.isPast && appointment.status === 'Scheduled' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Appointment in {timeUntil.days > 0 && `${timeUntil.days} days, `}
                  {timeUntil.hours} hours and {timeUntil.minutes} minutes
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-lg font-semibold text-gray-900">{appointment.appointment_type}</p>
              </div>
              {getAppointmentTypeIcon(appointment.appointment_type)}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendees</p>
                <p className="text-lg font-semibold text-gray-900">{attendees.length} people</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Location Type</p>
                <p className="text-lg font-semibold text-gray-900">
                  {appointment.virtual_meeting_link ? 'Virtual' : 'In-Person'}
                </p>
              </div>
              {appointment.virtual_meeting_link ? 
                <Video className="h-6 w-6 text-purple-600" /> : 
                <MapPin className="h-6 w-6 text-green-600" />
              }
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Outcome</p>
                <p className="text-lg font-semibold text-gray-900">{appointment.outcome || 'Pending'}</p>
              </div>
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Location Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Location Details</h2>
            
            {appointment.virtual_meeting_link ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Video className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Virtual Meeting</span>
                </div>
                <a 
                  href={appointment.virtual_meeting_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm break-all"
                >
                  {appointment.virtual_meeting_link}
                </a>
              </div>
            ) : (
              <div>
                {appointment.property_address && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Property Address</span>
                    </div>
                    <p className="text-sm text-gray-700">{appointment.property_address}</p>
                    {relatedProperty && (
                      <Link 
                        to={`/listings/${relatedProperty.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
                      >
                        View Listing Details →
                      </Link>
                    )}
                  </div>
                )}
                
                {appointment.location && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Meeting Location</span>
                    </div>
                    <p className="text-sm text-gray-700">{appointment.location.address}</p>
                    {appointment.location.parking_info && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">Parking Info:</p>
                        <p className="text-xs text-gray-700">{appointment.location.parking_info}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Map or Virtual Meeting Button */}
            <div className="mt-4">
              {appointment.virtual_meeting_link ? (
                <a
                  href={appointment.virtual_meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  Join Virtual Meeting
                </a>
              ) : appointment.location?.coordinates ? (
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </button>
              ) : null}
            </div>
          </div>

          {/* Attendees */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Attendees ({attendees.length})</h2>
            <div className="space-y-3">
              {attendees.map(attendee => (
                <Link
                  key={attendee.id}
                  to={`/clients/${attendee.id}`}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attendee.name}</p>
                      <p className="text-xs text-gray-600">{attendee.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    attendee.confirmed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {attendee.confirmed ? 'Confirmed' : 'Pending'}
                  </span>
                </Link>
              ))}
              
              {attendees.length === 0 && (
                <p className="text-sm text-gray-500">No attendees added</p>
              )}
            </div>

            {/* Attendance Stats */}
            {attendees.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={getAttendanceStats()}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getAttendanceStats().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Notes & Preparation */}
          {appointment.notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Notes & Preparation</h2>
              <div className="prose prose-sm text-gray-700">
                <p>{appointment.notes.preparation || 'No preparation notes'}</p>
                
                {appointment.notes.agenda && (
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Agenda</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {appointment.notes.agenda.map((item, index) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {appointment.notes.materials_needed && (
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Materials Needed</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {appointment.notes.materials_needed.map((item, index) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - Checklists */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pre-Appointment Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Pre-Appointment Checklist</h2>
            <div className="space-y-2">
              {preAppointmentChecklist.map(item => (
                <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistItems.preAppointment?.[item.key] || false}
                    onChange={() => handleChecklistToggle('preAppointment', item.key)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checklistItems.preAppointment?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* During Appointment Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">During Appointment</h2>
            <div className="space-y-2">
              {duringAppointmentChecklist.map(item => (
                <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistItems.duringAppointment?.[item.key] || false}
                    onChange={() => handleChecklistToggle('duringAppointment', item.key)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checklistItems.duringAppointment?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Post-Appointment Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Post-Appointment Tasks</h2>
            <div className="space-y-2">
              {postAppointmentChecklist.map(item => (
                <label key={item.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklistItems.postAppointment?.[item.key] || false}
                    onChange={() => handleChecklistToggle('postAppointment', item.key)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checklistItems.postAppointment?.[item.key] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Outcomes & Follow-up */}
        <div className="lg:col-span-1 space-y-6">
          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Checklist Progress</h2>
            <div className="space-y-4">
              {Object.entries({
                'Pre-Appointment': preAppointmentChecklist,
                'During Appointment': duringAppointmentChecklist,
                'Post-Appointment': postAppointmentChecklist
              }).map(([category, items]) => {
                const completed = items.filter(item => 
                  checklistItems[category.toLowerCase().replace('-', '').replace(' ', '')]?.[item.key]
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

          {/* Appointment Outcome */}
          {appointment.status === 'Completed' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Appointment Outcome</h2>
              
              {appointment.outcome ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">{appointment.outcome}</span>
                  </div>
                  
                  {appointment.follow_up_actions && appointment.follow_up_actions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Follow-up Actions</h3>
                      <ul className="space-y-2">
                        {appointment.follow_up_actions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {appointment.client_feedback && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Client Feedback</h3>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 italic">"{appointment.client_feedback}"</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No outcome recorded yet</p>
              )}
            </div>
          )}

          {/* Reminders */}
          {appointment.reminders && appointment.reminders.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Reminders Set</h2>
              <div className="space-y-3">
                {appointment.reminders.map((reminder, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{reminder.time_before} before</p>
                      <p className="text-xs text-gray-600">
                        {reminder.type} • {reminder.recipients.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Appointments */}
          {analytics?.related_appointments && analytics.related_appointments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Related Appointments</h2>
              <div className="space-y-3">
                {analytics.related_appointments.map(apt => (
                  <Link
                    key={apt.id}
                    to={`/appointments/${apt.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{apt.title}</p>
                        <p className="text-xs text-gray-600">{formatDate(apt.date)}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Send Follow-up Message</span>
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Schedule Next Appointment</span>
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Add Notes</span>
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <Star className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Request Review</span>
              </button>
            </div>
          </div>

          {/* Tips for Success */}
          {appointment.status === 'Scheduled' && timeUntil && !timeUntil.isPast && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Tips for Success</h3>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    {appointment.appointment_type === 'Property Showing' && (
                      <>
                        <li>• Research comparable properties in the area</li>
                        <li>• Prepare answers about HOA fees and utilities</li>
                        <li>• Highlight unique features of the property</li>
                      </>
                    )}
                    {appointment.appointment_type === 'Listing Presentation' && (
                      <>
                        <li>• Bring updated CMA and marketing plan</li>
                        <li>• Prepare success stories and testimonials</li>
                        <li>• Discuss pricing strategy thoroughly</li>
                      </>
                    )}
                    {appointment.appointment_type === 'Buyer Consultation' && (
                      <>
                        <li>• Review client's wishlist and budget</li>
                        <li>• Prepare area market overview</li>
                        <li>• Discuss financing options</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}