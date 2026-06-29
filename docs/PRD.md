PRODUCT REQUIREMENTS DOCUMENT (PRD)
SIPRAS-FIP
Sistem Informasi Sarana dan Prasarana
Fakultas Ilmu Pendidikan – Universitas Negeri Padang
Versi Dokumen: 1.0 (Draft By: Dion Laloc)
Status: In Review
Platform: Google Apps Script Web Application
Dokumen: docs/PRD.md

BAB 1. Executive Summary
1.1 Latar Belakang

Fakultas Ilmu Pendidikan (FIP) Universitas Negeri Padang memiliki berbagai sarana dan prasarana yang digunakan untuk mendukung kegiatan akademik maupun non-akademik. Pengelolaan data gedung, lokal, fasilitas, inventaris, pemeriksaan, serta jadwal penggunaan lokal masih dilakukan secara manual atau tersebar di berbagai media, sehingga menyulitkan proses monitoring, evaluasi, pelaporan, dan pengambilan keputusan.

Untuk meningkatkan efektivitas pengelolaan sarana dan prasarana, diperlukan sebuah sistem informasi yang mampu mengintegrasikan seluruh data ke dalam satu platform yang mudah diakses, terdokumentasi dengan baik, dan mampu menyajikan informasi secara cepat, akurat, serta transparan.

SIPRAS-FIP dikembangkan sebagai aplikasi berbasis Google Apps Script Web App dengan memanfaatkan ekosistem Google Workspace seperti Google Sheets sebagai basis data dan Google Drive sebagai media penyimpanan dokumentasi.

1.2 Deskripsi Produk

SIPRAS-FIP adalah sistem informasi berbasis web yang digunakan untuk mengelola seluruh data sarana dan prasarana Fakultas Ilmu Pendidikan Universitas Negeri Padang.

Sistem menyediakan informasi mengenai:

Informasi umum mengenai sarana dan prasarana FIP.
Data gedung beserta informasi setiap lokal.
Data inventaris yang dimiliki Fakultas Ilmu Pendidikan.
Data fasilitas yang tersedia pada setiap lokal.
Kondisi fasilitas berdasarkan hasil pemeriksaan.
Riwayat pemeriksaan fasilitas.
Jadwal penggunaan lokal.
Rekapitulasi kondisi fasilitas dan inventaris.
Dashboard monitoring sarana dan prasarana.

Administrator memiliki hak akses untuk mengelola seluruh data master, melakukan pemeriksaan fasilitas, memperbarui kondisi fasilitas dan inventaris, mengatur jadwal penggunaan lokal, serta menghasilkan laporan yang digunakan sebagai dasar pengambilan keputusan.

1.3 Tujuan Produk

Pengembangan SIPRAS-FIP bertujuan untuk:

Mendigitalisasi proses pengelolaan sarana dan prasarana Fakultas Ilmu Pendidikan.
Menyediakan informasi kondisi fasilitas secara cepat dan akurat.
Mendokumentasikan seluruh inventaris fakultas secara terpusat.
Mempermudah proses pemeriksaan fasilitas.
Menyediakan riwayat pemeriksaan sebagai dokumentasi historis.
Menyediakan informasi jadwal penggunaan lokal secara terstruktur.
Mengurangi potensi benturan penggunaan lokal melalui pengelolaan jadwal.
Membantu pimpinan dalam menentukan prioritas pemeliharaan dan perbaikan berdasarkan data.
Menyediakan dashboard monitoring yang informatif.
Mengurangi penggunaan pencatatan manual.
1.4 Target Pengguna

Sistem digunakan oleh:

Mahasiswa
Dosen
Tenaga Kependidikan (TENDIK)
Administrator Sistem
Pimpinan Fakultas
1.5 Platform

Sistem dikembangkan menggunakan teknologi berikut.

