/**
 * Repository for Inventaris sheet access.
 */
class InventoryRepository extends BaseRepository {
  constructor() {
    super('INVENTARIS');
  }

  /**
   * Finds an inventory item by kodeInventaris.
   *
   * @param {string} kodeInventaris Inventory code.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  findByCode(kodeInventaris) {
    try {
      const response = this.findAll();

      if (!response.success) {
        return response;
      }

      const normalizedCode = String(kodeInventaris || '').trim().toLowerCase();
      const record = response.data.find(function (item) {
        return String(item.kodeInventaris || '').trim().toLowerCase() === normalizedCode;
      }) || null;

      return ResponseHelper.success('Data berhasil diambil.', record);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data inventaris.', error);
    }
  }

  /**
   * Finds an inventory item by nomorInventaris.
   *
   * @param {string} nomorInventaris Inventory number.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  findByInventoryNumber(nomorInventaris) {
    try {
      const response = this.findAll();

      if (!response.success) {
        return response;
      }

      const normalizedNumber = String(nomorInventaris || '').trim().toLowerCase();
      const record = response.data.find(function (item) {
        return String(item.nomorInventaris || '').trim().toLowerCase() === normalizedNumber;
      }) || null;

      return ResponseHelper.success('Data berhasil diambil.', record);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data inventaris.', error);
    }
  }

  /**
   * Soft deletes an inventory record.
   *
   * @param {string} id Inventory id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  delete(id) {
    return this.update(id, {
      status: Config.STATUS.DELETED,
      updatedAt: new Date().toISOString()
    });
  }
}
