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
      // Fetch customers from the published Google Sheet
      const customersRaw = await this.fetchCSV(this.config.sheetsUrl.all);
      const customers = this.processCustomers(customersRaw);
      
      // Generate transactions and loans based on customer data
      const transactions = this.generateTransactions(customers);
      const loans = this.generateLoans(customers);

      this.cache = {
        transactions,
        customers,
        loans,
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

  // Process customers data
  processCustomers(data) {
    return data.map(c => ({
      ...c,
      monthly_income: parseFloat(c.monthly_income) || 0,
      registration_date: c.registration_date ? new Date(c.registration_date) : null,
      date_of_birth: c.date_of_birth ? new Date(c.date_of_birth) : null
    }));
  },

  // Generate realistic transactions based on customer data
  generateTransactions(customers) {
    const transactions = [];
    const transactionTypes = ['Transfer', 'Withdrawal', 'Deposit', 'Bill Payment', 'Airtime', 'POS'];
    const channels = ['Mobile', 'USSD', 'Internet Banking', 'Branch', 'POS', 'ATM'];
    const statuses = ['Successful', 'Successful', 'Successful', 'Successful', 'Failed', 'Pending'];
    const failureReasons = ['Insufficient Funds', 'Network Error', 'Invalid Account', 'Timeout', 'Limit Exceeded'];
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    customers.forEach((customer, idx) => {
      // Generate 2-8 transactions per customer
      const numTxns = Math.floor(Math.random() * 7) + 2;
      
      for (let i = 0; i < numTxns; i++) {
        const txnDate = new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const amount = Math.floor(Math.random() * 500000) + 1000;
        
        transactions.push({
          transaction_id: `TXN${String(idx * 10 + i + 1).padStart(8, '0')}`,
          customer_id: customer.customer_id,
          transaction_date: txnDate,
          transaction_type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
          transaction_status: status,
          failure_reason: status === 'Failed' ? failureReasons[Math.floor(Math.random() * failureReasons.length)] : '',
          amount: amount,
          channel: channels[Math.floor(Math.random() * channels.length)],
          route: 'NIP',
          source_account: customer.account_number,
          destination_account: String(Math.floor(Math.random() * 9000000000) + 1000000000),
          destination_bank: ['Access Bank', 'GTBank', 'First Bank', 'Zenith Bank', 'UBA'][Math.floor(Math.random() * 5)],
          narration: `Transaction for ${customer.first_name}`,
          balance_after: Math.floor(Math.random() * 1000000) + 10000,
          ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          branch_id: customer.account_opening_branch,
          session_id: `SES${Date.now()}${Math.random().toString(36).substr(2, 9)}`
        });
      }
    });

    return transactions.sort((a, b) => b.transaction_date - a.transaction_date);
  },

  // Generate realistic loans based on customer data
  generateLoans(customers) {
    const loans = [];
    const loanProducts = ['Personal Loan', 'Business Loan', 'Agricultural Loan', 'Salary Advance', 'SME Loan', 'Asset Finance'];
    const loanStatuses = ['Active', 'Active', 'Active', 'Completed', 'Default', 'Disbursed'];
    const purposes = ['Business Expansion', 'Working Capital', 'Education', 'Medical', 'Home Improvement', 'Agriculture'];
    const collateralTypes = ['Property', 'Vehicle', 'Stock', 'Cash', 'None'];
    const repaymentModes = ['Monthly', 'Weekly', 'Bi-Weekly'];
    
    const now = new Date();

    // About 40% of customers have loans
    customers.filter(() => Math.random() < 0.4).forEach((customer, idx) => {
      const disbursementDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const tenure = [3, 6, 12, 18, 24][Math.floor(Math.random() * 5)];
      const loanAmount = Math.floor(Math.random() * 2000000) + 50000;
      const interestRate = Math.floor(Math.random() * 15) + 10; // 10-25%
      const monthlyPayment = (loanAmount * (1 + interestRate / 100)) / tenure;
      const totalRepayment = monthlyPayment * tenure;
      const installmentsPaid = Math.floor(Math.random() * tenure);
      const installmentsRemaining = tenure - installmentsPaid;
      const amountPaid = monthlyPayment * installmentsPaid;
      const status = loanStatuses[Math.floor(Math.random() * loanStatuses.length)];
      
      const nextDueDate = new Date(disbursementDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + installmentsPaid + 1);
      
      const lastPaymentDate = new Date(disbursementDate);
      lastPaymentDate.setMonth(lastPaymentDate.getMonth() + installmentsPaid);

      loans.push({
        loan_id: `LN${String(idx + 1).padStart(6, '0')}`,
        customer_id: customer.customer_id,
        loan_product: loanProducts[Math.floor(Math.random() * loanProducts.length)],
        loan_amount: loanAmount,
        disbursement_date: disbursementDate,
        tenure_months: tenure,
        interest_rate: interestRate,
        monthly_payment: monthlyPayment,
        total_repayment_amount: totalRepayment,
        installments_agreed: tenure,
        installments_paid: installmentsPaid,
        installments_remaining: installmentsRemaining,
        principal_outstanding: (loanAmount - (loanAmount / tenure * installmentsPaid)),
        interest_outstanding: (totalRepayment - loanAmount) * (installmentsRemaining / tenure),
        total_outstanding_balance: totalRepayment - amountPaid,
        amount_paid_to_date: amountPaid,
        next_payment_due_date: status === 'Active' ? nextDueDate : null,
        last_payment_date: installmentsPaid > 0 ? lastPaymentDate : null,
        loan_status: status,
        collateral_type: collateralTypes[Math.floor(Math.random() * collateralTypes.length)],
        collateral_value: loanAmount * (Math.random() * 0.5 + 0.8),
        guarantor_name: `${['John', 'Mary', 'James', 'Sarah'][Math.floor(Math.random() * 4)]} ${customer.last_name}`,
        loan_officer_id: `LO${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`,
        purpose: purposes[Math.floor(Math.random() * purposes.length)],
        approval_date: new Date(disbursementDate.getTime() - 3 * 24 * 60 * 60 * 1000),
        disbursement_channel: ['Bank Transfer', 'Cash', 'Cheque'][Math.floor(Math.random() * 3)],
        repayment_mode: repaymentModes[Math.floor(Math.random() * repaymentModes.length)]
      });
    });

    return loans;
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
      l.loan_status === 'Written Off'
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
      l.next_payment_due_date && 
      new Date(l.next_payment_due_date) < now &&
      l.loan_status === 'Active'
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
