<?php
include_once("../../koneksi.php");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Mendapatkan ID dokter dari parameter URL
    $dokter_id = $_GET['id'];

    // Query untuk menghapus dokter berdasarkan ID
    $sql = "DELETE FROM dokter WHERE id = $dokter_id";

    if (mysqli_query($koneksi, $sql)) {
        // Redirect atau tindakan lain setelah berhasil hapus dokter
        header("Location:dokter.php");
        exit();
    } else {
        echo "Error deleting record: " . mysqli_error($koneksi);
    }
}
?>
