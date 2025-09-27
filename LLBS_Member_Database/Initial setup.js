/******************************************************
 * Bookstore Admin – TEMPLATE (library-driven setup)
 * Author: Phone Myat | Contact: phonemyatthanoo@gmail.com, +9595350911
 ******************************************************/

function Initialsetup() {
  // Ensure Ins Sheet via library (creates if missing)
  ensureInsSheetViaLibrary_();

  // Library-driven setup
  if (FunctionSet && FunctionSet.setupsheet) FunctionSet.setupsheet();
  if (FunctionSet && FunctionSet.setAccess)  FunctionSet.setAccess();
  if (FunctionSet && FunctionSet.setempinfo) FunctionSet.setempinfo();

  // Reset triggers to avoid duplicates, then create fresh
  deleteAllMyProjectTriggers_();
  createInstallableTrigger();
  createTimeDrivenTrigger24();
  createTimeDrivenTrigger7();
  createHourlyTimeDrivenTrigger();
  createTimeDrivenTriggerforupdate5Min();

  SpreadsheetApp.getActive().toast('Template setup complete.', 'Setup', 5);
}

function byebye() { FunctionSet && FunctionSet.byebye && FunctionSet.byebye(); }
function SetAccess() { FunctionSet && FunctionSet.setAccess && FunctionSet.setAccess(); }

const M_TITLE = 'Function';

function onOpenTrigger() {
  // Make sure the Ins sheet exists (via library) before anything else
  ensureInsSheetViaLibrary_();

  // Optional: keep access fresh & show directory
  SetAccess();
  FunctionSet && FunctionSet.showUrls && FunctionSet.showUrls();

  // Minimal menu
  const ui = SpreadsheetApp.getUi().createMenu(M_TITLE);
  ui.addItem('Update Access', 'SetAccess')
    .addItem('Directory', 'FunctionSet.showUrls')
    .addItem('Sync "Select Member"', 'syncSelectMember')
    .addToUi();
}

/** ===== Triggers ===== */
function createInstallableTrigger() {
  ScriptApp.newTrigger('onOpenTrigger')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();
}

function createTimeDrivenTrigger24() {
  ScriptApp.newTrigger('callbackup24')
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .create();
}

function createTimeDrivenTrigger7() {
  ScriptApp.newTrigger('callbackup7')
    .timeBased()
    .everyDays(7)
    .atHour(0)
    .create();
}

function createHourlyTimeDrivenTrigger() {
  ScriptApp.newTrigger('SetAccess')
    .timeBased()
    .everyHours(1)
    .create();
}

function createTimeDrivenTriggerforupdate5Min() {
  ScriptApp.newTrigger('syncSelectMember')
    .timeBased()
    .everyMinutes(5)
    .create();
}


// Keep your existing callback names; delegate to library
function callbackup7()  { FunctionSet && FunctionSet.backupSpreadsheet7  && FunctionSet.backupSpreadsheet7(); }
function callbackup24() { FunctionSet && FunctionSet.backupSpreadsheet24 && FunctionSet.backupSpreadsheet24(); }

/** ===== Utilities ===== */
function authorizeScript() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Authorization complete for spreadsheet: ' + ss.getName());
  ss.toast('Script has been authorized!', 'Authorization', 5);
}

/** Delete ALL triggers in this project (avoid duplicates) */
function deleteAllMyProjectTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function(t){
    try { ScriptApp.deleteTrigger(t); } catch (e) { Logger.log('Delete trigger skip: ' + e); }
  });
}

/** Ensure the library creates “Ins Sheet(DNT!)” if missing */
function ensureInsSheetViaLibrary_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Ins Sheet(DNT!)');
  if (sh) return;

  if (typeof FunctionSet === 'undefined' || !FunctionSet.setInstSheet) {
    throw new Error('FunctionSet.setInstSheet() not available to create "Ins Sheet(DNT!)".');
  }
  try {
    FunctionSet.setInstSheet();
    SpreadsheetApp.flush();
    Utilities.sleep(200);
  } catch (e) {
    Logger.log('Library setInstSheet failed: ' + e);
    throw e;
  }

  // Verify
  sh = ss.getSheetByName('Ins Sheet(DNT!)');
  if (!sh) throw new Error('"Ins Sheet(DNT!)" still not found after library call.');
}
