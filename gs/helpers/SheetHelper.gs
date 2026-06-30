/**
 * Resolves a configured sheet key into a Google Sheet name.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @return {string} Configured sheet name.
 */
function resolveSheetName(sheetKey) {
  try {
    const directConfig = Config.SHEETS[sheetKey];

    if (directConfig) {
      return typeof directConfig === 'string' ? directConfig : directConfig.name;
    }

    const matchedKey = Object.keys(Config.SHEETS).find(function (key) {
      const sheetConfig = Config.SHEETS[key];
      const sheetName = typeof sheetConfig === 'string' ? sheetConfig : sheetConfig.name;
      return sheetName === sheetKey;
    });

    if (matchedKey) {
      return resolveSheetName(matchedKey);
    }

    throw new Error('Sheet tidak terdaftar di Config.');
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Resolves a configured sheet key into its sheet config.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @return {{name: string, headers: string[]}} Sheet config.
 */
function resolveSheetConfig(sheetKey) {
  try {
    const directConfig = Config.SHEETS[sheetKey];

    if (directConfig) {
      return typeof directConfig === 'string'
        ? { name: directConfig, headers: ['id'] }
        : directConfig;
    }

    const sheetName = resolveSheetName(sheetKey);
    const matchedKey = Object.keys(Config.SHEETS).find(function (key) {
      return resolveSheetName(key) === sheetName;
    });

    return matchedKey ? resolveSheetConfig(matchedKey) : { name: sheetName, headers: ['id'] };
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Gets the active spreadsheet.
 *
 * @return {GoogleAppsScript.Spreadsheet.Spreadsheet} Active spreadsheet.
 */
function getActiveDatabase() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Gets or creates a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @return {GoogleAppsScript.Spreadsheet.Sheet} Target sheet.
 */
function getSheet(sheetKey) {
  try {
    const sheetName = resolveSheetName(sheetKey);
    const spreadsheet = getActiveDatabase();
    let sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }

    return sheet;
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Gets the last row number for a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @return {number} Last row number.
 */
function getLastRow(sheetKey) {
  try {
    return getSheet(sheetKey).getLastRow();
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Reads the header row from a sheet.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Target sheet.
 * @return {string[]} Header values.
 */
function getHeaders(sheet) {
  try {
    if (sheet.getLastRow() === 0) {
      return [];
    }

    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .filter(function (header) {
        return header !== '';
      });
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Ensures a sheet has headers for the provided record.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Target sheet.
 * @param {Object} record Record data.
 * @return {string[]} Complete header list.
 */
function ensureHeaders(sheet, record) {
  try {
    const configuredHeaders = getConfiguredHeadersBySheetName(sheet.getName());
    const recordHeaders = Object.keys(record || {}).filter(function (key) {
      return key !== 'id';
    });
    const requiredHeaders = configuredHeaders.concat(recordHeaders.filter(function (header) {
      return configuredHeaders.indexOf(header) === -1;
    }));
    let headers = getHeaders(sheet);

    if (headers.length === 0) {
      sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
      return requiredHeaders;
    }

    const missingHeaders = requiredHeaders.filter(function (header) {
      return headers.indexOf(header) === -1;
    });

    if (missingHeaders.length > 0) {
      sheet.getRange(1, headers.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
      headers = headers.concat(missingHeaders);
    }

    return headers;
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Gets configured headers by physical sheet name.
 *
 * @param {string} sheetName Sheet name.
 * @return {string[]} Configured headers.
 */
function getConfiguredHeadersBySheetName(sheetName) {
  const matchedKey = Object.keys(Config.SHEETS).find(function (key) {
    return resolveSheetName(key) === sheetName;
  });

  if (!matchedKey) {
    return ['id'];
  }

  const sheetConfig = resolveSheetConfig(matchedKey);
  return sheetConfig.headers && sheetConfig.headers.length > 0 ? sheetConfig.headers.slice() : ['id'];
}

/**
 * Converts row values into an object using sheet headers.
 *
 * @param {string[]} headers Header names.
 * @param {*[]} row Row values.
 * @return {Object} Row object.
 */
function mapRow(headers, row) {
  try {
    const record = {};

    headers.forEach(function (header, index) {
      record[header] = row[index];
    });

    return record;
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Finds a row index by record id.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet Target sheet.
 * @param {string} id Record id.
 * @return {number} Row index, or -1 when not found.
 */
function findRowIndexById(sheet, id) {
  try {
    const lastRow = sheet.getLastRow();

    if (!id || lastRow <= 1) {
      return -1;
    }

    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

    for (let index = 0; index < ids.length; index += 1) {
      if (String(ids[index][0]) === String(id)) {
        return index + 2;
      }
    }

    return -1;
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Reads all records from a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @return {Object[]} Records.
 */
function getAll(sheetKey) {
  try {
    const sheet = getSheet(sheetKey);
    const lastRow = sheet.getLastRow();
    const headers = getHeaders(sheet);

    if (lastRow <= 1 || headers.length === 0) {
      return [];
    }

    return sheet.getRange(2, 1, lastRow - 1, headers.length).getValues().map(function (row) {
      return mapRow(headers, row);
    });
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Reads a single record by id from a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @param {string} id Record id.
 * @return {?Object} Matching record, or null.
 */
function getById(sheetKey, id) {
  try {
    const sheet = getSheet(sheetKey);
    const rowIndex = findRowIndexById(sheet, id);

    if (rowIndex === -1) {
      return null;
    }

    const headers = getHeaders(sheet);
    const row = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
    return mapRow(headers, row);
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Generates a unique id for a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @return {string} Generated id.
 */
function generateId(sheetKey) {
  try {
    const sheetName = resolveSheetName(sheetKey);
    const prefix = sheetName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return prefix + '-' + timestamp + '-' + random;
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Inserts a record into a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @param {Object} payload Record data.
 * @return {Object} Inserted record.
 */
function insert(sheetKey, payload) {
  try {
    const sheet = getSheet(sheetKey);
    const record = Object.assign({}, payload || {});

    if (!record.id) {
      record.id = generateId(sheetKey);
    }

    const headers = ensureHeaders(sheet, record);
    const row = headers.map(function (header) {
      return record[header] === undefined ? '' : record[header];
    });

    sheet.appendRow(row);
    return record;
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Updates a record by id in a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @param {string} id Record id.
 * @param {Object} payload Record data.
 * @return {?Object} Updated record, or null.
 */
function update(sheetKey, id, payload) {
  try {
    const sheet = getSheet(sheetKey);
    const rowIndex = findRowIndexById(sheet, id);

    if (rowIndex === -1) {
      return null;
    }

    const current = getById(sheetKey, id);
    const record = Object.assign({}, current, payload || {}, { id: id });
    const headers = ensureHeaders(sheet, record);
    const row = headers.map(function (header) {
      return record[header] === undefined ? '' : record[header];
    });

    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    return record;
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Deletes a record row by id from a configured sheet.
 *
 * @param {string} sheetKey Key from Config.SHEETS.
 * @param {string} id Record id.
 * @return {boolean} True when a row was deleted.
 */
function deleteRecord(sheetKey, id) {
  try {
    const sheet = getSheet(sheetKey);
    const rowIndex = findRowIndexById(sheet, id);

    if (rowIndex === -1) {
      return false;
    }

    sheet.deleteRow(rowIndex);
    return true;
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * Sheet helper namespace.
 */
const SheetHelper = {
  getSheet: getSheet,
  getConfig: resolveSheetConfig,
  getAll: getAll,
  getById: getById,
  insert: insert,
  update: update,
  delete: deleteRecord,
  generateId: generateId,
  getLastRow: getLastRow
};
