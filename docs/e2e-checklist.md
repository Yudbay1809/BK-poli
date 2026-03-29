# Checklist Uji End-to-End

## Persiapan Umum
1. Jalankan app: `pnpm --filter web dev`
2. Seed data (jika belum): `pnpm --dir db exec prisma db seed`
3. Login dummy (password default sesuai `DUMMY_PASSWORD` atau `Password123!`):
- Super Admin: `superadmin@bkpoli.local` / `superadmin`
- Admin: `admin@bkpoli.local`
- Dokter: `dokter.gigi@bkpoli.local` (atau `drgigi`)
- Pasien: `pasien.satu@bkpoli.local` (atau `pasien1`)

## Public
1. Buka landing page: cek statistik, jadwal, status poli.
2. Filter cepat (nama dokter, poli, hari, jam, lokasi cabang).
3. Daftar pengobatan (Umum + BPJS).
4. Verifikasi OTP booking.
5. Cek booking pakai kode.
6. Buka halaman Edukasi dan filter kategori.

Expected:
- Filter bekerja, halaman tidak reload penuh, data konsisten.

## Pasien
1. Login pasien.
2. Daftar poli  cek masuk antrean.
3. Batalkan antrean (jika status belum diperiksa).
4. Riwayat kunjungan  buka detail pemeriksaan.
5. Upload dokumen (rujukan/lab).
6. Lihat Riwayat Pembayaran + buka invoice.
7. Cek banner status antrean (MENUNGGU/DIPANGGIL).

Expected:
- Dokumen tersimpan dan bisa diunduh.
- Invoice tampil dengan detail pemeriksaan.

## Dokter
1. Login dokter.
2. Cek jadwal hari ini.
3. Lihat antrean aktif + filter.
4. Update status antrean.
5. Input pemeriksaan + obat.
6. Upload dokumen pemeriksaan.
7. Buka konsultasi lanjutan dan kirim balasan.

Expected:
- Status antrean berubah.
- Hasil pemeriksaan tersimpan.
- Dokumen dan pesan konsultasi muncul.

## Admin
1. Login admin.
2. CRUD poli/dokter/obat/pasien.
3. CRUD jadwal + cek validasi bentrok.
4. Tambah antrian manual.
5. Input pemeriksaan.
6. Export CSV (antrian, jadwal, pasien, pemeriksaan).
7. Konfirmasi pembayaran guest booking.

Expected:
- Semua action tersimpan, export file berhasil.

## Super Admin
1. Login super admin.
2. Buat cabang klinik.
3. Mapping poli  cabang.
4. Mapping dokter  poli.
5. Atur setting multi-cabang + default cabang.
6. Monitoring page: angka KPI tampil.
7. Approval workflow: buat approval + set status.
8. Governance: ubah retensi + anonymize + purge audit.
9. Audit log tercatat.

Expected:
- Mapping dan config tersimpan.
- Governance action mengubah data lama.
