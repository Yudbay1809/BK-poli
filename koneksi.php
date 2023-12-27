<?php
$host = "localhost";
$username = "root";
$password = "";
$database = "poli"; // Gantilah dengan nama database yang sesuai

$koneksi = new mysqli($host, $username, $password, $database);

if ($koneksi->connect_error) {
    die("Koneksi ke database gagal: " . $koneksi->connect_error);
}
?>