<?php
require '../../koneksi.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Ambil data dari formulir
    $id = $_POST['id'];
    $nama_poli = mysqli_real_escape_string($koneksi, $_POST['nama_poli']);
    $keterangan = mysqli_real_escape_string($koneksi, $_POST['keterangan']);

    // Query SQL untuk update data poli
    $sql = "UPDATE poli SET nama_poli='$nama_poli', keterangan='$keterangan' WHERE id=$id";

    if (mysqli_query($koneksi, $sql)) {
        // Jika berhasil diupdate, redirect ke halaman daftar poli
        header("Location: poli.php");
        exit();
    } else {
        // Jika terjadi kesalahan, tampilkan pesan error
        echo "Error: " . $sql . "<br>" . mysqli_error($koneksi);
    }
} else {
    // Jika bukan metode POST, redirect ke halaman daftar poli
    header("Location: poli.php");
    exit();
}

// Tutup koneksi database
mysqli_close($koneksi);
?>