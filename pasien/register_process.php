<?php
include '../koneksi.php';

function generateNoRM($jumlahPasien) {
    $yearMonth = date('Ym');
    $noRM = $yearMonth . '-' . ($jumlahPasien + 1);
    return $noRM;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nama = $_POST['nama'];
    $alamat = $_POST['alamat'];
    $noKTP = $_POST['no_ktp'];
    $noHP = $_POST['no_hp'];

    // Mendapatkan jumlah total pasien
    $sqlJumlahPasien = "SELECT COUNT(id) AS jumlah_pasien FROM pasien";
    $resultJumlahPasien = mysqli_query($koneksi, $sqlJumlahPasien);

    if ($resultJumlahPasien) {
        $rowJumlahPasien = mysqli_fetch_assoc($resultJumlahPasien);
        $jumlahPasien = $rowJumlahPasien['jumlah_pasien'];
    } else {
        echo "Gagal mengambil jumlah pasien: " . mysqli_error($koneksi);
        exit();
    }

    // Membuat nomor rekam medis baru
    $noRM = generateNoRM($jumlahPasien);

    // Memasukkan data pasien ke dalam tabel
    $sqlInsert = "INSERT INTO pasien (nama, alamat, no_ktp, no_hp, no_rm) VALUES ('$nama', '$alamat', '$noKTP', '$noHP', '$noRM')";
    $resultInsert = mysqli_query($koneksi, $sqlInsert);

    if ($resultInsert) {
        // Jika pendaftaran sukses, tambahkan proses login disini sesuai kebutuhan aplikasi Anda.
        // Contoh:
        session_start();
        $_SESSION['no_rm'] = $noRM;
        header("Location: pasien.php"); // Gantilah dengan halaman dashboard pasien setelah login
        exit();
    } else {
        echo "Pendaftaran gagal: " . mysqli_error($koneksi);
    }
}

// Tutup koneksi ke database
mysqli_close($koneksi);
?>