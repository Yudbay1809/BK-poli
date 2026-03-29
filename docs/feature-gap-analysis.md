# Feature Gap Analysis & E2E Checklist

Dokumen ini menyimpan daftar fitur yang belum ada per role, prioritas fitur dokter, dan checklist uji end-to-end.

## Gap Analysis Per Role

### Public
- [x] Pencarian poli/dokter lebih mendalam (filter jam, hari, lokasi).
- [x] Konfirmasi pendaftaran via OTP (verifikasi booking).
- [x] Notifikasi booking (link WhatsApp setelah verifikasi, basic).
- [x] Riwayat booking publik (kode booking + OTP).
- [x] Edukasi kesehatan terjadwal/berkategori.

### Pasien
- [x] Profil pasien (update data).
- [x] Detail hasil pemeriksaan (catatan, biaya, obat).
- [x] Ganti password pasien.
- [x] Upload dokumen pendukung (foto rujukan/hasil lab).
- [x] Notifikasi status antrian/panggilan (in-app banner).
- [x] Riwayat pembayaran dan invoice.

### Dokter
- [x] Dashboard aktif (jadwal hari ini + antrean aktif).
- [x] Detail antrian pasien.
- [x] Input hasil pemeriksaan langsung (catatan + obat).
- [x] Update status antrian (dipanggil/selesai).
- [x] Riwayat pasien yang pernah diperiksa (terakhir).
- [x] Rekap statistik harian (ringkas).
- [x] Profil dokter + update info.
- [x] Opsional: konsultasi online / catatan lanjutan.

### Admin
- [x] Import data master (CSV poli/dokter/obat).
- [x] Import data pasien (CSV).
- [x] Manajemen BPJS (validasi nomor, mapping jenis layanan).
- [x] Konfirmasi pembayaran / pembayaran manual.
- [x] Pengaturan jadwal libur nasional.
- [x] Laporan dasar (statistik harian + total master).

### Super Admin
- [x] Organization management real (poli, mapping dokter, struktur cabang).
- [x] Settings multi-cabang/klinik.
- [x] Monitoring real (health check, error logs, uptime).
- [x] Approval workflow real (aksi kritis butuh approval).
- [x] Governance real (retensi data, anonymization).

## Prioritas Fitur Dokter

### Prioritas 1 (Wajib Operasional)
- [x] Dashboard dokter: jadwal hari ini + daftar antrean aktif.
- [x] Detail antrian pasien: keluhan, biodata singkat.
- [x] Input pemeriksaan: catatan, biaya, obat.
- [x] Update status antrian: dipanggil, selesai.

### Prioritas 2 (Menengah)
- [x] Riwayat pasien yang pernah ditangani (terakhir).
- [x] Filter/urut antrean.
- [x] Statistik ringan harian.

### Prioritas 3 (Tambahan)
- [x] Profil dokter (update info).
- [x] Upload hasil pemeriksaan atau dokumen.

## Checklist Uji End-to-End

### Public
- Buka landing page, pastikan data statistik tampil.
- Akses jadwal dokter dan filter.
- Daftar pengobatan (Umum dan BPJS).
- Cek booking pakai kode.
- Cek tampilan mobile.

### Pasien
- Login pasien.
- Daftar poli (buat antrian).
- Batalkan antrian jika belum diperiksa.
- Lihat riwayat kunjungan.
- Logout.

### Dokter
- Login dokter.
- Lihat jadwal hari ini.
- Buka antrean pasien.
- Input pemeriksaan + obat.
- Status antrian berubah.
- Riwayat pasien muncul.

### Admin
- Login admin.
- CRUD poli/dokter/obat/pasien.
- CRUD jadwal + validasi bentrok.
- Tambah antrian manual.
- Input pemeriksaan.
- Export CSV (antrian, jadwal, pasien, pemeriksaan).

### Super Admin
- Login super admin.
- Buat admin baru.
- Reset password user.
- [x] Nonaktifkan user.
- [x] Force logout user.
- [x] Audit log tercatat.
