const InventoryPage = {
  inventories: [],
  buildings: [],
  rooms: [],
  facilities: [],
  elements: {},

  init() {
    if (SiprasUtils.getCurrentPage() !== 'inventory') {
      return;
    }

    this.cacheElements();
    this.bindEvents();
    this.loadBuildings();
  },

  cacheElements() {
    this.elements.formPanel = SiprasUtils.qs('#inventoryFormPanel');
    this.elements.form = SiprasUtils.qs('#inventoryForm');
    this.elements.formTitle = SiprasUtils.qs('#inventoryFormTitle');
    this.elements.tableBody = SiprasUtils.qs('#inventoryTableBody');
    this.elements.search = SiprasUtils.qs('#inventorySearch');
    this.elements.buildingFilter = SiprasUtils.qs('#buildingFilter');
    this.elements.roomFilter = SiprasUtils.qs('#roomFilter');
    this.elements.facilityFilter = SiprasUtils.qs('#facilityFilter');
    this.elements.conditionFilter = SiprasUtils.qs('#conditionFilter');
    this.elements.statusFilter = SiprasUtils.qs('#statusFilter');
    this.elements.addButton = SiprasUtils.qs('#addInventoryButton');
    this.elements.cancelButton = SiprasUtils.qs('#cancelInventoryForm');
    this.elements.toast = SiprasUtils.qs('#inventoryToast');
  },

  bindEvents() {
    this.elements.addButton.addEventListener('click', () => this.openForm());
    this.elements.cancelButton.addEventListener('click', () => this.closeForm());
    this.elements.search.addEventListener('input', () => this.renderTable());
    this.elements.buildingFilter.addEventListener('change', () => this.handleFilterBuildingChange());
    this.elements.roomFilter.addEventListener('change', () => this.handleFilterRoomChange());
    this.elements.facilityFilter.addEventListener('change', () => this.renderTable());
    this.elements.conditionFilter.addEventListener('change', () => this.renderTable());
    this.elements.statusFilter.addEventListener('change', () => this.renderTable());
    this.elements.form.elements.gedungId.addEventListener('change', () => this.handleFormBuildingChange());
    this.elements.form.elements.lokalId.addEventListener('change', () => this.handleFormRoomChange());
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
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal memuat data fasilitas.', true);
      this.facilities = [];
    } else {
      this.facilities = response.data || [];
    }

    this.renderFacilityFilterOptions();
    this.loadInventories();
  },

  loadInventories() {
    google.script.run
      .withSuccessHandler((response) => this.handleInventoriesResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal memuat data inventaris.', true))
      .getInventories();
  },

  handleInventoriesResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal memuat data inventaris.', true);
      this.inventories = [];
    } else {
      this.inventories = response.data || [];
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

  renderRoomFilterOptions(rooms = this.rooms) {
    this.elements.roomFilter.innerHTML = '<option value="">Semua Lokal</option>' + this.createRoomOptions(rooms);
  },

  renderFacilityFilterOptions(facilities = this.facilities) {
    this.elements.facilityFilter.innerHTML = '<option value="">Semua Fasilitas</option>' + this.createFacilityOptions(facilities);
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

  handleFilterBuildingChange() {
    const gedungId = this.elements.buildingFilter.value;
    const rooms = gedungId ? this.rooms.filter((room) => room.gedungId === gedungId) : this.rooms;
    const facilities = gedungId ? this.facilities.filter((facility) => facility.gedungId === gedungId) : this.facilities;

    this.renderRoomFilterOptions(rooms);
    this.renderFacilityFilterOptions(facilities);
    this.elements.roomFilter.value = '';
    this.elements.facilityFilter.value = '';
    this.renderTable();
  },

  handleFilterRoomChange() {
    const gedungId = this.elements.buildingFilter.value;
    const lokalId = this.elements.roomFilter.value;
    const facilities = this.facilities.filter((facility) => {
      const matchesBuilding = !gedungId || facility.gedungId === gedungId;
      const matchesRoom = !lokalId || facility.lokalId === lokalId;
      return matchesBuilding && matchesRoom;
    });

    this.renderFacilityFilterOptions(facilities);
    this.elements.facilityFilter.value = '';
    this.renderTable();
  },

  handleFormBuildingChange() {
    const gedungId = this.elements.form.elements.gedungId.value;
    this.renderFormRoomOptions(gedungId);
    this.renderFormFacilityOptions('');
  },

  handleFormRoomChange() {
    const lokalId = this.elements.form.elements.lokalId.value;
    this.renderFormFacilityOptions(lokalId);
  },

  renderTable() {
    const keyword = this.elements.search.value.trim().toLowerCase();
    const gedungId = this.elements.buildingFilter.value;
    const lokalId = this.elements.roomFilter.value;
    const fasilitasId = this.elements.facilityFilter.value;
    const kondisi = this.elements.conditionFilter.value;
    const status = this.elements.statusFilter.value;
    const rows = this.inventories.filter((inventory) => {
      const code = String(inventory.kodeInventaris || '').toLowerCase();
      const number = String(inventory.nomorInventaris || '').toLowerCase();
      const name = String(inventory.namaBarang || '').toLowerCase();
      const matchesKeyword = code.includes(keyword) || number.includes(keyword) || name.includes(keyword);
      const matchesBuilding = !gedungId || inventory.gedungId === gedungId;
      const matchesRoom = !lokalId || inventory.lokalId === lokalId;
      const matchesFacility = !fasilitasId || inventory.fasilitasId === fasilitasId;
      const matchesCondition = !kondisi || inventory.kondisi === kondisi;
      const matchesStatus = !status || inventory.status === status;

      return matchesKeyword && matchesBuilding && matchesRoom && matchesFacility && matchesCondition && matchesStatus;
    });

    if (rows.length === 0) {
      this.elements.tableBody.innerHTML = '<tr><td colspan="11">Data inventaris belum tersedia.</td></tr>';
      return;
    }

    this.elements.tableBody.innerHTML = rows.map((inventory) => this.createRow(inventory)).join('');
  },

  createRow(inventory) {
    return `
      <tr>
        <td>${this.escape(inventory.kodeInventaris)}</td>
        <td>${this.escape(inventory.nomorInventaris)}</td>
        <td>${this.escape(inventory.namaBarang)}</td>
        <td>${this.escape(this.getBuildingName(inventory))}</td>
        <td>${this.escape(this.getRoomName(inventory))}</td>
        <td>${this.escape(this.getFacilityName(inventory))}</td>
        <td>${this.escape(inventory.merk)}</td>
        <td>${this.escape(this.getAmountLabel(inventory))}</td>
        <td><span class="status-pill">${this.escape(inventory.kondisi)}</span></td>
        <td><span class="status-pill">${this.escape(inventory.status)}</span></td>
        <td>
          <div class="row-actions">
            <button class="button button--small button--secondary" type="button" data-action="edit" data-id="${this.escape(inventory.id)}">Edit</button>
            <button class="button button--small button--danger" type="button" data-action="delete" data-id="${this.escape(inventory.id)}">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  },

  openForm(inventory = null) {
    this.elements.form.reset();
    this.elements.formPanel.hidden = false;
    this.elements.formTitle.textContent = inventory ? 'Edit Inventaris' : 'Tambah Inventaris';
    this.elements.form.elements.kategori.value = 'Furniture';
    this.elements.form.elements.kondisi.value = 'Baik';
    this.elements.form.elements.status.value = 'Aktif';
    this.elements.form.elements.satuan.value = 'unit';
    this.renderFormRoomOptions('');
    this.renderFormFacilityOptions('');

    if (inventory) {
      this.elements.form.elements.id.value = inventory.id || '';
      this.elements.form.elements.kodeInventaris.value = inventory.kodeInventaris || '';
      this.elements.form.elements.nomorInventaris.value = inventory.nomorInventaris || '';
      this.elements.form.elements.namaBarang.value = inventory.namaBarang || '';
      this.elements.form.elements.kategori.value = inventory.kategori || 'Furniture';
      this.elements.form.elements.gedungId.value = inventory.gedungId || '';
      this.renderFormRoomOptions(inventory.gedungId || '', inventory.lokalId || '');
      this.renderFormFacilityOptions(inventory.lokalId || '', inventory.fasilitasId || '');
      this.elements.form.elements.merk.value = inventory.merk || '';
      this.elements.form.elements.tipe.value = inventory.tipe || '';
      this.elements.form.elements.spesifikasi.value = inventory.spesifikasi || '';
      this.elements.form.elements.tahunPengadaan.value = inventory.tahunPengadaan || '';
      this.elements.form.elements.jumlah.value = inventory.jumlah || '';
      this.elements.form.elements.satuan.value = inventory.satuan || 'unit';
      this.elements.form.elements.kondisi.value = inventory.kondisi || 'Baik';
      this.elements.form.elements.sumberDana.value = inventory.sumberDana || '';
      this.elements.form.elements.status.value = inventory.status || 'Aktif';
      this.elements.form.elements.keterangan.value = inventory.keterangan || '';
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
      runner.updateInventory(id, payload);
    } else {
      runner.createInventory(payload);
    }
  },

  handleSaveResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message + ' ' + response.error : 'Gagal menyimpan data.', true);
      return;
    }

    this.showToast(response.message || 'Data berhasil disimpan.');
    this.closeForm();
    this.loadInventories();
  },

  handleTableAction(event) {
    const button = event.target.closest('button[data-action]');

    if (!button) {
      return;
    }

    const id = button.dataset.id;
    const inventory = this.inventories.find((item) => item.id === id);

    if (button.dataset.action === 'edit' && inventory) {
      this.openForm(inventory);
      return;
    }

    if (button.dataset.action === 'delete') {
      this.deleteInventory(id);
    }
  },

  deleteInventory(id) {
    const confirmed = window.confirm('Hapus data inventaris ini?');

    if (!confirmed) {
      return;
    }

    google.script.run
      .withSuccessHandler((response) => this.handleDeleteResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal menghapus data.', true))
      .deleteInventory(id);
  },

  handleDeleteResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal menghapus data.', true);
      return;
    }

    this.showToast(response.message || 'Data berhasil dihapus.');
    this.loadInventories();
  },

  getFormPayload() {
    return {
      kodeInventaris: this.elements.form.elements.kodeInventaris.value,
      nomorInventaris: this.elements.form.elements.nomorInventaris.value,
      namaBarang: this.elements.form.elements.namaBarang.value,
      kategori: this.elements.form.elements.kategori.value,
      gedungId: this.elements.form.elements.gedungId.value,
      lokalId: this.elements.form.elements.lokalId.value,
      fasilitasId: this.elements.form.elements.fasilitasId.value,
      merk: this.elements.form.elements.merk.value,
      tipe: this.elements.form.elements.tipe.value,
      spesifikasi: this.elements.form.elements.spesifikasi.value,
      tahunPengadaan: this.elements.form.elements.tahunPengadaan.value,
      jumlah: this.elements.form.elements.jumlah.value,
      satuan: this.elements.form.elements.satuan.value,
      kondisi: this.elements.form.elements.kondisi.value,
      sumberDana: this.elements.form.elements.sumberDana.value,
      status: this.elements.form.elements.status.value,
      keterangan: this.elements.form.elements.keterangan.value
    };
  },

  getBuildingName(inventory) {
    if (inventory.gedungNama) {
      return inventory.gedungNama;
    }

    const building = this.buildings.find((item) => item.id === inventory.gedungId);
    return building ? building.namaGedung : '';
  },

  getRoomName(inventory) {
    if (inventory.lokalNama) {
      return inventory.lokalNama;
    }

    const room = this.rooms.find((item) => item.id === inventory.lokalId);
    return room ? room.namaLokal : '';
  },

  getFacilityName(inventory) {
    if (inventory.fasilitasNama) {
      return inventory.fasilitasNama;
    }

    const facility = this.facilities.find((item) => item.id === inventory.fasilitasId);
    return facility ? facility.namaFasilitas : '';
  },

  getAmountLabel(inventory) {
    const amount = inventory.jumlah || '';
    const unit = inventory.satuan || '';
    return `${amount} ${unit}`.trim();
  },

  setLoading(isLoading) {
    if (isLoading) {
      this.elements.tableBody.innerHTML = '<tr><td colspan="11">Memuat data inventaris...</td></tr>';
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
  InventoryPage.init();
});
