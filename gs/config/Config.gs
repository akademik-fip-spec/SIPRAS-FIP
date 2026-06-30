/**
 * Global application configuration.
 * Sheet names must be read from this object instead of hardcoded elsewhere.
 */
const Config = {
  APP_NAME: 'SIPRAS-FIP',
  APP_VERSION: '0.2.0',
  DEFAULT_PAGE: 'home',
  SHEETS: {
    USERS: 'Users',
    GEDUNG: 'Gedung',
    LOKAL: 'Lokal',
    FASILITAS: 'Fasilitas',
    INVENTARIS: 'Inventaris',
    PEMERIKSAAN: 'Pemeriksaan',
    JADWAL: 'Jadwal',
    SETTING: 'Setting',
    LOG: 'Log'
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
