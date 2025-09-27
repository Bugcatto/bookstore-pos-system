var MEMBER_SSID = '1alBqmE7RV7-A6XYM6QsD9G43qzF_hnlxGBuKgt8sYNY';
var MEMBER_SHEET = 'Member Registration';

// HTML rendering function
//function doGet(e) {
//  return HtmlService.createHtmlOutputFromFile('index')
//    .setTitle('Library Member Registration')
//    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
//}
// Single router doGet
function doGet(e) {
  const view = (e && e.parameter && e.parameter.view) || 'register';
  let file;
  let title;

  switch(view) {
    case 'members':
      file = 'members';
      title = 'Member Status';
      break;
    case 'bookstore':
      file = 'bookstore';
      title = 'Bookstore Member Registration';
      break;
    case 'library':
      file = 'library';
      title = 'Library Member Registration';
      break;
    default:
      file = 'index';
      title = 'Library Member Registration';
  }

  return HtmlService.createHtmlOutputFromFile(file)
      .setTitle(title)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


// Optional: use templating if you need to pass server data to HTML
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


/* ---------------- Address dependency: region.json ---------------- */
var __ADDR_CACHE = null, __ADDR_CACHE_AT = 0;

function getRegionJson_() {
  var now = Date.now();
  if (__ADDR_CACHE && (now - __ADDR_CACHE_AT) < 6*60*60*1000) return __ADDR_CACHE; // Cache for 1 hour
  try {
    var raw = HtmlService.createHtmlOutputFromFile('region.json').getContent();
    var parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.regions)) parsed = { regions: [] };
    __ADDR_CACHE = parsed;
    __ADDR_CACHE_AT = now;
    return parsed;
  } catch (e) {
    Logger.log('region.json load error: ' + e);
    return { regions: [] };
  }
}

function api_getRegions() {
  var data = getRegionJson_();
  return data.regions.map(function(r) { return r.name_en; });
}

function api_getRegionTownships(regionName) {
  var data = getRegionJson_();
  var region = data.regions.find(function(r) { return r.name_en === String(regionName); });
  return region ? region.townships : [];
}

/* ---------------- NRC dependency: nrc.json ---------------- */
var __NRC_CACHE = null, __NRC_CACHE_AT = 0;

function getNrcJson_() {
  var now = Date.now();
  if (__NRC_CACHE && (now - __NRC_CACHE_AT) < 6*60*60*1000) return __NRC_CACHE; // Cache for 1 hour
  try {
    var raw = HtmlService.createHtmlOutputFromFile('nrc.json').getContent();
    var parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.data)) parsed = { data: [] };
    __NRC_CACHE = parsed;
    __NRC_CACHE_AT = now;
    return parsed;
  } catch (e) {
    Logger.log('nrc.json load/parse error: ' + e);
    return { data: [] };
  }
}

function api_getNrcCodes() {
  var data = getNrcJson_().data;
  var set = {};
  data.forEach(function(row) { set[String(row.nrc_code)] = true; });
  var list = Object.keys(set).sort(function(a, b) { return Number(a) - Number(b); });
  return list;
}

function getNrcRegionTownships(nrcCode) {
  var nrcData = getNrcJson_(); // Get NRC data from nrc.json

  // Filter NRC data based on the given NRC code
  var nrcTownships = nrcData.data.filter(function(row) {
    return String(row.nrc_code) === String(nrcCode); // Match NRC code
  });

  // If no townships found for the NRC code, return an empty array
  if (nrcTownships.length === 0) {
    return [];
  }

  // Create an array of townships
  var townships = nrcTownships.map(function(row) {
    return {
      value: row.name_en, // Township name (English name)
      label: row.name_en  // Label is the English name of the township
    };
  });

  // Sort the townships by their English name (ascending)
  townships.sort(function(a, b) {
    return a.label.localeCompare(b.label); // Sorting based on English name
  });

  return townships; // Return sorted townships
}

/* ---------------- Form Submission ---------------- */
function api_submitMember(payload) {
  var email = String(payload.email || '').trim();
  var name = String(payload.name || '').trim();
  var phone = String(payload.phone_primary || '').trim();
  var agreed = String(payload.agreed || '') === 'true';
  
  if (!email || !name || !phone) throw new Error('Email, Name, and Primary Phone are required.');
  if (!agreed) throw new Error('Please agree to the Terms & Conditions.');

  // NRC (dependent from nrc.json)
  var nrcCode = String(payload.nrc_code || '').trim();
  var nrcTown = String(payload.nrc_township || '').trim(); // value = name_en
  var nrcNum = String(payload.nrc_number || '').trim();
  
  if (!nrcCode || !nrcTown || !nrcNum) throw new Error('NRC Code, Township, and Number are required.');

  // Address (dependent from region.json)
  var addrRegion = String(payload.addr_region || '').trim();
  var addrTownship = String(payload.addr_township || '').trim();
  if (!addrRegion || !addrTownship) throw new Error('Address Region and Township are required.');

  var ss = SpreadsheetApp.openById(MEMBER_SSID);
  var sh = ss.getSheetByName(MEMBER_SHEET);
  if (!sh) throw new Error('Target sheet not found: ' + MEMBER_SHEET);

  // Check if the member already exists by NRC fields (NRC Code, NRC Township, NRC Number)
  var existingMembers = sh.getDataRange().getValues(); // Get all rows of data
  for (var i = 1; i < existingMembers.length; i++) { // Start from 1 to skip header row
    var row = existingMembers[i];
    var existingNrcCode = String(row[8]); // NRC Code column (column I, 0-indexed is 8)
    var existingNrcTownship = String(row[9]); // NRC Township column (column J, 0-indexed is 9)
    var existingNrcNumber = String(row[10]); // NRC Number column (column K, 0-indexed is 10)

    if (existingNrcCode === nrcCode && existingNrcTownship === nrcTown && existingNrcNumber === nrcNum) {
      throw new Error('This member is already registered with the same NRC details.');
    }
  }

  // If the member does not exist, proceed with registration
  if (sh.getLastRow() === 0) {
    var header = [
      'member_id', 'submitted_at',
      'email', 'name', 'phone_primary', 'phone_secondary', 'viber',
      'dob',
      'nrc_code', 'nrc_township', 'nrc_number',
      'addr_house', 'addr_street', 'addr_township', 'addr_region',
      'plan', 'channel',
      'status'
    ];
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }

  var memberId = Utilities.getUuid();
  var now = new Date();
  var row = [
    memberId, now,
    email, name, phone, (payload.phone_secondary || ''), (payload.viber || ''),
    (payload.dob || ''),
    nrcCode, nrcTown, nrcNum,
    (payload.addr_house || ''), (payload.addr_street || ''), addrTownship, addrRegion,
    (payload.plan || ''), (payload.channel || ''),
    'Pending'
  ];
  sh.appendRow(row);
  return { ok: true, memberId: memberId };
}
