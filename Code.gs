// ============================================================
//  LendTrack v2 — Google Apps Script Backend
//  Paste this in: Extensions > Apps Script > Code.gs
//  Deploy > New Deployment > Web App
//    - Execute as: Me
//    - Who has access: Anyone
// ============================================================

const SS = SpreadsheetApp.getActiveSpreadsheet();

function getOrCreateSheet(name, headers) {
  let sheet = SS.getSheetByName(name);
  if (!sheet) {
    sheet = SS.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold').setBackground('#0f0e17').setFontColor('#c8922a');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function borrowersSheet() {
  return getOrCreateSheet('Borrowers', [
    'id','name','phone','aadhar','address','amount','daily',
    'startDate','createdAt','notes','status'
  ]);
}
function paymentsSheet() {
  return getOrCreateSheet('Payments', ['id','borrowerId','day','paidAt','amount']);
}
function loansSheet() {
  return getOrCreateSheet('LoanHistory', [
    'id','borrowerId','amount','daily','startDate','endDate','status','createdAt'
  ]);
}
function expensesSheet() {
  return getOrCreateSheet('Expenses', ['id','date','category','description','amount','createdAt']);
}
function capitalSheet() {
  return getOrCreateSheet('Capital', ['id','date','type','amount','note','createdAt']);
}

function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const a = e.parameter.action;
  try {
    if (a === 'getBorrowers')   return respond(getBorrowers());
    if (a === 'getAllPayments') return respond(getAllPayments());
    if (a === 'getLoanHistory') return respond(getLoanHistory(e.parameter.borrowerId));
    if (a === 'getExpenses')    return respond(getExpenses());
    if (a === 'getCapital')     return respond(getCapital());
    return respond({ error: 'Unknown action: ' + a });
  } catch(err) { return respond({ error: err.message }); }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const a = body.action;
  try {
    if (a === 'addBorrower')    return respond(addBorrower(body.data));
    if (a === 'updateBorrower') return respond(updateBorrower(body.data));
    if (a === 'deleteBorrower') return respond(deleteBorrower(body.id));
    if (a === 'togglePayment')  return respond(togglePayment(body.borrowerId, body.day, body.amount));
    if (a === 'bulkPayment')    return respond(bulkPayment(body.borrowerId, body.days, body.amount));
    if (a === 'renewLoan')      return respond(renewLoan(body.borrowerId, body.data));
    if (a === 'closeLoan')      return respond(closeLoan(body.borrowerId));
    if (a === 'addExpense')     return respond(addExpense(body.data));
    if (a === 'deleteExpense')  return respond(deleteExpense(body.id));
    if (a === 'addCapital')     return respond(addCapital(body.data));
    if (a === 'updateNotes')    return respond(updateNotes(body.id, body.notes));
    return respond({ error: 'Unknown action: ' + a });
  } catch(err) { return respond({ error: err.message }); }
}

// ── Borrowers ────────────────────────────────────────────────
function getBorrowers() {
  const rows = borrowersSheet().getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1).map(r => ({
    id: r[0], name: r[1], phone: r[2], aadhar: r[3], address: r[4],
    amount: r[5], daily: r[6], startDate: r[7], createdAt: r[8],
    notes: r[9] || '', status: r[10] || 'active'
  }));
}

function addBorrower(data) {
  const id = 'B' + Date.now();
  const now = new Date().toISOString();
  borrowersSheet().appendRow([
    id, data.name, data.phone, data.aadhar, data.address,
    data.amount, data.daily, data.startDate, now,
    data.notes || '', 'active'
  ]);
  loansSheet().appendRow([
    'L' + Date.now(), id, data.amount, data.daily,
    data.startDate, '', 'active', now
  ]);
  capitalSheet().appendRow([
    'C' + Date.now(), now.split('T')[0], 'lent',
    -Math.abs(data.amount), 'Lent to ' + data.name, now
  ]);
  return { success: true, id };
}

function updateBorrower(data) {
  const sheet = borrowersSheet();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.getRange(i+1, 2, 1, 9).setValues([[
        data.name, data.phone, data.aadhar, data.address,
        data.amount, data.daily, data.startDate,
        rows[i][8], data.notes || rows[i][9] || '',
        data.status || rows[i][10] || 'active'
      ]]);
      return { success: true };
    }
  }
  return { error: 'Not found' };
}

function updateNotes(id, notes) {
  const sheet = borrowersSheet();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.getRange(i+1, 10).setValue(notes);
      return { success: true };
    }
  }
  return { error: 'Not found' };
}

function deleteBorrower(id) {
  const sheet = borrowersSheet();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.deleteRow(i+1);
      deletePaymentsForBorrower(id);
      return { success: true };
    }
  }
  return { error: 'Not found' };
}

// ── Loan History & Renewal ────────────────────────────────────
function getLoanHistory(borrowerId) {
  const rows = loansSheet().getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1)
    .filter(r => !borrowerId || r[1] === borrowerId)
    .map(r => ({
      id: r[0], borrowerId: r[1], amount: r[2], daily: r[3],
      startDate: r[4], endDate: r[5], status: r[6], createdAt: r[7]
    }));
}

