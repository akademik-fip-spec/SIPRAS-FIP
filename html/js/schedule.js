const SchedulePage = {
  schedules: [],
  buildings: [],
  rooms: [],
  elements: {},

  init() {
    if (SiprasUtils.getCurrentPage() !== 'schedule') {
      return;
    }

    this.cacheElements();
    this.bindEvents();
    this.loadBuildings();
  },

  cacheElements() {
    this.elements.formPanel = SiprasUtils.qs('#scheduleFormPanel');
    this.elements.form = SiprasUtils.qs('#scheduleForm');
    this.elements.formTitle = SiprasUtils.qs('#scheduleFormTitle');
    this.elements.tableBody = SiprasUtils.qs('#scheduleTableBody');
    this.elements.search = SiprasUtils.qs('#scheduleSearch');
    this.elements.buildingFilter = SiprasUtils.qs('#buildingFilter');
    this.elements.roomFilter = SiprasUtils.qs('#roomFilter');
    this.elements.typeFilter = SiprasUtils.qs('#typeFilter');
    this.elements.statusFilter = SiprasUtils.qs('#statusFilter');
    this.elements.dateFilter = SiprasUtils.qs('#dateFilter');
    this.elements.addButton = SiprasUtils.qs('#addScheduleButton');
    this.elements.cancelButton = SiprasUtils.qs('#cancelScheduleForm');
    this.elements.toast = SiprasUtils.qs('#scheduleToast');
  },

  bindEvents() {
    this.elements.addButton.addEventListener('click', () => this.openForm());
    this.elements.cancelButton.addEventListener('click', () => this.closeForm());
    this.elements.search.addEventListener('input', () => this.renderTable());
    this.elements.buildingFilter.addEventListener('change', () => this.handleFilterBuildingChange());
    this.elements.roomFilter.addEventListener('change', () => this.renderTable());
    this.elements.typeFilter.addEventListener('change', () => this.renderTable());
    this.elements.statusFilter.addEventListener('change', () => this.renderTable());
    this.elements.dateFilter.addEventListener('change', () => this.renderTable());
    this.elements.form.elements.gedungId.addEventListener('change', () => this.handleFormBuildingChange());
    this.elements.form.addEventListener('submit', (event) => this.handleSubmit(event));
    this.elements.tableBody.addEventListener('click', (event) => this.handleTableAction(event));
  },

  loadBuildings() {
    this.setLoading(true);
    google.script.run
      .withSuccessHandler((response) => this.handleBuildingsResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal memuat data gedung.', true))
      .getBuildings();
  },

  handleBuildingsResponse(response) {
    this.buildings = response && response.success ? response.data || [] : [];
    this.renderBuildingOptions();
    this.loadRooms();
  },

  loadRooms() {
    google.script.run
      .withSuccessHandler((response) => this.handleRoomsResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal memuat data lokal.', true))
      .getRooms();
  },

  handleRoomsResponse(response) {
    this.rooms = response && response.success ? response.data || [] : [];
    this.renderRoomFilterOptions();
    this.loadSchedules();
  },

  loadSchedules() {
    google.script.run
      .withSuccessHandler((response) => this.handleSchedulesResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal memuat data jadwal.', true))
      .getSchedules();
  },

  handleSchedulesResponse(response) {
    this.schedules = response && response.success ? response.data || [] : [];
    this.renderTable();
  },

  renderBuildingOptions() {
    const options = this.buildings.map((building) => {
      return `<option value="${this.escape(building.id)}">${this.escape(building.namaGedung)}</option>`;
    }).join('');

    this.elements.form.elements.gedungId.innerHTML = '<option value="">Pilih Gedung</option>' + options;
    this.elements.buildingFilter.innerHTML = '<option value="">Semua Gedung</option>' + options;
  },

  renderRoomFilterOptions(rooms = this.rooms) {
    this.elements.roomFilter.innerHTML = '<option value="">Semua Lokal</option>' + this.createRoomOptions(rooms);
  },

  renderFormRoomOptions(gedungId, selectedId = '') {
    const rooms = gedungId ? this.rooms.filter((room) => room.gedungId === gedungId) : [];
    this.elements.form.elements.lokalId.innerHTML = '<option value="">Pilih Lokal</option>' + this.createRoomOptions(rooms);
    this.elements.form.elements.lokalId.value = selectedId;
  },

  createRoomOptions(rooms) {
    return rooms.map((room) => {
      const label = room.gedungNama ? `${room.namaLokal} - ${room.gedungNama}` : room.namaLokal;
      return `<option value="${this.escape(room.id)}">${this.escape(label)}</option>`;
    }).join('');
  },

  handleFilterBuildingChange() {
    const gedungId = this.elements.buildingFilter.value;
    const rooms = gedungId ? this.rooms.filter((room) => room.gedungId === gedungId) : this.rooms;

    this.renderRoomFilterOptions(rooms);
    this.elements.roomFilter.value = '';
    this.renderTable();
  },

  handleFormBuildingChange() {
    this.renderFormRoomOptions(this.elements.form.elements.gedungId.value);
  },

  renderTable() {
    const rows = this.getFilteredSchedules();

    if (rows.length === 0) {
      this.elements.tableBody.innerHTML = '<tr><td colspan="10">Data jadwal belum tersedia.</td></tr>';
      return;
    }

    this.elements.tableBody.innerHTML = rows.map((schedule) => this.createRow(schedule)).join('');
  },

  getFilteredSchedules() {
    const keyword = this.elements.search.value.trim().toLowerCase();
    const gedungId = this.elements.buildingFilter.value;
    const lokalId = this.elements.roomFilter.value;
    const jenisKegiatan = this.elements.typeFilter.value;
    const status = this.elements.statusFilter.value;
    const date = this.elements.dateFilter.value;

    return this.schedules.filter((schedule) => {
      const searchable = [
        schedule.kodeJadwal,
        schedule.judulKegiatan,
        schedule.penanggungJawab
      ].join(' ').toLowerCase();

      return searchable.includes(keyword) &&
        (!gedungId || schedule.gedungId === gedungId) &&
        (!lokalId || schedule.lokalId === lokalId) &&
        (!jenisKegiatan || schedule.jenisKegiatan === jenisKegiatan) &&
        (!status || schedule.status === status) &&
        (!date || schedule.tanggal === date);
    });
  },

  createRow(schedule) {
    return `
      <tr>
        <td>${this.escape(schedule.kodeJadwal)}</td>
        <td>${this.escape(schedule.tanggal)}</td>
        <td>${this.escape(this.getTimeLabel(schedule))}</td>
        <td>${this.escape(schedule.gedungNama)}</td>
        <td>${this.escape(schedule.lokalNama)}</td>
        <td>${this.escape(schedule.judulKegiatan)}</td>
        <td>${this.escape(schedule.jenisKegiatan)}</td>
        <td>${this.escape(schedule.penanggungJawab)}</td>
        <td><span class="status-pill">${this.escape(schedule.status)}</span></td>
        <td>
          <div class="row-actions">
            <button class="button button--small button--secondary" type="button" data-action="edit" data-id="${this.escape(schedule.id)}">Edit</button>
            <button class="button button--small button--danger" type="button" data-action="delete" data-id="${this.escape(schedule.id)}">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  },

  openForm(schedule = null) {
    this.elements.form.reset();
    this.elements.formPanel.hidden = false;
    this.elements.formTitle.textContent = schedule ? 'Edit Jadwal' : 'Tambah Jadwal';
    this.elements.form.elements.jenisKegiatan.value = 'Perkuliahan';
    this.elements.form.elements.status.value = 'Terjadwal';
    this.elements.form.elements.tanggal.value = new Date().toISOString().slice(0, 10);
    this.elements.form.elements.jumlahPeserta.value = '1';
    this.renderFormRoomOptions('');

    if (schedule) {
      this.elements.form.elements.id.value = schedule.id || '';
      this.elements.form.elements.kodeJadwal.value = schedule.kodeJadwal || '';
      this.elements.form.elements.judulKegiatan.value = schedule.judulKegiatan || '';
      this.elements.form.elements.jenisKegiatan.value = schedule.jenisKegiatan || 'Perkuliahan';
      this.elements.form.elements.gedungId.value = schedule.gedungId || '';
      this.renderFormRoomOptions(schedule.gedungId || '', schedule.lokalId || '');
      this.elements.form.elements.penanggungJawab.value = schedule.penanggungJawab || '';
      this.elements.form.elements.tanggal.value = schedule.tanggal || '';
      this.elements.form.elements.jamMulai.value = schedule.jamMulai || '';
      this.elements.form.elements.jamSelesai.value = schedule.jamSelesai || '';
      this.elements.form.elements.jumlahPeserta.value = schedule.jumlahPeserta || '1';
      this.elements.form.elements.keterangan.value = schedule.keterangan || '';
      this.elements.form.elements.status.value = schedule.status || 'Terjadwal';
    }

    this.elements.formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  closeForm() {
    this.elements.form.reset();
    this.elements.formPanel.hidden = true;
  },

  handleSubmit(event) {
    event.preventDefault();

    const payload = this.getFormPayload();
    const id = this.elements.form.elements.id.value;
    const runner = google.script.run
      .withSuccessHandler((response) => this.handleSaveResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal menyimpan data.', true));

    if (id) {
      runner.updateSchedule(id, payload);
    } else {
      runner.createSchedule(payload);
    }
  },

  handleSaveResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message + ' ' + response.error : 'Gagal menyimpan data.', true);
      return;
    }

    this.showToast(response.message || 'Data berhasil disimpan.');
    this.closeForm();
    this.loadSchedules();
  },

  handleTableAction(event) {
    const button = event.target.closest('button[data-action]');

    if (!button) {
      return;
    }

    const id = button.dataset.id;
    const schedule = this.schedules.find((item) => item.id === id);

    if (button.dataset.action === 'edit' && schedule) {
      this.openForm(schedule);
      return;
    }

    if (button.dataset.action === 'delete') {
      this.deleteSchedule(id);
    }
  },

  deleteSchedule(id) {
    const confirmed = window.confirm('Hapus data jadwal ini?');

    if (!confirmed) {
      return;
    }

    google.script.run
      .withSuccessHandler((response) => this.handleDeleteResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal menghapus data.', true))
      .deleteSchedule(id);
  },

  handleDeleteResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal menghapus data.', true);
      return;
    }

    this.showToast(response.message || 'Data berhasil dihapus.');
    this.loadSchedules();
  },

  getFormPayload() {
    return {
      kodeJadwal: this.elements.form.elements.kodeJadwal.value,
      judulKegiatan: this.elements.form.elements.judulKegiatan.value,
      jenisKegiatan: this.elements.form.elements.jenisKegiatan.value,
      gedungId: this.elements.form.elements.gedungId.value,
      lokalId: this.elements.form.elements.lokalId.value,
      penanggungJawab: this.elements.form.elements.penanggungJawab.value,
      tanggal: this.elements.form.elements.tanggal.value,
      jamMulai: this.elements.form.elements.jamMulai.value,
      jamSelesai: this.elements.form.elements.jamSelesai.value,
      jumlahPeserta: this.elements.form.elements.jumlahPeserta.value,
      keterangan: this.elements.form.elements.keterangan.value,
      status: this.elements.form.elements.status.value
    };
  },

  getTimeLabel(schedule) {
    return `${schedule.jamMulai || ''} - ${schedule.jamSelesai || ''}`.trim();
  },

  setLoading(isLoading) {
    if (isLoading) {
      this.elements.tableBody.innerHTML = '<tr><td colspan="10">Memuat data jadwal...</td></tr>';
    }
  },

  showToast(message, isError = false) {
    this.elements.toast.textContent = message;
    this.elements.toast.classList.toggle('toast--error', isError);
    this.elements.toast.hidden = false;
    window.setTimeout(() => {
      this.elements.toast.hidden = true;
    }, 3200);
  },

  escape(value) {
    const div = document.createElement('div');
    div.textContent = value === undefined || value === null ? '' : String(value);
    return div.innerHTML;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  SchedulePage.init();
});
