/**
 * Service for Data Inventaris business rules.
 */
class InventoryService {
  constructor() {
    this.repository = new InventoryRepository();
    this.buildingService = new BuildingService();
    this.roomService = new RoomService();
    this.facilityService = new FacilityService();
    this.validStatuses = [Config.STATUS.ACTIVE, Config.STATUS.INACTIVE];
    this.validCategories = ['Furniture', 'Elektronik', 'Pembelajaran', 'Jaringan', 'Keamanan', 'Utilitas', 'Lainnya'];
    this.validConditions = ['Sangat Baik', 'Baik', 'Cukup', 'Rusak Ringan', 'Rusak Berat'];
  }

  /**
   * Gets all non-deleted inventory records with relation labels.
   *
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getInventories() {
    try {
      const response = this.repository.findAll();

      if (!response.success) {
        return response;
      }

      const relationMap = this.getRelationMap();
      const records = response.data.filter(function (inventory) {
        return inventory.status !== Config.STATUS.DELETED;
      }).map(function (inventory) {
        return relationMap.enrich(inventory);
      });

      return ResponseHelper.success('Data inventaris berhasil diambil.', records);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data inventaris.', error);
    }
  }

  /**
   * Gets an inventory record by id.
   *
   * @param {string} id Inventory id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getInventory(id) {
    try {
      const response = this.repository.findById(id);

      if (!response.success || !response.data || response.data.status === Config.STATUS.DELETED) {
        return ResponseHelper.error('Data inventaris tidak ditemukan.', 'Record id: ' + id);
      }

      return ResponseHelper.success('Data inventaris berhasil diambil.', this.enrichInventory(response.data));
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data inventaris.', error);
    }
  }

  /**
   * Creates an inventory record.
   *
   * @param {Object} data Inventory payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  createInventory(data) {
    try {
      const payload = this.normalizePayload(data);
      const validation = this.validatePayload(payload);

      if (!validation.success) {
        return validation;
      }

      const duplicate = this.findDuplicate(payload.kodeInventaris, payload.nomorInventaris, '');

      if (duplicate) {
        return duplicate;
      }

      const relation = this.getValidatedRelation(payload);
      const now = new Date().toISOString();
      payload.gedungId = relation.facility.data.gedungId;
      payload.createdAt = now;
      payload.updatedAt = now;

      return this.repository.create(payload);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menyimpan data inventaris.', error);
    }
  }

  /**
   * Updates an inventory record.
   *
   * @param {string} id Inventory id.
   * @param {Object} data Inventory payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  updateInventory(id, data) {
    try {
      const existing = this.getInventory(id);

      if (!existing.success) {
        return existing;
      }

      const payload = this.normalizePayload(data);
      const validation = this.validatePayload(payload);

      if (!validation.success) {
        return validation;
      }

      const duplicate = this.findDuplicate(payload.kodeInventaris, payload.nomorInventaris, id);

      if (duplicate) {
        return duplicate;
      }

      const relation = this.getValidatedRelation(payload);
      payload.gedungId = relation.facility.data.gedungId;
      payload.createdAt = existing.data.createdAt || new Date().toISOString();
      payload.updatedAt = new Date().toISOString();

      return this.repository.update(id, payload);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal memperbarui data inventaris.', error);
    }
  }

  /**
   * Soft deletes an inventory record.
   *
   * @param {string} id Inventory id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  deleteInventory(id) {
    try {
      const existing = this.getInventory(id);

      if (!existing.success) {
        return existing;
      }

      return this.repository.delete(id);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menghapus data inventaris.', error);
    }
  }

  /**
   * Normalizes inventory payload.
   *
   * @param {Object} data Inventory payload.
   * @return {Object} Normalized payload.
   */
  normalizePayload(data) {
    const payload = data || {};

    return {
      kodeInventaris: String(payload.kodeInventaris || '').trim(),
      nomorInventaris: String(payload.nomorInventaris || '').trim(),
      namaBarang: String(payload.namaBarang || '').trim(),
      kategori: String(payload.kategori || '').trim(),
      gedungId: String(payload.gedungId || '').trim(),
      lokalId: String(payload.lokalId || '').trim(),
      fasilitasId: String(payload.fasilitasId || '').trim(),
      merk: String(payload.merk || '').trim(),
      tipe: String(payload.tipe || '').trim(),
      spesifikasi: String(payload.spesifikasi || '').trim(),
      tahunPengadaan: String(payload.tahunPengadaan || '').trim(),
      jumlah: String(payload.jumlah || '').trim(),
      satuan: String(payload.satuan || '').trim(),
      kondisi: String(payload.kondisi || '').trim(),
      sumberDana: String(payload.sumberDana || '').trim(),
      status: String(payload.status || Config.STATUS.ACTIVE).trim(),
      keterangan: String(payload.keterangan || '').trim()
    };
  }

