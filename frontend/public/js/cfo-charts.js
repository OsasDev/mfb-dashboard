// CFO Dashboard Charts

const CFOCharts = {
  charts: {},

  // Initialize all charts
  init() {
    this.initRevenueChart();
    this.initLoanDisbursementChart();
    this.initCollectionRateChart();
    this.initNPLTrendChart();
    this.initIncomeDistributionChart();
    this.initLoanProductChart();
    this.initRouteCharts();
  },

  // Revenue/Transaction Value Trend
  initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    this.charts.revenue = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Transaction Value (₦M)',
          data: [],
          borderColor: '#00d4aa',
          backgroundColor: 'rgba(0, 212, 170, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#00d4aa',
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
            ticks: { 
              color: '#8b949e',
              callback: val => '₦' + val + 'M'
            }
          }
        }
      }
    });
  },

  // Loan Disbursement Trend
  initLoanDisbursementChart() {
    const ctx = document.getElementById('loanDisbursementChart');
    if (!ctx) return;

    this.charts.loanDisbursement = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Amount Disbursed (₦M)',
          data: [],
          backgroundColor: '#0ea5e9',
          borderRadius: 6,
          barThickness: 28
        }, {
          label: 'Loan Count',
          data: [],
          type: 'line',
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#f59e0b',
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
            labels: { color: '#8b949e', usePointStyle: true }
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
            ticks: { 
              color: '#8b949e',
              callback: val => '₦' + val + 'M'
            }
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

  // Collection Rate Gauge
  initCollectionRateChart() {
    const ctx = document.getElementById('collectionRateChart');
    if (!ctx) return;

    this.charts.collectionRate = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Collected', 'Outstanding'],
        datasets: [{
          data: [0, 100],
          backgroundColor: ['#00d4aa', '#1a2332'],
          borderWidth: 0,
          circumference: 270,
          rotation: 225
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  },

  // NPL Trend
  initNPLTrendChart() {
    const ctx = document.getElementById('nplTrendChart');
    if (!ctx) return;

    this.charts.nplTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'NPL Ratio (%)',
          data: [],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#ef4444',
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
            ticks: { 
              color: '#8b949e',
              callback: val => val + '%'
            },
            suggestedMin: 0,
            suggestedMax: 20
          }
        }
      }
    });
  },

  // Income Distribution
  initIncomeDistributionChart() {
    const ctx = document.getElementById('incomeDistributionChart');
    if (!ctx) return;

    this.charts.incomeDistribution = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['0-50k', '50k-100k', '100k-250k', '250k-500k', '500k+'],
        datasets: [{
          label: 'Customers',
          data: [],
          backgroundColor: ['#10b981', '#0ea5e9', '#a855f7', '#f59e0b', '#ef4444'],
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
            ticks: { color: '#8b949e' }
          }
        }
      }
    });
  },

  // Loan Product Distribution
  initLoanProductChart() {
    const ctx = document.getElementById('loanProductChart');
    if (!ctx) return;

    this.charts.loanProduct = new Chart(ctx, {
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
        cutout: '65%',
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

  // Update charts with data
  updateCharts(data) {
    const { transactions, customers, loans } = data;
    
    // Get analytics
    const txnAnalytics = SheetsAPI.getTransactionAnalytics(transactions);
    const custAnalytics = SheetsAPI.getCustomerAnalytics(customers);
    const loanAnalytics = SheetsAPI.getLoanAnalytics(loans);

    // Update Revenue Chart
    if (this.charts.revenue) {
      const dailyData = txnAnalytics.dailyVolume.slice(-30);
      this.charts.revenue.data.labels = dailyData.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
      });
      this.charts.revenue.data.datasets[0].data = dailyData.map(d => (d.amount / 1000000).toFixed(2));
      this.charts.revenue.update();
    }

    // Update Loan Disbursement Chart
    if (this.charts.loanDisbursement) {
      const monthlyData = loanAnalytics.monthlyDisbursements.slice(-12);
      this.charts.loanDisbursement.data.labels = monthlyData.map(d => {
        const [year, month] = d.month.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-NG', { month: 'short', year: '2-digit' });
      });
      this.charts.loanDisbursement.data.datasets[0].data = monthlyData.map(d => (d.amount / 1000000).toFixed(2));
      this.charts.loanDisbursement.data.datasets[1].data = monthlyData.map(d => d.count);
      this.charts.loanDisbursement.update();
    }

    // Update Collection Rate Chart
    if (this.charts.collectionRate) {
      const collected = loanAnalytics.collectionRate;
      this.charts.collectionRate.data.datasets[0].data = [collected, 100 - collected];
      this.charts.collectionRate.update();
      
      // Update center text
      const rateElement = document.getElementById('collectionRateValue');
      if (rateElement) {
        rateElement.textContent = collected.toFixed(1) + '%';
      }
    }

    // Update NPL Trend Chart (simulated monthly data)
    if (this.charts.nplTrend) {
      const months = [];
      const nplData = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(date.toLocaleDateString('en-NG', { month: 'short', year: '2-digit' }));
        // Simulate NPL variation around current rate
        const variation = (Math.random() - 0.5) * 4;
        nplData.push(Math.max(0, Math.min(20, loanAnalytics.nplRatio + variation)));
      }
      this.charts.nplTrend.data.labels = months;
      this.charts.nplTrend.data.datasets[0].data = nplData.map(n => n.toFixed(1));
      this.charts.nplTrend.update();
    }

    // Update Income Distribution Chart
    if (this.charts.incomeDistribution) {
      const dist = custAnalytics.incomeDistribution;
      this.charts.incomeDistribution.data.datasets[0].data = [
        dist['0-50k'] || 0,
        dist['50k-100k'] || 0,
        dist['100k-250k'] || 0,
        dist['250k-500k'] || 0,
        dist['500k+'] || 0
      ];
      this.charts.incomeDistribution.update();
    }

    // Update Loan Product Chart
    if (this.charts.loanProduct) {
      const products = Object.entries(loanAnalytics.byProduct).slice(0, 6);
      this.charts.loanProduct.data.labels = products.map(([p]) => p);
      this.charts.loanProduct.data.datasets[0].data = products.map(([, count]) => count);
      this.charts.loanProduct.update();
    }

    // Update Route Charts
    if (this.charts.cfoRoutes && data && data.transactions) {
      const byRoute = {};
      data.transactions.forEach(t => {
        const route = t.route || 'Unknown';
        byRoute[route] = (byRoute[route] || 0) + 1;
      });
      
      this.charts.cfoRoutes.data.labels = Object.keys(byRoute);
      this.charts.cfoRoutes.data.datasets[0].data = Object.values(byRoute);
      this.charts.cfoRoutes.update();
    }

    if (this.charts.cfoRouteSuccess && data && data.transactions) {
      const routePerformance = {};
      data.transactions.forEach(t => {
        const route = t.route || 'Unknown';
        if (!routePerformance[route]) {
          routePerformance[route] = { total: 0, success: 0 };
        }
        routePerformance[route].total++;
        if (t.transaction_status === 'Success' || t.transaction_status === 'Successful') {
          routePerformance[route].success++;
        }
      });
      
      const routeLabels = Object.keys(routePerformance);
      const successRates = routeLabels.map(route => {
        const perf = routePerformance[route];
        return perf.total > 0 ? (perf.success / perf.total) * 100 : 0;
      });
      
      this.charts.cfoRouteSuccess.data.labels = routeLabels;
      this.charts.cfoRouteSuccess.data.datasets[0].data = successRates;
      this.charts.cfoRouteSuccess.update();
    }
  },

  // Initialize Route Charts
  initRouteCharts() {
    // Transaction Routes Chart
    const routesCtx = document.getElementById('cfo-routes-chart');
    if (routesCtx) {
      this.charts.cfoRoutes = new Chart(routesCtx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: ['#3b82f6', '#059669', '#f59e0b', '#7c3aed', '#ec4899'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#8b949e', usePointStyle: true }
            }
          }
        }
      });
    }

    // Route Success Rate Chart
    const successCtx = document.getElementById('cfo-route-success-chart');
    if (successCtx) {
      this.charts.cfoRouteSuccess = new Chart(successCtx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Success Rate (%)',
            data: [],
            backgroundColor: '#059669',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(48, 54, 61, 0.5)' },
              ticks: { color: '#8b949e' }
            },
            y: {
              grid: { color: 'rgba(48, 54, 61, 0.5)' },
              ticks: { 
                color: '#8b949e',
                callback: val => val + '%'
              },
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
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
  module.exports = CFOCharts;
}
