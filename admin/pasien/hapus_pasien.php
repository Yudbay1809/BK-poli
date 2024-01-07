<?php
// Mulai sesi
session_start();

include_once("../../koneksi.php");

// Cek apakah parameter ID diterima
if (isset($_GET['id'])) {
    // Ambil nilai ID dari query string
    $id_pasien = $_GET['id'];

    // Setel mode SQL untuk mengaktifkan tindakan kaskade (CASCADE)
    $set_fk_query = "SET foreign_key_checks = 0";
    mysqli_query($koneksi, $set_fk_query);

    // Query untuk menghapus data pasien berdasarkan ID
    $hapus_query = "DELETE FROM pasien WHERE id = $id_pasien";
    $hapus_result = mysqli_query($koneksi, $hapus_query);

    // Setel mode SQL untuk mengaktifkan kembali kunci asing
    $set_fk_query = "SET foreign_key_checks = 1";
    mysqli_query($koneksi, $set_fk_query);

    // Periksa apakah penghapusan berhasil
    if ($hapus_result) {
        echo "Data pasien berhasil dihapus.";

        // Redirect to another page after successful deletion
        header("Location: pasien.php");
        exit();
    } else {
        echo "Gagal menghapus data pasien. Error: " . mysqli_error($koneksi);
    }
} else {
    echo "ID pasien tidak ditemukan.";
}
?>
