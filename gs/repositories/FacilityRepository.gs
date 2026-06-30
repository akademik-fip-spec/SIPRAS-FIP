/**
 * Repository for Fasilitas sheet access.
 */
class FacilityRepository extends BaseRepository {
  constructor() {
    super('FASILITAS');
  }

  /**
   * Finds a facility by kodeFasilitas.
   *
   * @param {string} kodeFasilitas Facility code.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  findByCode(kodeFasilitas) {
    try {
      const response = this.findAll();

      if (!response.success) {
        return response;
      }

      const normalizedCode = String(kodeFasilitas || '').trim().toLowerCase();
      const record = response.data.find(function (item) {
        return String(item.kodeFasilitas || '').trim().toLowerCase() === normalizedCode;
      }) || null;

      return ResponseHelper.success('Data berhasil diambil.', record);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data fasilitas.', error);
    }
  }

  /**
   * Soft deletes a facility record.
   *
   * @param {string} id Facility id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  delete(id) {
    return this.update(id, {
      status: Config.STATUS.DELETED,
      updatedAt: new Date().toISOString()
    });
  }
}
