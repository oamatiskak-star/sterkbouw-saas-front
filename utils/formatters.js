export const formatCurrency = (amount, currency = 'EUR') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '–'
  }

  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatDate = (date, includeTime = false) => {
  if (!date) return ''

  const dateObj = date instanceof Date ? date : new Date(date)

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date'
  }

  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }

  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }

  return new Intl.DateTimeFormat('nl-NL', options).format(dateObj)
}

export const formatDimension = (value, unit = 'm', decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '–'
  }

  const formattedValue = Number(value).toFixed(decimals)
  return `${formattedValue} ${unit}`
}

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '–'
  }

  const percentage = Number(value) * 100
  return `${percentage.toFixed(decimals)}%`
}

export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return ''

  const digits = phoneNumber.replace(/\D/g, '')

  // Nederlands mobiel nummer
  if (digits.length === 10 && digits.startsWith('06')) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3')
  }

  // Vast nummer zonder leading 0
  if (digits.length === 9 && !digits.startsWith('0')) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
  }

  return phoneNumber
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  if (bytes === null || bytes === undefined || isNaN(bytes)) return '–'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

export const formatInspectionStatus = (status) => {
  const statusMap = {
    pending: { text: 'Pending', color: '#FFA726' },
    in_progress: { text: 'In Progress', color: '#29B6F6' },
    completed: { text: 'Completed', color: '#66BB6A' },
    failed: { text: 'Failed', color: '#EF5350' },
    requires_action: { text: 'Requires Action', color: '#AB47BC' }
  }

  return statusMap[status] || { text: 'Unknown', color: '#78909C' }
}

export const formatAddress = (address) => {
  if (!address) return ''

  const parts = [
    address.street,
    address.number,
    address.numberSuffix,
    address.zipCode,
    address.city
  ].filter(Boolean)

  return parts.join(' ')
}

export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength).trim() + suffix
}