  /**
   * Validates inventory payload.
   *
   * @param {Object} payload Normalized payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  validatePayload(payload) {
    const errors = ValidationHelper.required(payload, [
      'kodeInventaris',
      'nomorInventaris',
      'namaBarang',
      'kategori',
      'gedungId',
      'lokalId',
      'fasilitasId',
      'jumlah',
      'kondisi',
      'status'
    ]);
    const amountNumberError = ValidationHelper.number(payload.jumlah, 'Jumlah');
    const amountMinimumError = amountNumberError ? null : ValidationHelper.minNumber(payload.jumlah, 1, 'Jumlah');
    const yearNumberError = ValidationHelper.isBlank(payload.tahunPengadaan) ? null : ValidationHelper.number(payload.tahunPengadaan, 'Tahun pengadaan');
    const categoryError = ValidationHelper.inList(payload.kategori, this.validCategories, 'Kategori');
    const conditionError = ValidationHelper.inList(payload.kondisi, this.validConditions, 'Kondisi');
    const statusError = ValidationHelper.inList(payload.status, this.validStatuses, 'Status');
    const relationError = this.validateRelation(payload);

    [amountNumberError, amountMinimumError, yearNumberError, categoryError, conditionError, statusError, relationError].forEach(function (error) {
      if (error) {
        errors.push(error);
      }
    });

    if (errors.length > 0) {
      return ResponseHelper.error('Validasi data inventaris gagal.', errors.join(' '));
    }

    return ResponseHelper.success('Validasi berhasil.', {});
  }

  /**
   * Finds duplicated code or inventory number.
   *
   * @param {string} kodeInventaris Inventory code.
   * @param {string} nomorInventaris Inventory number.
   * @param {string} ignoredId Record id to ignore.
   * @return {?{success: boolean, message: string, error: string}} Error response or null.
   */
  findDuplicate(kodeInventaris, nomorInventaris, ignoredId) {
    const codeResponse = this.repository.findByCode(kodeInventaris);

    if (this.isDuplicateRecord(codeResponse, ignoredId)) {
      return ResponseHelper.error('Kode inventaris sudah digunakan.', 'kodeInventaris harus unik.');
    }

    const numberResponse = this.repository.findByInventoryNumber(nomorInventaris);

    if (this.isDuplicateRecord(numberResponse, ignoredId)) {
      return ResponseHelper.error('Nomor inventaris sudah digunakan.', 'nomorInventaris harus unik.');
    }

    return null;
  }

  /**
   * Checks if a repository response contains a duplicated active record.
   *
   * @param {{success: boolean, data: *}} response Repository response.
   * @param {string} ignoredId Record id to ignore.
   * @return {boolean} True when duplicated.
   */
  isDuplicateRecord(response, ignoredId) {
    return Boolean(response.success && response.data && response.data.status !== Config.STATUS.DELETED && response.data.id !== ignoredId);
  }

  /**
   * Validates relation chain.
   *
   * @param {Object} payload Inventory payload.
   * @return {?string} Validation message.
   */
  validateRelation(payload) {
    if (ValidationHelper.isBlank(payload.gedungId) || ValidationHelper.isBlank(payload.lokalId) || ValidationHelper.isBlank(payload.fasilitasId)) {
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

    if (relation.room.data.gedungId !== payload.gedungId) {
      return 'Lokal tidak sesuai dengan gedung.';
    }

    if (relation.facility.data.lokalId !== payload.lokalId || relation.facility.data.gedungId !== payload.gedungId) {
      return 'Fasilitas tidak sesuai dengan lokal dan gedung.';
    }

    return null;
  }

  /**
   * Gets related building, room, and facility.
   *
   * @param {Object} payload Inventory payload.
   * @return {{building: Object, room: Object, facility: Object}} Relation responses.
   */
  getValidatedRelation(payload) {
    return {
      building: this.buildingService.getBuilding(payload.gedungId),
      room: this.roomService.getRoom(payload.lokalId),
      facility: this.facilityService.getFacility(payload.fasilitasId)
    };
  }

  /**
   * Enriches inventory with relation labels.
   *
   * @param {Object} inventory Inventory record.
   * @return {Object} Enriched inventory.
   */
  enrichInventory(inventory) {
    return this.getRelationMap().enrich(inventory);
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

    return {
      enrich: function (inventory) {
        const building = buildingMap[inventory.gedungId] || {};
        const room = roomMap[inventory.lokalId] || {};
        const facility = facilityMap[inventory.fasilitasId] || {};

        inventory.gedungNama = building.namaGedung || room.gedungNama || facility.gedungNama || '';
        inventory.lokalNama = room.namaLokal || facility.lokalNama || '';
        inventory.fasilitasNama = facility.namaFasilitas || '';

        return inventory;
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
