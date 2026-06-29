/**
 * Web app entry point.
 *
 * @param {GoogleAppsScript.Events.DoGet} e Request event.
 * @return {GoogleAppsScript.HTML.HtmlOutput} Rendered page.
 */
function doGet(e) {
  initializeDatabase();

  return renderPage('html/pages/' + Config.DEFAULT_PAGE);
}

/**
 * Renders an HTML template.
 *
 * @param {string} pageName Template path without extension.
 * @return {GoogleAppsScript.HTML.HtmlOutput} Rendered page.
 */
function renderPage(pageName) {
  const template = HtmlService.createTemplateFromFile(pageName);
  template.appTitle = Config.APP_NAME;
  template.currentYear = new Date().getFullYear();

  return template.evaluate()
    .setTitle(Config.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Includes an HTML partial.
 *
 * @param {string} filename Template path without extension.
 * @return {string} Template content.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Ensures every configured database sheet exists.
 *
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function initializeDatabase() {
  try {
    const sheets = Object.keys(Config.SHEETS).map(function (sheetKey) {
      const sheet = SheetHelper.getSheet(sheetKey);

      if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, 1).setValues([['id']]);
      }

      return {
        key: sheetKey,
        name: Config.SHEETS[sheetKey],
        lastRow: sheet.getLastRow()
      };
    });

    return ResponseHelper.success('Database siap digunakan.', sheets);
  } catch (error) {
    Logger.log(error);
    return ResponseHelper.error('Gagal menyiapkan database.', error);
  }
}

/**
 * Returns configured sheet metadata.
 *
 * @return {{success: boolean, message: string, data: *}} Standard response.
 */
function getConfiguredSheets() {
  return ResponseHelper.success('Konfigurasi sheet berhasil diambil.', Config.SHEETS);
}

/**
 * Reads all records from a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function getDatabaseRecords(sheetKey) {
  return new BaseRepository(sheetKey).findAll();
}

/**
 * Reads one record from a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @param {string} id Record id.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function getDatabaseRecordById(sheetKey, id) {
  return new BaseRepository(sheetKey).findById(id);
}

/**
 * Creates one record in a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @param {Object} payload Record data.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function createDatabaseRecord(sheetKey, payload) {
  return new BaseRepository(sheetKey).create(payload);
}

/**
 * Updates one record in a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @param {string} id Record id.
 * @param {Object} payload Record data.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function updateDatabaseRecord(sheetKey, id, payload) {
  return new BaseRepository(sheetKey).update(id, payload);
}

/**
 * Deletes one record from a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @param {string} id Record id.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function deleteDatabaseRecord(sheetKey, id) {
  return new BaseRepository(sheetKey).delete(id);
}
