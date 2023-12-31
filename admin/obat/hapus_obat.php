<?php
require '../../koneksi.php';

if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['id'])) {
    // Ambil ID obat dari parameter URL
    $id = $_GET['id'];

    // Query SQL untuk delete obat berdasarkan ID
    $sql = "DELETE FROM obat WHERE id=$id";

    if (mysqli_query($koneksi, $sql)) {
        // Jika berhasil dihapus, redirect ke halaman daftar obat
        header("Location:obat.php");
        exit();
    } else {
        // Jika terjadi kesalahan, tampilkan pesan error
        echo "Error: " . $sql . "<br>" . mysqli_error($koneksi);
    }
} else {
    // Jika tidak ada parameter ID, redirect ke halaman daftar obat
    header("Location:obat.php");
    exit();
}

// Tutup koneksi database
mysqli_close($koneksi);
?>