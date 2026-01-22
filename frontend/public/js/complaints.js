// Complaints Management System for MFB Dashboard

const Complaints = {
  complaints: [],
  config: null,

  // Initialize complaints system
  async init() {
    try {
      // Use absolute path for config
      const configResponse = await fetch('/data/config.json');
      if (!configResponse.ok) throw new Error('Failed to load config');
      this.config = await configResponse.json();
      
      // Load complaints from localStorage
      this.complaints = Utils.storage.get('mfb_complaints', []);
      return true;
    } catch (error) {
      console.error('Failed to initialize complaints:', error);
      return false;
    }
  },

  // Initialize from role pages (deprecated - use init instead)
  async initFromRole() {
    return this.init();
  },

  // Get all complaints
  getAll() {
    return this.complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Get complaint by ID
  getById(id) {
    return this.complaints.find(c => c.id === id);
  },

  // Create new complaint
  create(complaintData) {
    const user = Auth.getCurrentUser();
    const now = new Date().toISOString();
    
    const complaint = {
      id: 'CMP' + Date.now().toString(36).toUpperCase(),
      ticketNumber: 'TKT-' + String(this.complaints.length + 1).padStart(6, '0'),
      ...complaintData,
      status: 'Open',
      priority: complaintData.priority || 'Medium',
      createdAt: now,
      updatedAt: now,
      createdBy: user ? user.id : 'System',
      createdByName: user ? user.name : 'System',
      assignedTo: null,
      assignedToName: null,
      escalatedTo: null,
      escalationReason: null,
      resolvedAt: null,
      resolution: null,
      slaDeadline: this.calculateSLADeadline(now, complaintData.priority || 'Medium'),
      history: [{
        action: 'Created',
        timestamp: now,
        user: user ? user.name : 'System',
        details: 'Complaint created'
      }]
    };

    this.complaints.push(complaint);
    this.save();
    return complaint;
  },

  // Update complaint
  update(id, updates) {
    const index = this.complaints.findIndex(c => c.id === id);
    if (index === -1) return null;

    const user = Auth.getCurrentUser();
    const now = new Date().toISOString();

    // Add history entry
    const historyEntry = {
      action: 'Updated',
      timestamp: now,
      user: user ? user.name : 'System',
      details: Object.keys(updates).join(', ') + ' updated'
    };

    this.complaints[index] = {
      ...this.complaints[index],
      ...updates,
      updatedAt: now,
      history: [...this.complaints[index].history, historyEntry]
    };

    this.save();
    return this.complaints[index];
  },

  // Assign complaint
  assign(id, staffId, staffName) {
    const complaint = this.getById(id);
    if (!complaint) return null;

    const user = Auth.getCurrentUser();
    const now = new Date().toISOString();

    complaint.assignedTo = staffId;
    complaint.assignedToName = staffName;
    complaint.status = complaint.status === 'Open' ? 'In Progress' : complaint.status;
    complaint.updatedAt = now;
    complaint.history.push({
      action: 'Assigned',
      timestamp: now,
      user: user ? user.name : 'System',
      details: `Assigned to ${staffName}`
    });

    this.save();
    return complaint;
  },

  // Escalate complaint
  escalate(id, escalatedTo, reason) {
    const complaint = this.getById(id);
    if (!complaint) return null;

    const user = Auth.getCurrentUser();
    const now = new Date().toISOString();

    complaint.status = 'Escalated';
    complaint.escalatedTo = escalatedTo;
    complaint.escalationReason = reason;
    complaint.updatedAt = now;
    complaint.history.push({
      action: 'Escalated',
      timestamp: now,
      user: user ? user.name : 'System',
      details: `Escalated to ${escalatedTo}. Reason: ${reason}`
    });

    this.save();
    return complaint;
  },

  // Resolve complaint
  resolve(id, resolution) {
    const complaint = this.getById(id);
    if (!complaint) return null;

    const user = Auth.getCurrentUser();
    const now = new Date().toISOString();

    complaint.status = 'Resolved';
    complaint.resolution = resolution;
    complaint.resolvedAt = now;
    complaint.updatedAt = now;
    complaint.history.push({
      action: 'Resolved',
      timestamp: now,
      user: user ? user.name : 'System',
      details: `Resolved: ${resolution}`
    });

    this.save();
    return complaint;
  },

  // Close complaint
  close(id) {
    const complaint = this.getById(id);
    if (!complaint) return null;

    const user = Auth.getCurrentUser();
    const now = new Date().toISOString();

    complaint.status = 'Closed';
    complaint.updatedAt = now;
    complaint.history.push({
      action: 'Closed',
      timestamp: now,
      user: user ? user.name : 'System',
      details: 'Complaint closed'
    });

    this.save();
    return complaint;
  },

  // Reopen complaint
  reopen(id, reason) {
    const complaint = this.getById(id);
    if (!complaint) return null;

    const user = Auth.getCurrentUser();
    const now = new Date().toISOString();

    complaint.status = 'Open';
    complaint.resolvedAt = null;
    complaint.resolution = null;
    complaint.updatedAt = now;
    complaint.slaDeadline = this.calculateSLADeadline(now, complaint.priority);
    complaint.history.push({
      action: 'Reopened',
      timestamp: now,
      user: user ? user.name : 'System',
      details: `Reopened: ${reason}`
    });

    this.save();
    return complaint;
  },

  // Add note to complaint
  addNote(id, note) {
    const complaint = this.getById(id);
    if (!complaint) return null;

    const user = Auth.getCurrentUser();
    const now = new Date().toISOString();

    complaint.updatedAt = now;
    complaint.history.push({
      action: 'Note Added',
      timestamp: now,
      user: user ? user.name : 'System',
      details: note
    });

    this.save();
    return complaint;
  },

  // Calculate SLA deadline
  calculateSLADeadline(createdAt, priority) {
    const slaHours = this.config?.slaHours || {
      Low: 72,
      Medium: 48,
      High: 24,
      Critical: 4
    };
    const hours = slaHours[priority] || 48;
    const deadline = new Date(createdAt);
    deadline.setHours(deadline.getHours() + hours);
    return deadline.toISOString();
  },

  // Get SLA status
  getSLAStatus(complaint) {
    if (complaint.status === 'Closed' || complaint.status === 'Resolved') {
      const resolved = new Date(complaint.resolvedAt || complaint.updatedAt);
      const deadline = new Date(complaint.slaDeadline);
      return resolved <= deadline ? 'Met' : 'Breached';
    }

    const now = new Date();
    const deadline = new Date(complaint.slaDeadline);
    const remaining = deadline - now;
    const hoursRemaining = remaining / (1000 * 60 * 60);

    if (remaining < 0) return 'Breached';
    if (hoursRemaining < 2) return 'Critical';
    if (hoursRemaining < 8) return 'Warning';
    return 'On Track';
  },

  // Get complaints by status
  getByStatus(status) {
    return this.complaints.filter(c => c.status === status);
  },

  // Get complaints by assigned user
  getByAssignee(userId) {
    return this.complaints.filter(c => c.assignedTo === userId);
  },

  // Get complaints by customer
  getByCustomer(customerId) {
    return this.complaints.filter(c => c.customerId === customerId);
  },

  // Get complaints analytics
  getAnalytics() {
    const total = this.complaints.length;
    const byStatus = Utils.countBy(this.complaints, 'status');
    const byCategory = Utils.countBy(this.complaints, 'category');
    const byPriority = Utils.countBy(this.complaints, 'priority');

    // SLA metrics
    const closed = this.complaints.filter(c => c.status === 'Closed' || c.status === 'Resolved');
    const slaMet = closed.filter(c => this.getSLAStatus(c) === 'Met').length;
    const slaBreached = closed.filter(c => this.getSLAStatus(c) === 'Breached').length;

    // Active complaints at risk
    const active = this.complaints.filter(c => !['Closed', 'Resolved'].includes(c.status));
    const atRisk = active.filter(c => ['Critical', 'Warning', 'Breached'].includes(this.getSLAStatus(c)));

    // Average resolution time
    const resolvedComplaints = closed.filter(c => c.resolvedAt);
    let avgResolutionTime = 0;
    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((sum, c) => {
        return sum + (new Date(c.resolvedAt) - new Date(c.createdAt));
      }, 0);
      avgResolutionTime = totalTime / resolvedComplaints.length / (1000 * 60 * 60); // In hours
    }

    // Daily trends
    const dailyComplaints = {};
    this.complaints.forEach(c => {
      const date = c.createdAt.split('T')[0];
      dailyComplaints[date] = (dailyComplaints[date] || 0) + 1;
    });

    return {
      total,
      open: byStatus['Open'] || 0,
      inProgress: byStatus['In Progress'] || 0,
      escalated: byStatus['Escalated'] || 0,
      resolved: byStatus['Resolved'] || 0,
      closed: byStatus['Closed'] || 0,
      byCategory,
      byPriority,
      slaMet,
      slaBreached,
      slaRate: closed.length ? (slaMet / closed.length) * 100 : 0,
      atRiskCount: atRisk.length,
      avgResolutionTime,
      dailyTrends: Object.entries(dailyComplaints)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
    };
  },

  // Save to localStorage
  save() {
    Utils.storage.set('mfb_complaints', this.complaints);
  },

  // Search complaints
  search(query) {
    const q = query.toLowerCase();
    return this.complaints.filter(c => 
      c.ticketNumber.toLowerCase().includes(q) ||
      c.customerName?.toLowerCase().includes(q) ||
      c.customerPhone?.toLowerCase().includes(q) ||
      c.customerAccountNumber?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q)
    );
  },

  // Filter complaints
  filter(filters) {
    return this.complaints.filter(c => {
      if (filters.status && c.status !== filters.status) return false;
      if (filters.category && c.category !== filters.category) return false;
      if (filters.priority && c.priority !== filters.priority) return false;
      if (filters.assignedTo && c.assignedTo !== filters.assignedTo) return false;
      if (filters.dateFrom && new Date(c.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(c.createdAt) > new Date(filters.dateTo)) return false;
      return true;
    });
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Complaints;
}
