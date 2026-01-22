// Customer Service Dashboard Charts

const CustomerServiceCharts = {
  charts: {},

  // Initialize all charts
  init() {
    this.initComplaintsTrendChart();
    this.initCategoryDistributionChart();
    this.initSLAPerformanceChart();
    this.initPriorityDistributionChart();
  },

  // Complaints Trend
  initComplaintsTrendChart() {
    const ctx = document.getElementById('complaintsTrendChart');
    if (!ctx) return;

    this.charts.complaintsTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Complaints',
          data: [],
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#0ea5e9',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#8b949e', usePointStyle: true }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(48, 54, 61, 0.5)' },
            ticks: { color: '#8b949e' }
          },
          y: {
            grid: { color: 'rgba(48, 54, 61, 0.5)' },
            ticks: { color: '#8b949e' },
            beginAtZero: true
          }
        }
      }
    });
  },

  // Category Distribution
  initCategoryDistributionChart() {
    const ctx = document.getElementById('categoryDistributionChart');
    if (!ctx) return;

    this.charts.categoryDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#00d4aa',
            '#0ea5e9',
            '#a855f7',
            '#f59e0b',
            '#ef4444',
            '#10b981'
          ],
          borderWidth: 0,
          spacing: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#8b949e',
              usePointStyle: true,
              padding: 12,
              font: { size: 11 }
            }
          }
        }
      }
    });
  },

  // SLA Performance
  initSLAPerformanceChart() {
    const ctx = document.getElementById('slaPerformanceChart');
    if (!ctx) return;

    this.charts.slaPerformance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Met', 'Breached'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#00d4aa', '#ef4444'],
          borderRadius: 6,
          barThickness: 60
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#8b949e' }
          },
          y: {
            grid: { color: 'rgba(48, 54, 61, 0.5)' },
            ticks: { color: '#8b949e' },
            beginAtZero: true
          }
        }
      }
    });
  },

  // Priority Distribution
  initPriorityDistributionChart() {
    const ctx = document.getElementById('priorityDistributionChart');
    if (!ctx) return;

    this.charts.priorityDistribution = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Low', 'Medium', 'High', 'Critical'],
        datasets: [{
          data: [0, 0, 0, 0],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#7c3aed'],
          borderRadius: 6,
          barThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#8b949e' }
          },
          y: {
            grid: { color: 'rgba(48, 54, 61, 0.5)' },
            ticks: { color: '#8b949e' },
            beginAtZero: true
          }
        }
      }
    });
  },

  // Update charts with data
  updateCharts(analytics) {
    // Update Complaints Trend Chart
    if (this.charts.complaintsTrend) {
      const trends = analytics.dailyTrends.slice(-14);
      this.charts.complaintsTrend.data.labels = trends.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
      });
      this.charts.complaintsTrend.data.datasets[0].data = trends.map(d => d.count);
      this.charts.complaintsTrend.update();
    }

    // Update Category Distribution Chart
    if (this.charts.categoryDistribution) {
      const categories = Object.entries(analytics.byCategory);
      this.charts.categoryDistribution.data.labels = categories.map(([cat]) => cat);
      this.charts.categoryDistribution.data.datasets[0].data = categories.map(([, count]) => count);
      this.charts.categoryDistribution.update();
    }

    // Update SLA Performance Chart
    if (this.charts.slaPerformance) {
      this.charts.slaPerformance.data.datasets[0].data = [
        analytics.slaMet,
        analytics.slaBreached
      ];
      this.charts.slaPerformance.update();
    }

    // Update Priority Distribution Chart
    if (this.charts.priorityDistribution) {
      const priorities = analytics.byPriority;
      this.charts.priorityDistribution.data.datasets[0].data = [
        priorities['Low'] || 0,
        priorities['Medium'] || 0,
        priorities['High'] || 0,
        priorities['Critical'] || 0
      ];
      this.charts.priorityDistribution.update();
    }
  },

  // Destroy all charts
  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomerServiceCharts;
}
