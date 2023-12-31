<?php
// Mulai sesi
session_start();

// Mengecek apakah sesi 'username' dan 'status' diatur
if (!isset($_SESSION['username']) || $_SESSION['status'] !== "login") {
    // Jika sesi tidak diatur atau status bukan "login", arahkan pengguna ke halaman login
    $_SESSION["login_error"] = "Anda harus login terlebih dahulu.";
    header("Location: login.php");
    exit();
}

include_once("../../koneksi.php");

?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Admin | Dashboard</title>

  <!-- Google Font: Source Sans Pro -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
  <!-- Font Awesome -->
  <link rel="stylesheet" href="../../plugins/fontawesome-free/css/all.min.css">
  <!-- Ionicons -->
  <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
  <!-- Tempusdominus Bootstrap 4 -->
  <link rel="stylesheet" href="../../plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css">
  <!-- iCheck -->
  <link rel="stylesheet" href="../../plugins/icheck-bootstrap/icheck-bootstrap.min.css">
  <!-- JQVMap -->
  <link rel="stylesheet" href="../../plugins/jqvmap/jqvmap.min.css">
  <!-- Theme style -->
  <link rel="stylesheet" href="../../dist/css/adminlte.min.css">
  <!-- overlayScrollbars -->
  <link rel="stylesheet" href="../../plugins/overlayScrollbars/css/OverlayScrollbars.min.css">
  <!-- Daterange picker -->
  <link rel="stylesheet" href="../../plugins/daterangepicker/daterangepicker.css">
  <!-- summernote -->
  <link rel="stylesheet" href="../../plugins/summernote/summernote-bs4.min.css">

</head>
<body class="hold-transition sidebar-mini layout-fixed">
<div class="wrapper">

  <!-- Preloader -->
  <div class="preloader flex-column justify-content-center align-items-center">
  </div>

  <!-- Navbar -->
  <nav class="main-header navbar navbar-expand navbar-white navbar-light">
    <!-- Left navbar links -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
      </li>
      <li class="nav-item d-none d-sm-inline-block">
        <a href="../admin.php" class="nav-link">Home</a>
      </li>
    </ul>
  </nav>
  <!-- /.navbar -->

  <!-- Main Sidebar Container -->
  <aside class="main-sidebar sidebar-dark-primary elevation-4">
    <!-- Sidebar -->
    <div class="sidebar">
      <!-- Sidebar user panel (optional) -->
      <div class="user-panel mt-3 pb-3 mb-3 d-flex">
        <div class="info">
          <a href="#" class="d-block">Admin</a>
        </div>
      </div>

      <!-- SidebarSearch Form -->

      <!-- Sidebar Menu -->
      <nav class="mt-2">
        <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
              <li class="nav-item">
                <a href="../obat/obat.php" class="nav-link active">
                  <p>Obat</p>
                </a>
              </li>
            </ul>
          </li>
          <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
              <li class="nav-item">
                <a href="../dokter/dokter.php" class="nav-link active">
                  <p>Dokter</p>
                </a>
              </li>
            </ul>
          </li>
        <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
              <li class="nav-item">
                <a href="../poli/poli.php" class="nav-link active">
                  <p>Poli</p>
                </a>
              </li>
            </ul>
          </li>
          <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
              <li class="nav-item">
                <a href="../pasien/pasien.php" class="nav-link active">
                  <p>Pasien</p>
                </a>
              </li>
            </ul>
          </li>
      </nav>
        <!-- Menu Logout -->
        <nav class="mt-2">
    <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
        <li class="nav-item">
            <a href="../logout.php" class="nav-link">
                <i class="nav-icon fas fa-sign-out-alt"></i>
                <p>
                    Logout
                </p>
            </a>
        </li>
    </ul>
</nav>
      <!-- /.sidebar-menu -->
    </div>
    <!-- /.sidebar -->
  </aside>

  <!-- Content Wrapper. Contains page content -->
  
  <div class="content-wrapper">
    <!-- Content Header (Page header) -->
    <div class="content-header">
    <div class="content-header">
    <div class="content-header">
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">Tambah/Edit Dokter</h1>
          </div><!-- /.col -->
          <!-- /.col -->
        </div><!-- /.row -->
      </div><!-- /.container-fluid -->
    </div>
    <!-- /.content-header -->

    <!-- Main content -->
    <form action="tambah_dokter.php" method="post">
    <div class="form-group">
        <label for="nama">Nama Dokter</label>
        <input type="text" class="form-control" id="nama" name="nama" required>
    </div>
    <div class="form-group">
        <label for="alamat">Alamat</label>
        <input type="text" class="form-control" id="alamat" name="alamat" required>
    </div>
    <div class="form-group">
        <label for="no_hp">Nomor HP</label>
        <input type="text" class="form-control" id="no_hp" name="no_hp" required>
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
                    echo "<option value='" . $row_poli['id'] . "'>" . $row_poli['nama_poli'] . "</option>";
                }
            } else {
                echo "<option value=''>Error fetching data</option>";
            }
            ?>
        </select>
    </div>
    <div class="form-group">
        <label for="nip">NIP</label>
        <input type="text" class="form-control" id="nip" name="nip" required>
    </div>
    <div class="form-group">
        <label for="password">Password</label>
        <input type="password" class="form-control" id="password" name="password" required>
    </div>
    <button type="submit" class="btn btn-primary">Simpan</button>
