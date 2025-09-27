//Library Code - 1LCMQVuDk-GznjUvO637F0szJKo5jrdEISSaCLJkg2atIiItWuGw-1YzD
function Initialsetup() {
  FunctionSet.setupsheet();
  FunctionSet.setAccess();
  FunctionSet.setempinfo();
  createInstallableTrigger();
}
function byebye() {
  FunctionSet.byebye();
}
function SetAccess() {
  FunctionSet.setAccess();
}

const M_TITLE = 'Function';
//function onOpen(e) {

function onOpenTrigger() {
FunctionSet.setAccess();
FunctionSet.showUrls();
const menu = SpreadsheetApp.getUi().createMenu(M_TITLE)
  menu
    .addItem('Update Access', 'SetAccess')
    .addItem('Directory', 'FunctionSet.showUrls')
    .addToUi();
}

function createInstallableTrigger() {
  ScriptApp.newTrigger('onOpenTrigger')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();
}

function callbackup7() {
  FunctionSet.backupSpreadsheet7();
}
function callbackup24() {
  FunctionSet.backupSpreadsheet24();
}

function authorizeScript() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Authorization complete for spreadsheet: ' + spreadsheet.getName());
  spreadsheet.toast('Script has been authorized!', 'Authorization', 5);
}
//
//function createDailyTrigger() {
//  // Deletes any existing triggers for this function to avoid duplicates
//  deleteTriggers('callbackup24');
//  
//  // Creates a new daily trigger
//  ScriptApp.newTrigger('callbackup24')
//    .timeBased()
//    .everyDays(1) // Runs every day
//    .atHour(0)    // Runs at midnight (0 means 00:00)
//    .create();
//}
//
//// Helper function to delete existing triggers for a specific function
//function deleteTriggers(functionName) {
//  var allTriggers = ScriptApp.getProjectTriggers();
//  for (var i = 0; i < allTriggers.length; i++) {
//    if (allTriggers[i].getHandlerFunction() === functionName) {
//      ScriptApp.deleteTrigger(allTriggers[i]);
//    }
//  }
//}

//update scope
//{
//  "timeZone": "Asia/Yangon",
//  "exceptionLogging": "STACKDRIVER",
//  "runtimeVersion": "V8",
//  "dependencies": {
//    "libraries": [
//      {
//        "userSymbol": "FunctionSet",
//        "version": "0",
//        "libraryId": "1XVOZdjYvOvlM9T3ZgrXqUwl5E-yBwuNk64rI 6Rlf-AcIbgKTOTzPTnTL",
//        "developmentMode": true
//      }
//    ]
//  },
//    "oauthScopes": [
//    "https://www.googleapis.com/auth/spreadsheets",
//    "https://www.googleapis.com/auth/drive",
//    "https://www.googleapis.com/auth/script.container.ui",
//    "https://www.googleapis.com/auth/script.external_request",
//    "https://www.googleapis.com/auth/script.scriptapp",
//    "https://www.googleapis.com/auth/script.send_mail",
//    "https://www.googleapis.com/auth/userinfo.email"
//  ]
//}