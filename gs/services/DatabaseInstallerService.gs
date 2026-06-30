/**
 * Service for installing and initializing the Google Sheets database.
 */
class DatabaseInstallerService {
  constructor() {
    this.headerBackground = '#0b5cab';
    this.headerFontColor = '#ffffff';
  }

  /**
   * Initializes every configured database sheet.
   *
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  initializeDatabase() {
    try {
      const spreadsheet = getActiveDatabase();
      const summary = this.createSummary();

      Object.keys(Config.SHEETS).forEach((sheetKey) => {
        const result = this.initializeSheet(spreadsheet, sheetKey);
        summary.sheets.push(result);
        this.updateSummary(summary, result);
      });

      summary.totalSheet = summary.sheets.length;

      return ResponseHelper.success('Database SIPRAS-FIP siap digunakan.', summary);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menyiapkan database.', error);
    }
  }

  /**
   * Initializes one configured sheet.
   *
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet Active spreadsheet.
   * @param {string} sheetKey Config sheet key.
   * @return {Object} Sheet initialization result.
   */
  initializeSheet(spreadsheet, sheetKey) {
    const sheetConfig = SheetHelper.getConfig(sheetKey);
    let sheet = spreadsheet.getSheetByName(sheetConfig.name);
    const result = {
      key: sheetKey,
      name: sheetConfig.name,
      sheetDibuat: false,
      sheetSudahAda: false,
      headerDibuat: false,
      headerSesuai: false,
      warning: ''
    };

    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetConfig.name);
      result.sheetDibuat = true;
    } else {
      result.sheetSudahAda = true;
    }

    const currentHeaders = getHeaders(sheet);

    if (currentHeaders.length === 0) {
      this.writeHeaders(sheet, sheetConfig.headers);
      result.headerDibuat = true;
      result.headerSesuai = true;
      this.formatHeader(sheet, sheetConfig.headers.length);
      return result;
    }

    if (this.headersMatch(currentHeaders, sheetConfig.headers)) {
      result.headerSesuai = true;
      this.formatHeader(sheet, sheetConfig.headers.length);
      return result;
    }

    result.warning = 'Header sheet ' + sheetConfig.name + ' berbeda dengan Config.';
    Logger.log(result.warning + ' Current: ' + currentHeaders.join(', ') + ' Expected: ' + sheetConfig.headers.join(', '));
    return result;
  }

  /**
   * Writes configured headers to a sheet.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Target sheet.
   * @param {string[]} headers Configured headers.
   */
  writeHeaders(sheet, headers) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  /**
   * Formats a header row without changing user data rows.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Target sheet.
   * @param {number} columnCount Header column count.
   */
  formatHeader(sheet, columnCount) {
    const headerRange = sheet.getRange(1, 1, 1, columnCount);

    sheet.setFrozenRows(1);
    headerRange
      .setFontWeight('bold')
      .setBackground(this.headerBackground)
      .setFontColor(this.headerFontColor)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
    sheet.autoResizeColumns(1, columnCount);
    this.ensureFilter(sheet, columnCount);
  }

  /**
   * Ensures a filter exists for the configured header range.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Target sheet.
   * @param {number} columnCount Header column count.
   */
  ensureFilter(sheet, columnCount) {
    if (sheet.getFilter()) {
      return;
    }

    const rowCount = Math.max(sheet.getLastRow(), 1);
    sheet.getRange(1, 1, rowCount, columnCount).createFilter();
  }

  /**
   * Checks exact header equality.
   *
   * @param {string[]} currentHeaders Current sheet headers.
   * @param {string[]} expectedHeaders Configured headers.
   * @return {boolean} True when headers are equal.
   */
  headersMatch(currentHeaders, expectedHeaders) {
    if (currentHeaders.length !== expectedHeaders.length) {
      return false;
    }

    return expectedHeaders.every(function (header, index) {
      return currentHeaders[index] === header;
    });
  }

  /**
   * Creates an empty installer summary.
   *
   * @return {Object} Summary object.
   */
  createSummary() {
    return {
      totalSheet: 0,
      sheetDibuat: 0,
      sheetSudahAda: 0,
      headerDibuat: 0,
      headerSesuai: 0,
      warning: 0,
      sheets: []
    };
  }

  /**
   * Updates installer summary counters.
   *
   * @param {Object} summary Summary object.
   * @param {Object} result Sheet initialization result.
   */
  updateSummary(summary, result) {
    summary.sheetDibuat += result.sheetDibuat ? 1 : 0;
    summary.sheetSudahAda += result.sheetSudahAda ? 1 : 0;
    summary.headerDibuat += result.headerDibuat ? 1 : 0;
    summary.headerSesuai += result.headerSesuai ? 1 : 0;
    summary.warning += result.warning ? 1 : 0;
  }
}
