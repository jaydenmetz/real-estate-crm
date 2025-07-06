const { format, parseISO, isValid } = require('date-fns');

const formatters = {
  // Currency formatting
  currency: (amount, locale = 'en-US', currency = 'USD') => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Percentage formatting
  percentage: (value, decimals = 2) => {
    if (value === null || value === undefined) return '0%';
    return `${(value * 100).toFixed(decimals)}%`;
  },

  // Date formatting
  date: (date, formatString = 'MMM d, yyyy') => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatString) : '';
  },

  // Time formatting
  time: (time, formatString = 'h:mm a') => {
    if (!time) return '';
    const timeObj = typeof time === 'string' ? new Date(`1970-01-01T${time}`) : time;
    return isValid(timeObj) ? format(timeObj, formatString) : '';
  },

  // Phone number formatting
  phone: (phoneNumber) => {
    if (!phoneNumber) return '';
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phoneNumber; // Return original if can't format
  },

  // Address formatting
  address: (addressObj) => {
    if (!addressObj || typeof addressObj !== 'object') return '';
    const { street, city, state, zipCode } = addressObj;
    const parts = [street, city, state, zipCode].filter(Boolean);
    return parts.join(', ');
  },

  // Name formatting
  fullName: (firstName, lastName, preferredName = null) => {
    if (preferredName) return preferredName;
    return [firstName, lastName].filter(Boolean).join(' ');
  },

  // Number formatting with units
  number: (value, decimals = 0, suffix = '') => {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    }) + suffix;
  },

  // File size formatting
  fileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Truncate text
  truncate: (text, maxLength = 50, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  // Title case
  titleCase: (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  // Initials
  initials: (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  },

  // Days difference
  daysDifference: (date1, date2 = new Date()) => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    
    if (!isValid(d1) || !isValid(d2)) return 0;
    
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Relative time
  relativeTime: (date) => {
    if (!date) return '';
    const now = new Date();
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const diffMs = now - dateObj;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatters.date(date, 'MMM d');
  }
};

module.exports = formatters;