# LendTrack v2

A comprehensive microfinance lending management system built with Firebase Firestore and vanilla JavaScript. Track borrowers, manage daily payments, monitor loan status, and maintain detailed expense & capital ledgers—all from a responsive web interface with real-time data synchronization.

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

- **Backend**: Firebase Firestore (NoSQL database)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: Firebase Firestore
- **Hosting**: Firebase Hosting (optional)
- **Fonts**: DM Serif Display, DM Sans, JetBrains Mono
- **Real-time sync**: Firebase real-time listeners

## Installation

### 1. Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing one
3. Enable Firestore Database:
   - Go to Firestore Database > Create database
   - Choose "Start in test mode" for development
   - Select a location for your database

### 2. Configure Firebase in Your App

1. In your Firebase project, go to Project Settings > General > Your apps
2. Click "Add app" and select Web app (</>)
3. Register your app with a nickname
4. Copy the Firebase config object
5. Paste it into `firebase.js`, replacing the placeholder values

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Locally

```bash
npm start
```

This will start a local server at `http://localhost:3000`

### 5. Deploy to Firebase (Optional)

```bash
npm run deploy
```

## Data Migration from Google Sheets

If you have existing data in Google Sheets, follow these steps to migrate it to Firestore:

### Option 1: Manual Migration
1. Open your Google Sheet and export each sheet as CSV
2. Open `migrate.js` in your editor
3. Convert your CSV data to JavaScript arrays in the format shown
4. Open your Firebase app in the browser
5. Open browser developer tools (F12) > Console
6. Run `migrateFromSheets()` to import your data

### Option 2: Automated Migration Script
For larger datasets, you can create a Node.js script using the Firebase Admin SDK:

```javascript
// migrate-data.js
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Add your migration logic here
// Read from CSV files and write to Firestore collections
```

### Data Format Reference

**Borrowers Collection:**
```javascript
{
  name: "John Doe",
  phone: "9876543210",
  aadhar: "1234 5678 9012",
  address: "123 Main St, City",
  amount: 10000,
  daily: 100,
  startDate: "2024-01-01",
  createdAt: "2024-01-01T10:00:00.000Z",
  notes: "Good borrower",
  status: "active"
}
```

**Payments Collection:**
```javascript
{
  borrowerId: "borrower-doc-id",
  day: 5,
  paidAt: "2024-01-05T10:00:00.000Z",
  amount: 100
}
```

**Loans Collection:**
```javascript
{
  borrowerId: "borrower-doc-id",
  amount: 10000,
  daily: 100,
  startDate: "2024-01-01",
  endDate: "",
  status: "active",
  createdAt: "2024-01-01T10:00:00.000Z"
}
```

## File Structure

```
daily-collection/
├── firebase.js      # Firebase configuration and initialization
├── index.html       # Frontend UI & logic
├── package.json     # Dependencies and scripts
├── README.md        # This file
└── .gitignore       # Git ignore rules
```

## Firestore Collections

The app uses the following Firestore collections:

- `borrowers` - Borrower information
- `payments` - Daily payment records
- `loans` - Loan history
- `expenses` - Business expenses
- `capital` - Capital ledger entries

## Security Rules

For production, set up Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## API Methods

The app uses Firebase Firestore directly with these main operations:

- `getBorrowers()` - Fetch all borrowers
- `getAllPayments()` - Get payment records grouped by borrower
- `getLoanHistory()` - Get loan history (optionally filtered by borrowerId)
- `getExpenses()` - Fetch all expenses
- `getCapital()` - Get complete capital/ledger history
- `addBorrower()` - Create new borrower
- `updateBorrower()` - Update borrower details
- `togglePayment()` - Mark/unmark payment for a day
- `bulkPayment()` - Mark multiple days as paid
- `renewLoan()` - Renew loan with new terms
- `closeLoan()` - Close active loan
- `addExpense()` - Record business expense
- `addCapital()` - Add capital entry

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
