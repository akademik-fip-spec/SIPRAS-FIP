/**
 * Service for Jadwal Penggunaan Lokal business rules.
 */
class ScheduleService {
  constructor() {
    this.repository = new ScheduleRepository();
    this.buildingService = new BuildingService();
    this.roomService = new RoomService();
    this.validTypes = ['Perkuliahan', 'Seminar', 'Workshop', 'Rapat', 'Ujian', 'Praktikum', 'Kegiatan Fakultas', 'Lainnya'];
    this.validStatuses = ['Terjadwal', 'Berlangsung', 'Selesai', 'Dibatalkan', Config.STATUS.DELETED];
    this.conflictStatuses = ['Terjadwal', 'Berlangsung'];
  }

  /**
   * Gets all non-deleted schedules with relation labels.
   *
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getSchedules() {
    try {
      const response = this.repository.findAll();

      if (!response.success) {
        return response;
      }

      const relationMap = this.getRelationMap();
      const records = response.data.filter(function (schedule) {
        return schedule.status !== Config.STATUS.DELETED;
      }).map(function (schedule) {
        return relationMap.enrich(schedule);
      }).sort(function (first, second) {
        const firstValue = String(first.tanggal || '') + ' ' + String(first.jamMulai || '');
        const secondValue = String(second.tanggal || '') + ' ' + String(second.jamMulai || '');
        return secondValue.localeCompare(firstValue);
      });

      return ResponseHelper.success('Data jadwal berhasil diambil.', records);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data jadwal.', error);
    }
  }

  /**
   * Gets one schedule record by id.
   *
   * @param {string} id Schedule id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getSchedule(id) {
    try {
      const response = this.repository.findById(id);

      if (!response.success || !response.data || response.data.status === Config.STATUS.DELETED) {
        return ResponseHelper.error('Data jadwal tidak ditemukan.', 'Record id: ' + id);
      }

      return ResponseHelper.success('Data jadwal berhasil diambil.', this.enrichSchedule(response.data));
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data jadwal.', error);
    }
  }

  /**
   * Creates a schedule record.
   *
   * @param {Object} data Schedule payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  createSchedule(data) {
    try {
      const payload = this.normalizePayload(data);
      const validation = this.validatePayload(payload, '');

      if (!validation.success) {
        return validation;
      }

      const now = new Date().toISOString();
      payload.createdAt = now;
      payload.updatedAt = now;

      return this.repository.create(payload);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menyimpan data jadwal.', error);
    }
  }

  /**
   * Updates a schedule record.
   *
   * @param {string} id Schedule id.
   * @param {Object} data Schedule payload.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  updateSchedule(id, data) {
    try {
      const existing = this.getSchedule(id);

      if (!existing.success) {
        return existing;
      }

      const payload = this.normalizePayload(data);
      const validation = this.validatePayload(payload, id);

      if (!validation.success) {
        return validation;
      }

      payload.createdAt = existing.data.createdAt || new Date().toISOString();
      payload.updatedAt = new Date().toISOString();

      return this.repository.update(id, payload);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal memperbarui data jadwal.', error);
    }
  }

  /**
   * Soft deletes a schedule record.
   *
   * @param {string} id Schedule id.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  deleteSchedule(id) {
    try {
      const existing = this.getSchedule(id);

      if (!existing.success) {
        return existing;
      }

      return this.repository.delete(id);
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal menghapus data jadwal.', error);
    }
  }

  /**
   * Normalizes schedule payload.
   *
   * @param {Object} data Schedule payload.
   * @return {Object} Normalized payload.
   */
  normalizePayload(data) {
    const payload = data || {};

    return {
      kodeJadwal: String(payload.kodeJadwal || '').trim(),
      judulKegiatan: String(payload.judulKegiatan || '').trim(),
      jenisKegiatan: String(payload.jenisKegiatan || 'Perkuliahan').trim(),
      gedungId: String(payload.gedungId || '').trim(),
      lokalId: String(payload.lokalId || '').trim(),
      penanggungJawab: String(payload.penanggungJawab || '').trim(),
      tanggal: String(payload.tanggal || '').trim(),
      jamMulai: String(payload.jamMulai || '').trim(),
      jamSelesai: String(payload.jamSelesai || '').trim(),
      jumlahPeserta: String(payload.jumlahPeserta || '').trim(),
      keterangan: String(payload.keterangan || '').trim(),
      status: String(payload.status || 'Terjadwal').trim()
    };
  }

