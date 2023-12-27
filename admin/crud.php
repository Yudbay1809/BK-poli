<?php
// ... (kode yang sudah ada)

// Menangani pengiriman formulir
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $namaObat = $_POST["nama_obat"];
    $kemasan = $_POST["kemasan"];
    $harga = $_POST["harga"];

    if (tambahObat($namaObat, $kemasan, $harga)) {
        echo "<script>alert('Obat berhasil ditambahkan');</script>";
    } else {
        echo "<script>alert('Error menambahkan obat');</script>";
    }
}
?>