Backend
Google Apps Script
Frontend
HTML Service
HTML5
CSS3
JavaScript (Vanilla JavaScript)
Database
Google Sheets
File Storage
Google Drive
Version Control
Git
GitHub
clasp (Command Line Apps Script)
Development Environment
Visual Studio Code
Google Apps Script
1.6 Definisi Istilah
Istilah	Definisi
Gedung	Bangunan yang terdiri dari beberapa lokal.
Lokal	Ruangan yang berada di lingkungan Fakultas Ilmu Pendidikan.
Fasilitas	Sarana yang melekat atau tersedia di dalam suatu lokal, seperti meja, kursi, LCD, AC, lampu, dan sejenisnya.
Inventaris	Barang milik Fakultas yang memiliki identitas inventaris dan dapat ditempatkan pada suatu lokal atau lokasi tertentu.
Pemeriksaan	Aktivitas pemeriksaan kondisi fasilitas maupun inventaris yang dilakukan secara berkala.
Jadwal Penggunaan Lokal	Data penggunaan lokal berdasarkan jadwal akademik maupun kegiatan fakultas.
Dashboard Monitoring	Halaman yang menyajikan ringkasan kondisi sarana dan prasarana dalam bentuk statistik dan visualisasi data.
BAB 2. Product Vision
2.1 Visi Produk

Menjadi sistem informasi sarana dan prasarana yang terintegrasi, modern, mudah digunakan, dan mampu menyediakan informasi kondisi fasilitas serta inventaris Fakultas Ilmu Pendidikan secara cepat, akurat, transparan, dan terdokumentasi dengan baik.

2.2 Misi Produk

SIPRAS-FIP dikembangkan untuk:

menyediakan satu sumber data sarana dan prasarana yang terpusat;
meningkatkan transparansi kondisi fasilitas dan inventaris;
mempermudah proses monitoring fasilitas;
mempermudah pengelolaan inventaris;
mempercepat proses pemeriksaan dan pelaporan kondisi fasilitas;
menyediakan informasi jadwal penggunaan lokal secara terstruktur;
mendukung pengambilan keputusan berbasis data;
membangun budaya dokumentasi digital di lingkungan Fakultas Ilmu Pendidikan.
2.3 Nilai Produk

SIPRAS-FIP dikembangkan berdasarkan prinsip-prinsip berikut.

Sederhana

Antarmuka dirancang agar mudah dipahami oleh seluruh pengguna tanpa memerlukan pelatihan khusus.

Cepat

Informasi dapat diperoleh dalam beberapa klik dengan waktu respons yang ringan.

Akurat

Seluruh data berasal dari hasil pemeriksaan dan pengelolaan yang terdokumentasi.

Terpusat

Seluruh data tersimpan dalam satu sistem yang terintegrasi.

Mudah Dipelihara

Struktur aplikasi dirancang secara modular sehingga mudah dikembangkan dan dipelihara.

Skalabel

Arsitektur sistem memungkinkan penambahan modul baru tanpa mengubah struktur utama aplikasi.

2.4 Indikator Keberhasilan

Produk dianggap berhasil apabila:

seluruh gedung telah terdokumentasi;
seluruh lokal telah terdokumentasi;
seluruh fasilitas memiliki status kondisi;
seluruh inventaris memiliki data yang lengkap;
riwayat pemeriksaan tersimpan dengan baik;
jadwal penggunaan lokal dapat dikelola dengan mudah;
administrator mampu mengelola sistem tanpa bantuan teknis;
dashboard monitoring menyajikan informasi yang akurat;
waktu pencarian informasi jauh lebih cepat dibandingkan proses manual.
BAB 3. Business Objectives
3.1 Tujuan Bisnis

Pengembangan SIPRAS-FIP memiliki tujuan bisnis sebagai berikut.

Digitalisasi Pengelolaan Sarana dan Prasarana

Mengubah proses pencatatan manual menjadi sistem digital yang terintegrasi.

Monitoring Kondisi Fasilitas

Memungkinkan fakultas mengetahui kondisi seluruh fasilitas secara berkala.

Manajemen Inventaris

Menyediakan dokumentasi inventaris yang terpusat, terstruktur, dan mudah dikelola.

Pengelolaan Jadwal Penggunaan Lokal

Menyediakan informasi penggunaan lokal sehingga mengurangi benturan jadwal dan meningkatkan efisiensi pemanfaatan ruang.

Efisiensi Pemeriksaan

Petugas pemeriksa dapat langsung menginput hasil pemeriksaan ke dalam sistem sehingga mengurangi proses administrasi manual.

Transparansi Data

Informasi dapat diakses sesuai dengan hak akses masing-masing pengguna.

Pengambilan Keputusan

Pimpinan dapat menentukan prioritas pemeliharaan dan pengembangan fasilitas berdasarkan data yang tersedia.