  /**
   * Validates schedule payload.
   *
   * @param {Object} payload Normalized payload.
   * @param {string} ignoredId Record id to ignore.
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  validatePayload(payload, ignoredId) {
    const errors = ValidationHelper.required(payload, [
      'kodeJadwal',
      'judulKegiatan',
      'gedungId',
      'lokalId',
      'tanggal',
      'jamMulai',
      'jamSelesai'
    ]);
    const typeError = ValidationHelper.inList(payload.jenisKegiatan, this.validTypes, 'Jenis kegiatan');
    const statusError = ValidationHelper.inList(payload.status, this.validStatuses, 'Status');
    const amountNumberError = ValidationHelper.number(payload.jumlahPeserta, 'Jumlah peserta');
    const amountMinimumError = amountNumberError ? null : ValidationHelper.minNumber(payload.jumlahPeserta, 1, 'Jumlah peserta');
    const timeError = this.validateTimeRange(payload);
    const relationError = this.validateRelation(payload);
    const duplicateError = this.validateDuplicateCode(payload.kodeJadwal, ignoredId);
    const conflictError = this.validateScheduleConflict(payload, ignoredId);

    [typeError, statusError, amountNumberError, amountMinimumError, timeError, relationError, duplicateError, conflictError].forEach(function (error) {
      if (error) {
        errors.push(error);
      }
    });

    if (errors.length > 0) {
      return ResponseHelper.error('Validasi data jadwal gagal.', errors.join(' '));
    }

    return ResponseHelper.success('Validasi berhasil.', {});
  }

  /**
   * Validates the selected room belongs to the selected building.
   *
   * @param {Object} payload Schedule payload.
   * @return {?string} Validation message.
   */
  validateRelation(payload) {
    if (ValidationHelper.isBlank(payload.gedungId) || ValidationHelper.isBlank(payload.lokalId)) {
      return null;
    }

    const building = this.buildingService.getBuilding(payload.gedungId);
    const room = this.roomService.getRoom(payload.lokalId);

    if (!building.success) {
      return 'Gedung tidak ditemukan.';
    }

    if (!room.success) {
      return 'Lokal tidak ditemukan.';
    }

    if (room.data.gedungId !== payload.gedungId) {
      return 'Lokal tidak sesuai dengan gedung.';
    }

    return null;
  }

  /**
   * Validates finish time is later than start time.
   *
   * @param {Object} payload Schedule payload.
   * @return {?string} Validation message.
   */
  validateTimeRange(payload) {
    if (ValidationHelper.isBlank(payload.jamMulai) || ValidationHelper.isBlank(payload.jamSelesai)) {
      return null;
    }

    const start = this.parseTimeToMinutes(payload.jamMulai);
    const end = this.parseTimeToMinutes(payload.jamSelesai);

    if (start === null || end === null) {
      return 'Format jam tidak valid.';
    }

    return end <= start ? 'Jam selesai harus lebih besar dari jam mulai.' : null;
  }

  /**
   * Validates unique schedule code.
   *
   * @param {string} kodeJadwal Schedule code.
   * @param {string} ignoredId Record id to ignore.
   * @return {?string} Validation message.
   */
  validateDuplicateCode(kodeJadwal, ignoredId) {
    if (ValidationHelper.isBlank(kodeJadwal)) {
      return null;
    }

    const response = this.repository.findByCode(kodeJadwal);

    if (response.success && response.data && response.data.status !== Config.STATUS.DELETED && response.data.id !== ignoredId) {
      return 'Kode jadwal sudah digunakan.';
    }

    return null;
  }

  /**
   * Validates overlapping active schedules for the same room and date.
   *
   * @param {Object} payload Schedule payload.
   * @param {string} ignoredId Record id to ignore.
   * @return {?string} Validation message.
   */
  validateScheduleConflict(payload, ignoredId) {
    if (
      ValidationHelper.isBlank(payload.lokalId) ||
      ValidationHelper.isBlank(payload.tanggal) ||
      ValidationHelper.isBlank(payload.jamMulai) ||
      ValidationHelper.isBlank(payload.jamSelesai) ||
      this.conflictStatuses.indexOf(payload.status) === -1
    ) {
      return null;
    }

    const response = this.repository.findAll();

    if (!response.success) {
      return 'Gagal memeriksa konflik jadwal.';
    }

    const start = this.parseTimeToMinutes(payload.jamMulai);
    const end = this.parseTimeToMinutes(payload.jamSelesai);
    const conflict = response.data.find((schedule) => {
      if (
        schedule.id === ignoredId ||
        schedule.lokalId !== payload.lokalId ||
        schedule.tanggal !== payload.tanggal ||
        this.conflictStatuses.indexOf(schedule.status) === -1
      ) {
        return false;
      }

      const existingStart = this.parseTimeToMinutes(schedule.jamMulai);
      const existingEnd = this.parseTimeToMinutes(schedule.jamSelesai);

      if (existingStart === null || existingEnd === null) {
        return false;
      }

      return start < existingEnd && end > existingStart;
    });

    if (conflict) {
      return 'Konflik jadwal ditemukan dengan ' + conflict.kodeJadwal + ' pada lokal dan tanggal yang sama.';
    }

    return null;
  }

  /**
   * Converts HH:mm time into minutes.
   *
   * @param {string} value Time string.
   * @return {?number} Minutes or null.
   */
  parseTimeToMinutes(value) {
    const parts = String(value || '').split(':');

    if (parts.length < 2) {
      return null;
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return hours * 60 + minutes;
  }

  /**
   * Enriches schedule with relation labels.
   *
   * @param {Object} schedule Schedule record.
   * @return {Object} Enriched schedule.
   */
  enrichSchedule(schedule) {
    return this.getRelationMap().enrich(schedule);
  }

  /**
   * Builds relation lookup maps.
   *
   * @return {{enrich: Function}} Relation map.
   */
  getRelationMap() {
    const buildingMap = this.createMap(this.buildingService.getBuildings().data || []);
    const roomMap = this.createMap(this.roomService.getRooms().data || []);

    return {
      enrich: function (schedule) {
        const building = buildingMap[schedule.gedungId] || {};
        const room = roomMap[schedule.lokalId] || {};

        schedule.gedungNama = building.namaGedung || room.gedungNama || '';
        schedule.lokalNama = room.namaLokal || '';

        return schedule;
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
