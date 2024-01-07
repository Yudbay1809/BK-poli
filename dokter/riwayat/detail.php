<?php
// fetch_detail.php

include_once("../../koneksi.php");

if (isset($_POST['id'])) {
  $id = $_POST['id'];

  // Query untuk mengambil detail tambahan berdasarkan ID
  $detail_query = "SELECT * FROM pasien WHERE id = $id";
  $detail_result = mysqli_query($koneksi, $detail_query);
  $detail_row = mysqli_fetch_assoc($detail_result);

  // Tampilkan data yang diambil di dalam modal
  echo "<p>Nama: " . $detail_row['nama'] . "</p>";
  echo "<p>Alamat: " . $detail_row['alamat'] . "</p>";
  // Tambahkan lebih banyak field sesuai kebutuhan
}
?>
