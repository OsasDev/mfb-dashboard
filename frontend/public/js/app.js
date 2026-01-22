// Main Application Controller for MFB Dashboard

const App = {
  data: null,
  isLoading: false,

  // Initialize application
  async init() {
    // Initialize auth
    await Auth.init();
    
    // Check authentication
    if (!Auth.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }

    // Redirect to appropriate dashboard
    const user = Auth.getCurrentUser();
    window.location.href = Auth.getDashboardUrl(user.role);
  },

  // Initialize dashboard (called from role-specific pages)
  async initDashboard(roleCheck = null) {
    // Initialize auth
    await Auth.init();
    
    // Check authentication and role
    if (!Auth.isLoggedIn()) {
      window.location.href = '../login.html';
      return false;
    }

    if (roleCheck && !Auth.hasPermission(roleCheck)) {
      window.location.href = '../' + Auth.getDashboardUrl(Auth.getCurrentUser().role);
      return false;
    }

    // Initialize data
    await SheetsAPI.init();
    await Complaints.initFromRole();
    
    // Update user info in sidebar
    this.updateUserInfo();
    
    // Set up logout handler
    this.setupLogout();

    return true;
  },

  // Load all data
  async loadData(showLoader = true) {
    if (showLoader) this.showLoader();
    
    try {
      this.data = await SheetsAPI.getAllData();
      return this.data;
    } catch (error) {
      console.error('Failed to load data:', error);
      Utils.showToast('Failed to load data. Using cached data if available.', 'error');
      return this.data;
    } finally {
      if (showLoader) this.hideLoader();
    }
  },

  // Refresh data
  async refreshData() {
    this.showLoader();
    try {
      this.data = await SheetsAPI.getAllData(true);
      Utils.showToast('Data refreshed successfully', 'success');
      return this.data;
    } catch (error) {
      Utils.showToast('Failed to refresh data', 'error');
      return this.data;
    } finally {
      this.hideLoader();
    }
  },

  // Update user info in sidebar
  updateUserInfo() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');

    if (userAvatar) userAvatar.textContent = Utils.getInitials(user.name);
    if (userName) userName.textContent = user.name;
    if (userRole) userRole.textContent = user.role;
  },

  // Setup logout handler
  setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
          Auth.logout();
        }
      });
    }
  },

  // Show loader
  showLoader() {
    this.isLoading = true;
    const loader = document.getElementById('page-loader');
    if (loader) loader.style.display = 'flex';
  },

  // Hide loader
  hideLoader() {
    this.isLoading = false;
    const loader = document.getElementById('page-loader');
    if (loader) loader.style.display = 'none';
  },

  // Render stats cards
  renderStats(containerId, stats) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = stats.map(stat => `
      <div class="stat-card" style="--stat-color: ${stat.color || 'var(--accent-primary)'}">
        <div class="stat-icon" style="background: ${stat.color || 'var(--accent-primary)'}15; color: ${stat.color || 'var(--accent-primary)'}">
          <i class="fas fa-${stat.icon}"></i>
        </div>
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
        ${stat.change !== undefined ? `
          <div class="stat-change ${stat.change >= 0 ? 'positive' : 'negative'}">
            <i class="fas fa-${stat.change >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
            <span>${Math.abs(stat.change).toFixed(1)}%</span>
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  // Render data table
  renderTable(containerId, { columns, data, emptyMessage = 'No data available' }) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>${emptyMessage}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${col.header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr data-id="${row.id || ''}">
                ${columns.map(col => `
                  <td>${col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}</td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // Show modal
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  // Hide modal
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  // Setup modal close handlers
  setupModals() {
    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    // Close on close button click
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-overlay').classList.remove('active');
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
          modal.classList.remove('active');
        });
      }
    });
  },

  // Setup navigation
  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function() {
        const section = this.dataset.section;
        if (section) {
          App.navigateToSection(section);
        }
      });
    });
  },

  // Navigate to section
  navigateToSection(sectionId) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === sectionId);
    });

    // Update sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
      section.style.display = section.id === sectionId ? 'block' : 'none';
    });
  },

  // Format helpers for templates
  formatters: {
    currency: (val) => Utils.formatCurrency(val),
    number: (val) => Utils.formatNumber(val),
    percent: (val) => Utils.formatPercent(val),
    date: (val) => Utils.formatDate(val),
    datetime: (val) => Utils.formatDate(val, 'datetime'),
    relative: (val) => Utils.formatRelativeTime(val),
    
    status: (val) => {
      const classes = {
        'Success': 'badge-success',
        'Successful': 'badge-success',
        'Active': 'badge-success',
        'Completed': 'badge-success',
        'Resolved': 'badge-success',
        'Closed': 'badge-info',
        'Met': 'badge-success',
        'Pending': 'badge-warning',
        'In Progress': 'badge-warning',
        'Warning': 'badge-warning',
        'Failed': 'badge-danger',
        'Default': 'badge-danger',
        'Delinquent': 'badge-danger',
        'Breached': 'badge-danger',
        'Critical': 'badge-danger',
        'Escalated': 'badge-purple',
        'Open': 'badge-info'
      };
      return `<span class="badge ${classes[val] || 'badge-info'}">${val || '-'}</span>`;
    },

    priority: (val) => {
      const classes = {
        'Low': 'badge-info',
        'Medium': 'badge-warning',
        'High': 'badge-danger',
        'Critical': 'badge-danger'
      };
      return `<span class="badge ${classes[val] || 'badge-info'}">${val || '-'}</span>`;
    }
  }
};

// Auto-initialize if on index page
document.addEventListener('DOMContentLoaded', () => {
  const isIndexPage = window.location.pathname.endsWith('index.html') || 
                      window.location.pathname.endsWith('/');
  
  if (isIndexPage && !window.location.pathname.includes('roles/')) {
    App.init();
  }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
