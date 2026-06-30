/**
 * Global application configuration.
 * Sheet names must be read from this object instead of hardcoded elsewhere.
 */
const Config = {
  APP_NAME: 'SIPRAS-FIP',
  APP_VERSION: '0.2.0',
  DEFAULT_PAGE: 'home',
  SHEETS: {
    USERS: {
      name: 'Users',
      headers: ['id', 'nama', 'email', 'passwordHash', 'role', 'status', 'createdAt', 'updatedAt']
    },
    GEDUNG: {
      name: 'Gedung',
      headers: ['id', 'kodeGedung', 'namaGedung', 'alamat', 'jumlahLantai', 'deskripsi', 'status', 'fotoGedung', 'createdAt', 'updatedAt']
    },
    LOKAL: {
      name: 'Lokal',
      headers: ['id', 'kodeLokal', 'namaLokal', 'gedungId', 'lantai', 'kapasitas', 'jenisLokal', 'penanggungJawab', 'status', 'createdAt', 'updatedAt']
    },
    FASILITAS: {
      name: 'Fasilitas',
      headers: ['id', 'kodeFasilitas', 'namaFasilitas', 'kategori', 'gedungId', 'lokalId', 'jumlah', 'satuan', 'kondisi', 'keterangan', 'status', 'createdAt', 'updatedAt']
    },
    INVENTARIS: {
      name: 'Inventaris',
      headers: ['id', 'kodeInventaris', 'nomorInventaris', 'namaBarang', 'kategori', 'gedungId', 'lokalId', 'fasilitasId', 'merk', 'tipe', 'spesifikasi', 'tahunPengadaan', 'jumlah', 'satuan', 'kondisi', 'sumberDana', 'status', 'keterangan', 'createdAt', 'updatedAt']
    },
    PEMERIKSAAN: {
      name: 'Pemeriksaan',
      headers: ['id', 'nomorPemeriksaan', 'tanggalPemeriksaan', 'petugas', 'gedungId', 'lokalId', 'fasilitasId', 'inventarisId', 'kondisi', 'tindakan', 'catatan', 'foto', 'status', 'createdAt', 'updatedAt']
    },
    JADWAL: {
      name: 'Jadwal',
      headers: ['id', 'kodeJadwal', 'judulKegiatan', 'jenisKegiatan', 'gedungId', 'lokalId', 'penanggungJawab', 'tanggal', 'jamMulai', 'jamSelesai', 'jumlahPeserta', 'keterangan', 'status', 'createdAt', 'updatedAt']
    },
    SETTING: {
      name: 'Setting',
      headers: ['id', 'settingKey', 'settingValue', 'description', 'createdAt', 'updatedAt']
    },
    LOG: {
      name: 'Log',
      headers: ['id', 'timestamp', 'level', 'module', 'action', 'message', 'detail']
    }
  },
  STATUS: {
    ACTIVE: 'Aktif',
    INACTIVE: 'Tidak Aktif',
    DELETED: 'Dihapus'
  },
  DRIVE: {
    INSPECTION_PHOTO_FOLDER_ID: ''
  }
};