</form>
<div class="content-header">
    <!-- Tabel untuk menampilkan daftar obat -->
    <div class="card">
  <div class="card-header">
    <h3 class="card-title">Dokter</h3>
  </div>
    <table class="table table-bordered">
    <thead>
        <tr>
            <th>No</th>
            <th>Nama Dokter</th>
            <th>Alamat</th>
            <th>Nomor HP</th>
            <th>Poli</th>
            <th>NIP</th>
            <th>Aksi</th>
        </tr>
    </thead>
    <tbody>
    <?php
        require '../../koneksi.php';

        $sql = "SELECT dokter.*, poli.nama_poli 
                FROM dokter
                JOIN poli ON dokter.id_poli = poli.id";
        $result = mysqli_query($koneksi, $sql);

        if ($result && mysqli_num_rows($result) > 0) {
            $no = 1;
            while ($row = mysqli_fetch_assoc($result)) {
                echo "<tr>";
                echo "<td>".$no."</td>";
                echo "<td>".$row['nama']."</td>";
                echo "<td>".$row['alamat']."</td>";
                echo "<td>".$row['no_hp']."</td>";
                echo "<td>".$row['nama_poli']."</td>"; // Menampilkan nama poli
                echo "<td>".$row['nip']."</td>";
                echo "<td>";
                echo "<a href='edit_dokter.php?id=".$row['id']."' class='btn btn-warning btn-sm'>Edit</a>";
                echo "<a href='hapus_dokter.php?id=".$row['id']."' class='btn btn-danger btn-sm' onclick='return confirm(\"Apakah Anda yakin ingin menghapus dokter ini?\")'>Hapus</a>";
                echo "</td>";
                echo "</tr>";
                $no++;
            }
        } else {
            echo "<tr><td colspan='7'>Belum ada data dokter.</td></tr>";
        }
        ?>
    </tbody>
</table>
 </div>
  <!-- /.content-wrapper -->

  <!-- Control Sidebar -->
  <aside class="control-sidebar control-sidebar-dark">
    <!-- Control sidebar content goes here -->
    
  </aside>
  <!-- /.control-sidebar -->
</div>
<!-- ./wrapper -->

<!-- jQuery -->
<script src="../../plugins/jquery/jquery.min.js"></script>
<!-- jQuery UI 1.11.4 -->
<script src="../../plugins/jquery-ui/jquery-ui.min.js"></script>
<!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
<script>
  $.widget.bridge('uibutton', $.ui.button)
</script>
<!-- Bootstrap 4 -->
<script src="../../plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<!-- ChartJS -->
<script src="../../plugins/chart.js/Chart.min.js"></script>
<!-- Sparkline -->
<script src="../../plugins/sparklines/sparkline.js"></script>
<!-- JQVMap -->
<script src="../../plugins/jqvmap/jquery.vmap.min.js"></script>
<script src="../../plugins/jqvmap/maps/jquery.vmap.usa.js"></script>
<!-- jQuery Knob Chart -->
<script src="../../plugins/jquery-knob/jquery.knob.min.js"></script>
<!-- daterangepicker -->
<script src="../../plugins/moment/moment.min.js"></script>
<script src="../../plugins/daterangepicker/daterangepicker.js"></script>
<!-- Tempusdominus Bootstrap 4 -->
<script src="../../plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js"></script>
<!-- Summernote -->
<script src="../../plugins/summernote/summernote-bs4.min.js"></script>
<!-- overlayScrollbars -->
<script src="../../plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js"></script>
<!-- AdminLTE App -->
<script src="../../dist/js/adminlte.js"></script>
<!-- AdminLTE dashboard demo (This is only for demo purposes) -->
<script src="../../dist/js/pages/dashboard.js"></script>
</body>
</html>
