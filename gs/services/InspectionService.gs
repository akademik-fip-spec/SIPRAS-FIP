/**
 * Service for Pemeriksaan business rules.
 */
class InspectionService {
  constructor() {
    this.repository = new InspectionRepository();
    this.buildingService = new BuildingService();
    this.roomService = new RoomService();
    this.facilityService = new FacilityService();
    this.inventoryService = new InventoryService();
    this.validConditions = ['Sangat Baik', 'Baik', 'Cukup', 'Rusak Ringan', 'Rusak Berat'];
    this.validActions = ['Tidak Ada', 'Perlu Perbaikan', 'Perlu Penggantian', 'Perlu Pemeriksaan Lanjutan'];
    this.validStatuses = ['Draft', 'Selesai', Config.STATUS.DELETED];
  }

  /**
   * Gets all non-deleted inspection records sorted by latest date.
   *
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getInspections() {
    try {
      const response = this.repository.findAll();

      if (!response.success) {
        return response;
      }

      const relationMap = this.getRelationMap();
      const records = response.data.filter(function (inspection) {
        return inspection.status !== Config.STATUS.DELETED;
      }).map(function (inspection) {
        return relationMap.enrich(inspection);
      }).sort(function (first, second) {
        return new Date(second.tanggalPemeriksaan || 0) - new Date(first.tanggalPemeriksaan || 0);
      });

      return ResponseHelper.success('Data pemeriksaan berhasil diambil.', records);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data pemeriksaan.', error);
    }
  }

  /**
   * Gets inspection history for one inventory item.
   *
   * @param {string} inventarisId Inventory id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getInspectionHistory(inventarisId) {
    try {
      const response = this.getInspections();

      if (!response.success) {
        return response;
      }

      const records = response.data.filter(function (inspection) {
        return inspection.inventarisId === inventarisId;
      });

      return ResponseHelper.success('Riwayat pemeriksaan berhasil diambil.', records);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil riwayat pemeriksaan.', error);
    }
  }

  /**
   * Gets one inspection record by id.
   *
   * @param {string} id Inspection id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getInspection(id) {
    try {
      const response = this.repository.findById(id);

      if (!response.success || !response.data || response.data.status === Config.STATUS.DELETED) {
        return ResponseHelper.error('Data pemeriksaan tidak ditemukan.', 'Record id: ' + id);
      }

      return ResponseHelper.success('Data pemeriksaan berhasil diambil.', this.enrichInspection(response.data));
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data pemeriksaan.', error);
    }
  }

  /**
   * Creates an inspection record.
   *
   * @param {Object} data Inspection payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  createInspection(data) {
    try {
      const payload = this.normalizePayload(data);
      const validation = this.validatePayload(payload);

      if (!validation.success) {
        return validation;
      }

      const duplicate = this.findDuplicateNumber(payload.nomorPemeriksaan, '');

      if (duplicate) {
        return duplicate;
      }

      const upload = this.uploadPhoto(payload.fotoUpload);
      const now = new Date().toISOString();
      payload.foto = upload || payload.foto;
      payload.createdAt = now;
      payload.updatedAt = now;
      delete payload.fotoUpload;

      return this.repository.create(payload);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menyimpan data pemeriksaan.', error);
    }
  }

  /**
   * Updates an inspection record.
   *
   * @param {string} id Inspection id.
   * @param {Object} data Inspection payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  updateInspection(id, data) {
    try {
      const existing = this.getInspection(id);

      if (!existing.success) {
        return existing;
      }

      const payload = this.normalizePayload(data);
      const validation = this.validatePayload(payload);

      if (!validation.success) {
        return validation;
      }

      const duplicate = this.findDuplicateNumber(payload.nomorPemeriksaan, id);

      if (duplicate) {
        return duplicate;
      }

      const upload = this.uploadPhoto(payload.fotoUpload);
      payload.foto = upload || payload.foto || existing.data.foto || '';
      payload.createdAt = existing.data.createdAt || new Date().toISOString();
      payload.updatedAt = new Date().toISOString();
      delete payload.fotoUpload;

      return this.repository.update(id, payload);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal memperbarui data pemeriksaan.', error);
    }
  }

  /**
   * Soft deletes an inspection record.
   *
   * @param {string} id Inspection id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  deleteInspection(id) {
    try {
      const existing = this.getInspection(id);

      if (!existing.success) {
        return existing;
      }

      return this.repository.delete(id);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menghapus data pemeriksaan.', error);
    }
  }

  /**
   * Normalizes inspection payload.
   *
   * @param {Object} data Inspection payload.
   * @return {Object} Normalized payload.
   */
  normalizePayload(data) {
    const payload = data || {};

    return {
      nomorPemeriksaan: String(payload.nomorPemeriksaan || '').trim(),
      tanggalPemeriksaan: String(payload.tanggalPemeriksaan || '').trim(),
      petugas: String(payload.petugas || '').trim(),
      gedungId: String(payload.gedungId || '').trim(),
      lokalId: String(payload.lokalId || '').trim(),
      fasilitasId: String(payload.fasilitasId || '').trim(),
      inventarisId: String(payload.inventarisId || '').trim(),
      kondisi: String(payload.kondisi || '').trim(),
      tindakan: String(payload.tindakan || 'Tidak Ada').trim(),
      catatan: String(payload.catatan || '').trim(),
      foto: String(payload.foto || '').trim(),
      fotoUpload: payload.fotoUpload || null,
      status: String(payload.status || 'Draft').trim()
    };
  }

