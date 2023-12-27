<?php
require '../../koneksi.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Ambil data dari formulir
    $nama_obat = mysqli_real_escape_string($koneksi, $_POST['nama_obat']);
    $kemasan = mysqli_real_escape_string($koneksi, $_POST['kemasan']);
    $harga = mysqli_real_escape_string($koneksi, $_POST['harga']);

    // Query SQL untuk menyimpan data obat baru
    $sql = "INSERT INTO obat (nama_obat, kemasan, harga) VALUES ('$nama_obat', '$kemasan', '$harga')";

    if (mysqli_query($koneksi, $sql)) {
        // Jika berhasil disimpan, redirect ke halaman daftar obat
        header("Location:obat.php");
        exit();
    } else {
        // Jika terjadi kesalahan, tampilkan pesan error
        echo "Error: " . $sql . "<br>" . mysqli_error($koneksi);
    }
}

// Tutup koneksi database
mysqli_close($koneksi);
?>
