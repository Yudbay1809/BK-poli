<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Daftar Obat</title>
 <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
 <link rel="stylesheet" href="../dist/css/adminlte.min.css">

</head>

<body>
 <div class="container">
 <ul class="navbar-nav">
      <li class="nav-item d-none d-sm-inline-block">
        <a href="../admin.php" class="nav-link">Dashboard</a>
      </li>
    </ul>
    <h2>Daftar Obat</h2>

    <!-- Form untuk menambahkan obat -->
    <form action="tambah_obat.php" method="post">
        <div class="form-group">
            <label for="nama_obat">Nama Obat:</label>
            <input type="text" class="form-control" id="nama_obat" name="nama_obat" required>
        </div>
        <div class="form-group">
            <label for="kemasan">Kemasan:</label>
            <input type="text" class="form-control" id="kemasan" name="kemasan" required>
        </div>
        <div class="form-group">
            <label for="harga">Harga:</label>
            <input type="number" class="form-control" id="harga" name="harga" required>
        </div>
        <button type="submit" class="btn btn-primary">Simpan</button>
    </form>

    <!-- Tabel untuk menampilkan daftar obat -->
    <table class="table">
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Obat</th>
          <th>Kemasan</th>
          <th>Harga</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <?php
          require '../../koneksi.php';

          $sql = "SELECT * FROM obat";
          $result = mysqli_query($koneksi, $sql);

          if (mysqli_num_rows($result) > 0) {
            $no = 1;
            while ($row = mysqli_fetch_assoc($result)) {
              echo "<tr>";
              echo "<td>".$no."</td>";
              echo "<td>".$row['nama_obat']."</td>";
              echo "<td>".$row['kemasan']."</td>";
              echo "<td>".$row['harga']."</td>";
              echo "<td>";
              echo "<a href='edit_obat.php?id=".$row['id']."' class='btn btn-warning btn-sm'>Update</a>";
              echo "<a href='hapus_obat.php?id=".$row['id']."' class='btn btn-danger btn-sm' onclick='return confirm(\"Apakah Anda yakin ingin menghapus obat ini?\")'>Delete</a>";
              echo "</td>";
              echo "</tr>";
              $no++;
            }
          } else {
            echo "<tr><td colspan='5'>Belum ada data obat.</td></tr>";
          }
        ?>
      </tbody>
    </table>
 </div>

 <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
 <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.1/dist/umd/popper.min.js"></script>
 <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"></script>
</body>
</html>