  /**
   * Validates inspection payload.
   *
   * @param {Object} payload Normalized payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  validatePayload(payload) {
    const errors = ValidationHelper.required(payload, [
      'nomorPemeriksaan',
      'tanggalPemeriksaan',
      'petugas',
      'gedungId',
      'lokalId',
      'fasilitasId',
      'inventarisId',
      'kondisi'
    ]);
    const conditionError = ValidationHelper.inList(payload.kondisi, this.validConditions, 'Kondisi');
    const actionError = ValidationHelper.inList(payload.tindakan, this.validActions, 'Tindakan');
    const statusError = ValidationHelper.inList(payload.status, this.validStatuses, 'Status');
    const relationError = this.validateRelation(payload);

    [conditionError, actionError, statusError, relationError].forEach(function (error) {
      if (error) {
        errors.push(error);
      }
    });

    if (errors.length > 0) {
      return ResponseHelper.error('Validasi data pemeriksaan gagal.', errors.join(' '));
    }

    return ResponseHelper.success('Validasi berhasil.', {});
  }

  /**
   * Validates building, room, facility, and inventory relation chain.
   *
   * @param {Object} payload Inspection payload.
   * @return {?string} Validation message.
   */
  validateRelation(payload) {
    if (
      ValidationHelper.isBlank(payload.gedungId) ||
      ValidationHelper.isBlank(payload.lokalId) ||
      ValidationHelper.isBlank(payload.fasilitasId) ||
      ValidationHelper.isBlank(payload.inventarisId)
    ) {
      return null;
    }

    const relation = this.getValidatedRelation(payload);

    if (!relation.building.success) {
      return 'Gedung tidak ditemukan.';
    }

    if (!relation.room.success) {
      return 'Lokal tidak ditemukan.';
    }

    if (!relation.facility.success) {
      return 'Fasilitas tidak ditemukan.';
    }

    if (!relation.inventory.success) {
      return 'Inventaris tidak ditemukan.';
    }

    if (relation.room.data.gedungId !== payload.gedungId) {
      return 'Lokal tidak sesuai dengan gedung.';
    }

    if (relation.facility.data.lokalId !== payload.lokalId || relation.facility.data.gedungId !== payload.gedungId) {
      return 'Fasilitas tidak sesuai dengan lokal dan gedung.';
    }

    if (
      relation.inventory.data.fasilitasId !== payload.fasilitasId ||
      relation.inventory.data.lokalId !== payload.lokalId ||
      relation.inventory.data.gedungId !== payload.gedungId
    ) {
      return 'Inventaris tidak sesuai dengan fasilitas, lokal, dan gedung.';
    }

    return null;
  }

  /**
   * Gets related records for validation.
   *
   * @param {Object} payload Inspection payload.
   * @return {{building: Object, room: Object, facility: Object, inventory: Object}} Relation responses.
   */
  getValidatedRelation(payload) {
    return {
      building: this.buildingService.getBuilding(payload.gedungId),
      room: this.roomService.getRoom(payload.lokalId),
      facility: this.facilityService.getFacility(payload.fasilitasId),
      inventory: this.inventoryService.getInventory(payload.inventarisId)
    };
  }

  /**
   * Finds duplicated inspection number.
   *
   * @param {string} nomorPemeriksaan Inspection number.
   * @param {string} ignoredId Record id to ignore.
   * @return {?{success: boolean, message: string, error: string}} Error response or null.
   */
  findDuplicateNumber(nomorPemeriksaan, ignoredId) {
    const response = this.repository.findByNumber(nomorPemeriksaan);

    if (response.success && response.data && response.data.status !== Config.STATUS.DELETED && response.data.id !== ignoredId) {
      return ResponseHelper.error('Nomor pemeriksaan sudah digunakan.', 'nomorPemeriksaan harus unik.');
    }

    return null;
  }

  /**
   * Uploads a photo when provided.
   *
   * @param {?Object} fileData Photo payload.
   * @return {string} Uploaded photo URL.
   */
  uploadPhoto(fileData) {
    if (!fileData || ValidationHelper.isBlank(fileData.base64)) {
      return '';
    }

    return DriveHelper.uploadInspectionPhoto(fileData).url;
  }

  /**
   * Enriches inspection with relation labels.
   *
   * @param {Object} inspection Inspection record.
   * @return {Object} Enriched inspection.
   */
  enrichInspection(inspection) {
    return this.getRelationMap().enrich(inspection);
  }

  /**
   * Builds relation lookup maps.
   *
   * @return {{enrich: Function}} Relation map.
   */
  getRelationMap() {
    const buildingMap = this.createMap(this.buildingService.getBuildings().data || []);
    const roomMap = this.createMap(this.roomService.getRooms().data || []);
    const facilityMap = this.createMap(this.facilityService.getFacilities().data || []);
    const inventoryMap = this.createMap(this.inventoryService.getInventories().data || []);

    return {
      enrich: function (inspection) {
        const building = buildingMap[inspection.gedungId] || {};
        const room = roomMap[inspection.lokalId] || {};
        const facility = facilityMap[inspection.fasilitasId] || {};
        const inventory = inventoryMap[inspection.inventarisId] || {};

        inspection.gedungNama = building.namaGedung || room.gedungNama || facility.gedungNama || inventory.gedungNama || '';
        inspection.lokalNama = room.namaLokal || facility.lokalNama || inventory.lokalNama || '';
        inspection.fasilitasNama = facility.namaFasilitas || inventory.fasilitasNama || '';
        inspection.inventarisNama = inventory.namaBarang || '';
        inspection.nomorInventaris = inventory.nomorInventaris || '';

        return inspection;
      }
    };
  }

  /**
   * Creates a map by record id.
   *
   * @param {Object[]} records Records.
   * @return {Object} Record map.
   */
  createMap(records) {
    const map = {};

    records.forEach(function (record) {
      map[record.id] = record;
    });

    return map;
  }
}
