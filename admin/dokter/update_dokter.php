<?php
require '../../koneksi.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Ambil data dari formulir
    $id = $_POST['id'];
    $nama_obat = mysqli_real_escape_string($koneksi, $_POST['nama_obat']);
    $kemasan = mysqli_real_escape_string($koneksi, $_POST['kemasan']);
    $harga = mysqli_real_escape_string($koneksi, $_POST['harga']);

    // Query SQL untuk update data obat
    $sql = "UPDATE obat SET nama_obat='$nama_obat', kemasan='$kemasan', harga='$harga' WHERE id=$id";

    if (mysqli_query($koneksi, $sql)) {
        // Jika berhasil diupdate, redirect ke halaman daftar obat
        header("Location: obat.php");
        exit();
    } else {
        // Jika terjadi kesalahan, tampilkan pesan error
        echo "Error: " . $sql . "<br>" . mysqli_error($koneksi);
    }
} else {
    // Jika bukan metode POST, redirect ke halaman daftar obat
    header("Location: obat.php");
    exit();
}

// Tutup koneksi database
mysqli_close($koneksi);
?>