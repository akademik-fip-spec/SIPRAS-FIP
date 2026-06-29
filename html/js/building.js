const BuildingPage = {
  buildings: [],
  elements: {},

  init() {
    if (SiprasUtils.getCurrentPage() !== 'building') {
      return;
    }

    this.cacheElements();
    this.bindEvents();
    this.loadBuildings();
  },

  cacheElements() {
    this.elements.formPanel = SiprasUtils.qs('#buildingFormPanel');
    this.elements.form = SiprasUtils.qs('#buildingForm');
    this.elements.formTitle = SiprasUtils.qs('#buildingFormTitle');
    this.elements.tableBody = SiprasUtils.qs('#buildingTableBody');
    this.elements.search = SiprasUtils.qs('#buildingSearch');
    this.elements.addButton = SiprasUtils.qs('#addBuildingButton');
    this.elements.cancelButton = SiprasUtils.qs('#cancelBuildingForm');
    this.elements.toast = SiprasUtils.qs('#buildingToast');
  },

  bindEvents() {
    this.elements.addButton.addEventListener('click', () => this.openForm());
    this.elements.cancelButton.addEventListener('click', () => this.closeForm());
    this.elements.search.addEventListener('input', () => this.renderTable());
    this.elements.form.addEventListener('submit', (event) => this.handleSubmit(event));
    this.elements.tableBody.addEventListener('click', (event) => this.handleTableAction(event));
  },

  loadBuildings() {
    this.setLoading(true);
    google.script.run
      .withSuccessHandler((response) => this.handleLoadResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal memuat data.', true))
      .getBuildings();
  },

  handleLoadResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal memuat data.', true);
      this.buildings = [];
    } else {
      this.buildings = response.data || [];
    }

    this.renderTable();
  },

  renderTable() {
    const keyword = this.elements.search.value.trim().toLowerCase();
    const rows = this.buildings.filter((building) => {
      const code = String(building.kodeGedung || '').toLowerCase();
      const name = String(building.namaGedung || '').toLowerCase();
      return code.includes(keyword) || name.includes(keyword);
    });

    if (rows.length === 0) {
      this.elements.tableBody.innerHTML = '<tr><td colspan="5">Data gedung belum tersedia.</td></tr>';
      return;
    }

    this.elements.tableBody.innerHTML = rows.map((building) => this.createRow(building)).join('');
  },

  createRow(building) {
    return `
      <tr>
        <td>${this.escape(building.kodeGedung)}</td>
        <td>${this.escape(building.namaGedung)}</td>
        <td>${this.escape(building.alamat)}</td>
        <td><span class="status-pill">${this.escape(building.status)}</span></td>
        <td>
          <div class="row-actions">
            <button class="button button--small button--secondary" type="button" data-action="edit" data-id="${this.escape(building.id)}">Edit</button>
            <button class="button button--small button--danger" type="button" data-action="delete" data-id="${this.escape(building.id)}">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  },

  openForm(building = null) {
    this.elements.form.reset();
    this.elements.formPanel.hidden = false;
    this.elements.formTitle.textContent = building ? 'Edit Gedung' : 'Tambah Gedung';
    this.elements.form.elements.status.value = 'Aktif';

    if (building) {
      this.elements.form.elements.id.value = building.id || '';
      this.elements.form.elements.kodeGedung.value = building.kodeGedung || '';
      this.elements.form.elements.namaGedung.value = building.namaGedung || '';
      this.elements.form.elements.alamat.value = building.alamat || '';
      this.elements.form.elements.deskripsi.value = building.deskripsi || '';
      this.elements.form.elements.status.value = building.status || 'Aktif';
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
      runner.updateBuilding(id, payload);
    } else {
      runner.createBuilding(payload);
    }
  },

  handleSaveResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message + ' ' + response.error : 'Gagal menyimpan data.', true);
      return;
    }

    this.showToast(response.message || 'Data berhasil disimpan.');
    this.closeForm();
    this.loadBuildings();
  },

  handleTableAction(event) {
    const button = event.target.closest('button[data-action]');

    if (!button) {
      return;
    }

    const id = button.dataset.id;
    const building = this.buildings.find((item) => item.id === id);

    if (button.dataset.action === 'edit' && building) {
      this.openForm(building);
      return;
    }

    if (button.dataset.action === 'delete') {
      this.deleteBuilding(id);
    }
  },

  deleteBuilding(id) {
    const confirmed = window.confirm('Hapus data gedung ini?');

    if (!confirmed) {
      return;
    }

    google.script.run
      .withSuccessHandler((response) => this.handleDeleteResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal menghapus data.', true))
      .deleteBuilding(id);
  },

  handleDeleteResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal menghapus data.', true);
      return;
    }

    this.showToast(response.message || 'Data berhasil dihapus.');
    this.loadBuildings();
  },

  getFormPayload() {
    return {
      kodeGedung: this.elements.form.elements.kodeGedung.value,
      namaGedung: this.elements.form.elements.namaGedung.value,
      alamat: this.elements.form.elements.alamat.value,
      deskripsi: this.elements.form.elements.deskripsi.value,
      status: this.elements.form.elements.status.value
    };
  },

  setLoading(isLoading) {
    if (isLoading) {
      this.elements.tableBody.innerHTML = '<tr><td colspan="5">Memuat data gedung...</td></tr>';
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
  BuildingPage.init();
});
