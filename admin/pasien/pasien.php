<?php
// Mulai sesi
session_start();

include_once("../../koneksi.php");

// Menghitung jumlah total pasien
$total_pasien_query = "SELECT COUNT(*) AS total_pasien FROM pasien";
$total_pasien_result = mysqli_query($koneksi, $total_pasien_query);
$total_pasien_row = mysqli_fetch_assoc($total_pasien_result);
$total_pasien = $total_pasien_row['total_pasien'];

// Membuat Nomor Rekam Medis (No_RM)
$no_rm = date('Ym') . '-' . ($total_pasien + 1);
// Eksekusi query untuk menampilkan data pasien
$query = "SELECT ROW_NUMBER() OVER (ORDER BY id) AS no, id, nama, alamat, no_ktp, no_hp, no_rm FROM pasien";
$result = mysqli_query($koneksi, $query);
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
    <!-- ... (menu-menu lainnya) ... -->
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
    <section>
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">Tambah/Edit Pasien</h1>
          </div><!-- /.col -->
          <!-- /.col -->
        </div><!-- /.row -->
      </div><!-- /.container-fluid -->
    </div>
    <!-- /.content-header -->

    <!-- Main content -->
    <div class="container-fluid">
    <div calss = "row">
        <div class="card">
            <div class="card-header">
    <form action="tambahn_pasien.php" method="post">
      <div class="form-group">
        <label for="nama">Nama</label>
        <input type="text" class="form-control" id="nama" name="nama" required>
      </div>

      <div class="form-group">
        <label for="alamat">Alamat</label>
        <input type="text" class="form-control" id="alamat" name="alamat" required>
      </div>

      <div class="form-group">
        <label for="no_ktp">No. KTP</label>
        <input type="text" class="form-control" id="no_ktp" name="no_ktp" required>
      </div>

      <div class="form-group">
        <label for="no_hp">No. HP</label>
        <input type="text" class="form-control" id="no_hp" name="no_hp" required>
      </div>

      <div class="form-group">
    <label for="no_rm">No. RM:</label>
    <span>
      <!-- Tampilkan No_RM di sini -->
      <?php echo $no_rm; ?>
    </span>
    <!-- Hidden input field for No. RM -->
    <input type="hidden" name="no_rm" value="<?php echo $no_rm; ?>">
  </div>

      <button type="submit" class="btn btn-primary">Simpan</button>
    </form>
</div>
<div class="content-header">
</section>
    <!-- Tabel untuk menampilkan daftar obat -->
    <div class="container-fluid">

    <div calss = "row">
        <div class="card">
            <div class="card-header">
    <h3 class="card-title">Pasien</h3>
  </div>
  <table class="table table-bordered">
        <tr>
          <th>No.</th>
          <th>Nama</th>
          <th>Alamat</th>
          <th>No. KTP</th>
          <th>No. HP</th>
          <th>No. RM</th>
        </tr>

        <?php
        // Menampilkan data pasien dalam bentuk tabel
        while ($row = mysqli_fetch_assoc($result)) {
          echo "<tr>";
          echo "<td>" . $row['no'] . "</td>";
          echo "<td>" . $row['nama'] . "</td>";
          echo "<td>" . $row['alamat'] . "</td>";
          echo "<td>" . $row['no_ktp'] . "</td>";
          echo "<td>" . $row['no_hp'] . "</td>";
          echo "<td>" . $row['no_rm'] . "</td>";
          echo "<td>";
          // Link for edit action (replace # with your edit page)
          echo "<a href='edit_pasien.php?id=".$row['id']."' class='btn btn-warning btn-sm'>Edit</a>";
          // Link for delete action (replace # with your delete page)
          echo "<a href='hapus_pasien.php?id=".$row['id']."' class='btn btn-danger btn-sm' onclick='return confirm(\"Apakah Anda yakin ingin menghapus pasien ini?\")'>Hapus</a>";
          echo "</td>";
          echo "</tr>";
        }
        ?>
      </table>
    </div>
  </div>
</div>
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