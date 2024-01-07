<?php
include '../../koneksi.php';

// Check if the 'id' parameter is set in the URL
if (isset($_GET['id'])) {
    $id_dokter = $_GET['id'];

    // Create the SELECT query to retrieve dokter data
    $query_select_dokter = "SELECT * FROM dokter WHERE id = $id_dokter";
    $result_dokter = mysqli_query($koneksi, $query_select_dokter);

    if ($result_dokter && mysqli_num_rows($result_dokter) > 0) {
        $dokter_data = mysqli_fetch_assoc($result_dokter);
    } else {
        echo "Data dokter tidak ditemukan.";
        exit();
    }
} else {
    echo "Parameter 'id' tidak ditemukan.";
    exit();
}

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve data from the form
    $nama = $_POST['nama'];
    $alamat = $_POST['alamat'];
    $no_hp = $_POST['no_hp'];
    $id_poli = $_POST['id_poli'];
    $nip = $_POST['nip'];
    $password = $_POST['password'];

    // Create the UPDATE query
    $query_update_dokter = "UPDATE dokter SET
                            nama = '$nama',
                            alamat = '$alamat',
                            no_hp = '$no_hp',
                            id_poli = '$id_poli',
                            nip = '$nip',
                            password = '$password'
                            WHERE id = $id_dokter";

    // Execute the query
    if (mysqli_query($koneksi, $query_update_dokter)) {
        // Redirect to the original page after updating
        header("Location: dokter.php");
        exit(); // Ensure no further code execution after the redirect
    } else {
        echo "Error: " . $query_update_dokter . "<br>" . mysqli_error($koneksi);
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
  <link rel="stylesheet" href="../../dist/css/adminlte.min.css">

</head>
<body>

<div class="container mt-5">
    <h2>Edit Dokter</h2>
    <form action="" method="post">
        <div class="form-group">
            <label for="nama">Nama Dokter</label>
            <input type="text" class="form-control" id="nama" name="nama" value="<?php echo $dokter_data['nama']; ?>" required>
        </div>
        <div class="form-group">
            <label for="alamat">Alamat</label>
            <input type="text" class="form-control" id="alamat" name="alamat" value="<?php echo $dokter_data['alamat']; ?>" required>
        </div>
        <div class="form-group">
            <label for="no_hp">Nomor HP</label>
            <input type="text" class="form-control" id="no_hp" name="no_hp" value="<?php echo $dokter_data['no_hp']; ?>" required>
        </div>
        <div class="form-group">
            <label for="id_poli">Poli</label>
            <select class="form-control" id="id_poli" name="id_poli" required>
                <?php
                // Query untuk mendapatkan daftar ID Poli dari database
                $query_poli = "SELECT id, nama_poli FROM poli";
                $result_poli = mysqli_query($koneksi, $query_poli);

                if ($result_poli) {
                    while ($row_poli = mysqli_fetch_assoc($result_poli)) {
                        $selected = ($row_poli['id'] == $dokter_data['id_poli']) ? 'selected' : '';
                        echo "<option value='" . $row_poli['id'] . "' $selected>" . $row_poli['nama_poli'] . "</option>";
                    }
                } else {
                    echo "<option value=''>Error fetching data</option>";
                }
                ?>
            </select>
        </div>
        <div class="form-group">
            <label for="nip">NIP</label>
            <input type="text" class="form-control" id="nip" name="nip" value="<?php echo $dokter_data['nip']; ?>" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control" id="password" name="password" value="<?php echo $dokter_data['password']; ?>" required>
        </div>
        <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
    </form>
</div>

<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>

</body>
</html>