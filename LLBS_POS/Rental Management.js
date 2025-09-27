/**
 * Little Leaders — POS & Rental Return Manager (split view)
 * Sheet: "Book Renting Record"
 * Columns (row 1):
 *   Return Check, Status, Due Date, Timestamp,
 *   Email Address, Select Member, Upload Photo, Quantity,
 *   Return Timestamp
 */
const VERSION = 'rental-1.0.4'; // bumped

const SHEET_ID   = '1pxsJ24xAHhPtZeL2NhbgsHzNB08WG9mbt8Yu9LVnqV8';
const SHEET_NAME = 'Book Renting Record';

/** Web app entry — use ?view=pos or ?view=rental */
function doGet(e) {
  const view  = (e && e.parameter && e.parameter.view) || 'pos';
  const file  = (view === 'rental') ? 'rental' : 'index';
  const title = (view === 'rental')
    ? 'Little Leaders Bookstore POS V5 — Return Manager'
    : 'Little Leaders Bookstore POS V5';

  const t = HtmlService.createTemplateFromFile(file);
  t.APP_VERSION = VERSION;
  Logger.log('[doGet] view=%s file=%s version=%s', view, file, VERSION);

  return t.evaluate()
    .setTitle(title)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
/** Web app entry */
//function doGet() {
//  return HtmlService.createHtmlOutputFromFile('index')
//    .setTitle('Book Renting Record — Viewer')
//    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
//}


/** Helper: open sheet and build header map */
function getSheetAndMap_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) throw new Error(`Tab "${SHEET_NAME}" not found`);

  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();

  const headers = (lastCol > 0)
    ? sh.getRange(1, 1, 1, lastCol).getDisplayValues()[0]
    : [];

  const map = {};
  headers.forEach((h, i) => map[String(h).trim()] = i + 1); // 1-based

  return { sh, headers, map, lastRow, lastCol };
}

function normalizeStatus_(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s) return 'Ongoing';
  if (s === 'complete') return 'Complete';
  if (s === 'partial return') return 'Partial Return';
  if (s === 'ongoing') return 'Ongoing';
  return 'Ongoing'; // fail-safe
}

/** Fetch records with row numbers and normalized status */
function getTable() {
  const { sh, headers, map, lastRow, lastCol } = getSheetAndMap_();
  if (lastRow < 1 || lastCol < 1) {
    return { headers: [], records: [] };
  }

  const body = lastRow > 1
    ? sh.getRange(2, 1, lastRow - 1, lastCol).getDisplayValues()
    : [];

  const cReturn = map['Return Check'] || 0;

  // Build records: { row, cells[], status }
  const records = body.map((cells, i) => {
    const row = i + 2;
    const rawStatus = cReturn ? cells[cReturn - 1] : '';
    const status = normalizeStatus_(rawStatus);
    return { row, cells, status };
  });

  return { headers, records };
}


/** Update a single row's Return Check (+ Return Timestamp when Complete) */
function updateStatus(payload) {
  const { row, status } = payload || {};
  const allowed = ['Ongoing', 'Partial Return', 'Complete'];

  if (!row || !status) throw new Error('row and status are required');
  if (!allowed.includes(status)) throw new Error(`status must be one of: ${allowed.join(', ')}`);

  const { sh, headers, map, lastRow } = getSheetAndMap_();
  if (row < 2 || row > lastRow) throw new Error(`Row ${row} is out of bounds (2..${lastRow})`);

  const cReturn = map['Return Check'] || 0;
  if (!cReturn) throw new Error(`Column "Return Check" not found. Headers: ${headers.join(' | ')}`);

  // Always set Return Check
  sh.getRange(row, cReturn).setValue(status);

  // If marking Complete, set Return Timestamp = now
  let timestampISO = null;
  if (status === 'Complete') {
    const cRTS = map['Return Timestamp'] || 0;
    if (!cRTS) {
      throw new Error(`Column "Return Timestamp" not found. Please add this header in row 1.`);
    }
    const now = new Date();
    sh.getRange(row, cRTS).setValue(now);
    timestampISO = now.toISOString();
  }

  return { ok: true, row, status, returnTimestampISO: timestampISO };
}

