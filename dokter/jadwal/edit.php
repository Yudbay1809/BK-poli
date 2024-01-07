<?php
include_once("../../koneksi.php");

// Cek apakah parameter id telah diterima
if (isset($_GET['id'])) {
    $id_jadwal = $_GET['id'];

    // Query untuk mendapatkan data jadwal periksa berdasarkan id
    $sql = "SELECT jadwal_periksa.id, dokter.nama, jadwal_periksa.hari, jadwal_periksa.jam_mulai, jadwal_periksa.jam_selesai
            FROM jadwal_periksa
            JOIN dokter ON jadwal_periksa.id_dokter = dokter.id
            WHERE jadwal_periksa.id = $id_jadwal";
    $result = mysqli_query($koneksi, $sql);

    // Cek apakah data ditemukan
    if ($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        $nama_dokter = $row['nama'];
        $hari = $row['hari'];
        $jam_mulai = $row['jam_mulai'];
        $jam_selesai = $row['jam_selesai'];
    } else {
        // Redirect ke halaman jadwal periksa jika data tidak ditemukan
        header("Location: jadwal_periksa.php");
        exit();
    }
} else {
    // Redirect ke halaman jadwal periksa jika parameter id tidak ditemukan
    header("Location: jadwal_periksa.php");
    exit();
}

// Proses update data setelah form disubmit
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $hari_baru = $_POST['hari'];
    $jam_mulai_baru = $_POST['jam_mulai'];
    $jam_selesai_baru = $_POST['jam_selesai'];

    // Query untuk melakukan update data
    $update_query = "UPDATE jadwal_periksa
                     SET hari = '$hari_baru', jam_mulai = '$jam_mulai_baru', jam_selesai = '$jam_selesai_baru'
                     WHERE id = $id_jadwal";
    
    $update_result = mysqli_query($koneksi, $update_query);

    // Redirect ke halaman jadwal periksa setelah update berhasil
    if ($update_result) {
        header("Location: jadwal_periksa.php");
        exit();
    } else {
        // Tampilkan pesan kesalahan jika update gagal
        $error_message = "Gagal melakukan update data.";
    }
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Edit Dokter</title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
  <style>
    body {
      background-color: #f8f9fa;
    }

    .container {
      margin-top: 50px;
    }

    form {
      max-width: 600px;
      margin: auto;
    }

    h2 {
      text-align: center;
    }

    label {
      font-weight: bold;
    }

    .form-group {
      margin-bottom: 20px;
    }

    button {
      margin-top: 20px;
    }
  </style>
</head>
<body class="hold-transition sidebar-mini layout-fixed">
<div class="container mt-5">
    <h2>Edit Dokter</h2>
    <form action="" method="post">
    <div class="form-group">
        <label for="hari">Hari:</label>
        <select class="form-control" id="hari" name="hari" required>
            <option value="Senin" <?php echo ($hari == 'Senin') ? 'selected' : ''; ?>>Senin</option>
            <option value="Selasa" <?php echo ($hari == 'Selasa') ? 'selected' : ''; ?>>Selasa</option>
            <option value="Rabu" <?php echo ($hari == 'Rabu') ? 'selected' : ''; ?>>Rabu</option>
            <option value="Kamis" <?php echo ($hari == 'Kamis') ? 'selected' : ''; ?>>Kamis</option>
            <option value="Jumat" <?php echo ($hari == 'Jumat') ? 'selected' : ''; ?>>Jumat</option>
        </select>
    </div>
    <div class="form-group">
        <label for="jam_mulai">Jam Mulai:</label>
        <input type="time" class="form-control" id="jam_mulai" name="jam_mulai" value="<?php echo $jam_mulai; ?>" required>
    </div>
    <div class="form-group">
        <label for="jam_selesai">Jam Selesai:</label>
        <input type="time" class="form-control" id="jam_selesai" name="jam_selesai" value="<?php echo $jam_selesai; ?>" required>
    </div>
    <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
</form>
                    </div>
                </div>
            </div>
        </section>
    </div>
</body>
</html>
