const FacilityPage = {
  facilities: [],
  rooms: [],
  elements: {},

  init() {
    if (SiprasUtils.getCurrentPage() !== 'facility') {
      return;
    }

    this.cacheElements();
    this.bindEvents();
    this.loadRooms();
  },

  cacheElements() {
    this.elements.formPanel = SiprasUtils.qs('#facilityFormPanel');
    this.elements.form = SiprasUtils.qs('#facilityForm');
    this.elements.formTitle = SiprasUtils.qs('#facilityFormTitle');
    this.elements.tableBody = SiprasUtils.qs('#facilityTableBody');
    this.elements.search = SiprasUtils.qs('#facilitySearch');
    this.elements.buildingFilter = SiprasUtils.qs('#buildingFilter');
    this.elements.roomFilter = SiprasUtils.qs('#roomFilter');
    this.elements.conditionFilter = SiprasUtils.qs('#conditionFilter');
    this.elements.addButton = SiprasUtils.qs('#addFacilityButton');
    this.elements.cancelButton = SiprasUtils.qs('#cancelFacilityForm');
    this.elements.toast = SiprasUtils.qs('#facilityToast');
  },

  bindEvents() {
    this.elements.addButton.addEventListener('click', () => this.openForm());
    this.elements.cancelButton.addEventListener('click', () => this.closeForm());
    this.elements.search.addEventListener('input', () => this.renderTable());
    this.elements.buildingFilter.addEventListener('change', () => this.handleBuildingFilterChange());
    this.elements.roomFilter.addEventListener('change', () => this.renderTable());
    this.elements.conditionFilter.addEventListener('change', () => this.renderTable());
    this.elements.form.elements.lokalId.addEventListener('change', () => this.updateSelectedBuilding());
    this.elements.form.addEventListener('submit', (event) => this.handleSubmit(event));
    this.elements.tableBody.addEventListener('click', (event) => this.handleTableAction(event));
  },

  loadRooms() {
    this.setLoading(true);
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

    this.renderRoomOptions();
    this.loadFacilities();
  },

  loadFacilities() {
    google.script.run
      .withSuccessHandler((response) => this.handleFacilitiesResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal memuat data fasilitas.', true))
      .getFacilities();
  },

  handleFacilitiesResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal memuat data fasilitas.', true);
      this.facilities = [];
    } else {
      this.facilities = response.data || [];
    }

    this.renderTable();
  },

  renderRoomOptions() {
    const roomOptions = this.createRoomOptions(this.rooms);
    const buildingOptions = this.getUniqueBuildings().map((building) => {
      return `<option value="${this.escape(building.id)}">${this.escape(building.name)}</option>`;
    }).join('');

    this.elements.form.elements.lokalId.innerHTML = '<option value="">Pilih Lokal</option>' + roomOptions;
    this.elements.roomFilter.innerHTML = '<option value="">Semua Lokal</option>' + roomOptions;
    this.elements.buildingFilter.innerHTML = '<option value="">Semua Gedung</option>' + buildingOptions;
  },

  createRoomOptions(rooms) {
    return rooms.map((room) => {
      const label = room.gedungNama ? `${room.namaLokal} - ${room.gedungNama}` : room.namaLokal;
      return `<option value="${this.escape(room.id)}">${this.escape(label)}</option>`;
    }).join('');
  },

  getUniqueBuildings() {
    const buildingMap = {};

    this.rooms.forEach((room) => {
      if (room.gedungId && !buildingMap[room.gedungId]) {
        buildingMap[room.gedungId] = {
          id: room.gedungId,
          name: room.gedungNama || room.gedungId
        };
      }
    });

    return Object.keys(buildingMap).map((id) => buildingMap[id]);
  },

  handleBuildingFilterChange() {
    const gedungId = this.elements.buildingFilter.value;
    const rooms = gedungId ? this.rooms.filter((room) => room.gedungId === gedungId) : this.rooms;

    this.elements.roomFilter.innerHTML = '<option value="">Semua Lokal</option>' + this.createRoomOptions(rooms);
    this.elements.roomFilter.value = '';
    this.renderTable();
  },

  renderTable() {
    const keyword = this.elements.search.value.trim().toLowerCase();
    const gedungId = this.elements.buildingFilter.value;
    const lokalId = this.elements.roomFilter.value;
    const kondisi = this.elements.conditionFilter.value;
    const rows = this.facilities.filter((facility) => {
      const code = String(facility.kodeFasilitas || '').toLowerCase();
      const name = String(facility.namaFasilitas || '').toLowerCase();
      const matchesKeyword = code.includes(keyword) || name.includes(keyword);
      const matchesBuilding = !gedungId || facility.gedungId === gedungId;
      const matchesRoom = !lokalId || facility.lokalId === lokalId;
      const matchesCondition = !kondisi || facility.kondisi === kondisi;

      return matchesKeyword && matchesBuilding && matchesRoom && matchesCondition;
    });

    if (rows.length === 0) {
      this.elements.tableBody.innerHTML = '<tr><td colspan="9">Data fasilitas belum tersedia.</td></tr>';
      return;
    }

    this.elements.tableBody.innerHTML = rows.map((facility) => this.createRow(facility)).join('');
  },

  createRow(facility) {
    return `
      <tr>
        <td>${this.escape(facility.kodeFasilitas)}</td>
        <td>${this.escape(facility.namaFasilitas)}</td>
        <td>${this.escape(facility.kategori)}</td>
        <td>${this.escape(this.getBuildingName(facility))}</td>
        <td>${this.escape(this.getRoomName(facility))}</td>
        <td>${this.escape(this.getAmountLabel(facility))}</td>
        <td><span class="status-pill">${this.escape(facility.kondisi)}</span></td>
        <td><span class="status-pill">${this.escape(facility.status)}</span></td>
        <td>
          <div class="row-actions">
            <button class="button button--small button--secondary" type="button" data-action="edit" data-id="${this.escape(facility.id)}">Edit</button>
            <button class="button button--small button--danger" type="button" data-action="delete" data-id="${this.escape(facility.id)}">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  },

  openForm(facility = null) {
    this.elements.form.reset();
    this.elements.formPanel.hidden = false;
    this.elements.formTitle.textContent = facility ? 'Edit Fasilitas' : 'Tambah Fasilitas';
    this.elements.form.elements.kategori.value = 'Furniture';
    this.elements.form.elements.kondisi.value = 'Baik';
    this.elements.form.elements.status.value = 'Aktif';
    this.elements.form.elements.satuan.value = 'unit';
    this.updateSelectedBuilding();

    if (facility) {
      this.elements.form.elements.id.value = facility.id || '';
      this.elements.form.elements.kodeFasilitas.value = facility.kodeFasilitas || '';
      this.elements.form.elements.namaFasilitas.value = facility.namaFasilitas || '';
      this.elements.form.elements.kategori.value = facility.kategori || 'Furniture';
      this.elements.form.elements.lokalId.value = facility.lokalId || '';
      this.elements.form.elements.jumlah.value = facility.jumlah || '';
      this.elements.form.elements.satuan.value = facility.satuan || 'unit';
      this.elements.form.elements.kondisi.value = facility.kondisi || 'Baik';
      this.elements.form.elements.status.value = facility.status || 'Aktif';
      this.elements.form.elements.keterangan.value = facility.keterangan || '';
      this.updateSelectedBuilding();
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
      runner.updateFacility(id, payload);
    } else {
      runner.createFacility(payload);
    }
  },

  handleSaveResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message + ' ' + response.error : 'Gagal menyimpan data.', true);
      return;
    }

    this.showToast(response.message || 'Data berhasil disimpan.');
    this.closeForm();
    this.loadFacilities();
  },

  handleTableAction(event) {
    const button = event.target.closest('button[data-action]');

    if (!button) {
      return;
    }

    const id = button.dataset.id;
    const facility = this.facilities.find((item) => item.id === id);

    if (button.dataset.action === 'edit' && facility) {
      this.openForm(facility);
      return;
    }

    if (button.dataset.action === 'delete') {
      this.deleteFacility(id);
    }
  },

  deleteFacility(id) {
    const confirmed = window.confirm('Hapus data fasilitas ini?');

    if (!confirmed) {
      return;
    }

    google.script.run
      .withSuccessHandler((response) => this.handleDeleteResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal menghapus data.', true))
      .deleteFacility(id);
  },

  handleDeleteResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal menghapus data.', true);
      return;
    }

    this.showToast(response.message || 'Data berhasil dihapus.');
    this.loadFacilities();
  },

  getFormPayload() {
    return {
      kodeFasilitas: this.elements.form.elements.kodeFasilitas.value,
      namaFasilitas: this.elements.form.elements.namaFasilitas.value,
      kategori: this.elements.form.elements.kategori.value,
      gedungId: this.elements.form.elements.gedungId.value,
      lokalId: this.elements.form.elements.lokalId.value,
      jumlah: this.elements.form.elements.jumlah.value,
      satuan: this.elements.form.elements.satuan.value,
      kondisi: this.elements.form.elements.kondisi.value,
      keterangan: this.elements.form.elements.keterangan.value,
      status: this.elements.form.elements.status.value
    };
  },

  getRoomName(facility) {
    if (facility.lokalNama) {
      return facility.lokalNama;
    }

    const room = this.rooms.find((item) => item.id === facility.lokalId);
    return room ? room.namaLokal : '';
  },

  getBuildingName(facility) {
    if (facility.gedungNama) {
      return facility.gedungNama;
    }

    const room = this.rooms.find((item) => item.id === facility.lokalId);
    return room ? room.gedungNama : '';
  },

  updateSelectedBuilding() {
    const lokalId = this.elements.form.elements.lokalId.value;
    const room = this.rooms.find((item) => item.id === lokalId);

    this.elements.form.elements.gedungId.value = room ? room.gedungId : '';
    this.elements.form.elements.gedungNama.value = room ? room.gedungNama : '';
  },

  getAmountLabel(facility) {
    const amount = facility.jumlah || '';
    const unit = facility.satuan || '';
    return `${amount} ${unit}`.trim();
  },

  setLoading(isLoading) {
    if (isLoading) {
      this.elements.tableBody.innerHTML = '<tr><td colspan="9">Memuat data fasilitas...</td></tr>';
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
  FacilityPage.init();
});
