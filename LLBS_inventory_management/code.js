const SPREADSHEET_ID = SpreadsheetApp.getActive().getId();
const BOOK_DB_SHEET  = "Book Database";
const STOCK_IN_SHEET = "Stock In";

function doGet() {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Inventory Stock In")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function _openSS_() { return SpreadsheetApp.openById(SPREADSHEET_ID); }

function _readHeaders_(sh) {
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(h => String(h).trim());
}

function _indexOfRequired_(headers, name) {
  const i = headers.indexOf(name);
  if (i === -1) throw new Error(`Column "${name}" not found in Book Database.`);
  return i + 1;
}
function _indexOfOptional_(headers, name) {
  const i = headers.indexOf(name);
  return i === -1 ? null : i + 1;
}

function getBooks() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("BOOKS_SIMPLE");
  if (cached) return JSON.parse(cached);

  const ss = _openSS_();
  const sh = ss.getSheetByName(BOOK_DB_SHEET);
  if (!sh) throw new Error(`Sheet "${BOOK_DB_SHEET}" not found.`);

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  const headers = _readHeaders_(sh);
  const titleCol = _indexOfRequired_(headers, "Book Title");
  const isbnCol  = _indexOfRequired_(headers, "ISBN");
  const typeCol  = _indexOfOptional_(headers, "Type");

  const maxCol = Math.max(titleCol, isbnCol, typeCol || 0);
  const vals = sh.getRange(2, 1, lastRow - 1, maxCol).getValues();

  const seen = new Set();
  const out = [];
  vals.forEach(r => {
    const title = String(r[titleCol - 1] || "").trim();
    const isbn  = String(r[isbnCol - 1]  || "").trim();
    const type  = typeCol ? String(r[typeCol - 1] || "").trim() : "";
    if (!title && !isbn) return;
    const key = `${isbn}|${title}|${type}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ title, isbn, type });
  });

  cache.put("BOOKS_SIMPLE", JSON.stringify(out), 300);
  return out;
}

function saveStockIn(entries) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error("No entries submitted.");

  const clean = entries.map(e => {
    const title = String(e.title || "").trim();
    const isbn  = String(e.isbn  || "").trim();
    const type  = String(e.type  || "").trim();
    const qty   = Number(e.quantity || 0);
    const price = Number(e.purchasePrice || 0);
    if (!(isbn || title)) throw new Error("Book required.");
    if (!(qty > 0)) throw new Error("Quantity must be > 0.");
    if (!(price >= 0)) throw new Error("Price must be >= 0.");
    return { title, isbn, type, quantity: qty, purchasePrice: price };
  });

  const map = {};
  clean.forEach(r => {
    const key = `${r.isbn}|||${r.title}|||${r.type}|||${r.purchasePrice}`;
    map[key] = (map[key] || 0) + r.quantity;
  });
  const merged = Object.entries(map).map(([k, qty]) => {
    const [isbn, title, type, price] = k.split("|||");
    return { isbn, title, type, purchasePrice: Number(price), quantity: qty };
  });

  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    const ss = _openSS_();
    let sh = ss.getSheetByName(STOCK_IN_SHEET);
    if (!sh) {
      sh = ss.insertSheet(STOCK_IN_SHEET);
      sh.appendRow(["Timestamp", "ISBN", "Book Title", "Type", "Quantity", "Purchase Price", "Submitted By"]);
    }
    const headers = ["Timestamp","ISBN","Book Title","Type","Quantity","Purchase Price","Submitted By"];
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);

    const user = Session.getActiveUser().getEmail() || "";
    const rows = merged.map(o => [new Date(), o.isbn, o.title, o.type, o.quantity, o.purchasePrice, user]);
    sh.getRange(sh.getLastRow()+1, 1, rows.length, rows[0].length).setValues(rows);

    return { ok: true, inserted: rows.length };
  } finally {
    lock.releaseLock();
  }
}
