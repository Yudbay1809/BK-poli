<?php
session_start();

include_once("../../koneksi.php");

// Cek apakah parameter ID diterima
if (isset($_GET['id'])) {
    // Ambil nilai ID dari query string
    $id_pasien = $_GET['id'];

    // Query untuk mendapatkan data pasien berdasarkan ID
    $edit_query = "SELECT * FROM pasien WHERE id = $id_pasien";
    $edit_result = mysqli_query($koneksi, $edit_query);

    // Periksa apakah pengambilan data berhasil
    if ($edit_result) {
        // Periksa apakah ada data pasien dengan ID tersebut
        if (mysqli_num_rows($edit_result) > 0) {
            $data_pasien = mysqli_fetch_assoc($edit_result);
        } else {
            echo "Data pasien dengan ID tersebut tidak ditemukan.";
            exit();
        }
    } else {
        echo "Gagal mendapatkan data pasien. Error: " . mysqli_error($koneksi);
        exit();
    }
} else {
    echo "ID pasien tidak ditemukan.";
    exit();
}

// Cek apakah form sudah disubmit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ambil data yang diinputkan dari form
    $nama = $_POST['nama'];
    $alamat = $_POST['alamat'];
    $no_ktp = $_POST['no_ktp'];
    $no_hp = $_POST['no_hp'];

    // Query untuk mengupdate data pasien
    $update_query = "UPDATE pasien SET nama = '$nama', alamat = '$alamat', no_ktp = '$no_ktp', no_hp = '$no_hp' WHERE id = $id_pasien";
    $update_result = mysqli_query($koneksi, $update_query);

    // Periksa apakah pengeditan berhasil
    if ($update_result) {
        // Redirect ke halaman tertentu setelah proses penyimpanan berhasil
        header("Location: pasien.php");
        exit();
    } else {
        echo "Gagal mengupdate data pasien. Error: " . mysqli_error($koneksi);
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
<body>

<div class="container mt-5">
    <h2>Edit Pasien</h2>
    <form action="edit_pasien.php?id=<?php echo $id_pasien; ?>" method="post">
        <div class="form-group">
            <label for="nama">Nama Pasien</label>
            <input type="text" class="form-control" id="nama" name="nama" value="<?php echo $data_pasien['nama']; ?>" required>
        </div>
        <div class="form-group">
            <label for="alamat">Alamat</label>
            <input type="text" class="form-control" id="alamat" name="alamat" value="<?php echo $data_pasien['alamat']; ?>" required>
        </div>
        <div class="form-group">
            <label for="no_ktp">No. KTP</label>
            <input type="text" class="form-control" id="no_ktp" name="no_ktp" value="<?php echo $data_pasien['no_ktp']; ?>" required>
        </div>
        <div class="form-group">
            <label for="no_hp">No. HP</label>
            <input type="text" class="form-control" id="no_hp" name="no_hp" value="<?php echo $data_pasien['no_hp']; ?>" required>
        </div>
        <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
    </form>
</div>

<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>

</body>
</html>
