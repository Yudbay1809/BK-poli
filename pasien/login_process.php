<?php
session_start();

include '../koneksi.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nama = $_POST['nama'];
    $no_ktp = $_POST['no_ktp'];

    // Query untuk memeriksa kecocokan nama dan nomor KTP di database
    $sqlLogin = "SELECT * FROM pasien WHERE nama = '$nama' AND no_ktp = '$no_ktp'";
    $resultLogin = mysqli_query($koneksi, $sqlLogin);

    if ($resultLogin && mysqli_num_rows($resultLogin) > 0) {
        $rowPasien = mysqli_fetch_assoc($resultLogin);

        // Tentukan sesi
        $_SESSION['no_rm'] = $rowPasien['no_rm'];

        // Redirect ke halaman pasien
        header("Location: pasien.php");
        exit();
    } else {
        $error_message = "Nama atau Nomor KTP salah. Silakan coba lagi.";
    }
}

mysqli_close($koneksi);
?>