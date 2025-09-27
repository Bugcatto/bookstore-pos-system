/** 
 * Web app entry point
 * Deploy: Publish → Deploy as web app → Execute as: Me; Who has access: Anyone with the link (or your choice)
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('App Launcher')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Fetch rows from "App List" sheet.
 * Column A: Name, Column B: Link (URL)
 * Skips empty rows and (optionally) header if it detects one.
 */
function getApps() {
  const ss = SpreadsheetApp.getActive();             // If this is bound to the Sheet
  const sh = ss.getSheetByName('App List');
  if (!sh) throw new Error('Sheet "App List" not found');

  const lastRow = sh.getLastRow();
  if (lastRow < 1) return [];

  const range = sh.getRange(1, 1, lastRow, 2);       // A:B
  const values = range.getValues();

  // Detect header (very light heuristic: first row has "name"/"link" text)
  let start = 1;
  const r0 = values[0].map(v => String(v).trim().toLowerCase());
  const hasHeader = r0[0].includes('name') || r0[1].includes('link');
  if (!hasHeader) start = 0;

  const out = [];
  for (let i = start; i < values.length; i++) {
    const [name, url] = values[i].map(v => String(v).trim());
    if (!name || !url) continue;
    // basic URL sanity (allows http/https and app links)
    const looksLikeUrl = /^(https?:\/\/|mailto:|tel:)/i.test(url);
    out.push({
      name,
      url: looksLikeUrl ? url : ('https://' + url) // make forgiving if user omitted scheme
    });
  }
  return out;
}