3.2 Sasaran Bisnis

Pada implementasi MVP, sistem diharapkan mampu:

mendokumentasikan seluruh gedung FIP;
mendokumentasikan seluruh lokal;
mendokumentasikan seluruh fasilitas;
mendokumentasikan seluruh inventaris;
mendokumentasikan seluruh pengguna sistem;
menyimpan riwayat pemeriksaan;
mengelola jadwal penggunaan lokal;
menampilkan dashboard monitoring;
menyajikan laporan kondisi sarana dan prasarana.
3.3 Key Performance Indicators (KPI)
KPI	Target
Data gedung terdokumentasi	100%
Data lokal terdokumentasi	100%
Data fasilitas terdokumentasi	100%
Data inventaris terdokumentasi	100%
Pemeriksaan terdokumentasi	100%
Jadwal penggunaan lokal terdokumentasi	100%
Dashboard dapat diakses	24/7
Waktu pencarian informasi	< 5 detik
Akurasi data	≥ 95%
3.4 Ruang Lingkup MVP (In Scope)

Versi pertama SIPRAS-FIP mencakup:

Area Publik
Landing Page
Informasi Sarana dan Prasarana
Data Gedung
Data Lokal
Jadwal Penggunaan Lokal
Informasi Kondisi Fasilitas
Informasi Inventaris (sesuai hak akses publik)
Area Administrator
Dashboard Monitoring
Manajemen Data Gedung
Manajemen Data Lokal
Manajemen Data Fasilitas
Manajemen Data Inventaris
Manajemen Pengguna
Manajemen Jadwal Penggunaan Lokal
Pemeriksaan Fasilitas
Rekapitulasi Kondisi
Laporan dan Statistik

Modul-modul tersebut menjadi fondasi utama pengembangan SIPRAS-FIP dan akan menjadi prioritas implementasi pada fase MVP.

3.5 Ruang Lingkup yang Tidak Termasuk (Out of Scope)

Pada fase MVP, sistem tidak mencakup:

Pengadaan barang.
Pengelolaan anggaran atau keuangan.
Sistem tiket perbaikan (maintenance ticketing).
Integrasi Single Sign-On (SSO).
Aplikasi mobile native (Android/iOS).
Integrasi dengan sistem akademik Universitas Negeri Padang.
Notifikasi otomatis melalui WhatsApp atau Email.

Fitur-fitur tersebut direncanakan sebagai pengembangan pada fase berikutnya sesuai kebutuhan institusi.

BAB 4. Project Scope
4.1 Tujuan Ruang Lingkup

Bab ini mendefinisikan batasan pengembangan SIPRAS-FIP agar seluruh tim pengembang, reviewer, dan stakeholder memiliki pemahaman yang sama mengenai fitur yang akan dibangun pada fase MVP (Minimum Viable Product).

Dokumen ini juga menjadi acuan dalam proses implementasi, pengujian, dokumentasi, dan pengembangan lanjutan.

4.2 In Scope (Termasuk Dalam Pengembangan MVP)

Fitur-fitur berikut wajib tersedia pada versi pertama SIPRAS-FIP.

A. Area Publik (Tanpa Login)
Landing Page

Menyediakan halaman utama yang dapat diakses oleh seluruh pengguna.

Fungsi:

Menampilkan profil SIPRAS-FIP.
Menampilkan informasi umum sarana dan prasarana.
Menampilkan statistik ringkas.
Menampilkan informasi kontak.
Menampilkan berita atau pengumuman (opsional).
Informasi Gedung

Menampilkan daftar gedung yang tersedia di lingkungan FIP.

Fungsi:

Daftar gedung.
Detail gedung.
Jumlah lokal.
Jumlah fasilitas.
Informasi Lokal

Menampilkan daftar lokal yang tersedia.

Fungsi:

Daftar lokal.
Detail lokal.
Lokasi lokal.
Kapasitas lokal.
Kondisi umum lokal.
Informasi Fasilitas

Menampilkan fasilitas yang tersedia pada setiap lokal.

Fungsi:

Daftar fasilitas.
Status kondisi fasilitas.
Tanggal pemeriksaan terakhir.
Informasi Inventaris

Menampilkan informasi inventaris yang dapat dipublikasikan.

Fungsi:

Daftar inventaris.
Lokasi inventaris.
Kondisi inventaris.
Jadwal Penggunaan Lokal

Menampilkan jadwal penggunaan lokal.

Fungsi:

Jadwal harian.
Jadwal mingguan.
Filter lokal.
Filter hari.
B. Area Administrator

Seluruh fitur berikut memerlukan autentikasi.

Dashboard Monitoring

Menyajikan ringkasan kondisi sarana dan prasarana.

Fungsi:

Total gedung.
Total lokal.
Total fasilitas.
Total inventaris.
Statistik kondisi.
Grafik kondisi fasilitas.
Grafik kondisi inventaris.
Manajemen Gedung

Fungsi:

Tambah gedung.
Ubah data gedung.
Hapus gedung.
Lihat detail gedung.
Manajemen Lokal

Fungsi:

Tambah lokal.
Edit lokal.
Hapus lokal.
Detail lokal.
Manajemen Fasilitas

Fungsi:

Tambah fasilitas.
Edit fasilitas.
Hapus fasilitas.
Kategorisasi fasilitas.
Manajemen Inventaris

Fungsi:

Tambah inventaris.
Edit inventaris.
Hapus inventaris.
Penempatan inventaris.
Riwayat perubahan kondisi.
Manajemen Pengguna

Fungsi:

Tambah pengguna.
Edit pengguna.
Reset akses.
Pengaturan hak akses.
Pemeriksaan Fasilitas

Fungsi:

Input hasil pemeriksaan.
Upload dokumentasi.
Catatan pemeriksaan.
Riwayat pemeriksaan.
Pemeriksaan Inventaris

Fungsi:

Input kondisi inventaris.
Dokumentasi foto.
Riwayat pemeriksaan.
Manajemen Jadwal Penggunaan Lokal

Fungsi:

Tambah jadwal.
Edit jadwal.
Hapus jadwal.
Cek konflik jadwal.
Rekapitulasi dan Laporan

Fungsi:

Rekap kondisi fasilitas.
Rekap kondisi inventaris.
Rekap pemeriksaan.
Rekap penggunaan lokal.
4.3 Out of Scope (Tidak Termasuk MVP)

Fitur berikut tidak dikembangkan pada fase pertama.

Pengadaan Barang

Sistem tidak mengelola proses pembelian barang.

Sistem Keuangan

Sistem tidak mengelola:

Anggaran
Pengeluaran
Pembayaran
Maintenance Ticketing

Sistem belum menyediakan:

Tiket kerusakan
Workflow perbaikan
Monitoring progres perbaikan
Mobile Application

Belum tersedia:

Android App
iOS App

Akses dilakukan melalui browser.

Integrasi SSO

Belum terhubung dengan:

SSO UNP
LDAP
Active Directory
Integrasi Sistem Akademik

Belum terhubung dengan:

Portal Akademik
Sistem Jadwal Akademik
Sistem Kepegawaian
Notifikasi Otomatis

Belum tersedia:

WhatsApp Gateway
Telegram Bot
Email Notification
4.4 Future Scope (Fase Pengembangan Lanjutan)

Fitur yang direncanakan setelah MVP.

Phase 2
Export PDF
Export Excel
QR Code Lokal
QR Code Inventaris
Dashboard Analitik
Phase 3
Mobile Friendly PWA
Integrasi Google Calendar
Notifikasi Otomatis
Sistem Tiket Perbaikan
Phase 4
Integrasi SSO UNP
Integrasi Sistem Akademik
AI-Based Facility Analysis
BAB 5. Stakeholders
5.1 Tujuan

Bab ini menjelaskan seluruh pihak yang terlibat, menggunakan, mengelola, atau memperoleh manfaat dari SIPRAS-FIP.

5.2 Stakeholder Utama

Stakeholder utama adalah pihak yang berinteraksi langsung dengan sistem.

Administrator Sistem

Peran:

Mengelola aplikasi.
Mengelola data master.
Mengelola pengguna.
Mengelola jadwal.
Mengelola pemeriksaan.

Kebutuhan:

Akses penuh ke seluruh modul.
Dashboard monitoring.
Laporan.
Tenaga Kependidikan (TENDIK)

Peran:

Melakukan pemeriksaan.
Menginput data kondisi fasilitas.
Menginput data inventaris.
Mengelola dokumentasi.

Kebutuhan:

Form pemeriksaan yang mudah digunakan.
Upload dokumentasi.
Riwayat pemeriksaan.
Pimpinan Fakultas

Peran:

Monitoring kondisi sarana.
Evaluasi kebutuhan perbaikan.
Pengambilan keputusan.

Kebutuhan:

Dashboard.
Statistik.
Rekap kondisi.
Laporan.
Dosen

Peran:

Mengakses informasi lokal.
Melihat jadwal penggunaan lokal.
Melihat informasi fasilitas.

Kebutuhan:

Informasi yang akurat.
Jadwal yang mudah diakses.
Mahasiswa

Peran:

Mengakses informasi publik.

Kebutuhan:

Informasi lokal.
Jadwal penggunaan lokal.
Informasi fasilitas.
5.3 Stakeholder Pendukung

Stakeholder yang tidak menggunakan sistem secara langsung namun memperoleh manfaat dari sistem.

Fakultas Ilmu Pendidikan

Manfaat:

Pengelolaan sarana lebih terstruktur.
Dokumentasi lebih baik.
Transparansi informasi.
Unit Sarana dan Prasarana

Manfaat:

Monitoring lebih mudah.
Data lebih terpusat.
Pelaporan lebih cepat.
Universitas Negeri Padang

Manfaat:

Mendukung transformasi digital.
Mendukung tata kelola aset yang lebih baik.
Mendukung pengambilan keputusan berbasis data.
5.4 Matriks Kepentingan Stakeholder
Stakeholder	Pengaruh	Keterlibatan
Administrator Sistem	Sangat Tinggi	Sangat Tinggi
TENDIK	Tinggi	Tinggi
Pimpinan Fakultas	Tinggi	Sedang
Dosen	Sedang	Sedang
Mahasiswa	Rendah	Sedang
Fakultas	Tinggi	Tinggi
Universitas	Sedang	Rendah

BAB 6. User Roles & Permissions
6.1 Tujuan

Bab ini menjelaskan peran (role), hak akses (permissions), dan batasan setiap pengguna dalam sistem SIPRAS-FIP.

Penerapan hak akses bertujuan untuk:

menjaga keamanan data;
membatasi akses berdasarkan kewenangan;
mencegah perubahan data oleh pengguna yang tidak berwenang;
memastikan setiap aktivitas dapat dipertanggungjawabkan.
6.2 Konsep Hak Akses

SIPRAS-FIP menerapkan Role-Based Access Control (RBAC).

Setiap pengguna diberikan satu role yang menentukan hak akses terhadap modul-modul dalam sistem.

Pada fase MVP hanya terdapat dua role utama.

Role	Keterangan
User	Pengguna umum yang hanya dapat melihat informasi publik tanpa login.
Administrator	Pengguna yang memiliki akses penuh setelah login untuk mengelola seluruh data sistem.

Catatan: Meskipun dalam struktur organisasi terdapat TENDIK, Dosen, dan Pimpinan, pada implementasi sistem mereka akan menggunakan akun dengan role Administrator apabila diberi kewenangan mengelola data. Hal ini menjaga kesederhanaan implementasi pada fase MVP.

6.3 Hak Akses User

Role User tidak memerlukan proses login.

User hanya memiliki akses baca (read only) terhadap informasi yang dipublikasikan.

Modul yang dapat diakses
Landing Page
Informasi Gedung
Informasi Lokal
Informasi Fasilitas
Informasi Inventaris
Jadwal Penggunaan Lokal
Statistik umum

User tidak dapat:

menambah data;
mengubah data;
menghapus data;
melakukan pemeriksaan;
mengakses dashboard administrator.
6.4 Hak Akses Administrator

Administrator harus melakukan proses login terlebih dahulu.

Administrator memiliki hak akses penuh terhadap seluruh modul sistem.

Administrator dapat:

Dashboard
melihat dashboard monitoring;
melihat statistik;
melihat grafik.
Data Gedung
tambah data;
ubah data;
hapus data;
melihat detail.
Data Lokal
tambah;
ubah;
hapus;
pencarian;
filter.
Data Fasilitas
tambah fasilitas;
edit fasilitas;
hapus fasilitas;
mengubah kondisi.
Data Inventaris
tambah inventaris;
edit inventaris;
hapus inventaris;
memindahkan inventaris;
mengubah kondisi inventaris.
Pemeriksaan
input pemeriksaan;
upload dokumentasi;
melihat riwayat;
mengubah hasil pemeriksaan.
Jadwal Penggunaan Lokal
tambah jadwal;
edit jadwal;
hapus jadwal;
validasi konflik jadwal.
Pengguna
membuat akun administrator;
mengubah akun;
menghapus akun;
reset password.
Laporan
melihat laporan;
export data;
mencetak laporan.
6.5 Matriks Hak Akses
Modul	User	Administrator
Landing Page	✅	✅
Dashboard Monitoring	❌	✅
Data Gedung	Read	CRUD
Data Lokal	Read	CRUD
Data Fasilitas	Read	CRUD
Data Inventaris	Read	CRUD
Pemeriksaan	Read	CRUD
Jadwal Penggunaan Lokal	Read	CRUD
Manajemen Pengguna	❌	CRUD
Rekap & Laporan	Read	CRUD
6.6 Keamanan Akses

Administrator diwajibkan login menggunakan akun yang telah terdaftar.

Sistem harus:

memverifikasi identitas pengguna;
mengelola sesi login;
membatasi akses ke halaman administrator;
mencatat aktivitas penting (audit log) pada fase pengembangan berikutnya.
BAB 7. Functional Requirements
7.1 Pendahuluan

Bab ini menjelaskan kebutuhan fungsional setiap modul yang akan dibangun pada SIPRAS-FIP.

Seluruh spesifikasi pada bab ini menjadi acuan implementasi Google Apps Script serta dasar penyusunan prompt untuk Codex.

7.2 Modul Landing Page
Tujuan

Landing Page menjadi halaman pertama yang diakses pengguna.

Halaman ini berfungsi sebagai media informasi umum mengenai sarana dan prasarana Fakultas Ilmu Pendidikan.

Aktor
User
Administrator
Fitur

Landing Page harus menyediakan:

Header
Navigasi
Hero Section
Ringkasan Statistik
Informasi SIPRAS
Daftar Gedung
Jadwal Penggunaan Lokal Hari Ini
Footer
Komponen Halaman
Header

Berisi:

Logo FIP
Logo UNP
Nama Aplikasi
Menu Navigasi
Tombol Login Administrator
Hero Section

Menampilkan:

Judul aplikasi
Deskripsi singkat
Tombol Jelajahi
Statistik

Menampilkan:

Total Gedung
Total Lokal
Total Fasilitas
Total Inventaris
Informasi Singkat

Berisi:

tujuan aplikasi;
manfaat aplikasi;
informasi kontak.
Business Rules

Landing Page:

dapat diakses tanpa login;
tidak boleh menampilkan data sensitif;
seluruh statistik diambil secara otomatis dari database.
Acceptance Criteria

Landing Page dianggap selesai apabila:

dapat dibuka tanpa login;
responsif;
statistik tampil dengan benar;
navigasi berjalan normal.
7.3 Modul Dashboard Monitoring
Tujuan

Dashboard digunakan administrator untuk memonitor kondisi sarana dan prasarana secara menyeluruh.

Aktor

Administrator

Informasi yang Ditampilkan

Dashboard harus menampilkan:

Total Gedung
Total Lokal
Total Fasilitas
Total Inventaris
Fasilitas Baik
Fasilitas Rusak Ringan
Fasilitas Rusak Berat
Inventaris Aktif
Inventaris Rusak
Pemeriksaan Terakhir
Widget Dashboard

Dashboard minimal memiliki widget berikut.

Summary Card
Gedung
Lokal
Fasilitas
Inventaris
Grafik Kondisi

Menampilkan persentase:

Sangat Baik
Baik
Cukup
Rusak Ringan
Rusak Berat
Aktivitas Terbaru

Menampilkan:

pemeriksaan terbaru;
perubahan data;
jadwal terbaru.
Business Rules

Dashboard harus:

memperbarui data secara otomatis;
hanya dapat diakses administrator;
menampilkan data berdasarkan database terbaru.
Acceptance Criteria

Dashboard selesai apabila:

seluruh widget tampil;
statistik sesuai database;
grafik tampil normal.
7.4 Modul Manajemen Gedung
Tujuan

Mengelola seluruh data gedung Fakultas Ilmu Pendidikan.

Aktor

Administrator

