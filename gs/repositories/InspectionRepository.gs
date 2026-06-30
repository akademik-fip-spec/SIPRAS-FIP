/**
 * Repository for Pemeriksaan sheet access.
 */
class InspectionRepository extends BaseRepository {
  constructor() {
    super('PEMERIKSAAN');
  }

  /**
   * Finds an inspection by nomorPemeriksaan.
   *
   * @param {string} nomorPemeriksaan Inspection number.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  findByNumber(nomorPemeriksaan) {
    try {
      const response = this.findAll();

      if (!response.success) {
        return response;
      }

      const normalizedNumber = String(nomorPemeriksaan || '').trim().toLowerCase();
      const record = response.data.find(function (item) {
        return String(item.nomorPemeriksaan || '').trim().toLowerCase() === normalizedNumber;
      }) || null;

      return ResponseHelper.success('Data berhasil diambil.', record);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data pemeriksaan.', error);
    }
  }

  /**
   * Soft deletes an inspection record.
   *
   * @param {string} id Inspection id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  delete(id) {
    return this.update(id, {
      status: Config.STATUS.DELETED,
      updatedAt: new Date().toISOString()
    });
  }
}
