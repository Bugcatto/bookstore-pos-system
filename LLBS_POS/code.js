/** Little Leaders Bookstore-POS-V5 — code.gs (with Logger) **/

//function doGet(){
//  Logger.log('[doGet] render index');
//  return HtmlService.createTemplateFromFile('index').evaluate()
//    .setTitle('Little Leaders Bookstore POS V5')
//    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
//}
function include(f){ return HtmlService.createHtmlOutputFromFile(f).getContent(); }


const SHEET = { SALES:'Sales', INV:'Inventory List', ITEMS:'Items', MEMBERS:'Members', PAY:'Payment Option' };
const PAYMENT_HEADERS = ['Payment Type'];
const SALES_HEADERS = [
  'Timestamp','Sale ID','Line No','ISBN','Book Title','Type','Qty','Unit Price',
  'Line Discount','Tax Rate','Tax Amount','Line Base','Line Net (pre-tax)','Line Total',
  'Notes', 'Payment Method',           // <-- NEW
  'Customer Type','Member ID','Member Email','Buyer Name','Buyer Phone'
];
const INV_HEADERS = ['Serial','ISBN','Book Title','Total Count','Stock In','Stock Out','Sales','Rent','Damage'];
const ITEMS_HEADERS = ['ISBN','Book Title','Type','Price'];
const MEMBERS_HEADERS = ['member_id','email','name','phone_primary','phone_secondary','viber','dob','nrc','addr_house','addr_street','addr_township','addr_region','plan','channel','status','created_at','updated_at'];

function _ss(){ return SpreadsheetApp.getActive(); }
function _ws(name){ const sh=_ss().getSheetByName(name); if(!sh) throw new Error('Missing sheet: '+name); return sh; }

