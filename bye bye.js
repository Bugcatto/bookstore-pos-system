function byebye() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ownerEmail = ss.getOwner().getEmail();
    var editors = ss.getEditors();
    
    // Step: Remove access for editors (excluding the owner)
    editors.forEach(function(editor) {
      var editorEmail = editor.getEmail();
      if (editorEmail !== ownerEmail) {
        ss.removeEditor(editorEmail);
        Logger.log("Removed access for: " + editorEmail);
      }
    });

    // Show a toast message with the result
    var toastMessage = "Access management completed. Removed access for all editors except the owner.";
    ss.toast(toastMessage, "Access Management", 5);

    Logger.log(toastMessage);
  } catch (error) {
    // Log any unexpected errors
    Logger.log("Error in removeAllAccessExceptOwner: " + error);
    // Show an error toast message
    ss.toast("Error in access management. Check the logs for details.", "Error", 5);
  }
}
