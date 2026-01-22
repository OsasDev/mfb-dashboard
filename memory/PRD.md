# PayMFB Strategic Insights Dashboard - Product Requirements Document

## Project Overview
A comprehensive web dashboard for PayMFB (Microfinance Bank) providing strategic insights and customer service management with role-based access.

## Original Problem Statement
Build a strategic insights dashboard for a microfinance bank with:
- Data from Google Sheets (Transactions, Customers, Loans)
- Role-based access for CEO, COO, CFO, and Customer Service staff
- Customer complaint management system with full workflow
- Export functionality for reports

## Architecture

### Tech Stack
- **Frontend**: Static HTML/CSS/JavaScript (served via React public folder)
- **Data Source**: Published Google Sheets CSVs (Real data)
  - Transactions: gid=302195719
  - Customers: gid=1161555937
  - Loans: gid=317818925
- **Storage**: Browser localStorage for complaints
- **Charts**: Chart.js
- **Icons**: Font Awesome 6

### File Structure
```
/app/frontend/public/
├── index.html              # Redirect to login
├── login.html              # Login page
├── css/
│   ├── style.css           # Global styles
│   ├── ceo-coo.css         # Executive dashboard styles
│   ├── cfo.css             # CFO dashboard styles
│   └── customer-service.css # Customer service styles
├── js/
│   ├── utils.js            # Utility functions
│   ├── auth.js             # Authentication handler
│   ├── sheets-api.js       # Google Sheets data handler
│   ├── complaints.js       # Complaints management
│   ├── app.js              # Main application controller
│   ├── export.js           # Export functionality (CSV, Excel, PDF)
│   ├── ceo-coo-charts.js   # CEO/COO chart configurations
│   ├── cfo-charts.js       # CFO chart configurations
│   └── customer-service-charts.js # CS chart configurations
├── data/
│   ├── config.json         # Configuration (Google Sheets URLs)
│   └── users.json          # User credentials
└── roles/
    ├── ceo-coo.html        # CEO/COO Executive Dashboard
    ├── cfo.html            # CFO Financial Dashboard
    └── customer-service.html # Customer Service Dashboard
```

## User Personas & Access

| Role | Email | Dashboard |
|------|-------|-----------|
| CEO | ceo@paymfb.com | Executive Dashboard |
| COO | adenike.funke@paymfb.com | Executive Dashboard |
| CFO | ruth.prayer@paymfb.com | Financial Dashboard |
| Customer Service | tolu.aduragba@paymfb.com | Customer Service Dashboard |
| Customer Service | chinedu.abah@paymfb.com | Customer Service Dashboard |
| Customer Service | mustapha.onoja@paymfb.com | Customer Service Dashboard |

## What's Been Implemented

### Date: January 22, 2025

#### Core Features
1. ✅ Complete login system with role-based access
2. ✅ CEO/COO Executive Dashboard with REAL data from Google Sheets
3. ✅ CFO Financial Dashboard with all financial metrics
4. ✅ Customer Service Dashboard with full complaint workflow
5. ✅ Google Sheets integration (ALL THREE SHEETS - real data)
6. ✅ SLA tracking and escalation workflow
7. ✅ Chart visualizations with Chart.js
8. ✅ Responsive dark theme design
9. ✅ Toast notifications for user feedback

#### Export Functionality (NEW)
10. ✅ Export to CSV (Transactions, Customers, Loans, Complaints)
11. ✅ Export to Excel (Transactions, Customers, Loans, Complaints)
12. ✅ Export Analytics Report to PDF
13. ✅ Export Financial Report to PDF

## Data Summary (Real Data)
- **Transactions**: 10,295 records
- **Customers**: 500 records (339 verified)
- **Loans**: 215 records (₦48,041,364.00 disbursed)
- **Success Rate**: 92.6%
- **NPL Ratio**: 16.8% (26 loans)
- **Overdue**: 159 loans

## Prioritized Backlog

### P0 - Critical (Done)
- ✅ Role-based authentication
- ✅ Dashboard data visualization
- ✅ Complaint logging and workflow
- ✅ Export functionality

### P1 - High Priority (Future)
- [ ] Email notifications for SLA breaches
- [ ] Real-time data refresh (WebSocket)
- [ ] Advanced search and filtering
- [ ] Dashboard customization

### P2 - Nice to Have
- [ ] Customer profile details page
- [ ] Mobile responsive improvements
- [ ] Data backup to server
- [ ] Audit logging for compliance
- [ ] Branch-level filtering

## Next Action Items

1. Consider adding email notifications for complaint SLA breaches
2. Add customer profile detail views
3. Implement branch-level data filtering for COO
4. Add more granular date range filters for reports