function renewLoan(borrowerId, data) {
  const lSheet = loansSheet();
  const rows = lSheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === borrowerId && rows[i][6] === 'active') {
      lSheet.getRange(i+1, 6).setValue(new Date().toISOString().split('T')[0]);
      lSheet.getRange(i+1, 7).setValue('closed');
    }
  }
  deletePaymentsForBorrower(borrowerId);
  updateBorrower({ ...data, id: borrowerId, status: 'active' });
  const now = new Date().toISOString();
  lSheet.appendRow([
    'L' + Date.now(), borrowerId, data.amount, data.daily,
    data.startDate, '', 'active', now
  ]);
  capitalSheet().appendRow([
    'C' + Date.now(), now.split('T')[0], 'lent',
    -Math.abs(data.amount), 'Renewal for ' + data.name, now
  ]);
  return { success: true };
}

function closeLoan(borrowerId) {
  const bSheet = borrowersSheet();
  const bRows = bSheet.getDataRange().getValues();
  for (let i = 1; i < bRows.length; i++) {
    if (bRows[i][0] === borrowerId) {
      bSheet.getRange(i+1, 11).setValue('closed');
      break;
    }
  }
  const lSheet = loansSheet();
  const lRows = lSheet.getDataRange().getValues();
  for (let i = 1; i < lRows.length; i++) {
    if (lRows[i][1] === borrowerId && lRows[i][6] === 'active') {
      lSheet.getRange(i+1, 6).setValue(new Date().toISOString().split('T')[0]);
      lSheet.getRange(i+1, 7).setValue('closed');
    }
  }
  return { success: true };
}

// ── Payments ─────────────────────────────────────────────────
function getAllPayments() {
  const rows = paymentsSheet().getDataRange().getValues();
  if (rows.length <= 1) return {};
  const result = {};
  rows.slice(1).forEach(r => {
    const bid = r[1];
    if (!result[bid]) result[bid] = [];
    result[bid].push(Number(r[2]));
  });
  return result;
}

function togglePayment(borrowerId, day, amount) {
  const sheet = paymentsSheet();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === borrowerId && Number(rows[i][2]) === Number(day)) {
      sheet.deleteRow(i+1);
      return { success: true, action: 'removed', day };
    }
  }
  const now = new Date().toISOString();
  sheet.appendRow(['P' + Date.now(), borrowerId, day, now, amount || 0]);
  capitalSheet().appendRow([
    'C' + Date.now(), now.split('T')[0], 'collected',
    Math.abs(amount || 0), 'Day ' + day + ' from borrower ' + borrowerId, now
  ]);
  return { success: true, action: 'added', day };
}

function bulkPayment(borrowerId, days, amountPerDay) {
  const sheet = paymentsSheet();
  const rows = sheet.getDataRange().getValues();
  const existingDays = new Set(
    rows.slice(1).filter(r => r[1] === borrowerId).map(r => Number(r[2]))
  );
  const now = new Date().toISOString();
  const added = [];
  days.forEach(day => {
    if (!existingDays.has(Number(day))) {
      sheet.appendRow(['P' + Date.now() + Math.random(), borrowerId, day, now, amountPerDay]);
      added.push(day);
      Utilities.sleep(50); // avoid duplicate timestamps
    }
  });
  if (added.length > 0) {
    capitalSheet().appendRow([
      'C' + Date.now(), now.split('T')[0], 'collected',
      added.length * amountPerDay,
      'Bulk: days ' + added.join(',') + ' borrower ' + borrowerId, now
    ]);
  }
  return { success: true, added };
}

function deletePaymentsForBorrower(borrowerId) {
  const sheet = paymentsSheet();
  const rows = sheet.getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i--) {
    if (rows[i][1] === borrowerId) sheet.deleteRow(i+1);
  }
}

// ── Expenses ─────────────────────────────────────────────────
function getExpenses() {
  const rows = expensesSheet().getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1).map(r => ({
    id: r[0], date: r[1], category: r[2],
    description: r[3], amount: r[4], createdAt: r[5]
  }));
}

function addExpense(data) {
  const id = 'E' + Date.now();
  const now = new Date().toISOString();
  expensesSheet().appendRow([id, data.date, data.category, data.description, data.amount, now]);
  capitalSheet().appendRow([
    'C' + Date.now(), data.date, 'expense',
    -Math.abs(data.amount), data.category + ': ' + data.description, now
  ]);
  return { success: true, id };
}

function deleteExpense(id) {
  const sheet = expensesSheet();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) { sheet.deleteRow(i+1); return { success: true }; }
  }
  return { error: 'Not found' };
}

// ── Capital ───────────────────────────────────────────────────
function getCapital() {
  const rows = capitalSheet().getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1).map(r => ({
    id: r[0], date: r[1], type: r[2], amount: r[3], note: r[4], createdAt: r[5]
  }));
}

function addCapital(data) {
  const id = 'CAP' + Date.now();
  const now = new Date().toISOString();
  capitalSheet().appendRow([id, data.date, data.type, data.amount, data.note, now]);
  return { success: true, id };
}