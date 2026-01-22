# PayMFB Strategic Insights Dashboard - Product Requirements Document

## Project Overview
A comprehensive web dashboard for PayMFB (Microfinance Bank) providing strategic insights and customer service management with role-based access.

## Original Problem Statement
Build a strategic insights dashboard for a microfinance bank with:
- Data from Google Sheets (Transactions, Customers, Loans)
- Role-based access for CEO, COO, CFO, and Customer Service staff
- Customer complaint management system with full workflow

## Architecture

### Tech Stack
- **Frontend**: Static HTML/CSS/JavaScript (served via React public folder)
- **Data Source**: Published Google Sheets CSV (Customers data)
- **Storage**: Browser localStorage for complaints
- **Charts**: Chart.js
- **Icons**: Font Awesome 6.4

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

## Core Requirements

### 1. Authentication (✅ Implemented)
- Role-based login with email/password
- Session persistence via localStorage
- Automatic redirect to appropriate dashboard based on role
- Logout functionality

### 2. CEO/COO Executive Dashboard (✅ Implemented)
- KPI Cards: Total Transactions, Total Customers, Total Disbursed, Success Rate
- Charts: Transaction Volume & Value, Transaction Types, Channel Distribution, Customer Growth, Loan Portfolio, Regional Distribution
- Alerts for high NPL ratio and overdue payments
- Strategic insights (top channel, customer concentration, popular loan product)
- Navigation: Overview, Transactions, Customers, Loans, Performance

### 3. CFO Financial Dashboard (✅ Implemented)
- Financial Summary: Transaction Value, Loans Disbursed, Outstanding Balance, Total Collected
- Risk Indicators: NPL Ratio, Collection Rate, Overdue Loans
- Charts: Revenue Trend, Loan Disbursements, Collection Rate Gauge, NPL Trend, Income Distribution, Loan Products
- Portfolio breakdown and aging report
- Navigation: Overview, Revenue Analysis, Loan Analysis, Risk Management

### 4. Customer Service Dashboard (✅ Implemented)
- Service Stats: Total, Open, In Progress, Escalated, Resolved
- Complaint Management:
  - Log new complaints (customer info, category, priority, description)
  - Full workflow: Open → In Progress → Escalated → Resolved → Closed
  - SLA tracking with deadlines based on priority
  - Assignment to staff members
  - History timeline
- Categories: Account Issues, Card Issues, Loan Issues, Transfer Issues, KYC/Documentation, Others
- Priorities: Low (72h SLA), Medium (48h), High (24h), Critical (4h)
- Customer lookup functionality
- Charts: Complaints Trend, Category Distribution, SLA Performance, Priority Distribution

## What's Been Implemented

### Date: January 22, 2025

1. ✅ Complete login system with role-based access
2. ✅ CEO/COO Executive Dashboard with real data from Google Sheets
3. ✅ CFO Financial Dashboard with all financial metrics
4. ✅ Customer Service Dashboard with full complaint workflow
5. ✅ Google Sheets integration (Customers data)
6. ✅ Generated transactions and loans data based on customer data
7. ✅ SLA tracking and escalation workflow
8. ✅ Chart visualizations with Chart.js
9. ✅ Responsive dark theme design
10. ✅ Toast notifications for user feedback

## Data Notes

**IMPORTANT**: 
- Customer data is fetched from the real Google Sheets CSV
- Transactions and Loans data are **GENERATED** from customer data (not from separate sheets)
- Complaints are stored in browser localStorage

## Prioritized Backlog

### P0 - Critical (Done)
- ✅ Role-based authentication
- ✅ Dashboard data visualization
- ✅ Complaint logging and workflow

### P1 - High Priority (Future)
- [ ] Export reports to PDF/Excel
- [ ] Email notifications for SLA breaches
- [ ] Integration with actual Transactions and Loans sheets (requires GIDs)
- [ ] Real-time data refresh

### P2 - Nice to Have
- [ ] Customer profile details page
- [ ] Advanced search and filtering
- [ ] Dashboard customization
- [ ] Mobile responsive improvements
- [ ] Data backup to server

## Next Action Items

1. Obtain correct GID values for Transactions and Loans sheets to fetch real data
2. Add export functionality for reports
3. Implement email notifications for complaint SLA breaches
4. Add customer profile detail views
5. Consider adding audit logging for compliance
