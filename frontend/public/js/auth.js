// Authentication Handler for MFB Dashboard

const Auth = {
  users: [],
  currentUser: null,

  // Initialize auth
  async init() {
    try {
      // Use absolute path to ensure correct resolution
      const response = await fetch('/data/users.json');
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      this.users = data.users;
      
      // Check for existing session
      const savedUser = Utils.storage.get('mfb_user');
      if (savedUser) {
        this.currentUser = savedUser;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      return false;
    }
  },

  // Login
  login(email, password) {
    const user = this.users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );

    if (user) {
      this.currentUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      };
      Utils.storage.set('mfb_user', this.currentUser);
      return { success: true, user: this.currentUser };
    }

    return { success: false, error: 'Invalid email or password' };
  },

  // Logout
  logout() {
    this.currentUser = null;
    Utils.storage.remove('mfb_user');
    window.location.href = 'login.html';
  },

  // Check if logged in
  isLoggedIn() {
    return this.currentUser !== null;
  },

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  },

  // Get role-specific dashboard URL
  getDashboardUrl(role) {
    const dashboards = {
      'CEO': 'roles/ceo-coo.html',
      'COO': 'roles/ceo-coo.html',
      'CFO': 'roles/cfo.html',
      'CustomerService': 'roles/customer-service.html'
    };
    return dashboards[role] || 'index.html';
  },

  // Check permission
  hasPermission(requiredRoles) {
    if (!this.currentUser) return false;
    if (typeof requiredRoles === 'string') {
      return this.currentUser.role === requiredRoles;
    }
    return requiredRoles.includes(this.currentUser.role);
  },

  // Protect page
  protectPage(allowedRoles = null) {
    if (!this.isLoggedIn()) {
      window.location.href = '../login.html';
      return false;
    }

    if (allowedRoles && !this.hasPermission(allowedRoles)) {
      window.location.href = this.getDashboardUrl(this.currentUser.role);
      return false;
    }

    return true;
  },

  // Get all customer service staff
  getCustomerServiceStaff() {
    return this.users.filter(u => u.role === 'CustomerService');
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
