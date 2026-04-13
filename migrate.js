// Migration script to move data from Google Sheets to Firebase
// Run this in the browser console after setting up Firebase

async function migrateFromSheets() {
  console.log('Starting migration from Google Sheets to Firebase...');

  // You'll need to export your data from Google Sheets as JSON
  // For now, this is a template - you'll need to adapt it to your data format

  try {
    // Example: Migrate borrowers
    const borrowersData = [
      // Paste your exported borrowers data here
      // Format: { name, phone, aadhar, address, amount, daily, startDate, createdAt, notes, status }
    ];

    for (const borrower of borrowersData) {
      await db.collection('borrowers').add({
        ...borrower,
        createdAt: borrower.createdAt || new Date().toISOString(),
        status: borrower.status || 'active'
      });
    }

    // Example: Migrate payments
    const paymentsData = [
      // Paste your exported payments data here
      // Format: { borrowerId, day, paidAt, amount }
    ];

    for (const payment of paymentsData) {
      await db.collection('payments').add({
        borrowerId: payment.borrowerId,
        day: Number(payment.day),
        paidAt: payment.paidAt || new Date().toISOString(),
        amount: payment.amount || 0
      });
    }

    // Example: Migrate loans
    const loansData = [
      // Paste your exported loans data here
      // Format: { borrowerId, amount, daily, startDate, endDate, status, createdAt }
    ];

    for (const loan of loansData) {
      await db.collection('loans').add({
        borrowerId: loan.borrowerId,
        amount: loan.amount,
        daily: loan.daily,
        startDate: loan.startDate,
        endDate: loan.endDate || '',
        status: loan.status || 'active',
        createdAt: loan.createdAt || new Date().toISOString()
      });
    }

    // Example: Migrate expenses
    const expensesData = [
      // Paste your exported expenses data here
      // Format: { date, category, description, amount, createdAt }
    ];

    for (const expense of expensesData) {
      await db.collection('expenses').add({
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        createdAt: expense.createdAt || new Date().toISOString()
      });
    }

    // Example: Migrate capital entries
    const capitalData = [
      // Paste your exported capital data here
      // Format: { date, type, amount, note, createdAt }
    ];

    for (const entry of capitalData) {
      await db.collection('capital').add({
        date: entry.date,
        type: entry.type,
        amount: entry.amount,
        note: entry.note,
        createdAt: entry.createdAt || new Date().toISOString()
      });
    }

    console.log('Migration completed successfully!');
    console.log('Refresh the page to see your migrated data.');

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// To use this script:
// 1. Export your Google Sheets data as CSV or JSON
// 2. Convert to the format expected above
// 3. Paste your data into the arrays above
// 4. Run migrateFromSheets() in the browser console
// 5. The function is available globally for easy access