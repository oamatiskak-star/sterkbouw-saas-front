// utils/formatters.js

// Format currency
export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', { ...defaultOptions, ...options }).format(date);
};

// Format date with time
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

// Format phone number
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Dutch phone numbers
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  
  return phone;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format VAT number
export const formatVAT = (vat) => {
  if (!vat) return '';
  // Format NL VAT numbers
  if (vat.startsWith('NL')) {
    return vat.replace(/^(\w{2})(\d{9})(\w{2})$/, '$1 $2 $3');
  }
  return vat;
};

// Format construction measurement
export const formatMeasurement = (value, unit = 'm') => {
  return `${parseFloat(value).toLocaleString('nl-NL')} ${unit}`;
};

// Format status badge
export const formatStatus = (status) => {
  const statusMap = {
    'active': { text: 'Actief', class: 'success' },
    'inactive': { text: 'Inactief', class: 'secondary' },
    'pending': { text: 'In behandeling', class: 'warning' },
    'completed': { text: 'Voltooid', class: 'info' },
    'cancelled': { text: 'Geannuleerd', class: 'danger' },
    'draft': { text: 'Concept', class: 'secondary' },
    'approved': { text: 'Goedgekeurd', class: 'success' },
    'rejected': { text: 'Afgekeurd', class: 'danger' }
  };
  
  return statusMap[status] || { text: status, class: 'secondary' };
};
