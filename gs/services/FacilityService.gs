/**
 * Service for Data Fasilitas business rules.
 */
class FacilityService {
  constructor() {
    this.repository = new FacilityRepository();
    this.roomService = new RoomService();
    this.validStatuses = [Config.STATUS.ACTIVE, Config.STATUS.INACTIVE];
    this.validCategories = ['Furniture', 'Elektronik', 'Pembelajaran', 'Jaringan', 'Keamanan', 'Utilitas', 'Lainnya'];
    this.validConditions = ['Sangat Baik', 'Baik', 'Cukup', 'Rusak Ringan', 'Rusak Berat'];
  }

  /**
   * Gets all non-deleted facilities with relation labels.
   *
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getFacilities() {
    try {
      const response = this.repository.findAll();

      if (!response.success) {
        return response;
      }

      const roomMap = this.getRoomMap();
      const records = response.data.filter(function (facility) {
        return facility.status !== Config.STATUS.DELETED;
      }).map(function (facility) {
        const room = roomMap[facility.lokalId] || {};
        facility.lokalNama = room.namaLokal || '';
        facility.gedungNama = room.gedungNama || '';
        facility.gedungId = facility.gedungId || room.gedungId || '';
        return facility;
      });

      return ResponseHelper.success('Data fasilitas berhasil diambil.', records);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data fasilitas.', error);
    }
  }

  /**
   * Gets a facility by id.
   *
   * @param {string} id Facility id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getFacility(id) {
    try {
      const response = this.repository.findById(id);

      if (!response.success || !response.data || response.data.status === Config.STATUS.DELETED) {
        return ResponseHelper.error('Data fasilitas tidak ditemukan.', 'Record id: ' + id);
      }

      return ResponseHelper.success('Data fasilitas berhasil diambil.', this.enrichFacility(response.data));
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data fasilitas.', error);
    }
  }

  /**
   * Creates a facility.
   *
   * @param {Object} data Facility payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  createFacility(data) {
    try {
      const payload = this.normalizePayload(data);
      const validation = this.validatePayload(payload);

      if (!validation.success) {
        return validation;
      }

      const duplicate = this.findDuplicateCode(payload.kodeFasilitas, '');

      if (duplicate) {
        return ResponseHelper.error('Kode fasilitas sudah digunakan.', 'kodeFasilitas harus unik.');
      }

      const room = this.roomService.getRoom(payload.lokalId);
      const now = new Date().toISOString();
      payload.gedungId = room.data.gedungId;
      payload.createdAt = now;
      payload.updatedAt = now;

      return this.repository.create(payload);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menyimpan data fasilitas.', error);
    }
  }

  /**
   * Updates a facility.
   *
   * @param {string} id Facility id.
   * @param {Object} data Facility payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  updateFacility(id, data) {
    try {
      const existing = this.getFacility(id);

      if (!existing.success) {
        return existing;
      }

      const payload = this.normalizePayload(data);
      const validation = this.validatePayload(payload);

      if (!validation.success) {
        return validation;
      }

      const duplicate = this.findDuplicateCode(payload.kodeFasilitas, id);

      if (duplicate) {
        return ResponseHelper.error('Kode fasilitas sudah digunakan.', 'kodeFasilitas harus unik.');
      }

      const room = this.roomService.getRoom(payload.lokalId);
      payload.gedungId = room.data.gedungId;
      payload.createdAt = existing.data.createdAt || new Date().toISOString();
      payload.updatedAt = new Date().toISOString();

      return this.repository.update(id, payload);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal memperbarui data fasilitas.', error);
    }
  }

  /**
   * Soft deletes a facility.
   *
   * @param {string} id Facility id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  deleteFacility(id) {
    try {
      const existing = this.getFacility(id);

      if (!existing.success) {
        return existing;
      }

      return this.repository.delete(id);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menghapus data fasilitas.', error);
    }
  }

  /**
   * Normalizes facility payload.
   *
   * @param {Object} data Facility payload.
   * @return {Object} Normalized payload.
   */
  normalizePayload(data) {
    const payload = data || {};

    return {
      kodeFasilitas: String(payload.kodeFasilitas || '').trim(),
      namaFasilitas: String(payload.namaFasilitas || '').trim(),
      kategori: String(payload.kategori || '').trim(),
      gedungId: String(payload.gedungId || '').trim(),
      lokalId: String(payload.lokalId || '').trim(),
      jumlah: String(payload.jumlah || '').trim(),
      satuan: String(payload.satuan || '').trim(),
      kondisi: String(payload.kondisi || '').trim(),
      keterangan: String(payload.keterangan || '').trim(),
      status: String(payload.status || Config.STATUS.ACTIVE).trim()
    };
  }

  /**
   * Validates facility payload.
   *
   * @param {Object} payload Normalized payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  validatePayload(payload) {
    const errors = ValidationHelper.required(payload, ['kodeFasilitas', 'namaFasilitas', 'kategori', 'lokalId', 'jumlah', 'kondisi', 'status']);
    const amountNumberError = ValidationHelper.number(payload.jumlah, 'Jumlah');
    const amountMinimumError = amountNumberError ? null : ValidationHelper.minNumber(payload.jumlah, 1, 'Jumlah');
    const categoryError = ValidationHelper.inList(payload.kategori, this.validCategories, 'Kategori');
    const conditionError = ValidationHelper.inList(payload.kondisi, this.validConditions, 'Kondisi');
    const statusError = ValidationHelper.inList(payload.status, this.validStatuses, 'Status');
    const room = ValidationHelper.isBlank(payload.lokalId) ? null : this.roomService.getRoom(payload.lokalId);

    [categoryError, conditionError, statusError, amountNumberError, amountMinimumError].forEach(function (error) {
      if (error) {
        errors.push(error);
      }
    });

    if (room && !room.success) {
      errors.push('Lokal tidak ditemukan.');
    }

    if (errors.length > 0) {
      return ResponseHelper.error('Validasi data fasilitas gagal.', errors.join(' '));
    }

    return ResponseHelper.success('Validasi berhasil.', {});
  }

  /**
   * Finds a non-deleted facility with the same code.
   *
   * @param {string} kodeFasilitas Facility code.
   * @param {string} ignoredId Record id to ignore.
   * @return {?Object} Duplicate record or null.
   */
  findDuplicateCode(kodeFasilitas, ignoredId) {
    const response = this.repository.findByCode(kodeFasilitas);

    if (!response.success || !response.data) {
      return null;
    }

    if (response.data.status === Config.STATUS.DELETED || response.data.id === ignoredId) {
      return null;
    }

    return response.data;
  }

  /**
   * Enriches a facility with room and building labels.
   *
   * @param {Object} facility Facility record.
   * @return {Object} Enriched facility.
   */
  enrichFacility(facility) {
    const room = this.roomService.getRoom(facility.lokalId);

    if (room.success) {
      facility.lokalNama = room.data.namaLokal;
      facility.gedungNama = room.data.gedungNama;
      facility.gedungId = facility.gedungId || room.data.gedungId;
    }

    return facility;
  }

  /**
   * Builds a map of room ids to room data.
   *
   * @return {Object} Room id map.
   */
  getRoomMap() {
    const response = this.roomService.getRooms();
    const map = {};

    if (!response.success) {
      return map;
    }

    response.data.forEach(function (room) {
      map[room.id] = room;
    });

    return map;
  }
}
