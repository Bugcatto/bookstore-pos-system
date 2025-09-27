const SHEET_NAME = 'Member Status';
const EXPECTED_HEADERS = [
  'phone_primary','email','name','Membership Type','Expired Date','Valid Check','plan'
];

/** Include plan in each row */
function getMembers() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) throw new Error(`Sheet "${SHEET_NAME}" not found.`);

  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return [];

  const values = sh.getRange(1, 1, lastRow, lastCol).getValues();

  const headerRow = values[0] || [];
  const idx = {};
  EXPECTED_HEADERS.forEach(h => {
    const pos = headerRow.findIndex(c => String(c).trim().toLowerCase() === h.toLowerCase());
    if (pos === -1) {
      throw new Error(`Header "${h}" not found. Found headers: ${headerRow.join(', ')}`);
    }
    idx[h] = pos;
  });

  const out = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r] || [];
    const phone = String(row[idx['phone_primary']] ?? '').trim();
    const email = String(row[idx['email']] ?? '').trim();
    const name  = String(row[idx['name']] ?? '').trim();
    const membershipType = String(row[idx['Membership Type']] ?? '').trim();
    const validCheck = String(row[idx['Valid Check']] ?? '').trim();
    const plan = String(row[idx['plan']] ?? '').trim();

    const rawExpired = row[idx['Expired Date']];
    let expiredDateStr = '';
    if (rawExpired instanceof Date) {
      expiredDateStr = Utilities.formatDate(rawExpired, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } else {
      expiredDateStr = String(rawExpired ?? '').trim();
    }

    out.push({ phone, email, name, membershipType, expiredDateStr, validCheck, plan });
  }
  return out;
}