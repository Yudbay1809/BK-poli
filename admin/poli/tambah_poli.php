<?php
require '../../koneksi.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Ambil data dari formulir
    $nama_poli = mysqli_real_escape_string($koneksi, $_POST['nama_poli']);
    $keterangan = mysqli_real_escape_string($koneksi, $_POST['keterangan']);

    // Query SQL untuk menyimpan data obat baru
    $sql = "INSERT INTO poli (nama_poli, keterangan) VALUES ('$nama_poli', '$keterangan')";

    if (mysqli_query($koneksi, $sql)) {
        // Jika berhasil disimpan, redirect ke halaman daftar obat
        header("Location:poli.php");
        exit();
    } else {
        // Jika terjadi kesalahan, tampilkan pesan error
        echo "Error: " . $sql . "<br>" . mysqli_error($koneksi);
    }
}

// Tutup koneksi database
mysqli_close($koneksi);
?>