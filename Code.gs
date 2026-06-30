/**
 * Web app entry point.
 *
 * @param {GoogleAppsScript.Events.DoGet} e Request event.
 * @return {GoogleAppsScript.HTML.HtmlOutput} Rendered page.
 */
function doGet(e) {
  initializeDatabase();

  const page = getRequestedPage(e);
  return renderPage(page);
}

/**
 * Resolves the requested UI page.
 *
 * @param {GoogleAppsScript.Events.DoGet} e Request event.
 * @return {string} Page key.
 */
function getRequestedPage(e) {
  const page = e && e.parameter && e.parameter.page ? e.parameter.page : Config.DEFAULT_PAGE;
  const allowedPages = ['home', 'dashboard', 'building', 'room', 'facility', 'inventory'];

  return allowedPages.indexOf(page) === -1 ? Config.DEFAULT_PAGE : page;
}

/**
 * Renders the main HTML layout.
 *
 * @param {string} page Page key.
 * @return {GoogleAppsScript.HTML.HtmlOutput} Rendered page.
 */
function renderPage(page) {
  const template = HtmlService.createTemplateFromFile('html/layouts/main');
  template.appTitle = Config.APP_NAME;
  template.appVersion = Config.APP_VERSION;
  template.currentYear = new Date().getFullYear();
  template.currentPage = page;
  template.pageContent = include('html/pages/' + page);

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
  const template = HtmlService.createTemplateFromFile(filename);
  template.appTitle = Config.APP_NAME;
  template.appVersion = Config.APP_VERSION;
  template.currentYear = new Date().getFullYear();
  template.currentPage = typeof currentPage === 'undefined' ? Config.DEFAULT_PAGE : currentPage;

  return template.evaluate().getContent();
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

/**
 * Gets active building records.
 *
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function getBuildings() {
  return new BuildingService().getBuildings();
}

/**
 * Gets one building record.
 *
 * @param {string} id Building id.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function getBuilding(id) {
  return new BuildingService().getBuilding(id);
}

/**
 * Creates a building record.
 *
 * @param {Object} data Building payload.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function createBuilding(data) {
  return new BuildingService().createBuilding(data);
}

/**
 * Updates a building record.
 *
 * @param {string} id Building id.
 * @param {Object} data Building payload.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function updateBuilding(id, data) {
  return new BuildingService().updateBuilding(id, data);
}

/**
 * Soft deletes a building record.
 *
 * @param {string} id Building id.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function deleteBuilding(id) {
  return new BuildingService().deleteBuilding(id);
}

/**
 * Gets active room records.
 *
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function getRooms() {
  return new RoomService().getRooms();
}

/**
 * Gets one room record.
 *
 * @param {string} id Room id.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function getRoom(id) {
  return new RoomService().getRoom(id);
}

/**
 * Creates a room record.
 *
 * @param {Object} data Room payload.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function createRoom(data) {
  return new RoomService().createRoom(data);
}

/**
 * Updates a room record.
 *
 * @param {string} id Room id.
 * @param {Object} data Room payload.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function updateRoom(id, data) {
  return new RoomService().updateRoom(id, data);
}

/**
 * Soft deletes a room record.
 *
 * @param {string} id Room id.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function deleteRoom(id) {
  return new RoomService().deleteRoom(id);
}

/**
 * Gets active facility records.
 *
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function getFacilities() {
  return new FacilityService().getFacilities();
}

/**
 * Gets one facility record.
 *
 * @param {string} id Facility id.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function getFacility(id) {
  return new FacilityService().getFacility(id);
}

/**
 * Creates a facility record.
 *
 * @param {Object} data Facility payload.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function createFacility(data) {
  return new FacilityService().createFacility(data);
}

/**
 * Updates a facility record.
 *
 * @param {string} id Facility id.
 * @param {Object} data Facility payload.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function updateFacility(id, data) {
  return new FacilityService().updateFacility(id, data);
}

/**
 * Soft deletes a facility record.
 *
 * @param {string} id Facility id.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function deleteFacility(id) {
  return new FacilityService().deleteFacility(id);
}

/**
 * Gets active inventory records.
 *
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function getInventories() {
  return new InventoryService().getInventories();
}

/**
 * Gets one inventory record.
 *
 * @param {string} id Inventory id.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function getInventory(id) {
  return new InventoryService().getInventory(id);
}

/**
 * Creates an inventory record.
 *
 * @param {Object} data Inventory payload.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function createInventory(data) {
  return new InventoryService().createInventory(data);
}

/**
 * Updates an inventory record.
 *
 * @param {string} id Inventory id.
 * @param {Object} data Inventory payload.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function updateInventory(id, data) {
  return new InventoryService().updateInventory(id, data);
}

/**
 * Soft deletes an inventory record.
 *
 * @param {string} id Inventory id.
 * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
 */
function deleteInventory(id) {
  return new InventoryService().deleteInventory(id);
}
