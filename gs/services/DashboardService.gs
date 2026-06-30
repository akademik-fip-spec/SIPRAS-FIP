/**
 * Service for Dashboard read-only summaries.
 */
class DashboardService {
  constructor() {
    this.buildingRepository = new BuildingRepository();
    this.roomRepository = new RoomRepository();
    this.facilityRepository = new FacilityRepository();
    this.inventoryRepository = new InventoryRepository();
    this.inspectionRepository = new InspectionRepository();
    this.scheduleRepository = new ScheduleRepository();
    this.conditions = ['Sangat Baik', 'Baik', 'Cukup', 'Rusak Ringan', 'Rusak Berat'];
  }

  /**
   * Gets all dashboard data in one response.
   *
   * @return {{success: boolean, message: string, data: *}|{success: boolean, message: string, error: string}} Standard response.
   */
  getDashboardData() {
    try {
      const records = this.getRecords();
      const maps = this.getRelationMaps(records);
      const today = this.getToday();
      const enriched = this.enrichRecords(records, maps);

      return ResponseHelper.success('Data dashboard berhasil diambil.', {
        generatedAt: new Date().toISOString(),
        today: today,
        statistics: this.getStatistics(enriched, today),
        inventoryConditionSummary: this.getInventoryConditionSummary(enriched.inventories),
        latestInspections: this.getLatestInspections(enriched.inspections),
        todaySchedules: this.getTodaySchedules(enriched.schedules, today),
        attentionInventories: this.getAttentionInventories(enriched.inventories),
        recentActivities: this.getRecentActivities(enriched)
      });
    } catch (error) {
      Logger.log(error);
      return ResponseHelper.error('Gagal mengambil data dashboard.', error);
    }
  }

  /**
   * Reads all required records.
   *
   * @return {Object} Dashboard record sets.
   */
  getRecords() {
    return {
      buildings: this.unwrap(this.buildingRepository.findAll()),
      rooms: this.unwrap(this.roomRepository.findAll()),
      facilities: this.unwrap(this.facilityRepository.findAll()),
      inventories: this.unwrap(this.inventoryRepository.findAll()),
      inspections: this.unwrap(this.inspectionRepository.findAll()),
      schedules: this.unwrap(this.scheduleRepository.findAll())
    };
  }

  /**
   * Unwraps repository response data.
   *
   * @param {{success: boolean, data: Object[]}} response Repository response.
   * @return {Object[]} Records.
   */
  unwrap(response) {
    return response && response.success ? response.data || [] : [];
  }

  /**
   * Builds relation maps.
   *
   * @param {Object} records Dashboard records.
   * @return {Object} Relation maps.
   */
  getRelationMaps(records) {
    return {
      buildings: this.createMap(this.excludeDeleted(records.buildings)),
      rooms: this.createMap(this.excludeDeleted(records.rooms)),
      facilities: this.createMap(this.excludeDeleted(records.facilities)),
      inventories: this.createMap(this.excludeDeleted(records.inventories))
    };
  }

  /**
   * Enriches records with labels and excludes soft-deleted rows.
   *
   * @param {Object} records Dashboard records.
   * @param {Object} maps Relation maps.
   * @return {Object} Enriched record sets.
   */
  enrichRecords(records, maps) {
    const buildings = this.excludeDeleted(records.buildings);
    const rooms = this.excludeDeleted(records.rooms).map((room) => this.enrichRoom(room, maps));
    const facilities = this.excludeDeleted(records.facilities).map((facility) => this.enrichFacility(facility, maps));
    const inventories = this.excludeDeleted(records.inventories).map((inventory) => this.enrichInventory(inventory, maps));
    const inspections = this.excludeDeleted(records.inspections).map((inspection) => this.enrichInspection(inspection, maps));
    const schedules = this.excludeDeleted(records.schedules).map((schedule) => this.enrichSchedule(schedule, maps));

    return {
      buildings: buildings,
      rooms: rooms,
      facilities: facilities,
      inventories: inventories,
      inspections: inspections,
      schedules: schedules
    };
  }

