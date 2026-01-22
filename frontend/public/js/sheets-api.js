// Google Sheets API Handler for MFB Dashboard

const SheetsAPI = {
  config: null,
  cache: {
    transactions: null,
    customers: null,
    loans: null,
    lastFetch: null
  },
  cacheTimeout: 5 * 60 * 1000, // 5 minutes

  // Initialize with config
  async init() {
    try {
      // Use absolute path for config
      const response = await fetch('/data/config.json');
      if (!response.ok) throw new Error('Failed to load config');
      this.config = await response.json();
      return true;
    } catch (error) {
      console.error('Failed to load config:', error);
      return false;
    }
  },

  // Check if cache is valid
  isCacheValid() {
    if (!this.cache.lastFetch) return false;
    return (Date.now() - this.cache.lastFetch) < this.cacheTimeout;
  },

  // Fetch CSV data
  async fetchCSV(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      return Utils.parseCSV(text);
    } catch (error) {
      console.error('Failed to fetch CSV:', error);
      throw error;
    }
  },

  // Get all data
  async getAllData(forceRefresh = false) {
    if (!forceRefresh && this.isCacheValid()) {
      return {
        transactions: this.cache.transactions,
        customers: this.cache.customers,
        loans: this.cache.loans
      };
    }

    if (!this.config) await this.init();

    try {
      // Fetch all three sheets in parallel
      const [transactionsRaw, customersRaw, loansRaw] = await Promise.all([
        this.fetchCSV(this.config.sheetsUrl.transactions),
        this.fetchCSV(this.config.sheetsUrl.customers),
        this.fetchCSV(this.config.sheetsUrl.loans)
      ]);

      this.cache = {
        transactions: this.processTransactions(transactionsRaw),
        customers: this.processCustomers(customersRaw),
        loans: this.processLoans(loansRaw),
        lastFetch: Date.now()
      };

      return {
        transactions: this.cache.transactions,
        customers: this.cache.customers,
        loans: this.cache.loans
      };
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Return cached data if available
      if (this.cache.transactions) {
        return {
          transactions: this.cache.transactions,
          customers: this.cache.customers,
          loans: this.cache.loans
        };
      }
      throw error;
    }
  },

  // Process transactions data
  processTransactions(data) {
    return data.map(t => ({
      ...t,
      amount: parseFloat(t.amount) || 0,
      balance_after: parseFloat(t.balance_after) || 0,
      transaction_date: t.transaction_date ? new Date(t.transaction_date) : null
    }));
  },

  // Process customers data
  processCustomers(data) {
    return data.map(c => ({
      ...c,
      monthly_income: parseFloat(c.monthly_income) || 0,
      registration_date: c.registration_date ? new Date(c.registration_date) : null,
      date_of_birth: c.date_of_birth ? new Date(c.date_of_birth) : null
    }));
  },

  // Process loans data
  processLoans(data) {
    return data.map(l => ({
      ...l,
      loan_amount: parseFloat(l.loan_amount) || 0,
      monthly_payment: parseFloat(l.monthly_payment) || 0,
      total_repayment_amount: parseFloat(l.total_repayment_amount) || 0,
      principal_outstanding: parseFloat(l.principal_outstanding) || 0,
      interest_outstanding: parseFloat(l.interest_outstanding) || 0,
      total_outstanding_balance: parseFloat(l.total_outstanding_balance) || 0,
      amount_paid_to_date: parseFloat(l.amount_paid_to_date) || 0,
      collateral_value: parseFloat(l.collateral_value) || 0,
      interest_rate: parseFloat(l.interest_rate) || 0,
      tenure_months: parseInt(l.tenure_months) || 0,
      installments_agreed: parseInt(l.installments_agreed) || 0,
      installments_paid: parseInt(l.installments_paid) || 0,
      installments_remaining: parseInt(l.installments_remaining) || 0,
      disbursement_date: l.disbursement_date ? new Date(l.disbursement_date) : null,
      next_payment_due_date: l.next_payment_due_date ? new Date(l.next_payment_due_date) : null,
      last_payment_date: l.last_payment_date ? new Date(l.last_payment_date) : null,
      approval_date: l.approval_date ? new Date(l.approval_date) : null
    }));
  },

  // Analytics Methods
  getTransactionAnalytics(transactions, dateRange = null) {
    let data = transactions;
    if (dateRange) {
      data = data.filter(t => {
        const date = new Date(t.transaction_date);
        return date >= dateRange.start && date <= dateRange.end;
      });
    }

    const total = data.length;
    const totalAmount = Utils.sumBy(data, 'amount');
    const successful = data.filter(t => t.transaction_status === 'Success' || t.transaction_status === 'Successful');
    const failed = data.filter(t => t.transaction_status === 'Failed');
    
    const byType = Utils.countBy(data, 'transaction_type');
    const byChannel = Utils.countBy(data, 'channel');
    const byStatus = Utils.countBy(data, 'transaction_status');
    
    // Daily volume
    const dailyVolume = {};
    data.forEach(t => {
      const date = t.transaction_date ? t.transaction_date.toISOString().split('T')[0] : 'Unknown';
      if (!dailyVolume[date]) {
        dailyVolume[date] = { count: 0, amount: 0 };
      }
      dailyVolume[date].count++;
      dailyVolume[date].amount += t.amount;
    });

    return {
      total,
      totalAmount,
      successCount: successful.length,
      successRate: total ? (successful.length / total) * 100 : 0,
      failedCount: failed.length,
      failureRate: total ? (failed.length / total) * 100 : 0,
      averageAmount: total ? totalAmount / total : 0,
      byType,
      byChannel,
      byStatus,
      dailyVolume: Object.entries(dailyVolume)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    };
  },

  getCustomerAnalytics(customers) {
    const total = customers.length;
    const byGender = Utils.countBy(customers, 'gender');
    const byState = Utils.countBy(customers, 'state');
    const byType = Utils.countBy(customers, 'customer_type');
    const byAccountType = Utils.countBy(customers, 'account_type');
    const byKYCStatus = Utils.countBy(customers, 'kyc_status');
    const byEmployment = Utils.countBy(customers, 'employment_status');
    const byMaritalStatus = Utils.countBy(customers, 'marital_status');

    // Monthly registrations
    const monthlyReg = {};
    customers.forEach(c => {
      if (c.registration_date) {
        const month = c.registration_date.toISOString().slice(0, 7);
        monthlyReg[month] = (monthlyReg[month] || 0) + 1;
      }
    });

    // Income distribution
    const incomeRanges = {
      '0-50k': 0,
      '50k-100k': 0,
      '100k-250k': 0,
      '250k-500k': 0,
      '500k+': 0
    };
    customers.forEach(c => {
      const income = c.monthly_income;
      if (income < 50000) incomeRanges['0-50k']++;
      else if (income < 100000) incomeRanges['50k-100k']++;
      else if (income < 250000) incomeRanges['100k-250k']++;
      else if (income < 500000) incomeRanges['250k-500k']++;
      else incomeRanges['500k+']++;
    });

    return {
      total,
      byGender,
      byState,
      byType,
      byAccountType,
      byKYCStatus,
      byEmployment,
      byMaritalStatus,
      monthlyRegistrations: Object.entries(monthlyReg)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      incomeDistribution: incomeRanges,
      averageIncome: Utils.average(customers, 'monthly_income')
    };
  },

  getLoanAnalytics(loans) {
    const total = loans.length;
    const totalDisbursed = Utils.sumBy(loans, 'loan_amount');
    const totalOutstanding = Utils.sumBy(loans, 'total_outstanding_balance');
    const totalCollected = Utils.sumBy(loans, 'amount_paid_to_date');
    
    const byStatus = Utils.countBy(loans, 'loan_status');
    const byProduct = Utils.countBy(loans, 'loan_product');
    const byPurpose = Utils.countBy(loans, 'purpose');
    
    // NPL calculation (Non-Performing Loans)
    const nplLoans = loans.filter(l => 
      l.loan_status === 'Default' || 
      l.loan_status === 'Delinquent' ||
      l.loan_status === 'Written Off' ||
      l.loan_status === 'Overdue'
    );
    const nplAmount = Utils.sumBy(nplLoans, 'total_outstanding_balance');
    const nplRatio = totalOutstanding ? (nplAmount / totalOutstanding) * 100 : 0;

    // Active loans
    const activeLoans = loans.filter(l => l.loan_status === 'Active' || l.loan_status === 'Disbursed');
    
    // Collection rate
    const expectedCollection = Utils.sumBy(loans, 'total_repayment_amount');
    const collectionRate = expectedCollection ? (totalCollected / expectedCollection) * 100 : 0;

    // Average metrics
    const avgLoanAmount = total ? totalDisbursed / total : 0;
    const avgInterestRate = Utils.average(loans, 'interest_rate');
    const avgTenure = Utils.average(loans, 'tenure_months');

    // Monthly disbursements
    const monthlyDisbursements = {};
    loans.forEach(l => {
      if (l.disbursement_date) {
        const month = l.disbursement_date.toISOString().slice(0, 7);
        if (!monthlyDisbursements[month]) {
          monthlyDisbursements[month] = { count: 0, amount: 0 };
        }
        monthlyDisbursements[month].count++;
        monthlyDisbursements[month].amount += l.loan_amount;
      }
    });

    // Overdue loans
    const now = new Date();
    const overdueLoans = loans.filter(l => 
      l.loan_status === 'Overdue' ||
      (l.next_payment_due_date && 
       new Date(l.next_payment_due_date) < now &&
       (l.loan_status === 'Active' || l.loan_status === 'Disbursed'))
    );

    return {
      total,
      totalDisbursed,
      totalOutstanding,
      totalCollected,
      activeCount: activeLoans.length,
      nplCount: nplLoans.length,
      nplAmount,
      nplRatio,
      collectionRate,
      overdueCount: overdueLoans.length,
      avgLoanAmount,
      avgInterestRate,
      avgTenure,
      byStatus,
      byProduct,
      byPurpose,
      monthlyDisbursements: Object.entries(monthlyDisbursements)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month))
    };
  },

  // Get customer by ID with related data
  getCustomerDetails(customerId, customers, transactions, loans) {
    const customer = customers.find(c => c.customer_id === customerId);
    if (!customer) return null;

    const customerTransactions = transactions.filter(t => t.customer_id === customerId);
    const customerLoans = loans.filter(l => l.customer_id === customerId);

    return {
      ...customer,
      transactions: customerTransactions,
      loans: customerLoans,
      totalTransactions: customerTransactions.length,
      totalTransactionAmount: Utils.sumBy(customerTransactions, 'amount'),
      totalLoans: customerLoans.length,
      totalLoanAmount: Utils.sumBy(customerLoans, 'loan_amount'),
      outstandingBalance: Utils.sumBy(customerLoans, 'total_outstanding_balance')
    };
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SheetsAPI;
}
