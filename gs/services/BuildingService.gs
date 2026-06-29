/**
 * Service for Data Gedung business rules.
 */
class BuildingService {
  constructor() {
    this.repository = new BuildingRepository();
    this.validStatuses = [Config.STATUS.ACTIVE, Config.STATUS.INACTIVE];
  }

  /**
   * Gets all non-deleted buildings.
   *
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getBuildings() {
    try {
      const response = this.repository.findAll();

      if (!response.success) {
        return response;
      }

      const records = response.data.filter(function (building) {
        return building.status !== Config.STATUS.DELETED;
      });

      return ResponseHelper.success('Data gedung berhasil diambil.', records);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data gedung.', error);
    }
  }

  /**
   * Gets a building by id.
   *
   * @param {string} id Building id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getBuilding(id) {
    try {
      const response = this.repository.findById(id);

      if (!response.success || !response.data || response.data.status === Config.STATUS.DELETED) {
        return ResponseHelper.error('Data gedung tidak ditemukan.', 'Record id: ' + id);
      }

      return ResponseHelper.success('Data gedung berhasil diambil.', response.data);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data gedung.', error);
    }
  }

  /**
   * Creates a building.
   *
   * @param {Object} data Building payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  createBuilding(data) {
    try {
      const payload = this.normalizePayload(data);
      const validation = this.validatePayload(payload);

      if (!validation.success) {
        return validation;
      }

      const duplicate = this.findDuplicateCode(payload.kodeGedung, '');

      if (duplicate) {
        return ResponseHelper.error('Kode gedung sudah digunakan.', 'kodeGedung harus unik.');
      }

      const now = new Date().toISOString();
      payload.createdAt = now;
      payload.updatedAt = now;

      return this.repository.create(payload);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menyimpan data gedung.', error);
    }
  }

  /**
   * Updates a building.
   *
   * @param {string} id Building id.
   * @param {Object} data Building payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  updateBuilding(id, data) {
    try {
      const existing = this.getBuilding(id);

      if (!existing.success) {
        return existing;
      }

      const payload = this.normalizePayload(data);
      const validation = this.validatePayload(payload);

      if (!validation.success) {
        return validation;
      }

      const duplicate = this.findDuplicateCode(payload.kodeGedung, id);

      if (duplicate) {
        return ResponseHelper.error('Kode gedung sudah digunakan.', 'kodeGedung harus unik.');
      }

      payload.createdAt = existing.data.createdAt || new Date().toISOString();
      payload.updatedAt = new Date().toISOString();

      return this.repository.update(id, payload);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal memperbarui data gedung.', error);
    }
  }

  /**
   * Soft deletes a building.
   *
   * @param {string} id Building id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  deleteBuilding(id) {
    try {
      const existing = this.getBuilding(id);

      if (!existing.success) {
        return existing;
      }

      return this.repository.delete(id);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menghapus data gedung.', error);
    }
  }

  /**
   * Normalizes building payload.
   *
   * @param {Object} data Building payload.
   * @return {Object} Normalized payload.
   */
  normalizePayload(data) {
    const payload = data || {};

    return {
      kodeGedung: String(payload.kodeGedung || '').trim(),
      namaGedung: String(payload.namaGedung || '').trim(),
      alamat: String(payload.alamat || '').trim(),
      deskripsi: String(payload.deskripsi || '').trim(),
      status: String(payload.status || Config.STATUS.ACTIVE).trim()
    };
  }

  /**
   * Validates building payload.
   *
   * @param {Object} payload Normalized payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  validatePayload(payload) {
    const errors = ValidationHelper.required(payload, ['kodeGedung', 'namaGedung']);
    const statusError = ValidationHelper.inList(payload.status, this.validStatuses, 'Status');

    if (statusError) {
      errors.push(statusError);
    }

    if (errors.length > 0) {
      return ResponseHelper.error('Validasi data gedung gagal.', errors.join(' '));
    }

    return ResponseHelper.success('Validasi berhasil.', {});
  }

  /**
   * Finds a non-deleted building with the same code.
   *
   * @param {string} kodeGedung Building code.
   * @param {string} ignoredId Record id to ignore.
   * @return {?Object} Duplicate record or null.
   */
  findDuplicateCode(kodeGedung, ignoredId) {
    const response = this.repository.findByCode(kodeGedung);

    if (!response.success || !response.data) {
      return null;
    }

    if (response.data.status === Config.STATUS.DELETED || response.data.id === ignoredId) {
      return null;
    }

    return response.data;
  }
}
