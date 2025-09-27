// === CONFIG ===
const FORM_ID = '12P-7k5ApKJnKExbrQkgLvrnU3tWxyrcfxYIi2W8wGVI';   // e.g. 1a2B3c... from the Form URL
const SOURCE_SHEET = 'For Renting';        // sheet/tab name
const HEADER_ROWS = 1;                       // how many header rows to skip
const COLUMN_INDEX = 1;                      // 1 = column A

function syncSelectMember() {
  const form = FormApp.openById(FORM_ID);
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SOURCE_SHEET);
  if (!sh) throw new Error(`Sheet "${SOURCE_SHEET}" not found`);

  const lastRow = sh.getLastRow();
  if (lastRow <= HEADER_ROWS) return;

  const values = sh.getRange(HEADER_ROWS + 1, COLUMN_INDEX, lastRow - HEADER_ROWS, 1)
    .getValues()
    .flat()
    .map(v => String(v).trim())
    .filter(v => v);

  const uniqueSorted = [...new Set(values)].sort((a, b) => a.localeCompare(b));

  const listItem = form
    .getItems(FormApp.ItemType.LIST)
    .find(it => it.getTitle() === 'Select Member');
  if (!listItem) throw new Error('Dropdown item "Select Member" not found in the Form');

  listItem.asListItem().setChoiceValues(uniqueSorted);
}

