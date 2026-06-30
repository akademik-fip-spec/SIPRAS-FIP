const RoomPage = {
  rooms: [],
  buildings: [],
  elements: {},

  init() {
    if (SiprasUtils.getCurrentPage() !== 'room') {
      return;
    }

    this.cacheElements();
    this.bindEvents();
    this.loadBuildings();
  },

  cacheElements() {
    this.elements.formPanel = SiprasUtils.qs('#roomFormPanel');
    this.elements.form = SiprasUtils.qs('#roomForm');
    this.elements.formTitle = SiprasUtils.qs('#roomFormTitle');
    this.elements.tableBody = SiprasUtils.qs('#roomTableBody');
    this.elements.search = SiprasUtils.qs('#roomSearch');
    this.elements.buildingFilter = SiprasUtils.qs('#buildingFilter');
    this.elements.addButton = SiprasUtils.qs('#addRoomButton');
    this.elements.cancelButton = SiprasUtils.qs('#cancelRoomForm');
    this.elements.toast = SiprasUtils.qs('#roomToast');
  },

  bindEvents() {
    this.elements.addButton.addEventListener('click', () => this.openForm());
    this.elements.cancelButton.addEventListener('click', () => this.closeForm());
    this.elements.search.addEventListener('input', () => this.renderTable());
    this.elements.buildingFilter.addEventListener('change', () => this.renderTable());
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
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal memuat data gedung.', true);
      this.buildings = [];
    } else {
      this.buildings = response.data || [];
    }

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
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal memuat data lokal.', true);
      this.rooms = [];
    } else {
      this.rooms = response.data || [];
    }

    this.renderTable();
  },

  renderBuildingOptions() {
    const options = this.buildings.map((building) => {
      return `<option value="${this.escape(building.id)}">${this.escape(building.namaGedung)}</option>`;
    }).join('');

    this.elements.form.elements.gedungId.innerHTML = '<option value="">Pilih Gedung</option>' + options;
    this.elements.buildingFilter.innerHTML = '<option value="">Semua Gedung</option>' + options;
  },

  renderTable() {
    const keyword = this.elements.search.value.trim().toLowerCase();
    const gedungId = this.elements.buildingFilter.value;
    const rows = this.rooms.filter((room) => {
      const code = String(room.kodeLokal || '').toLowerCase();
      const name = String(room.namaLokal || '').toLowerCase();
      const matchesKeyword = code.includes(keyword) || name.includes(keyword);
      const matchesBuilding = !gedungId || room.gedungId === gedungId;

      return matchesKeyword && matchesBuilding;
    });

    if (rows.length === 0) {
      this.elements.tableBody.innerHTML = '<tr><td colspan="8">Data lokal belum tersedia.</td></tr>';
      return;
    }

    this.elements.tableBody.innerHTML = rows.map((room) => this.createRow(room)).join('');
  },

  createRow(room) {
    return `
      <tr>
        <td>${this.escape(room.kodeLokal)}</td>
        <td>${this.escape(room.namaLokal)}</td>
        <td>${this.escape(this.getBuildingName(room))}</td>
        <td>${this.escape(room.lantai)}</td>
        <td>${this.escape(room.kapasitas)}</td>
        <td>${this.escape(room.jenisLokal)}</td>
        <td><span class="status-pill">${this.escape(room.status)}</span></td>
        <td>
          <div class="row-actions">
            <button class="button button--small button--secondary" type="button" data-action="edit" data-id="${this.escape(room.id)}">Edit</button>
            <button class="button button--small button--danger" type="button" data-action="delete" data-id="${this.escape(room.id)}">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  },

  openForm(room = null) {
    this.elements.form.reset();
    this.elements.formPanel.hidden = false;
    this.elements.formTitle.textContent = room ? 'Edit Lokal' : 'Tambah Lokal';
    this.elements.form.elements.status.value = 'Aktif';
    this.elements.form.elements.jenisLokal.value = 'Ruang Kelas';

    if (room) {
      this.elements.form.elements.id.value = room.id || '';
      this.elements.form.elements.kodeLokal.value = room.kodeLokal || '';
      this.elements.form.elements.namaLokal.value = room.namaLokal || '';
      this.elements.form.elements.gedungId.value = room.gedungId || '';
      this.elements.form.elements.lantai.value = room.lantai || '';
      this.elements.form.elements.kapasitas.value = room.kapasitas || '';
      this.elements.form.elements.jenisLokal.value = room.jenisLokal || 'Ruang Kelas';
      this.elements.form.elements.penanggungJawab.value = room.penanggungJawab || '';
      this.elements.form.elements.status.value = room.status || 'Aktif';
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
      runner.updateRoom(id, payload);
    } else {
      runner.createRoom(payload);
    }
  },

  handleSaveResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message + ' ' + response.error : 'Gagal menyimpan data.', true);
      return;
    }

    this.showToast(response.message || 'Data berhasil disimpan.');
    this.closeForm();
    this.loadRooms();
  },

  handleTableAction(event) {
    const button = event.target.closest('button[data-action]');

    if (!button) {
      return;
    }

    const id = button.dataset.id;
    const room = this.rooms.find((item) => item.id === id);

    if (button.dataset.action === 'edit' && room) {
      this.openForm(room);
      return;
    }

    if (button.dataset.action === 'delete') {
      this.deleteRoom(id);
    }
  },

  deleteRoom(id) {
    const confirmed = window.confirm('Hapus data lokal ini?');

    if (!confirmed) {
      return;
    }

    google.script.run
      .withSuccessHandler((response) => this.handleDeleteResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal menghapus data.', true))
      .deleteRoom(id);
  },

  handleDeleteResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal menghapus data.', true);
      return;
    }

    this.showToast(response.message || 'Data berhasil dihapus.');
    this.loadRooms();
  },

  getFormPayload() {
    return {
      kodeLokal: this.elements.form.elements.kodeLokal.value,
      namaLokal: this.elements.form.elements.namaLokal.value,
      gedungId: this.elements.form.elements.gedungId.value,
      lantai: this.elements.form.elements.lantai.value,
      kapasitas: this.elements.form.elements.kapasitas.value,
      jenisLokal: this.elements.form.elements.jenisLokal.value,
      penanggungJawab: this.elements.form.elements.penanggungJawab.value,
      status: this.elements.form.elements.status.value
    };
  },

  getBuildingName(room) {
    if (room.gedungNama) {
      return room.gedungNama;
    }

    const building = this.buildings.find((item) => item.id === room.gedungId);
    return building ? building.namaGedung : '';
  },

  setLoading(isLoading) {
    if (isLoading) {
      this.elements.tableBody.innerHTML = '<tr><td colspan="8">Memuat data lokal...</td></tr>';
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
  RoomPage.init();
});
