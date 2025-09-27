//function showUrls() {
//  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Matrix Sheet Directory");
//  
//  // Get the data ranges
//  var urlRange = sheet.getRange("D2:D" + sheet.getLastRow());
//  var nameRange = sheet.getRange("F2:F" + sheet.getLastRow());
//  var groupRange = sheet.getRange("C2:C" + sheet.getLastRow());
//  
//  var urls = urlRange.getValues().map(row => row[0]);
//  var names = nameRange.getValues().map(row => row[0]);
//  var groups = groupRange.getValues().map(row => row[0]);
//  
//  // Create an object to store URLs and names by group
//  var groupedData = {};
//  
//  urls.forEach(function(url, index) {
//    if (url) {  // Only process non-empty URLs
//      var group = groups[index];
//      var name = names[index] || "Directory " + (index + 1);
//      
//      if (!groupedData[group]) {
//        groupedData[group] = [];
//      }
//      
//      groupedData[group].push({ url: url, name: name });
//    }
//  });
//  
//  // Build the HTML
//  var html = `
//    <html>
//    <head>
//      <style>
//        body {
//          font-family: Arial, sans-serif;
//          background-color: #f7f7f7;
//          padding: 20px;
//        }
//        h1 {
//          color: #333;
//          text-align: center;
//        }
//        h2 {
//          color: #444;
//          margin-top: 20px;
//        }
//        button {
//          background-color: #4CAF50;
//          border: none;
//          color: white;
//          padding: 10px 20px;
//          text-align: center;
//          text-decoration: none;
//          display: inline-block;
//          font-size: 14px;
//          margin: 10px 5px;
//          cursor: pointer;
//          border-radius: 5px;
//          transition: background-color 0.3s ease;
//        }
//        button:hover {
//          background-color: #45a049;
//        }
//        .group {
//          margin-bottom: 20px;
//        }
//      </style>
//    </head>
//    <body>
//      <h1>Select File</h1>
//  `;
//  
//  // Iterate through the groups and create sections with buttons
//  for (var group in groupedData) {
//    html += `<div class="group"><h2>${group}</h2>`;
//    
//    groupedData[group].forEach(function(item) {
//      html += `<button onclick="window.open('${item.url}')">${item.name}</button><br>`;
//    });
//    
//    html += `</div>`;
//  }
//  
//  html += `
//    </body>
//    </html>
//  `;
//  
//  var userInterface = HtmlService.createHtmlOutput(html)
//                                 .setWidth(300)
//                                 .setHeight(500);
//  
//  // Display the HTML in a sidebar within the Google Sheet
//  SpreadsheetApp.getUi().showSidebar(userInterface);
//}
//