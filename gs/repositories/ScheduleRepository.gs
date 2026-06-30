/**
 * Repository for Jadwal sheet access.
 */
class ScheduleRepository extends BaseRepository {
  constructor() {
    super('JADWAL');
  }

  /**
   * Finds a schedule by kodeJadwal.
   *
   * @param {string} kodeJadwal Schedule code.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  findByCode(kodeJadwal) {
    try {
      const response = this.findAll();

      if (!response.success) {
        return response;
      }

      const normalizedCode = String(kodeJadwal || '').trim().toLowerCase();
      const record = response.data.find(function (item) {
        return String(item.kodeJadwal || '').trim().toLowerCase() === normalizedCode;
      }) || null;

      return ResponseHelper.success('Data berhasil diambil.', record);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data jadwal.', error);
    }
  }

  /**
   * Soft deletes a schedule record.
   *
   * @param {string} id Schedule id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  delete(id) {
    return this.update(id, {
      status: Config.STATUS.DELETED,
      updatedAt: new Date().toISOString()
    });
  }
}
