<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Edit Poli</title>
 <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
</head>
<body>
 <div class="container">
    <h2>Edit Poli</h2>

    <?php
        require '../../koneksi.php';

        if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['id'])) {
            $id = $_GET['id'];

            $sql = "SELECT * FROM poli WHERE id = $id";
            $result = mysqli_query($koneksi, $sql);

            if (mysqli_num_rows($result) == 1) {
                $row = mysqli_fetch_assoc($result);
    ?>

                <!-- Form untuk mengedit poli -->
                <form action="update_poli.php" method="post">
                    <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                    <div class="form-group">
                        <label for="nama_poli">Nama Poli:</label>
                        <input type="text" class="form-control" id="nama_poli" name="nama_poli" value="<?php echo $row['nama_poli']; ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="keterangan">keterangan:</label>
                        <input type="text" class="form-control" id="keterangan" name="keterangan" value="<?php echo $row['keterangan']; ?>" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                </form>

    <?php
            } else {
                echo "<p>Data poli tidak ditemukan.</p>";
            }
        } else {
            echo "<p>Permintaan tidak valid.</p>";
        }

        // Tutup koneksi database
        mysqli_close($koneksi);
    ?>
 </div>

 <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
 <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.1/dist/umd/popper.min.js"></script>
 <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"></script>
</body>
</html>