/**
 * Base repository for Google Sheets access.
 * Repository methods must not contain business validation or business rules.
 */
class BaseRepository {
  /**
   * @param {string} sheetKey Key from Config.SHEETS.
   */
  constructor(sheetKey) {
    this.sheetKey = sheetKey;
  }

  /**
   * Finds all records.
   *
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  findAll() {
    try {
      return ResponseHelper.success('Data berhasil diambil.', SheetHelper.getAll(this.sheetKey));
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data.', error);
    }
  }

  /**
   * Finds one record by id.
   *
   * @param {string} id Record id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  findById(id) {
    try {
      return ResponseHelper.success('Data berhasil diambil.', SheetHelper.getById(this.sheetKey, id));
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data.', error);
    }
  }

  /**
   * Creates a record.
   *
   * @param {Object} payload Record data.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  create(payload) {
    try {
      return ResponseHelper.success('Data berhasil disimpan.', SheetHelper.insert(this.sheetKey, payload));
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menyimpan data.', error);
    }
  }

  /**
   * Updates a record.
   *
   * @param {string} id Record id.
   * @param {Object} payload Record data.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  update(id, payload) {
    try {
      const record = SheetHelper.update(this.sheetKey, id, payload);

      if (!record) {
        return ResponseHelper.error('Data tidak ditemukan.', 'Record id: ' + id);
      }

      return ResponseHelper.success('Data berhasil diperbarui.', record);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal memperbarui data.', error);
    }
  }

  /**
   * Deletes a record.
   *
   * @param {string} id Record id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  delete(id) {
    try {
      const deleted = SheetHelper.delete(this.sheetKey, id);

      if (!deleted) {
        return ResponseHelper.error('Data tidak ditemukan.', 'Record id: ' + id);
      }

      return ResponseHelper.success('Data berhasil dihapus.', { id: id });
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menghapus data.', error);
    }
  }
}