  /**
   * Builds main statistics.
   *
   * @param {Object} records Enriched records.
   * @param {string} today Current date yyyy-MM-dd.
   * @return {Object} Statistics.
   */
  getStatistics(records, today) {
    return {
      totalGedung: records.buildings.length,
      totalLokal: records.rooms.length,
      totalFasilitas: records.facilities.length,
      totalInventaris: records.inventories.length,
      totalPemeriksaan: records.inspections.length,
      jadwalHariIni: records.schedules.filter(function (schedule) {
        return schedule.tanggal === today && schedule.status !== 'Dibatalkan';
      }).length
    };
  }

  /**
   * Counts inventory by condition.
   *
   * @param {Object[]} inventories Inventory records.
   * @return {Object[]} Condition summary.
   */
  getInventoryConditionSummary(inventories) {
    const total = inventories.length;

    return this.conditions.map(function (condition) {
      const count = inventories.filter(function (inventory) {
        return inventory.kondisi === condition;
      }).length;

      return {
        kondisi: condition,
        jumlah: count,
        persentase: total === 0 ? 0 : Math.round((count / total) * 100)
      };
    });
  }

  /**
   * Gets the 10 latest inspections.
   *
   * @param {Object[]} inspections Inspection records.
   * @return {Object[]} Latest inspections.
   */
  getLatestInspections(inspections) {
    return inspections.slice().sort(function (first, second) {
      return DashboardService.compareLatest(first.tanggalPemeriksaan, second.tanggalPemeriksaan, first.createdAt, second.createdAt);
    }).slice(0, 10);
  }

  /**
   * Gets today's schedules.
   *
   * @param {Object[]} schedules Schedule records.
   * @param {string} today Current date yyyy-MM-dd.
   * @return {Object[]} Today's schedules.
   */
  getTodaySchedules(schedules, today) {
    return schedules.filter(function (schedule) {
      return schedule.tanggal === today && schedule.status !== 'Dibatalkan';
    }).sort(function (first, second) {
      return String(first.jamMulai || '').localeCompare(String(second.jamMulai || ''));
    });
  }

  /**
   * Gets inventories that need attention.
   *
   * @param {Object[]} inventories Inventory records.
   * @return {Object[]} Attention inventory records.
   */
  getAttentionInventories(inventories) {
    const order = {
      'Rusak Berat': 1,
      'Rusak Ringan': 2
    };

    return inventories.filter(function (inventory) {
      return inventory.kondisi === 'Rusak Berat' || inventory.kondisi === 'Rusak Ringan';
    }).sort(function (first, second) {
      return order[first.kondisi] - order[second.kondisi];
    });
  }

  /**
   * Builds recent activity feed.
   *
   * @param {Object} records Enriched records.
   * @return {Object[]} Recent activities.
   */
  getRecentActivities(records) {
    const activities = [];

    records.inspections.forEach(function (inspection) {
      activities.push({
        tipe: 'Pemeriksaan',
        waktu: inspection.createdAt || inspection.tanggalPemeriksaan || '',
        judul: inspection.nomorPemeriksaan || 'Pemeriksaan',
        deskripsi: [inspection.inventarisNama, inspection.petugas, inspection.kondisi].filter(Boolean).join(' - '),
        status: inspection.status || ''
      });
    });

    records.schedules.forEach(function (schedule) {
      activities.push({
        tipe: 'Jadwal',
        waktu: schedule.createdAt || schedule.tanggal || '',
        judul: schedule.kodeJadwal || 'Jadwal',
        deskripsi: [schedule.judulKegiatan, schedule.lokalNama, schedule.jamMulai].filter(Boolean).join(' - '),
        status: schedule.status || ''
      });
    });

    records.inventories.forEach(function (inventory) {
      activities.push({
        tipe: 'Inventaris',
        waktu: inventory.createdAt || '',
        judul: inventory.kodeInventaris || inventory.nomorInventaris || 'Inventaris',
        deskripsi: [inventory.namaBarang, inventory.lokalNama, inventory.kondisi].filter(Boolean).join(' - '),
        status: inventory.status || ''
      });
    });

    return activities.filter(function (activity) {
      return activity.waktu;
    }).sort(function (first, second) {
      return new Date(second.waktu || 0) - new Date(first.waktu || 0);
    }).slice(0, 20);
  }

