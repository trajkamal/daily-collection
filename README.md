# LendTrack v2

A comprehensive microfinance lending management system built with Google Apps Script and vanilla JavaScript. Track borrowers, manage daily payments, monitor loan status, and maintain detailed expense & capital ledgers—all from a responsive web interface connected to Google Sheets.

## Features

### 👥 Borrower Management
- Add new borrowers with complete details (name, phone, Aadhar ID, address)
- Track active loans with daily payment amount and start date
- Update borrower information and loan status
- Delete borrowers and associated payment history
- View all borrowers with quick status overview

### 💰 Payment Tracking
- Record daily payments for individual borrowers
- Bulk payment entry for multiple days at once
- Visual payment calendar with day-by-day status
- Payment history with timestamps
- Toggle payment status (mark as paid/unpaid)
- Real-time completion percentage tracking

### 📊 Loan Management
- Track complete loan history with creation and closure dates
- Renew loans with new amount and daily payment schedule
- Close completed loans
- Monitor loan status (active/closed)
- Auto-reset payment calendar on loan renewal

### 📈 Financial Tracking
- **Expenses**: Add and categorize business expenses
- **Capital Ledger**: Track all capital flows (loans disbursed, payments collected, expenses)
- Real-time balance calculations
- Filterable transaction history

### 📱 Responsive Design
- Desktop and mobile-optimized interface
- Bottom navigation bar for mobile devices
- Sticky headers for easy scrolling
- Touch-friendly buttons and interactions
- Professional dark/light theme with gold accents

## Tech Stack

- **Backend**: Google Apps Script (GAS)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: Google Sheets
- **Fonts**: DM Serif Display, DM Sans, JetBrains Mono
- **No external dependencies** (runs entirely in Google Sheets)

## Installation

### 1. Set Up Google Sheet
- Create a new Google Sheet
- Share it with yourself or teammates

### 2. Deploy Apps Script Backend
1. Open your Google Sheet
2. Click **Extensions** > **Apps Script**
3. Open the editor and paste the entire contents of `Code.gs`
4. Click **Save**
5. Click **Deploy** > **New Deployment**
6. Select type: **Web App**
   - Execute as: Your email
   - Who has access: Anyone
7. Click **Deploy** and **copy the deployment URL**

### 3. Configure Frontend
1. In `config.js`, replace `'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'` with your deployment URL:
   ```javascript
   const CONFIG = {
     SCRIPT_URL: 'https://script.google.com/macros/d/YOUR-DEPLOYMENT-ID/userweb'
   };
   ```

### 4. Access the App
- Open `index.html` in your browser
- The app will connect to your Google Sheet automatically

## File Structure

```
daily-collection/
├── Code.gs          # Google Apps Script backend (endpoints & database operations)
├── config.js        # Configuration (deployment URL)
├── index.html       # Frontend UI & logic
├── README.md        # This file
└── .gitignore       # Git ignore rules
```

## API Endpoints

All requests go through Google Apps Script with `action` parameter.

### GET Requests
- `getBorrowers` - Fetch all borrowers
- `getAllPayments` - Get payment records grouped by borrower
- `getLoanHistory` - Get loan history (optionally filtered by borrowerId)
- `getExpenses` - Fetch all expenses
- `getCapital` - Get complete capital/ledger history

### POST Requests
- `addBorrower` - Create new borrower
- `updateBorrower` - Update borrower details
- `deleteBorrower` - Remove borrower
- `togglePayment` - Mark/unmark payment for a day
- `bulkPayment` - Add payments for multiple days
- `renewLoan` - Close current loan & create new one
- `closeLoan` - Mark loan as completed
- `addExpense` - Record business expense
- `deleteExpense` - Remove expense
- `addCapital` - Manual capital entry
- `updateNotes` - Update borrower notes

## Database Schema

### Borrowers Sheet
| id | name | phone | aadhar | address | amount | daily | startDate | createdAt | notes | status |
|----|------|-------|--------|---------|---------|-------|-----------|-----------|-------|--------|

### Payments Sheet
| id | borrowerId | day | paidAt | amount |
|----|-----------|-----|--------|--------|

### LoanHistory Sheet
| id | borrowerId | amount | daily | startDate | endDate | status | createdAt |
|----|-----------|--------|-------|-----------|---------|--------|-----------|

### Expenses Sheet
| id | date | category | description | amount | createdAt |
|----|------|----------|-------------|--------|-----------|

### Capital Sheet
| id | date | type | amount | note | createdAt |
|----|------|------|--------|------|-----------|

## Usage Tips

1. **Payment Calendar**: Click any day number to mark payment as complete. Green = paid, Red = overdue.
2. **Bulk Payments**: Use for quick entry of multiple days (e.g., days 1-15 all at once).
3. **Loan Renewal**: Closes current loan, resets payment calendar, starts new loan cycle.
4. **Expenses**: Track operating costs separately from loan disbursements.
5. **Capital Ledger**: Audit trail of all money movements (loans given, payments received, expenses).

## Known Limitations

- Requires Google account & Google Sheet
- Real-time updates require page refresh
- Max ~10,000 rows per sheet (Google Sheets limit)
- No built-in user authentication (sheet access control recommended)

## Error Fixes

### Error: "The rowContents passed to appendRow() must be nonempty"
**Fixed in v2.1** - The `getOrCreateSheet()` function now validates headers before appending.

## Future Enhancements

- [ ] Real-time sync without page refresh (WebSocket/Polling)
- [ ] PDF reports and statements
- [ ] Interest calculation and EMI tracking
- [ ] SMS/WhatsApp payment reminders
- [ ] Multi-currency support
- [ ] User authentication & role-based access
- [ ] Mobile app (React Native)

## License

Open source - Free to use and modify

## Support

For issues or questions:
1. Check deployment URL is correctly set in `config.js`
2. Ensure Apps Script has Google Sheets permission
3. Verify deployment is set to "Execute as: Me" and "Anyone" access
4. Check browser console (F12) for error messages
