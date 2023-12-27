<?php
require '../koneksi.php';

// Ambil data poli dari database
$query = "SELECT id, nama_poli FROM poli";
$result = mysqli_query($koneksi, $query);

// Pastikan query berhasil dijalankan
if (!$result) {
    die("Query error: " . mysqli_error($koneksi));
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Periksa Pasien</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
    <!-- Tambahkan stylesheet atau script tambahan sesuai kebutuhan -->
</head>
<body>
    <div class="container">
        <h2>Form Pemeriksaan Pasien</h2>

        <!-- Form Pemeriksaan Pasien -->
        <form action="proses_periksa.php" method="post">
            <!-- Tambahkan elemen formulir sesuai kebutuhan -->
            <div class="form-group">
                <label for="nama_pasien">Nama Pasien:</label>
                <input type="text" class="form-control" id="nama_pasien" name="nama_pasien" required>
            </div>
            <div class="form-group">
                <label for="id">Poli:</label>
                <!-- Assume you have a table named 'poli' with columns 'id_poli' and 'nama_poli' -->
                <select class="form-control" id="id" name="id" required>
                    <option value="">Pilih Poli</option>
                    <?php
                        // Loop through the results to generate <option> tags
                        while ($row = mysqli_fetch_assoc($result)) {
                            echo "<option value='" . $row['id'] . "'>" . $row['nama_poli'] . "</option>";
                        }
                    ?>
                </select>
            </div>
            <div class="form-group">
                <label for="keluhan">Keluhan:</label>
                <textarea class="form-control" id="keluhan" name="keluhan" rows="4" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Simpan Pemeriksaan</button>
        </form>
    </div>

    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.1/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"></script>
    <!-- Tambahkan script tambahan sesuai kebutuhan -->
</body>
</html>
