/**
 * Repository for Lokal sheet access.
 */
class RoomRepository extends BaseRepository {
  constructor() {
    super('LOKAL');
  }

  /**
   * Finds a room by kodeLokal.
   *
   * @param {string} kodeLokal Room code.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  findByCode(kodeLokal) {
    try {
      const response = this.findAll();

      if (!response.success) {
        return response;
      }

      const normalizedCode = String(kodeLokal || '').trim().toLowerCase();
      const record = response.data.find(function (item) {
        return String(item.kodeLokal || '').trim().toLowerCase() === normalizedCode;
      }) || null;

      return ResponseHelper.success('Data berhasil diambil.', record);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data lokal.', error);
    }
  }

  /**
   * Soft deletes a room record.
   *
   * @param {string} id Room id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  delete(id) {
    return this.update(id, {
      status: Config.STATUS.DELETED,
      updatedAt: new Date().toISOString()
    });
  }
}