function ensureHeaders(sheetName, headers){
  const sh=_wsEnsure(sheetName); // use _wsEnsure instead of _ws
  const rng=sh.getRange(1,1,1,headers.length);
  const have=(rng.getValues()[0]||[]).map(String);
  let changed=false;
  for(let i=0;i<headers.length;i++){ if((have[i]||'').trim()!==headers[i]){ have[i]=headers[i]; changed=true; } }
  if(changed){ rng.setValues([have]); Logger.log('[ensureHeaders] updated headers for %s', sheetName); }
  return sh;
}
function _wsEnsure(name){
  const ss=_ss();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

// safe body row getter
function getBodyRows_(sh, width){
  const last=sh.getLastRow();
  if(last<2) return [];
  return sh.getRange(2,1,last-1,width).getValues();
}

function toObj(headers,row){ const o={}; headers.forEach((h,i)=>o[h]=row[i]); return o; }
function normalizeEmail(e){ return (e||'').trim().toLowerCase(); }
function normalizePhone(p){
  if(!p) return '';
  const d=String(p).replace(/\\D+/g,'');
  if(d.startsWith('959')) return d;
  if(d.startsWith('09')) return '959'+d.slice(1);
  if(d.startsWith('9')) return '959'+d;
  if(d.startsWith('00')) return d.replace(/^00/,'');
  return d;
}
function makeSaleId(){
  const d=new Date();
  const ts=Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  const rnd=Math.floor(Math.random()*9000+1000);
  const id='S'+ts+'-'+rnd; Logger.log('[makeSaleId] %s', id); return id;
}

function priceMap(){
  const sh=ensureHeaders(SHEET.ITEMS, ITEMS_HEADERS);
  const rows=getBodyRows_(sh, ITEMS_HEADERS.length);
  const map={};
  rows.forEach(r=>{ const isbn=String(r[0]||'').trim(); if(isbn) map[isbn]={ BookTitle:r[1], Type:r[2], Price:Number(r[3]||0) }; });
  Logger.log('[priceMap] items=%s', Object.keys(map).length);
  return map;
}

function indexInventory(){
  const sh=ensureHeaders(SHEET.INV, INV_HEADERS);
  const rows=getBodyRows_(sh, INV_HEADERS.length);
  const idx={}; rows.forEach((r,i)=>{ const isbn=String(r[1]||'').trim(); if(isbn) idx[isbn]={ row:i+2, data:r }; });
  Logger.log('[indexInventory] indexed=%s', Object.keys(idx).length);
  return { sh, idx };
}

function listItems(){
  try{
    Logger.log('[listItems] start');
    const sh=ensureHeaders(SHEET.ITEMS, ITEMS_HEADERS);
    const rows=getBodyRows_(sh, ITEMS_HEADERS.length);
    const out=[];
    rows.forEach(r=>{ if(!r[0]&& !r[1]) return; out.push({ ISBN:String(r[0]||''), BookTitle:String(r[1]||''), Type:String(r[2]||''), Price:Number(r[3]||0) }); });
    Logger.log('[listItems] return count=%s', out.length);
    return out;
  }catch(e){ Logger.log('[listItems][error] %s', e); throw e; }
}

function searchItems(query){
  try{
    const q=(query||'').toString().trim().toLowerCase();
    Logger.log('[searchItems] q="%s"', q);
    if(!q) return listItems();
    const items=listItems();
    const res=items.filter(it=> (it.BookTitle||'').toLowerCase().indexOf(q)>-1 || (it.ISBN||'').toLowerCase().indexOf(q)>-1 );
    Logger.log('[searchItems] matches=%s', res.length);
    return res;
  }catch(e){ Logger.log('[searchItems][error] %s', e); throw e; }
}

function findMember(req){
  try{
    const by=(req&&req.by)||'email';
    const valRaw=(req&&req.value)||'';
    Logger.log('[findMember] by=%s value="%s"', by, valRaw);
    const sh=ensureHeaders(SHEET.MEMBERS, MEMBERS_HEADERS);
    const rows=getBodyRows_(sh, MEMBERS_HEADERS.length);

    let matches=[];
    if(by==='email'){
      const target=normalizeEmail(valRaw); if(!target){ Logger.log('[findMember] empty email'); return { ok:true, none:true }; }
      rows.forEach(r=>{ const o=toObj(MEMBERS_HEADERS,r); if(normalizeEmail(o.email)===target) matches.push(o); });
    } else if(by==='phone'){
      const target=normalizePhone(valRaw); if(!target){ Logger.log('[findMember] empty phone'); return { ok:true, none:true }; }
      rows.forEach(r=>{ const o=toObj(MEMBERS_HEADERS,r); if(normalizePhone(o.phone_primary)===target || normalizePhone(o.phone_secondary)===target) matches.push(o); });
    } else {
      Logger.log('[findMember][error] unsupported mode: %s', by);
      return { ok:false, error:'Unsupported search mode' };
    }

    Logger.log('[findMember] matches=%s', matches.length);
    if(matches.length===0) return { ok:true, none:true };
    if(matches.length===1){
      const m=matches[0]; const warn=(String(m.status||'').toLowerCase()!=='active');
      Logger.log('[findMember] unique member_id=%s warnInactive=%s', m.member_id||'', warn);
      return { ok:true, match:{ member_id:m.member_id||'', email:m.email||'', name:m.name||'', phone_primary:m.phone_primary||'', status:m.status||'' }, warnInactive:warn };
    }
    const multi=matches.map(m=>({ member_id:m.member_id||'', email:m.email||'', name:m.name||'', phone_primary:m.phone_primary||'', status:m.status||'' }));
    Logger.log('[findMember] multiple=%s', multi.length);
    return { ok:true, multiple: multi };
  }catch(e){ Logger.log('[findMember][error] %s', e); return { ok:false, error:String(e) }; }
}

function listPaymentTypes(){
  try{
    Logger.log('[listPaymentTypes] start');
    const sh = ensureHeaders(SHEET.PAY, PAYMENT_HEADERS);
    const rows = getBodyRows_(sh, PAYMENT_HEADERS.length);
    const out = rows
      .map(r => String(r[0]||'').trim())
      .filter(x => x); // non-empty
    Logger.log('[listPaymentTypes] count=%s', out.length);
    return out;
  }catch(e){ Logger.log('[listPaymentTypes][error] %s', e); throw e; }
}

function submitOrder(payload){
  try{
    Logger.log('[submitOrder] start');
    if (!payload) { Logger.log('[submitOrder][error] no payload'); throw new Error('Empty order'); }
    Logger.log('[submitOrder] payload.lines=%s discount=%s taxRate=%s',
               (payload.lines||[]).length, payload.discount, payload.taxRate);

    if (!Array.isArray(payload.lines) || payload.lines.length === 0) {
      throw new Error('Empty order');
    }

    // Helpers
    function num(x){ x = Number(x||0); return isFinite(x) ? x : 0; }

    // Server-authoritative prices
    const items = priceMap();

    const saleId   = makeSaleId();
    const ts       = new Date();
    const taxRate  = Number(payload.taxRate || 0);     // e.g. 0.05 for 5%
    const ordDisc  = Number(payload.discount || 0);    // order-level discount

    // Build computed lines from authoritative price list
    let subtotalBase = 0; // sum of positive bases for discount allocation
    const computed = payload.lines.map((L, i) => {
      const isbn = String(L.ISBN || '').trim();
      if (!isbn || !items[isbn]) throw new Error('Unknown ISBN: ' + isbn);

      const unitPrice = Number(items[isbn].Price || 0);
      const qty = Number(L.qty || 0);
      if (!qty) throw new Error('Zero qty not allowed');

      const base = unitPrice * qty; // negative allowed (returns)
      if (base > 0) subtotalBase += base;

      return {
        i: i + 1,
        ISBN: isbn,
        BookTitle: items[isbn].BookTitle || '',
        Type: items[isbn].Type || '',
        qty, unitPrice, base,
        notes: (L.notes || '')
      };
    });

    Logger.log('[submitOrder] computedLines=%s subtotalBase=%s', computed.length, subtotalBase);

    // Allocate order-level discount across positive-base lines only
    const linesOut = [];
    computed.forEach((cl, idx) => {
      let lineDiscount = 0;
      if (cl.base > 0 && ordDisc > 0 && subtotalBase > 0) {
        if (idx < computed.length - 1) {
          lineDiscount = Math.round((cl.base / subtotalBase) * ordDisc * 100) / 100;
        } else {
          // last line gets remainder to avoid rounding drift
          const allocated = linesOut.reduce((s, x) => s + x.lineDiscount, 0);
          lineDiscount = Math.max(0, Math.round((ordDisc - allocated) * 100) / 100);
        }
      }
      const lineNet = cl.base - lineDiscount;               // pre-tax
      const tax     = Math.round(lineNet * taxRate * 100) / 100;
      const total   = Math.round((lineNet + tax) * 100) / 100;

      linesOut.push(Object.assign({}, cl, {
        lineDiscount, lineNet, tax, total
      }));
    });

    const summary = {
      subtotal: Math.round(linesOut.reduce((s, x) => s + Math.max(0, x.base), 0) * 100) / 100,
      discount: Math.round(linesOut.reduce((s, x) => s + x.lineDiscount, 0) * 100) / 100,
      tax:      Math.round(linesOut.reduce((s, x) => s + x.tax, 0) * 100) / 100,
      total:    Math.round(linesOut.reduce((s, x) => s + x.total, 0) * 100) / 100,
      taxRate
    };
    Logger.log('[submitOrder] summary subtotal=%s discount=%s tax=%s total=%s',
               summary.subtotal, summary.discount, summary.tax, summary.total);

    // Prepare Sales rows
    const salesSh  = ensureHeaders(SHEET.SALES, SALES_HEADERS);
    const startRow = salesSh.getLastRow() + 1;
    const rows     = [];

    const buyer      = payload.buyer || {};
    const buyerType  = buyer.type === 'Member' ? 'Member' : 'Other Customer';
    const buyerCols  = [
      buyerType,
      buyerType === 'Member' ? (buyer.member_id || '') : '',
      buyerType === 'Member' ? (buyer.email     || '') : '',
      buyer.name  || '',
      buyer.phone || ''
    ];
    Logger.log('[submitOrder] buyer type=%s id=%s email=%s name=%s phone=%s',
               buyerType, buyerCols[1], buyerCols[2], buyerCols[3], buyerCols[4]);

    // Validate payment method
    const paymentMethod = (payload && payload.paymentMethod || '').toString().trim();
    if (!paymentMethod) throw new Error('Select a payment method');
    Logger.log('[submitOrder] payment=%s', paymentMethod);

    linesOut.forEach((L, idx) => {
      rows.push([
        ts,                // Timestamp (will only be written to the sheet; response uses ISO string)
        saleId,
        idx + 1,           // Line No
        L.ISBN,
        L.BookTitle,
        L.Type,
        L.qty,
        L.unitPrice,
        L.lineDiscount,
        taxRate,
        L.tax,
        L.base,
        L.lineNet,
        L.total,
        L.notes || '',paymentMethod,
        // Buyer columns
        buyerCols[0], buyerCols[1], buyerCols[2], buyerCols[3], buyerCols[4]
      ]);
    });

    Logger.log('[submitOrder] rows to write=%s at row=%s', rows.length, startRow);

    if (rows.length > 0) {
      salesSh.getRange(startRow, 1, rows.length, SALES_HEADERS.length).setValues(rows);
    } else {
      Logger.log('[submitOrder][abort] no rows');
      return { ok:false, error:'No lines to write (cart empty on server).' };
    }

    // Inventory updates (oversell allowed)
    const { sh: invSh, idx: invIdx } = indexInventory();
    const invWrites = [];
    const appendInv = [];

    linesOut.forEach(L => {
      const isbn = L.ISBN;
      const qty  = Number(L.qty || 0);

      if (invIdx[isbn]) {
        const rowN = invIdx[isbn].row;
        const row  = invIdx[isbn].data.slice(); // [Serial, ISBN, Book Title, Total, In, Out, Sales, Rent, Damage]

        row[2] = L.BookTitle || row[2];
        if (qty > 0) {
          row[3] = Number(row[3] || 0) - qty; // Total Count -= qty
          row[5] = Number(row[5] || 0) + qty; // Stock Out += qty
          row[6] = Number(row[6] || 0) + qty; // Sales += qty
        } else {
          const n = Math.abs(qty);
          row[3] = Number(row[3] || 0) + n;   // Total Count += n
          row[5] = Number(row[5] || 0) - n;   // Stock Out -= n
          row[6] = Number(row[6] || 0) - n;   // Sales -= n
        }
        invWrites.push({ row: rowN, values: row });
      } else {
        // Create new row with zeroed counts then apply delta
        let total=0, out=0, sales=0;
        if (qty > 0) { total = 0 - qty; out = qty;      sales = qty;      }
        else         { const n = Math.abs(qty); total = n; out = 0 - n; sales = 0 - n; }
        appendInv.push([ '', isbn, L.BookTitle || '', total, 0, out, sales, 0, 0 ]);
      }
    });

    Logger.log('[submitOrder] invWrites=%s appendInv=%s', invWrites.length, appendInv.length);

    if (invWrites.length > 0) {
      invWrites.forEach(w => invSh.getRange(w.row, 1, 1, INV_HEADERS.length).setValues([w.values]));
    }
    if (appendInv.length > 0) {
      invSh.getRange(invSh.getLastRow() + 1, 1, appendInv.length, INV_HEADERS.length).setValues(appendInv);
    }

    // Build JSON-safe response (no raw Date/NaN)
    const tz   = Session.getScriptTimeZone();
    const tsIso = Utilities.formatDate(ts, tz, "yyyy-MM-dd'T'HH:mm:ss");

    const respLines = linesOut.map(L => ({
      ISBN:       String(L.ISBN),
      BookTitle:  String(L.BookTitle || ''),
      Type:       String(L.Type || ''),
      qty:        num(L.qty),
      unitPrice:  num(L.unitPrice),
      base:       num(L.base),
      lineDiscount: num(L.lineDiscount),
      tax:        num(L.tax),
      lineTotal:  num(L.total)
    }));

    // After you compute safeSummary in submitOrder:
    const safeSummary = {
      subtotal: num(summary.subtotal),
      discount: num(summary.discount),
      tax:      num(summary.tax),
      total:    num(summary.total),
      taxRate:  num(summary.taxRate)
    };
    safeSummary.paymentType = String(paymentMethod || '');

    Logger.log('[submitOrder] done saleId=%s', saleId);

    return {
      ok: true,
      saleId: String(saleId),
      ts:     tsIso,        // string (safe)
      lines:  respLines,
      summary: safeSummary,
      paymentMethod,
      buyer: {
        type:      buyerType,
        member_id: buyer.member_id || null,
        email:     buyer.email || null,
        name:      buyer.name  || null,
        phone:     buyer.phone || null
      }
    };

  } catch (e) {
    Logger.log('[submitOrder][error] %s', e);
    return { ok:false, error:String(e) };
  }
}
