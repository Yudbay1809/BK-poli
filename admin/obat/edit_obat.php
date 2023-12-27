<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Edit Obat</title>
 <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
</head>
<body>
 <div class="container">
    <h2>Edit Obat</h2>

    <?php
        require '../../koneksi.php';

        if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['id'])) {
            $id = $_GET['id'];

            $sql = "SELECT * FROM obat WHERE id = $id";
            $result = mysqli_query($koneksi, $sql);

            if (mysqli_num_rows($result) == 1) {
                $row = mysqli_fetch_assoc($result);
    ?>

                <!-- Form untuk mengedit obat -->
                <form action="update_obat.php" method="post">
                    <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                    <div class="form-group">
                        <label for="nama_obat">Nama Obat:</label>
                        <input type="text" class="form-control" id="nama_obat" name="nama_obat" value="<?php echo $row['nama_obat']; ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="kemasan">Kemasan:</label>
                        <input type="text" class="form-control" id="kemasan" name="kemasan" value="<?php echo $row['kemasan']; ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="harga">Harga:</label>
                        <input type="number" class="form-control" id="harga" name="harga" value="<?php echo $row['harga']; ?>" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                </form>

    <?php
            } else {
                echo "<p>Data obat tidak ditemukan.</p>";
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
