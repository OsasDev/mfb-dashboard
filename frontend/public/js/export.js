// Export functionality for MFB Dashboard

const ExportUtils = {
  
  // Export data to CSV
  toCSV(data, filename) {
    if (!data || !data.length) {
      Utils.showToast('No data to export', 'error');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(','));
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        let value = row[header];
        
        // Handle dates
        if (value instanceof Date) {
          value = value.toISOString().split('T')[0];
        }
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          value = '';
        }
        
        // Convert to string and escape quotes
        value = String(value).replace(/"/g, '""');
        
        // Wrap in quotes if contains comma, newline, or quotes
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`;
        }
        
        return value;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    Utils.showToast(`Exported ${data.length} records to ${filename}.csv`, 'success');
  },

  // Export data to Excel (using CSV with BOM for Excel compatibility)
  toExcel(data, filename) {
    if (!data || !data.length) {
      Utils.showToast('No data to export', 'error');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join('\t'));
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        let value = row[header];
        
        if (value instanceof Date) {
          value = value.toLocaleDateString('en-NG');
        }
        
        if (value === null || value === undefined) {
          value = '';
        }
        
        return String(value).replace(/\t/g, ' ');
      });
      csvRows.push(values.join('\t'));
    });

    // Add BOM for Excel compatibility
    const BOM = '\uFEFF';
    const content = BOM + csvRows.join('\n');
    this.downloadFile(content, `${filename}.xls`, 'application/vnd.ms-excel');
    Utils.showToast(`Exported ${data.length} records to ${filename}.xls`, 'success');
  },

  // Export to PDF (generates HTML table that can be printed to PDF)
  toPDF(data, title, filename) {
    if (!data || !data.length) {
      Utils.showToast('No data to export', 'error');
      return;
    }

    const headers = Object.keys(data[0]);
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title} - PayMFB Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      padding: 20px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #00d4aa;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #00d4aa;
      margin-bottom: 5px;
    }
    .report-title {
      font-size: 20px;
      color: #666;
      margin-bottom: 10px;
    }
    .report-date {
      font-size: 12px;
      color: #999;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 11px;
    }
    th {
      background: #00d4aa;
      color: white;
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #eee;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    tr:hover {
      background: #f0f0f0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 11px;
      color: #999;
    }
    .summary {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .summary-item {
      display: inline-block;
      margin-right: 30px;
    }
    .summary-label {
      font-size: 11px;
      color: #666;
    }
    .summary-value {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
    @media print {
      body { padding: 10px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">PayMFB</div>
    <div class="report-title">${title}</div>
    <div class="report-date">Generated on ${new Date().toLocaleString('en-NG')}</div>
  </div>
  
  <div class="summary">
    <div class="summary-item">
      <div class="summary-label">Total Records</div>
      <div class="summary-value">${data.length.toLocaleString()}</div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        ${headers.map(h => `<th>${h.replace(/_/g, ' ')}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.slice(0, 500).map(row => `
        <tr>
          ${headers.map(h => {
            let value = row[h];
            if (value instanceof Date) value = value.toLocaleDateString('en-NG');
            if (value === null || value === undefined) value = '-';
            if (typeof value === 'number' && h.toLowerCase().includes('amount')) {
              value = '₦' + value.toLocaleString('en-NG', { minimumFractionDigits: 2 });
            }
            return `<td>${value}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  ${data.length > 500 ? '<p style="margin-top: 20px; color: #999; font-style: italic;">Showing first 500 records. Export to CSV for complete data.</p>' : ''}
  
  <div class="footer">
    <p>PayMFB - Strategic Insights Dashboard</p>
    <p>Confidential Report - For Internal Use Only</p>
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    Utils.showToast('PDF export ready - use browser print (Ctrl+P) to save as PDF', 'success');
  },

  // Export analytics summary to PDF
  toAnalyticsPDF(analytics, title) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title} - PayMFB Analytics Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      padding: 30px;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #00d4aa;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #00d4aa;
      margin-bottom: 5px;
    }
    .report-title {
      font-size: 24px;
      color: #333;
      margin-bottom: 10px;
    }
    .report-date {
      font-size: 14px;
      color: #666;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #eee;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }
    .metric-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      border-left: 4px solid #00d4aa;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #333;
    }
    .metric-label {
      font-size: 13px;
      color: #666;
      margin-top: 5px;
    }
    .breakdown-table {
      width: 100%;
      border-collapse: collapse;
    }
    .breakdown-table th,
    .breakdown-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .breakdown-table th {
      background: #f5f5f5;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }
    .breakdown-table td {
      font-size: 14px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    @media print {
      body { padding: 15px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">PayMFB</div>
    <div class="report-title">${title}</div>
    <div class="report-date">Generated on ${new Date().toLocaleString('en-NG')}</div>
  </div>
  
  ${analytics.sections.map(section => `
    <div class="section">
      <h2 class="section-title">${section.title}</h2>
      ${section.metrics ? `
        <div class="metrics-grid">
          ${section.metrics.map(m => `
            <div class="metric-card">
              <div class="metric-value">${m.value}</div>
              <div class="metric-label">${m.label}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${section.breakdown ? `
        <table class="breakdown-table">
          <thead>
            <tr>
              <th>${section.breakdownLabel || 'Category'}</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(section.breakdown).map(([key, value]) => {
              const total = Object.values(section.breakdown).reduce((a, b) => a + b, 0);
              const percent = ((value / total) * 100).toFixed(1);
              return `
                <tr>
                  <td>${key}</td>
                  <td>${value.toLocaleString()}</td>
                  <td>${percent}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      ` : ''}
    </div>
  `).join('')}
  
  <div class="footer">
    <p>PayMFB - Strategic Insights Dashboard</p>
    <p>Confidential Report - For Internal Use Only</p>
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  },

  // Download file helper
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Prepare transaction data for export
  prepareTransactionsExport(transactions) {
    return transactions.map(t => ({
      'Transaction ID': t.transaction_id,
      'Customer ID': t.customer_id,
      'Date': t.transaction_date,
      'Type': t.transaction_type,
      'Status': t.transaction_status,
      'Amount': t.amount,
      'Channel': t.channel,
      'Source Account': t.source_account,
      'Destination Account': t.destination_account,
      'Destination Bank': t.destination_bank,
      'Narration': t.narration,
      'Balance After': t.balance_after,
      'Failure Reason': t.failure_reason || ''
    }));
  },

  // Prepare customer data for export
  prepareCustomersExport(customers) {
    return customers.map(c => ({
      'Customer ID': c.customer_id,
      'Name': `${c.first_name || ''} ${c.last_name || ''}`.trim(),
      'Email': c.email,
      'Phone': c.phone_number,
      'Gender': c.gender,
      'State': c.state,
      'Customer Type': c.customer_type,
      'Account Type': c.account_type,
      'KYC Status': c.kyc_status,
      'Monthly Income': c.monthly_income,
      'Employment Status': c.employment_status,
      'Registration Date': c.registration_date,
      'Account Number': c.account_number
    }));
  },

  // Prepare loan data for export
  prepareLoansExport(loans) {
    return loans.map(l => ({
      'Loan ID': l.loan_id,
      'Customer ID': l.customer_id,
      'Product': l.loan_product,
      'Amount': l.loan_amount,
      'Disbursement Date': l.disbursement_date,
      'Tenure (Months)': l.tenure_months,
      'Interest Rate': l.interest_rate,
      'Monthly Payment': l.monthly_payment,
      'Total Repayment': l.total_repayment_amount,
      'Amount Paid': l.amount_paid_to_date,
      'Outstanding Balance': l.total_outstanding_balance,
      'Status': l.loan_status,
      'Purpose': l.purpose,
      'Collateral Type': l.collateral_type,
      'Next Due Date': l.next_payment_due_date
    }));
  },

  // Prepare complaints data for export
  prepareComplaintsExport(complaints) {
    return complaints.map(c => ({
      'Ticket Number': c.ticketNumber,
      'Customer Name': c.customerName,
      'Customer Phone': c.customerPhone,
      'Category': c.category,
      'Priority': c.priority,
      'Status': c.status,
      'Subject': c.subject,
      'Description': c.description,
      'Created Date': c.createdAt,
      'Assigned To': c.assignedToName || 'Unassigned',
      'Resolved Date': c.resolvedAt || '',
      'Resolution': c.resolution || '',
      'SLA Deadline': c.slaDeadline
    }));
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportUtils;
}