Data Gedung

Setiap gedung memiliki informasi:

ID Gedung
Kode Gedung
Nama Gedung
Jumlah Lantai
Deskripsi
Status
Foto Gedung
Operasi

Administrator dapat:

tambah gedung;
edit gedung;
hapus gedung;
melihat detail gedung.
Validasi
Nama gedung wajib diisi.
Kode gedung harus unik.
Status hanya boleh Aktif atau Tidak Aktif.
Foto bersifat opsional.
Business Rules

Satu gedung dapat memiliki banyak lokal.

Gedung yang masih memiliki lokal tidak dapat dihapus sebelum seluruh lokal dipindahkan atau dihapus.

Acceptance Criteria

Modul dianggap selesai apabila administrator dapat:

menambahkan gedung;
mengubah data;
menghapus gedung yang memenuhi syarat;
melihat daftar gedung dengan pencarian dan filter.
7.5 Modul Manajemen Lokal
Tujuan

Mengelola seluruh lokal yang berada pada setiap gedung.

Aktor

Administrator

Data Lokal

Setiap lokal memiliki informasi:

ID Lokal
Kode Lokal
Nama Lokal
Gedung
Lantai
Kapasitas
Fungsi Lokal (Ruang Kuliah, Laboratorium, Ruang Rapat, Kantor, Gudang, dll.)
Status Lokal
Foto Lokal
Keterangan
Operasi

Administrator dapat:

menambah lokal;
mengubah lokal;
menghapus lokal;
melihat detail lokal.
Validasi
Kode lokal harus unik.
Gedung wajib dipilih.
Kapasitas harus berupa angka positif.
Status lokal harus dipilih.
Business Rules
Satu lokal hanya berada pada satu gedung.
Satu lokal dapat memiliki banyak fasilitas.
Satu lokal dapat memiliki banyak inventaris.
Satu lokal dapat memiliki banyak riwayat pemeriksaan.
Satu lokal dapat memiliki banyak jadwal penggunaan.
Acceptance Criteria

Modul dianggap selesai apabila administrator dapat mengelola seluruh data lokal secara lengkap, melakukan pencarian, filter berdasarkan gedung dan status, serta melihat detail lokal beserta fasilitas, inventaris, jadwal penggunaan, dan riwayat pemeriksaannya.

# BAB 8. User Journey

## User (Tanpa Login)

Landing Page → Informasi Gedung → Informasi Lokal → Detail Lokal → Informasi Fasilitas → Informasi Inventaris → Jadwal Penggunaan Lokal → Selesai

## Administrator

Login → Dashboard → Pilih Modul → Kelola Data → Simpan Perubahan → Dashboard → Logout

---

# BAB 9. Sitemap

```
Landing Page
│
├── Tentang SIPRAS
├── Informasi Gedung
│     └── Detail Gedung
├── Informasi Lokal
│     └── Detail Lokal
├── Informasi Fasilitas
├── Informasi Inventaris
├── Jadwal Penggunaan Lokal
└── Login Administrator

Administrator
│
├── Dashboard
├── Data Gedung
├── Data Lokal
├── Data Fasilitas
├── Data Inventaris
├── Jadwal Penggunaan Lokal
├── Pemeriksaan
├── Manajemen Pengguna
└── Laporan
```

---

# BAB 10. Screen Requirements

## Public

* Landing Page
* Informasi Gedung
* Informasi Lokal
* Detail Lokal
* Jadwal Penggunaan Lokal

## Administrator

* Login
* Dashboard
* Data Gedung
* Data Lokal
* Data Fasilitas
* Data Inventaris
* Pemeriksaan
* Jadwal
* Pengguna
* Laporan

---

# BAB 11. Module Specifications

| Modul        | Fungsi                         |
| ------------ | ------------------------------ |
| Landing Page | Informasi umum SIPRAS          |
| Dashboard    | Monitoring data                |
| Gedung       | CRUD Gedung                    |
| Lokal        | CRUD Lokal                     |
| Fasilitas    | CRUD Fasilitas                 |
| Inventaris   | CRUD Inventaris                |
| Pemeriksaan  | Input kondisi fasilitas        |
| Jadwal       | Kelola jadwal penggunaan lokal |
| Pengguna     | Kelola akun administrator      |
| Laporan      | Rekapitulasi dan statistik     |

