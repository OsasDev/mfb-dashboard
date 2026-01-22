// CEO/COO Dashboard Charts

const CEOCOOCharts = {
  charts: {},

  // Initialize all charts
  init() {
    this.initTransactionVolumeChart();
    this.initTransactionTypeChart();
    this.initChannelDistributionChart();
    this.initCustomerGrowthChart();
    this.initLoanPortfolioChart();
    this.initRegionalDistributionChart();
  },

  // Transaction Volume Trend
  initTransactionVolumeChart() {
    const ctx = document.getElementById('transactionVolumeChart');
    if (!ctx) return;

    this.charts.transactionVolume = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Transaction Volume',
          data: [],
          borderColor: '#00d4aa',
          backgroundColor: 'rgba(0, 212, 170, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          borderWidth: 2
        }, {
          label: 'Transaction Value (₦M)',
          data: [],
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          borderWidth: 2,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#8b949e',
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(48, 54, 61, 0.5)' },
            ticks: { color: '#8b949e' }
          },
          y: {
            position: 'left',
            grid: { color: 'rgba(48, 54, 61, 0.5)' },
            ticks: { color: '#8b949e' }
          },
          y1: {
            position: 'right',
            grid: { display: false },
            ticks: { color: '#8b949e' }
          }
        }
      }
    });
  },

  // Transaction Type Distribution
  initTransactionTypeChart() {
    const ctx = document.getElementById('transactionTypeChart');
    if (!ctx) return;

    this.charts.transactionType = new Chart(ctx, {
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
              padding: 15,
              font: { size: 11 }
            }
          }
        }
      }
    });
  },

  // Channel Distribution
  initChannelDistributionChart() {
    const ctx = document.getElementById('channelDistributionChart');
    if (!ctx) return;

    this.charts.channelDistribution = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Transactions',
          data: [],
          backgroundColor: '#00d4aa',
          borderRadius: 6,
          barThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: 'rgba(48, 54, 61, 0.5)' },
            ticks: { color: '#8b949e' }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#8b949e' }
          }
        }
      }
    });
  },

  // Customer Growth
  initCustomerGrowthChart() {
    const ctx = document.getElementById('customerGrowthChart');
    if (!ctx) return;

    this.charts.customerGrowth = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'New Customers',
          data: [],
          backgroundColor: '#0ea5e9',
          borderRadius: 6,
          barThickness: 24
        }, {
          label: 'Cumulative',
          data: [],
          type: 'line',
          borderColor: '#00d4aa',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#00d4aa',
          borderWidth: 2,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#8b949e',
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#8b949e' }
          },
          y: {
            position: 'left',
            grid: { color: 'rgba(48, 54, 61, 0.5)' },
            ticks: { color: '#8b949e' }
          },
          y1: {
            position: 'right',
            grid: { display: false },
            ticks: { color: '#8b949e' }
          }
        }
      }
    });
  },

  // Loan Portfolio Status
  initLoanPortfolioChart() {
    const ctx = document.getElementById('loanPortfolioChart');
    if (!ctx) return;

    this.charts.loanPortfolio = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#00d4aa',
            '#0ea5e9',
            '#f59e0b',
            '#ef4444',
            '#a855f7',
            '#6b7280'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#8b949e',
              usePointStyle: true,
              padding: 15,
              font: { size: 11 }
            }
          }
        }
      }
    });
  },

  // Regional Distribution
  initRegionalDistributionChart() {
    const ctx = document.getElementById('regionalDistributionChart');
    if (!ctx) return;

    this.charts.regionalDistribution = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Customers',
          data: [],
          backgroundColor: '#a855f7',
          borderRadius: 4,
          barThickness: 20
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
            ticks: { 
              color: '#8b949e',
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            grid: { color: 'rgba(48, 54, 61, 0.5)' },
            ticks: { color: '#8b949e' }
          }
        }
      }
    });
  },

  // Update charts with data
  updateCharts(data) {
    const { transactions, customers, loans } = data;
    
    // Get analytics
    const txnAnalytics = SheetsAPI.getTransactionAnalytics(transactions);
    const custAnalytics = SheetsAPI.getCustomerAnalytics(customers);
    const loanAnalytics = SheetsAPI.getLoanAnalytics(loans);

    // Update Transaction Volume Chart
    if (this.charts.transactionVolume) {
      const dailyData = txnAnalytics.dailyVolume.slice(-30);
      this.charts.transactionVolume.data.labels = dailyData.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
      });
      this.charts.transactionVolume.data.datasets[0].data = dailyData.map(d => d.count);
      this.charts.transactionVolume.data.datasets[1].data = dailyData.map(d => d.amount / 1000000);
      this.charts.transactionVolume.update();
    }

    // Update Transaction Type Chart
    if (this.charts.transactionType) {
      const types = Object.entries(txnAnalytics.byType).slice(0, 6);
      this.charts.transactionType.data.labels = types.map(([type]) => type);
      this.charts.transactionType.data.datasets[0].data = types.map(([, count]) => count);
      this.charts.transactionType.update();
    }

    // Update Channel Distribution Chart
    if (this.charts.channelDistribution) {
      const channels = Object.entries(txnAnalytics.byChannel)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      this.charts.channelDistribution.data.labels = channels.map(([ch]) => ch);
      this.charts.channelDistribution.data.datasets[0].data = channels.map(([, count]) => count);
      this.charts.channelDistribution.update();
    }

    // Update Customer Growth Chart
    if (this.charts.customerGrowth) {
      const monthlyData = custAnalytics.monthlyRegistrations.slice(-12);
      let cumulative = 0;
      this.charts.customerGrowth.data.labels = monthlyData.map(d => {
        const [year, month] = d.month.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-NG', { month: 'short', year: '2-digit' });
      });
      this.charts.customerGrowth.data.datasets[0].data = monthlyData.map(d => d.count);
      this.charts.customerGrowth.data.datasets[1].data = monthlyData.map(d => {
        cumulative += d.count;
        return cumulative;
      });
      this.charts.customerGrowth.update();
    }

    // Update Loan Portfolio Chart
    if (this.charts.loanPortfolio) {
      const statuses = Object.entries(loanAnalytics.byStatus);
      this.charts.loanPortfolio.data.labels = statuses.map(([status]) => status);
      this.charts.loanPortfolio.data.datasets[0].data = statuses.map(([, count]) => count);
      this.charts.loanPortfolio.update();
    }

    // Update Regional Distribution Chart
    if (this.charts.regionalDistribution) {
      const states = Object.entries(custAnalytics.byState)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      this.charts.regionalDistribution.data.labels = states.map(([state]) => state);
      this.charts.regionalDistribution.data.datasets[0].data = states.map(([, count]) => count);
      this.charts.regionalDistribution.update();
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
  module.exports = CEOCOOCharts;
}
