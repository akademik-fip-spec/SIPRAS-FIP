/**
 * Repository for Gedung sheet access.
 */
class BuildingRepository extends BaseRepository {
  constructor() {
    super('GEDUNG');
  }

  /**
   * Finds a building by kodeGedung.
   *
   * @param {string} kodeGedung Building code.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  findByCode(kodeGedung) {
    try {
      const response = this.findAll();

      if (!response.success) {
        return response;
      }

      const normalizedCode = String(kodeGedung || '').trim().toLowerCase();
      const record = response.data.find(function (item) {
        return String(item.kodeGedung || '').trim().toLowerCase() === normalizedCode;
      }) || null;

      return ResponseHelper.success('Data berhasil diambil.', record);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data gedung.', error);
    }
  }

  /**
   * Soft deletes a building record.
   *
   * @param {string} id Building id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  delete(id) {
    return this.update(id, {
      status: Config.STATUS.DELETED,
      updatedAt: new Date().toISOString()
    });
  }
}
