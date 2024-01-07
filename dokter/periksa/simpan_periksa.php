<?php
// Sertakan file koneksi.php
include "../../koneksi.php";

// Periksa apakah data formulir telah dikirimkan melalui metode POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Ambil nilai dari formulir
    $id_daftar_poli = $_POST['id_daftar_poli'];
    $tanggal_periksa = $_POST['tanggal_periksa'];
    $catatan = $_POST['catatan'];
    $obat = $_POST['obat']; // Ini akan menjadi array karena atribut 'multiple' pada select
    $total_biaya_obat = $_POST['total_biaya_obat'];
    $total_biaya_periksa = $_POST['total_biaya_periksa'];

    // Proses penyimpanan data periksa ke dalam database
    $query_simpan_periksa = "INSERT INTO periksa (id_daftar_poli, tgl_periksa, catatan, biaya_periksa) VALUES ('$id_daftar_poli', '$tanggal_periksa', '$catatan', '$total_biaya_periksa')";

    // Eksekusi query penyimpanan data periksa
    if ($koneksi->query($query_simpan_periksa) === TRUE) {
        // Ambil ID periksa yang baru saja disimpan
        $id_periksa = $koneksi->insert_id;

        // Loop untuk menyimpan data obat yang dipilih ke dalam tabel detail_periksa
        foreach ($obat as $id_obat) {
            $query_simpan_obat = "INSERT INTO detail_periksa (id_periksa, id_obat) VALUES ('$id_periksa', '$id_obat')";
            $koneksi->query($query_simpan_obat);
        }

        // Setelah menyimpan data, arahkan pengguna ke halaman tujuan
        header("Location: m_pasien.php");
        exit();
    } else {
        echo "Error: " . $koneksi->error;
    }
} else {
    // Jika formulir tidak dikirimkan melalui metode POST, kembalikan ke halaman sebelumnya atau tampilkan pesan kesalahan
    echo "Formulir harus dikirimkan melalui metode POST.";
}

// Tutup koneksi
$koneksi->close();
?>
