<?php
include_once("../../koneksi.php");

// Cek apakah parameter ID diterima
if (isset($_GET['id'])) {
    // Ambil nilai ID dari query string
    $id_jadwal = $_GET['id'];

    // Query untuk menghapus data dari tabel anak (daftar_poli) yang terkait
    $hapus_daftar_poli_query = "DELETE FROM daftar_poli WHERE id_jadwal = $id_jadwal";
    $hapus_daftar_poli_result = mysqli_query($koneksi, $hapus_daftar_poli_query);

    // Periksa apakah penghapusan di tabel anak berhasil
    if ($hapus_daftar_poli_result) {
        // Jika berhasil, lanjutkan dengan menghapus data dari tabel utama (jadwal_periksa)
        $hapus_jadwal_query = "DELETE FROM jadwal_periksa WHERE id = $id_jadwal";
        $hapus_jadwal_result = mysqli_query($koneksi, $hapus_jadwal_query);

        // Periksa apakah penghapusan di tabel utama berhasil
        if ($hapus_jadwal_result) {
            // Redirect ke halaman jadwal periksa setelah penghapusan berhasil
            header("Location: jadwal_periksa.php");
            exit();
        } else {
            echo "Gagal menghapus data jadwal periksa. Error: " . mysqli_error($koneksi);
        }
    } else {
        echo "Gagal menghapus data dari tabel anak (daftar_poli). Error: " . mysqli_error($koneksi);
    }
} else {
    echo "ID jadwal periksa tidak ditemukan.";
    exit();
}
?>
