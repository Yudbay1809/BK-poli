# Feature Gap Analysis & E2E Checklist

Dokumen ini menyimpan daftar fitur yang belum ada per role, prioritas fitur dokter, dan checklist uji end-to-end.

## Gap Analysis Per Role

### Public
- Pencarian poli/dokter lebih mendalam (filter jam, hari, lokasi).
- Konfirmasi pendaftaran via OTP (status sudah ada di DB, UI belum tersedia).
- Notifikasi (email/WhatsApp) untuk booking + nomor antrean.
- Riwayat booking publik (berdasarkan kode booking + OTP).
- Edukasi kesehatan terjadwal/berkategori.

### Pasien
- Profil pasien (update data, ganti password).
- Detail hasil pemeriksaan (diagnosis, resep, detail tindakan).
- Upload dokumen pendukung (foto rujukan/hasil lab).
- Notifikasi status antrian/panggilan.
- Riwayat pembayaran dan invoice.

### Dokter
- Dashboard aktif (jadwal hari ini + antrean aktif).
- Detail antrian pasien.
- Input hasil pemeriksaan langsung (catatan + obat).
- Update status antrian (dipanggil/selesai).
- Riwayat pasien yang pernah diperiksa.
- Profil dokter + update info.
- Rekap statistik harian (jumlah pasien/obat).
- Opsional: konsultasi online / catatan lanjutan.

### Admin
- Import data master (CSV poli/dokter/obat).
- Manajemen BPJS (validasi nomor, mapping jenis layanan).
- Konfirmasi pembayaran / pembayaran manual.
- Pengaturan jadwal libur nasional.
- Laporan keuangan & statistik.

### Super Admin
- Organization management real (poli, mapping dokter, struktur cabang).
- Settings multi-cabang/klinik.
- Monitoring real (health check, error logs, uptime).
- Approval workflow real (aksi kritis butuh approval).
- Governance real (retensi data, anonymization).

## Prioritas Fitur Dokter

### Prioritas 1 (Wajib Operasional)
- Dashboard dokter: jadwal hari ini + daftar antrean aktif.
- Detail antrian pasien: keluhan, biodata singkat.
- Input pemeriksaan: catatan, biaya, obat.
- Update status antrian: dipanggil, selesai.

### Prioritas 2 (Menengah)
- Riwayat pasien yang pernah ditangani.
- Filter/urut antrean.
- Statistik ringan harian.

### Prioritas 3 (Tambahan)
- Profil dokter (update info).
- Upload hasil pemeriksaan atau dokumen.

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
- Nonaktifkan user.
- Force logout user.
- Audit log tercatat.