---

# BAB 12. Data Dictionary

| Entitas     | Deskripsi                   |
| ----------- | --------------------------- |
| Gedung      | Data gedung FIP             |
| Lokal       | Data ruangan                |
| Fasilitas   | Sarana yang berada di lokal |
| Inventaris  | Barang inventaris           |
| Pemeriksaan | Riwayat pemeriksaan         |
| Jadwal      | Jadwal penggunaan lokal     |
| User        | Administrator sistem        |

---

# BAB 13. Entity Relationship

```
Gedung
   │
   └──── Lokal
             │
             ├──── Fasilitas
             ├──── Inventaris
             ├──── Pemeriksaan
             └──── Jadwal
```

---

# BAB 14. Google Sheets Structure

Workbook SIPRAS terdiri dari beberapa sheet.

```
Users
Gedung
Lokal
Fasilitas
Inventaris
Pemeriksaan
Jadwal
Setting
Log
```

Setiap sheet memiliki kolom ID sebagai Primary Key.

Hubungan antar sheet menggunakan ID Referensi.

---

# BAB 15. Google Apps Script Architecture

```
Client (HTML + CSS + JavaScript)

↓

google.script.run

↓

Code.gs (Router)

↓

Services

↓

Repositories

↓

Google Sheets

↓

Google Drive
```

Arsitektur menggunakan pendekatan modular agar mudah dikembangkan.

---

# BAB 16. Folder Structure

```
SIPRAS-FIP

assets/
docs/

gs/
    app/
    services/
    repositories/
    helpers/
    config/

html/
    layouts/
    pages/
    components/
    css/
    js/

appsscript.json
.clasp.json
README.md
```

---

# BAB 17. UI/UX Guidelines

## Warna

Primary : Biru FIP

Secondary : Putih

Success : Hijau

Warning : Kuning

Danger : Merah

## Font

Google Font

Poppins

## Layout

* Responsive
* Clean
* Minimalis
* Sidebar Administrator
* Top Navigation Public

## Komponen

* Card
* Table
* Modal
* Toast Notification
* Search
* Filter
* Pagination

---

# BAB 18. Security Requirements

* Login hanya untuk Administrator.
* Password disimpan dalam bentuk hash.
* Validasi seluruh input.
* Session Login.
* Logout otomatis setelah periode tidak aktif.
* Sanitasi input untuk mencegah XSS.
* Audit log untuk aktivitas penting (pengembangan berikutnya).

---

# BAB 19. Non-Functional Requirements

## Performance

* Loading halaman < 3 detik.
* Mendukung minimal 50 pengguna bersamaan.

## Reliability

* Data tersimpan pada Google Sheets.
* Backup berkala melalui Google Drive.

## Compatibility

* Google Chrome
* Microsoft Edge
* Mozilla Firefox

## Responsiveness

* Desktop
* Tablet
* Mobile

---

# BAB 20. Acceptance Criteria

SIPRAS-FIP dinyatakan siap digunakan apabila:

* Seluruh modul dapat diakses sesuai hak akses.
* CRUD seluruh master data berjalan.
* Pemeriksaan dapat disimpan.
* Jadwal penggunaan lokal dapat dikelola.
* Dashboard menampilkan statistik yang benar.
* Data tersimpan pada Google Sheets.
* Tidak ditemukan error kritis pada pengujian.

---

# BAB 21. MVP Roadmap

## Sprint 1

* Setup Project
* Login
* Dashboard
* Data Gedung

## Sprint 2

* Data Lokal
* Data Fasilitas
* Data Inventaris

## Sprint 3

* Pemeriksaan
* Jadwal Penggunaan Lokal

## Sprint 4

* Laporan
* Optimasi UI
* Testing
* Deployment

---

# BAB 22. Future Enhancements

* QR Code setiap Lokal.
* QR Code Inventaris.
* Export PDF.
* Export Excel.
* Dashboard Analitik.
* Upload Multi Foto.
* Riwayat Perubahan Data.
* Notifikasi Email.
* Integrasi Google Calendar.
* Progressive Web App (PWA).
* Integrasi Single Sign-On (SSO) UNP.
* Integrasi Sistem Akademik UNP.
* AI Analisis Kondisi Sarana dan Prasarana.
* Audit Log Lengkap.
* Manajemen Tiket Perbaikan.
