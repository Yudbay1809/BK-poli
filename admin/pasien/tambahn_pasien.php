<?php
    // Menghubungkan ke database menggunakan koneksi.php
    include '../../koneksi.php';

    // Mengambil data dari form input
    $nama = $_POST['nama'];
    $alamat = $_POST['alamat'];
    $no_ktp = $_POST['no_ktp'];
    $no_hp = $_POST['no_hp'];

    // Menghitung jumlah total pasien
    $total_pasien_query = "SELECT COUNT(*) AS total_pasien FROM pasien";
    $total_pasien_result = mysqli_query($koneksi, $total_pasien_query);
    $total_pasien_row = mysqli_fetch_assoc($total_pasien_result);
    $total_pasien = $total_pasien_row['total_pasien'];

    // Membuat Nomor Rekam Medis (No_RM)
    $no_rm = date('Ym') . '-' . ($total_pasien + 1);

    // Query untuk menyimpan data pasien baru ke database
    $insert_query = "INSERT INTO pasien (nama, alamat, no_ktp, no_hp, no_rm) VALUES ('$nama', '$alamat', '$no_ktp', '$no_hp', '$no_rm')";
    $insert_result = mysqli_query($koneksi, $insert_query);

     // Cek apakah data berhasil disimpan
     if ($insert_result) {
        // Mengalihkan ke halaman lain setelah proses penambahan selesai
        header("Location: pasien.php");
        exit(); // Penting untuk menghentikan eksekusi script setelah melakukan redirect
    } else {
        echo "Error: " . mysqli_error($koneksi);
    }


    // Menutup koneksi database
    mysqli_close($koneksi);
?>