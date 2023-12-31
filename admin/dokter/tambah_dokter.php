<?php
include_once("../../koneksi.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama = $_POST['nama'];
    $alamat = $_POST['alamat'];
    $no_hp = $_POST['no_hp'];
    $id_poli = $_POST['id_poli'];
    $nip = $_POST['nip'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $sql = "INSERT INTO dokter (nama, alamat, no_hp, id_poli, nip, password) VALUES ('$nama', '$alamat', '$no_hp', '$id_poli', '$nip', '$password')";

    if (mysqli_query($koneksi, $sql)) {
        // Redirect atau tindakan lain setelah berhasil tambah dokter
        header("Location: dokter.php");
        exit();
    } else {
        echo "Error: " . $sql . "<br>" . mysqli_error($koneksi);
    }
}
?>
