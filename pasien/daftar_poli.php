<?php
session_start();

include '../koneksi.php';

if (!isset($_SESSION['no_rm'])) {
    header("Location: login.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Tangkap data dari formulir
    $idPoliTerpilih = $_POST['id_poli'];
    $idJadwalTerpilih = $_POST['id_jadwal'];
    $keluhan = $_POST['keluhan'];

    // Dapatkan ID Pasien berdasarkan sesi login
    $noRM = $_SESSION['no_rm'];
    $sqlGetIdPasien = "SELECT id FROM pasien WHERE no_rm = '$noRM'";
    $resultIdPasien = mysqli_query($koneksi, $sqlGetIdPasien);

    if ($resultIdPasien && mysqli_num_rows($resultIdPasien) > 0) {
        $rowIdPasien = mysqli_fetch_assoc($resultIdPasien);
        $idPasien = $rowIdPasien['id'];

        // Hitung jumlah pasien yang sudah mendaftar pada poli dan jadwal tertentu
        $sqlJumlahPasien = "SELECT COUNT(id) AS jumlah_pasien FROM daftar_poli 
                            WHERE id_jadwal = '$idJadwalTerpilih'";
        $resultJumlahPasien = mysqli_query($koneksi, $sqlJumlahPasien);

        if ($resultJumlahPasien) {
            $rowJumlahPasien = mysqli_fetch_assoc($resultJumlahPasien);
            $nomorAntrian = $rowJumlahPasien['jumlah_pasien'] + 1;

            // Insert data ke dalam tabel daftar_poli
            $sqlInsertDaftarPoli = "INSERT INTO daftar_poli (id_pasien, id_jadwal, keluhan, no_antrian) 
                                    VALUES ('$idPasien', '$idJadwalTerpilih', '$keluhan', '$nomorAntrian')";

            $resultInsertDaftarPoli = mysqli_query($koneksi, $sqlInsertDaftarPoli);

            if ($resultInsertDaftarPoli) {
                // Arahkan langsung ke halaman tertentu setelah pendaftaran
                header("Location: pasien.php");
                exit();
            } else {
                echo "Gagal mendaftar poli: " . mysqli_error($koneksi);
            }
        } else {
            echo "Gagal menghitung jumlah pasien: " . mysqli_error($koneksi);
        }
    } else {
        echo "Gagal mendapatkan ID Pasien: " . mysqli_error($koneksi);
    }
}

// Close the database connection
mysqli_close($koneksi);
?>
