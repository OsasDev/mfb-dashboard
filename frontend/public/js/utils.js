// Utility functions for MFB Dashboard

const Utils = {
  // Format currency in Naira
  formatCurrency(amount) {
    if (amount === null || amount === undefined) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  },

  // Format number with commas
  formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-NG').format(num);
  },

  // Format percentage
  formatPercent(value, decimals = 1) {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(decimals)}%`;
  },

  // Format date
  formatDate(dateStr, format = 'short') {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    
    const options = {
      short: { day: '2-digit', month: 'short', year: 'numeric' },
      long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
      datetime: { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    };
    
    return date.toLocaleDateString('en-NG', options[format] || options.short);
  },

  // Format relative time
  formatRelativeTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return this.formatDate(dateStr);
  },

  // Parse CSV to array of objects
  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = this.parseCSVLine(lines[0]);
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
        });
        data.push(obj);
      }
    }
    return data;
  },

  // Parse single CSV line handling quoted values
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  },

  // Generate unique ID
  generateId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  // Calculate percentage change
  percentChange(current, previous) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  },

  // Group array by key
  groupBy(array, key) {
    return array.reduce((acc, item) => {
      const group = item[key] || 'Unknown';
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});
  },

  // Sum array values by key
  sumBy(array, key) {
    return array.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);
  },

  // Calculate average
  average(array, key) {
    if (!array.length) return 0;
    return this.sumBy(array, key) / array.length;
  },

  // Count by value
  countBy(array, key) {
    return array.reduce((acc, item) => {
      const value = item[key] || 'Unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  },

  // Filter by date range
  filterByDateRange(array, dateKey, startDate, endDate) {
    return array.filter(item => {
      const date = new Date(item[dateKey]);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  },

  // Get date range presets
  getDateRange(preset) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const ranges = {
      today: {
        start: today,
        end: now
      },
      yesterday: {
        start: new Date(today.setDate(today.getDate() - 1)),
        end: new Date(today.setHours(23, 59, 59, 999))
      },
      last7days: {
        start: new Date(new Date().setDate(new Date().getDate() - 7)),
        end: now
      },
      last30days: {
        start: new Date(new Date().setDate(new Date().getDate() - 30)),
        end: now
      },
      thisMonth: {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      },
      lastMonth: {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0)
      },
      thisYear: {
        start: new Date(now.getFullYear(), 0, 1),
        end: now
      }
    };
    
    return ranges[preset] || ranges.last30days;
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Deep clone object
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Get initials from name
  getInitials(name) {
    if (!name) return '??';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  // Calculate SLA status
  calculateSLAStatus(createdAt, slaHours, resolvedAt = null) {
    const created = new Date(createdAt);
    const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
    const now = resolvedAt ? new Date(resolvedAt) : new Date();
    
    if (resolvedAt) {
      return now <= deadline ? 'Met' : 'Breached';
    }
    
    const remaining = deadline - now;
    const remainingHours = remaining / (1000 * 60 * 60);
    
    if (remaining < 0) return 'Breached';
    if (remainingHours < 2) return 'Critical';
    if (remainingHours < slaHours * 0.25) return 'Warning';
    return 'On Track';
  },

  // Get SLA remaining time
  getSLARemaining(createdAt, slaHours) {
    const created = new Date(createdAt);
    const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
    const now = new Date();
    const remaining = deadline - now;
    
    if (remaining < 0) {
      const overdue = Math.abs(remaining);
      const hours = Math.floor(overdue / 3600000);
      const mins = Math.floor((overdue % 3600000) / 60000);
      return `Overdue by ${hours}h ${mins}m`;
    }
    
    const hours = Math.floor(remaining / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    return `${hours}h ${mins}m remaining`;
  },

  // Show toast notification
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container') || this.createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  },

  // Storage helpers
  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Storage error:', e);
      }
    },
    
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    },
    
    remove(key) {
      localStorage.removeItem(key);
    }
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
