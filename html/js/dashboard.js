const DashboardPage = {
  elements: {},

  init() {
    if (SiprasUtils.getCurrentPage() !== 'dashboard') {
      return;
    }

    this.cacheElements();
    this.loadDashboard();
  },

  cacheElements() {
    this.elements.stats = SiprasUtils.qs('#dashboardStats');
    this.elements.conditionSummary = SiprasUtils.qs('#inventoryConditionSummary');
    this.elements.latestInspectionsBody = SiprasUtils.qs('#latestInspectionsBody');
    this.elements.todaySchedulesBody = SiprasUtils.qs('#todaySchedulesBody');
    this.elements.attentionInventoriesBody = SiprasUtils.qs('#attentionInventoriesBody');
    this.elements.recentActivities = SiprasUtils.qs('#recentActivities');
    this.elements.toast = SiprasUtils.qs('#dashboardToast');
  },

  loadDashboard() {
    google.script.run
      .withSuccessHandler((response) => this.handleDashboardResponse(response))
      .withFailureHandler((error) => this.showToast(error.message || 'Gagal memuat dashboard.', true))
      .getDashboardData();
  },

  handleDashboardResponse(response) {
    if (!response || !response.success) {
      this.showToast(response ? response.message : 'Gagal memuat dashboard.', true);
      return;
    }

    const data = response.data || {};
    this.renderStats(data.statistics || {});
    this.renderConditionSummary(data.inventoryConditionSummary || []);
    this.renderLatestInspections(data.latestInspections || []);
    this.renderTodaySchedules(data.todaySchedules || []);
    this.renderAttentionInventories(data.attentionInventories || []);
    this.renderRecentActivities(data.recentActivities || []);
  },

  renderStats(statistics) {
    const cards = [
      ['Total Gedung', statistics.totalGedung],
      ['Total Lokal', statistics.totalLokal],
      ['Total Fasilitas', statistics.totalFasilitas],
      ['Total Inventaris', statistics.totalInventaris],
      ['Total Pemeriksaan', statistics.totalPemeriksaan],
      ['Jadwal Hari Ini', statistics.jadwalHariIni]
    ];

    this.elements.stats.innerHTML = cards.map((card) => {
      return `
        <article class="metric-card">
          <span>${this.escape(card[0])}</span>
          <strong>${this.escape(this.formatNumber(card[1] || 0))}</strong>
        </article>
      `;
    }).join('');
  },

  renderConditionSummary(summary) {
    if (summary.length === 0) {
      this.elements.conditionSummary.innerHTML = '<p>Data inventaris belum tersedia.</p>';
      return;
    }

    this.elements.conditionSummary.innerHTML = summary.map((item) => {
      const percentage = Number(item.persentase || 0);
      return `
        <article class="condition-item">
          <div class="condition-item__meta">
            <strong>${this.escape(item.kondisi)}</strong>
            <span>${this.escape(item.jumlah || 0)} item</span>
          </div>
          <div class="progress-bar" aria-label="${this.escape(item.kondisi)} ${percentage}%">
            <span style="width: ${percentage}%"></span>
          </div>
          <span class="condition-item__percent">${percentage}%</span>
        </article>
      `;
    }).join('');
  },

  renderLatestInspections(inspections) {
    if (inspections.length === 0) {
      this.elements.latestInspectionsBody.innerHTML = '<tr><td colspan="6">Belum ada data pemeriksaan.</td></tr>';
      return;
    }

    this.elements.latestInspectionsBody.innerHTML = inspections.map((inspection) => {
      return `
        <tr>
          <td>${this.escape(inspection.tanggalPemeriksaan)}</td>
          <td>${this.escape(this.getInventoryLabel(inspection))}</td>
          <td>${this.escape(inspection.petugas)}</td>
          <td><span class="status-pill">${this.escape(inspection.kondisi)}</span></td>
          <td>${this.escape(inspection.tindakan)}</td>
          <td><span class="status-pill">${this.escape(inspection.status)}</span></td>
        </tr>
      `;
    }).join('');
  },

  renderTodaySchedules(schedules) {
    if (schedules.length === 0) {
      this.elements.todaySchedulesBody.innerHTML = '<tr><td colspan="5">Tidak ada jadwal hari ini.</td></tr>';
      return;
    }

    this.elements.todaySchedulesBody.innerHTML = schedules.map((schedule) => {
      return `
        <tr>
          <td>${this.escape(this.getTimeLabel(schedule))}</td>
          <td>${this.escape(schedule.lokalNama)}</td>
          <td>${this.escape(schedule.judulKegiatan)}</td>
          <td>${this.escape(schedule.penanggungJawab)}</td>
          <td><span class="status-pill">${this.escape(schedule.status)}</span></td>
        </tr>
      `;
    }).join('');
  },

  renderAttentionInventories(inventories) {
    if (inventories.length === 0) {
      this.elements.attentionInventoriesBody.innerHTML = '<tr><td colspan="5">Tidak ada inventaris rusak ringan atau rusak berat.</td></tr>';
      return;
    }

    this.elements.attentionInventoriesBody.innerHTML = inventories.map((inventory) => {
      return `
        <tr>
          <td>${this.escape(inventory.nomorInventaris)}</td>
          <td>${this.escape(inventory.namaBarang)}</td>
          <td>${this.escape(inventory.lokalNama)}</td>
          <td>${this.escape(inventory.fasilitasNama)}</td>
          <td><span class="status-pill">${this.escape(inventory.kondisi)}</span></td>
        </tr>
      `;
    }).join('');
  },

  renderRecentActivities(activities) {
    if (activities.length === 0) {
      this.elements.recentActivities.innerHTML = '<p>Belum ada aktivitas terbaru.</p>';
      return;
    }

    this.elements.recentActivities.innerHTML = activities.map((activity) => {
      return `
        <article class="activity-item">
          <div>
            <span class="activity-item__type">${this.escape(activity.tipe)}</span>
            <strong>${this.escape(activity.judul)}</strong>
            <p>${this.escape(activity.deskripsi)}</p>
          </div>
          <div class="activity-item__meta">
            <time>${this.escape(this.formatDateTime(activity.waktu))}</time>
            <span class="status-pill">${this.escape(activity.status)}</span>
          </div>
        </article>
      `;
    }).join('');
  },

  getInventoryLabel(inspection) {
    return inspection.nomorInventaris
      ? `${inspection.inventarisNama} - ${inspection.nomorInventaris}`
      : inspection.inventarisNama;
  },

  getTimeLabel(schedule) {
    return `${schedule.jamMulai || ''} - ${schedule.jamSelesai || ''}`.trim();
  },

  formatNumber(value) {
    return Number(value || 0).toLocaleString('id-ID');
  },

  formatDateTime(value) {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
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
  DashboardPage.init();
});