  /**
   * Excludes soft-deleted records.
   *
   * @param {Object[]} records Records.
   * @return {Object[]} Non-deleted records.
   */
  excludeDeleted(records) {
    return (records || []).filter(function (record) {
      return record.status !== Config.STATUS.DELETED;
    });
  }

  /**
   * Enriches room record.
   *
   * @param {Object} room Room record.
   * @param {Object} maps Relation maps.
   * @return {Object} Enriched room.
   */
  enrichRoom(room, maps) {
    const building = maps.buildings[room.gedungId] || {};
    return Object.assign({}, room, {
      gedungNama: building.namaGedung || ''
    });
  }

  /**
   * Enriches facility record.
   *
   * @param {Object} facility Facility record.
   * @param {Object} maps Relation maps.
   * @return {Object} Enriched facility.
   */
  enrichFacility(facility, maps) {
    const room = maps.rooms[facility.lokalId] || {};
    const building = maps.buildings[facility.gedungId || room.gedungId] || {};

    return Object.assign({}, facility, {
      gedungId: facility.gedungId || room.gedungId || '',
      gedungNama: building.namaGedung || '',
      lokalNama: room.namaLokal || ''
    });
  }

  /**
   * Enriches inventory record.
   *
   * @param {Object} inventory Inventory record.
   * @param {Object} maps Relation maps.
   * @return {Object} Enriched inventory.
   */
  enrichInventory(inventory, maps) {
    const room = maps.rooms[inventory.lokalId] || {};
    const facility = maps.facilities[inventory.fasilitasId] || {};
    const building = maps.buildings[inventory.gedungId || room.gedungId || facility.gedungId] || {};

    return Object.assign({}, inventory, {
      gedungNama: building.namaGedung || '',
      lokalNama: room.namaLokal || facility.lokalNama || '',
      fasilitasNama: facility.namaFasilitas || ''
    });
  }

  /**
   * Enriches inspection record.
   *
   * @param {Object} inspection Inspection record.
   * @param {Object} maps Relation maps.
   * @return {Object} Enriched inspection.
   */
  enrichInspection(inspection, maps) {
    const inventory = maps.inventories[inspection.inventarisId] || {};
    const room = maps.rooms[inspection.lokalId] || maps.rooms[inventory.lokalId] || {};
    const building = maps.buildings[inspection.gedungId || inventory.gedungId || room.gedungId] || {};

    return Object.assign({}, inspection, {
      gedungNama: building.namaGedung || '',
      lokalNama: room.namaLokal || '',
      inventarisNama: inventory.namaBarang || '',
      nomorInventaris: inventory.nomorInventaris || ''
    });
  }

  /**
   * Enriches schedule record.
   *
   * @param {Object} schedule Schedule record.
   * @param {Object} maps Relation maps.
   * @return {Object} Enriched schedule.
   */
  enrichSchedule(schedule, maps) {
    const room = maps.rooms[schedule.lokalId] || {};
    const building = maps.buildings[schedule.gedungId || room.gedungId] || {};

    return Object.assign({}, schedule, {
      gedungNama: building.namaGedung || '',
      lokalNama: room.namaLokal || ''
    });
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

  /**
   * Gets today's date in script timezone.
   *
   * @return {string} Date in yyyy-MM-dd format.
   */
  getToday() {
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  /**
   * Compares records by primary date then createdAt descending.
   *
   * @param {string} firstDate First primary date.
   * @param {string} secondDate Second primary date.
   * @param {string} firstCreated First createdAt.
   * @param {string} secondCreated Second createdAt.
   * @return {number} Sort comparison.
   */
  static compareLatest(firstDate, secondDate, firstCreated, secondCreated) {
    const firstValue = new Date(firstDate || firstCreated || 0).getTime();
    const secondValue = new Date(secondDate || secondCreated || 0).getTime();

    if (secondValue !== firstValue) {
      return secondValue - firstValue;
    }

    return new Date(secondCreated || 0).getTime() - new Date(firstCreated || 0).getTime();
  }
}
