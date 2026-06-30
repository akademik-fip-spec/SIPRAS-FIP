/**
 * Service for Data Lokal business rules.
 */
class RoomService {
  constructor() {
    this.repository = new RoomRepository();
    this.buildingService = new BuildingService();
    this.validStatuses = [Config.STATUS.ACTIVE, Config.STATUS.INACTIVE];
    this.validTypes = [
      'Ruang Kelas',
      'Laboratorium',
      'Ruang Dosen',
      'Ruang Administrasi',
      'Aula',
      'Ruang Rapat',
      'Gudang',
      'Lainnya'
    ];
  }

  /**
   * Gets all non-deleted rooms with building names.
   *
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getRooms() {
    try {
      const response = this.repository.findAll();

      if (!response.success) {
        return response;
      }

      const buildingMap = this.getBuildingMap();
      const records = response.data.filter(function (room) {
        return room.status !== Config.STATUS.DELETED;
      }).map(function (room) {
        room.gedungNama = buildingMap[room.gedungId] || '';
        return room;
      });

      return ResponseHelper.success('Data lokal berhasil diambil.', records);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data lokal.', error);
    }
  }

  /**
   * Gets a room by id.
   *
   * @param {string} id Room id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getRoom(id) {
    try {
      const response = this.repository.findById(id);

      if (!response.success || !response.data || response.data.status === Config.STATUS.DELETED) {
        return ResponseHelper.error('Data lokal tidak ditemukan.', 'Record id: ' + id);
      }

      const building = this.buildingService.getBuilding(response.data.gedungId);
      response.data.gedungNama = building.success ? building.data.namaGedung : '';

      return ResponseHelper.success('Data lokal berhasil diambil.', response.data);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data lokal.', error);
    }
  }

  /**
   * Creates a room.
   *
   * @param {Object} data Room payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  createRoom(data) {
    try {
      const payload = this.normalizePayload(data);
      const validation = this.validatePayload(payload);

      if (!validation.success) {
        return validation;
      }

      const duplicate = this.findDuplicateCode(payload.kodeLokal, '');

      if (duplicate) {
        return ResponseHelper.error('Kode lokal sudah digunakan.', 'kodeLokal harus unik.');
      }

      const now = new Date().toISOString();
      payload.createdAt = now;
      payload.updatedAt = now;

      return this.repository.create(payload);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menyimpan data lokal.', error);
    }
  }

  /**
   * Updates a room.
   *
   * @param {string} id Room id.
   * @param {Object} data Room payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  updateRoom(id, data) {
    try {
      const existing = this.getRoom(id);

      if (!existing.success) {
        return existing;
      }

      const payload = this.normalizePayload(data);
      const validation = this.validatePayload(payload);

      if (!validation.success) {
        return validation;
      }

      const duplicate = this.findDuplicateCode(payload.kodeLokal, id);

      if (duplicate) {
        return ResponseHelper.error('Kode lokal sudah digunakan.', 'kodeLokal harus unik.');
      }

      payload.createdAt = existing.data.createdAt || new Date().toISOString();
      payload.updatedAt = new Date().toISOString();

      return this.repository.update(id, payload);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal memperbarui data lokal.', error);
    }
  }

  /**
   * Soft deletes a room.
   *
   * @param {string} id Room id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  deleteRoom(id) {
    try {
      const existing = this.getRoom(id);

      if (!existing.success) {
        return existing;
      }

      return this.repository.delete(id);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menghapus data lokal.', error);
    }
  }

  /**
   * Normalizes room payload.
   *
   * @param {Object} data Room payload.
   * @return {Object} Normalized payload.
   */
  normalizePayload(data) {
    const payload = data || {};

    return {
      kodeLokal: String(payload.kodeLokal || '').trim(),
      namaLokal: String(payload.namaLokal || '').trim(),
      gedungId: String(payload.gedungId || '').trim(),
      lantai: String(payload.lantai || '').trim(),
      kapasitas: String(payload.kapasitas || '').trim(),
      jenisLokal: String(payload.jenisLokal || 'Ruang Kelas').trim(),
      penanggungJawab: String(payload.penanggungJawab || '').trim(),
      status: String(payload.status || Config.STATUS.ACTIVE).trim()
    };
  }

  /**
   * Validates room payload.
   *
   * @param {Object} payload Normalized payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  validatePayload(payload) {
    const errors = ValidationHelper.required(payload, ['kodeLokal', 'namaLokal', 'gedungId']);
    const statusError = ValidationHelper.inList(payload.status, this.validStatuses, 'Status');
    const capacityNumberError = ValidationHelper.number(payload.kapasitas, 'Kapasitas');
    const capacityMinimumError = capacityNumberError ? null : ValidationHelper.minNumber(payload.kapasitas, 1, 'Kapasitas');
    const building = ValidationHelper.isBlank(payload.gedungId) ? null : this.buildingService.getBuilding(payload.gedungId);

    if (statusError) {
      errors.push(statusError);
    }

    if (capacityNumberError) {
      errors.push(capacityNumberError);
    }

    if (capacityMinimumError) {
      errors.push(capacityMinimumError);
    }

    if (payload.jenisLokal && this.validTypes.indexOf(payload.jenisLokal) === -1) {
      errors.push('Jenis lokal tidak valid.');
    }

    if (building && !building.success) {
      errors.push('Gedung tidak ditemukan.');
    }

    if (errors.length > 0) {
      return ResponseHelper.error('Validasi data lokal gagal.', errors.join(' '));
    }

    return ResponseHelper.success('Validasi berhasil.', {});
  }

  /**
   * Finds a non-deleted room with the same code.
   *
   * @param {string} kodeLokal Room code.
   * @param {string} ignoredId Record id to ignore.
   * @return {?Object} Duplicate record or null.
   */
  findDuplicateCode(kodeLokal, ignoredId) {
    const response = this.repository.findByCode(kodeLokal);

    if (!response.success || !response.data) {
      return null;
    }

    if (response.data.status === Config.STATUS.DELETED || response.data.id === ignoredId) {
      return null;
    }

    return response.data;
  }

  /**
   * Builds a map of building ids to building names.
   *
   * @return {Object} Building id map.
   */
  getBuildingMap() {
    const response = this.buildingService.getBuildings();
    const map = {};

    if (!response.success) {
      return map;
    }

    response.data.forEach(function (building) {
      map[building.id] = building.namaGedung;
    });

    return map;
  }
}
