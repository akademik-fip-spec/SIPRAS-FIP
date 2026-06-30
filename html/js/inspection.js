const InspectionPage = {
  inspections: [],
  buildings: [],
  rooms: [],
  facilities: [],
  inventories: [],
  elements: {},

  init() {
    if (SiprasUtils.getCurrentPage() !== 'inspection') {
      return;
    }

    this.cacheElements();
    this.bindEvents();
    this.loadBuildings();
  },

  cacheElements() {
    this.elements.formPanel = SiprasUtils.qs('#inspectionFormPanel');
    this.elements.form = SiprasUtils.qs('#inspectionForm');
    this.elements.formTitle = SiprasUtils.qs('#inspectionFormTitle');
    this.elements.tableBody = SiprasUtils.qs('#inspectionTableBody');
    this.elements.historyPanel = SiprasUtils.qs('#historyPanel');
    this.elements.historyTitle = SiprasUtils.qs('#historyTitle');
    this.elements.historyTableBody = SiprasUtils.qs('#historyTableBody');
    this.elements.search = SiprasUtils.qs('#inspectionSearch');
    this.elements.buildingFilter = SiprasUtils.qs('#buildingFilter');
    this.elements.roomFilter = SiprasUtils.qs('#roomFilter');
    this.elements.conditionFilter = SiprasUtils.qs('#conditionFilter');
    this.elements.statusFilter = SiprasUtils.qs('#statusFilter');
    this.elements.dateFilter = SiprasUtils.qs('#dateFilter');
    this.elements.addButton = SiprasUtils.qs('#addInspectionButton');
    this.elements.cancelButton = SiprasUtils.qs('#cancelInspectionForm');
    this.elements.toast = SiprasUtils.qs('#inspectionToast');
  },

  bindEvents() {
    this.elements.addButton.addEventListener('click', () => this.openForm());
    this.elements.cancelButton.addEventListener('click', () => this.closeForm());
    this.elements.search.addEventListener('input', () => this.renderTable());
    this.elements.buildingFilter.addEventListener('change', () => this.handleFilterBuildingChange());
    this.elements.roomFilter.addEventListener('change', () => this.renderTable());
    this.elements.conditionFilter.addEventListener('change', () => this.renderTable());
    this.elements.statusFilter.addEventListener('change', () => this.renderTable());
    this.elements.dateFilter.addEventListener('change', () => this.renderTable());
    this.elements.form.elements.gedungId.addEventListener('change', () => this.handleFormBuildingChange());
    this.elements.form.elements.lokalId.addEventListener('change', () => this.handleFormRoomChange());
    this.elements.form.elements.fasilitasId.addEventListener('change', () => this.handleFormFacilityChange());
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
    this.loadFacilities();
  },

  loadFacilities() {
    google.script.run
      .withSuccessHandler((response) => this.handleFacilitiesResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal memuat data fasilitas.', true))
      .getFacilities();
  },

  handleFacilitiesResponse(response) {
    this.facilities = response && response.success ? response.data || [] : [];
    this.loadInventories();
  },

  loadInventories() {
    google.script.run
      .withSuccessHandler((response) => this.handleInventoriesResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal memuat data inventaris.', true))
      .getInventories();
  },

  handleInventoriesResponse(response) {
    this.inventories = response && response.success ? response.data || [] : [];
    this.loadInspections();
  },

  loadInspections() {
    google.script.run
      .withSuccessHandler((response) => this.handleInspectionsResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal memuat data pemeriksaan.', true))
      .getInspections();
  },

  handleInspectionsResponse(response) {
    this.inspections = response && response.success ? response.data || [] : [];
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

  renderFormFacilityOptions(lokalId, selectedId = '') {
    const facilities = lokalId ? this.facilities.filter((facility) => facility.lokalId === lokalId) : [];
    this.elements.form.elements.fasilitasId.innerHTML = '<option value="">Pilih Fasilitas</option>' + this.createFacilityOptions(facilities);
    this.elements.form.elements.fasilitasId.value = selectedId;
  },

  renderFormInventoryOptions(fasilitasId, selectedId = '') {
    const inventories = fasilitasId ? this.inventories.filter((inventory) => inventory.fasilitasId === fasilitasId) : [];
    this.elements.form.elements.inventarisId.innerHTML = '<option value="">Pilih Inventaris</option>' + this.createInventoryOptions(inventories);
    this.elements.form.elements.inventarisId.value = selectedId;
  },

  createRoomOptions(rooms) {
    return rooms.map((room) => {
      const label = room.gedungNama ? `${room.namaLokal} - ${room.gedungNama}` : room.namaLokal;
      return `<option value="${this.escape(room.id)}">${this.escape(label)}</option>`;
    }).join('');
  },

  createFacilityOptions(facilities) {
    return facilities.map((facility) => {
      const label = facility.lokalNama ? `${facility.namaFasilitas} - ${facility.lokalNama}` : facility.namaFasilitas;
      return `<option value="${this.escape(facility.id)}">${this.escape(label)}</option>`;
    }).join('');
  },

  createInventoryOptions(inventories) {
    return inventories.map((inventory) => {
      const label = inventory.nomorInventaris ? `${inventory.namaBarang} - ${inventory.nomorInventaris}` : inventory.namaBarang;
      return `<option value="${this.escape(inventory.id)}">${this.escape(label)}</option>`;
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
    this.renderFormFacilityOptions('');
    this.renderFormInventoryOptions('');
  },

  handleFormRoomChange() {
    this.renderFormFacilityOptions(this.elements.form.elements.lokalId.value);
    this.renderFormInventoryOptions('');
  },

  handleFormFacilityChange() {
    this.renderFormInventoryOptions(this.elements.form.elements.fasilitasId.value);
  },

  renderTable() {
    const rows = this.getFilteredInspections();

    if (rows.length === 0) {
      this.elements.tableBody.innerHTML = '<tr><td colspan="9">Data pemeriksaan belum tersedia.</td></tr>';
      return;
    }

    this.elements.tableBody.innerHTML = rows.map((inspection) => this.createRow(inspection)).join('');
  },

  getFilteredInspections() {
    const keyword = this.elements.search.value.trim().toLowerCase();
    const gedungId = this.elements.buildingFilter.value;
    const lokalId = this.elements.roomFilter.value;
    const kondisi = this.elements.conditionFilter.value;
    const status = this.elements.statusFilter.value;
    const date = this.elements.dateFilter.value;

    return this.inspections.filter((inspection) => {
      const searchable = [
        inspection.nomorPemeriksaan,
        inspection.inventarisNama,
        inspection.nomorInventaris,
        inspection.lokalNama,
        inspection.petugas
      ].join(' ').toLowerCase();

      return searchable.includes(keyword) &&
        (!gedungId || inspection.gedungId === gedungId) &&
        (!lokalId || inspection.lokalId === lokalId) &&
        (!kondisi || inspection.kondisi === kondisi) &&
        (!status || inspection.status === status) &&
        (!date || inspection.tanggalPemeriksaan === date);
    });
  },

  createRow(inspection) {
    return `
      <tr>
        <td>${this.escape(inspection.nomorPemeriksaan)}</td>
        <td>${this.escape(inspection.tanggalPemeriksaan)}</td>
        <td>${this.escape(inspection.gedungNama)}</td>
        <td>${this.escape(inspection.lokalNama)}</td>
        <td>${this.escape(this.getInventoryLabel(inspection))}</td>
        <td>${this.escape(inspection.petugas)}</td>
        <td><span class="status-pill">${this.escape(inspection.kondisi)}</span></td>
        <td><span class="status-pill">${this.escape(inspection.status)}</span></td>
        <td>
          <div class="row-actions">
            <button class="button button--small button--secondary" type="button" data-action="history" data-id="${this.escape(inspection.inventarisId)}">Riwayat</button>
            <button class="button button--small button--secondary" type="button" data-action="edit" data-id="${this.escape(inspection.id)}">Edit</button>
            <button class="button button--small button--danger" type="button" data-action="delete" data-id="${this.escape(inspection.id)}">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  },

  openForm(inspection = null) {
    this.elements.form.reset();
    this.elements.formPanel.hidden = false;
    this.elements.formTitle.textContent = inspection ? 'Edit Pemeriksaan' : 'Tambah Pemeriksaan';
    this.elements.form.elements.tanggalPemeriksaan.value = new Date().toISOString().slice(0, 10);
    this.elements.form.elements.kondisi.value = 'Baik';
    this.elements.form.elements.tindakan.value = 'Tidak Ada';
    this.elements.form.elements.status.value = 'Draft';
    this.renderFormRoomOptions('');
    this.renderFormFacilityOptions('');
    this.renderFormInventoryOptions('');

    if (inspection) {
      this.elements.form.elements.id.value = inspection.id || '';
      this.elements.form.elements.nomorPemeriksaan.value = inspection.nomorPemeriksaan || '';
      this.elements.form.elements.tanggalPemeriksaan.value = inspection.tanggalPemeriksaan || '';
      this.elements.form.elements.petugas.value = inspection.petugas || '';
      this.elements.form.elements.gedungId.value = inspection.gedungId || '';
      this.renderFormRoomOptions(inspection.gedungId || '', inspection.lokalId || '');
      this.renderFormFacilityOptions(inspection.lokalId || '', inspection.fasilitasId || '');
      this.renderFormInventoryOptions(inspection.fasilitasId || '', inspection.inventarisId || '');
      this.elements.form.elements.kondisi.value = inspection.kondisi || 'Baik';
      this.elements.form.elements.tindakan.value = inspection.tindakan || 'Tidak Ada';
      this.elements.form.elements.catatan.value = inspection.catatan || '';
      this.elements.form.elements.foto.value = inspection.foto || '';
      this.elements.form.elements.status.value = inspection.status || 'Draft';
    }

    this.elements.formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  closeForm() {
    this.elements.form.reset();
    this.elements.formPanel.hidden = true;
  },

  handleSubmit(event) {
    event.preventDefault();
    this.getFormPayload().then((payload) => {
      const id = this.elements.form.elements.id.value;
      const runner = google.script.run
        .withSuccessHandler((response) => this.handleSaveResponse(response))
        .withFailureHandler((error) => this.showToast(error.message || 'Gagal menyimpan data.', true));

      if (id) {
        runner.updateInspection(id, payload);
      } else {
        runner.createInspection(payload);
      }
    }).catch((error) => this.showToast(error.message || 'Gagal membaca file foto.', true));
  },

  handleSaveResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message + ' ' + response.error : 'Gagal menyimpan data.', true);
      return;
    }

    this.showToast(response.message || 'Data berhasil disimpan.');
    this.closeForm();
    this.loadInspections();
  },

  handleTableAction(event) {
    const button = event.target.closest('button[data-action]');

    if (!button) {
      return;
    }

    const id = button.dataset.id;

    if (button.dataset.action === 'history') {
      this.showHistory(id);
      return;
    }

    const inspection = this.inspections.find((item) => item.id === id);

    if (button.dataset.action === 'edit' && inspection) {
      this.openForm(inspection);
      return;
    }

    if (button.dataset.action === 'delete') {
      this.deleteInspection(id);
    }
  },

  showHistory(inventarisId) {
    const inventory = this.inventories.find((item) => item.id === inventarisId) || {};
    const rows = this.inspections.filter((inspection) => inspection.inventarisId === inventarisId);
    this.elements.historyPanel.hidden = false;
    this.elements.historyTitle.textContent = `Riwayat Pemeriksaan ${inventory.namaBarang || ''}`.trim();

    if (rows.length === 0) {
      this.elements.historyTableBody.innerHTML = '<tr><td colspan="6">Riwayat pemeriksaan belum tersedia.</td></tr>';
    } else {
      this.elements.historyTableBody.innerHTML = rows.map((inspection) => this.createHistoryRow(inspection)).join('');
    }

    this.elements.historyPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  createHistoryRow(inspection) {
    const photo = inspection.foto
      ? `<a href="${this.escape(inspection.foto)}" target="_blank" rel="noopener">Lihat Foto</a>`
      : '-';

    return `
      <tr>
        <td>${this.escape(inspection.nomorPemeriksaan)}</td>
        <td>${this.escape(inspection.tanggalPemeriksaan)}</td>
        <td>${this.escape(inspection.petugas)}</td>
        <td><span class="status-pill">${this.escape(inspection.kondisi)}</span></td>
        <td>${this.escape(inspection.tindakan)}</td>
        <td>${photo}</td>
      </tr>
    `;
  },

  deleteInspection(id) {
    const confirmed = window.confirm('Hapus data pemeriksaan ini?');

    if (!confirmed) {
      return;
    }

    google.script.run
      .withSuccessHandler((response) => this.handleDeleteResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal menghapus data.', true))
      .deleteInspection(id);
  },

  handleDeleteResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal menghapus data.', true);
      return;
    }

    this.showToast(response.message || 'Data berhasil dihapus.');
    this.loadInspections();
  },

  getFormPayload() {
    const form = this.elements.form;

    return this.readPhotoUpload().then((fotoUpload) => {
      return {
        nomorPemeriksaan: form.elements.nomorPemeriksaan.value,
        tanggalPemeriksaan: form.elements.tanggalPemeriksaan.value,
        petugas: form.elements.petugas.value,
        gedungId: form.elements.gedungId.value,
        lokalId: form.elements.lokalId.value,
        fasilitasId: form.elements.fasilitasId.value,
        inventarisId: form.elements.inventarisId.value,
        kondisi: form.elements.kondisi.value,
        tindakan: form.elements.tindakan.value,
        catatan: form.elements.catatan.value,
        foto: form.elements.foto.value,
        fotoUpload: fotoUpload,
        status: form.elements.status.value
      };
    });
  },

  readPhotoUpload() {
    const file = this.elements.form.elements.fotoUpload.files[0];

    if (!file) {
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        fileName: file.name,
        mimeType: file.type,
        base64: reader.result
      });
      reader.onerror = () => reject(new Error('File foto tidak dapat dibaca.'));
      reader.readAsDataURL(file);
    });
  },

  getInventoryLabel(inspection) {
    return inspection.nomorInventaris
      ? `${inspection.inventarisNama} - ${inspection.nomorInventaris}`
      : inspection.inventarisNama;
  },

  setLoading(isLoading) {
    if (isLoading) {
      this.elements.tableBody.innerHTML = '<tr><td colspan="9">Memuat data pemeriksaan...</td></tr>';
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
  InspectionPage.init();
});
