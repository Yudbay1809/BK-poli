<?php
session_start();

include '../koneksi.php';

if (!isset($_SESSION['no_rm'])) {
    header("Location: login.php");
    exit();
}

$noRM = $_SESSION['no_rm'];

// Query untuk mendapatkan data pasien
$sqlPasien = "SELECT * FROM pasien WHERE no_rm = '$noRM'";
$resultPasien = mysqli_query($koneksi, $sqlPasien);

if ($resultPasien) {
    $rowPasien = mysqli_fetch_assoc($resultPasien);
    $namaPasien = $rowPasien['nama'];
    $nomorRekamMedis = $rowPasien['no_rm'];
    // Dapatkan ID Pasien
    $idPasien = $rowPasien['id'];
    // Tambahan informasi pasien lainnya
} else {
    echo "Gagal mengambil informasi pasien: " . mysqli_error($koneksi);
}

// Menangani pemilihan poli
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['id_poli'])) {
        $idPoliTerpilih = $_POST['id_poli'];

        // Query untuk mendapatkan data poli terpilih
        $sqlPoliTerpilih = "SELECT * FROM poli WHERE id = $idPoliTerpilih";
        $resultPoliTerpilih = mysqli_query($koneksi, $sqlPoliTerpilih);

        if ($resultPoliTerpilih) {
            $rowPoliTerpilih = mysqli_fetch_assoc($resultPoliTerpilih);
            $namaPoliTerpilih = $rowPoliTerpilih['nama_poli'];

            // Query untuk mendapatkan jadwal dan dokter berdasarkan poli terpilih
            $sqlJadwalDokter = "SELECT jadwal.*, dokter.nama AS nama_dokter 
                                FROM jadwal_periksa jadwal
                                JOIN dokter ON jadwal.id_dokter = dokter.id
                                WHERE dokter.id_poli = $idPoliTerpilih";

            $resultJadwalDokter = mysqli_query($koneksi, $sqlJadwalDokter);

            if (!$resultJadwalDokter) {
                echo "Gagal mengambil jadwal dan dokter: " . mysqli_error($koneksi);
            }
        } else {
            echo "Gagal mengambil data poli terpilih: " . mysqli_error($koneksi);
        }
    }
}

// Query untuk mendapatkan data poli
$sqlPoli = "SELECT * FROM poli";
$resultPoli = mysqli_query($koneksi, $sqlPoli);

if (!$resultPoli) {
    echo "Gagal mengambil data poli: " . mysqli_error($koneksi);
}

// Query untuk mendapatkan riwayat daftar poli pasien
$sqlRiwayatDaftarPoli = "SELECT daftar_poli.*, poli.nama_poli, dokter.nama AS nama_dokter, jadwal.hari, DATE_FORMAT(jadwal.jam_mulai, '%H:%i') AS jam_mulai, DATE_FORMAT(jadwal.jam_selesai, '%H:%i') AS jam_selesai
                        FROM daftar_poli
                        JOIN jadwal_periksa jadwal ON daftar_poli.id_jadwal = jadwal.id
                        JOIN dokter ON jadwal.id_dokter = dokter.id
                        JOIN poli ON dokter.id_poli = poli.id
                        WHERE daftar_poli.id_pasien = '$idPasien'";

$resultRiwayatDaftarPoli = mysqli_query($koneksi, $sqlRiwayatDaftarPoli);

if (!$resultRiwayatDaftarPoli) {
    echo "Gagal mengambil riwayat daftar poli: " . mysqli_error($koneksi);
}

// Close the database connection
mysqli_close($koneksi);
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pasien | Dashboard</title>

  <!-- Google Font: Source Sans Pro -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
  <!-- Font Awesome -->
  <link rel="stylesheet" href="../plugins/fontawesome-free/css/all.min.css">
  <!-- Ionicons -->
  <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
  <!-- Tempusdominus Bootstrap 4 -->
  <link rel="stylesheet" href="../plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css">
  <!-- iCheck -->
  <link rel="stylesheet" href="../plugins/icheck-bootstrap/icheck-bootstrap.min.css">
  <!-- JQVMap -->
  <link rel="stylesheet" href="../plugins/jqvmap/jqvmap.min.css">
  <!-- Theme style -->
  <link rel="stylesheet" href="../dist/css/adminlte.min.css">
  <!-- overlayScrollbars -->
  <link rel="stylesheet" href="../plugins/overlayScrollbars/css/OverlayScrollbars.min.css">
  <!-- Daterange picker -->
  <link rel="stylesheet" href="../plugins/daterangepicker/daterangepicker.css">
  <!-- summernote -->
  <link rel="stylesheet" href="../plugins/summernote/summernote-bs4.min.css">

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
        <a href="pasien.php" class="nav-link">Home</a>
      </li>
    </ul>

    <!-- Right navbar links -->
    <ul class="navbar-nav ml-auto">
      <!-- Navbar Search -->
      <li class="nav-item">
        <div class="navbar-search-block">
          <form class="form-inline">
            <div class="input-group input-group-sm">
              <input class="form-control form-control-navbar" type="search" placeholder="Search" aria-label="Search">
              <div class="input-group-append">
                <button class="btn btn-navbar" type="submit">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
      </li>

      <!-- Messages Dropdown Menu -->

      <!-- Notifications Dropdown Menu -->
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
          <a href="#" class="d-block">Pasien</a>
        </div>
      </div>

      <!-- SidebarSearch Form -->

      <!-- Sidebar Menu -->
      <nav class="mt-2">
        <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
          <!-- Add icons to the links using the .nav-icon class
               with font-awesome or any other icon font library -->
          <li class="nav-item menu-open">
            <a href="pasien.php" class="nav-link active">
              <!--<i class="nav-icon fas fa-tachometer-alt"></i>-->
              <p>
                Daftar Poli
              </p>
            </a>
        <!-- Menu Logout -->
        <li class="nav-item">
            <a href="../admin/logout.php" class="nav-link">
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
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">Dashboard</h1>
          </div><!-- /.col -->
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
            </ol>
          </div><!-- /.col -->
        </div><!-- /.row -->
      </div><!-- /.container-fluid -->
    </div>
    <!-- /.content-header -->

    <!-- Main content -->
    <section class="content">
    <div class="container-fluid">

    <div calss = "row">
        <div class="card">
            <div class="card-header">
                <h5 class="card-header">Pendaftaran Poli</h5>
            <div class="card-body">

    <form action= ""method="post">
    <input type="hidden" value="<?= $idPasien ?>" name="idaPsien">
        <div class="mb-3">    
    <labe for="no_rm" class="form-label"> Nomor Rekam Medis</label>
    <input type="text" class="form-control" id="no_rm" placeholder="Nomor Rekam Medis Anda:" name="no_rm" value="<?= $nomorRekamMedis; ?>" readonly>
    </div>
    <div class="mb-3">    
    <label class="form-label">Pilih Poli untuk Melihat Jadwal Dokter</label>
    <form action="pasien.php" method="post">
        <select name="id_poli" class="form-control">
        <option>Pilih poli</option>

            <?php while ($rowPoli = mysqli_fetch_assoc($resultPoli)) : ?>
                <option value="<?php echo $rowPoli['id']; ?>"><?php echo $rowPoli['nama_poli']; ?></option>
            <?php endwhile; ?>
        </select>
            </div>
        <input class="btn btn-primary" type="submit" value="Tampilkan Jadwal Dokter">
    </form>

    <?php if (isset($namaPoliTerpilih)) : ?>
    <form action="daftar_poli.php" method="post">
        <input type="hidden" name="id_poli" value="<?php echo $idPoliTerpilih; ?>">
    </label>
        <label for="id_jadwal">Pilih Jadwal dan Dokter di <?php echo $namaPoliTerpilih; ?></label><br>
        <select name="id_jadwal" id="id_jadwal" class="form-control">
            <?php while ($rowJadwalDokter = mysqli_fetch_assoc($resultJadwalDokter)) : ?>
                <option value="<?php echo $rowJadwalDokter['id']; ?>">
                <?php 
echo $rowJadwalDokter['hari'] . ', ' . date("H:i", strtotime($rowJadwalDokter['jam_mulai'])) . ' - ' . date("H:i", strtotime($rowJadwalDokter['jam_selesai'])) . ' | Dr. ' . $rowJadwalDokter['nama_dokter'];
?>                </option>
            <?php endwhile; ?>
        </select>
        <div class="mb-3">    

        <label for="keluhan" class="form-label">Keluhan</label>
        <textarea class="form-control" name="keluhan" id="keluhan" rows="4" cols="50"></textarea>
        </div>

        <input class="btn btn-primary" type="submit" value="Daftar Poli">

    </form>
<?php endif; ?>
</section>
  <!-- /.content-wrapper -->
  <section class="content">
    <div class="container-fluid">

    <div calss = "row">
        <div class="card">
            <div class="card-header">
                <h5 class="card-header">Riwayat Poli</h5>
            </div>
            <div class="card-body">
            <table class="table table-bordered">
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Poli</th>
                <th>Nama Dokter</th>
                <th>Hari</th>
                <th>Jam Mulai</th>
                <th>Jam Selesai</th>
                <th>Antrian</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $counter = 1;
            while ($rowRiwayatDaftarPoli = mysqli_fetch_assoc($resultRiwayatDaftarPoli)) :
            ?>
                <tr>
                    <td><?php echo $counter; ?></td>
                    <td><?php echo $rowRiwayatDaftarPoli['nama_poli']; ?></td>
                    <td><?php echo $rowRiwayatDaftarPoli['nama_dokter']; ?></td>
                    <td><?php echo $rowRiwayatDaftarPoli['hari']; ?></td>
                    <td><?php echo $rowRiwayatDaftarPoli['jam_mulai']; ?></td>
                    <td><?php echo $rowRiwayatDaftarPoli['jam_selesai']; ?></td>
                    <td><?php echo $rowRiwayatDaftarPoli['no_antrian']; ?></td>
                </tr>
            <?php
                $counter++;
            endwhile;
            ?>
        </tbody>
    </table>
            </div>
        </div>
    </div>
</section>

  <!-- Control Sidebar -->
  <aside class="control-sidebar control-sidebar-dark">
    <!-- Control sidebar content goes here -->
    
  </aside>
  <!-- /.control-sidebar -->
</div>
<!-- ./wrapper -->

<!-- jQuery -->
<script src="../plugins/jquery/jquery.min.js"></script>
<!-- jQuery UI 1.11.4 -->
<script src="../plugins/jquery-ui/jquery-ui.min.js"></script>
<!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
<script>
  $.widget.bridge('uibutton', $.ui.button)
</script>
<!-- Bootstrap 4 -->
<script src="../plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<!-- ChartJS -->
<script src="../plugins/chart.js/Chart.min.js"></script>
<!-- Sparkline -->
<script src="../plugins/sparklines/sparkline.js"></script>
<!-- JQVMap -->
<script src="../plugins/jqvmap/jquery.vmap.min.js"></script>
<script src="../plugins/jqvmap/maps/jquery.vmap.usa.js"></script>
<!-- jQuery Knob Chart -->
<script src="../plugins/jquery-knob/jquery.knob.min.js"></script>
<!-- daterangepicker -->
<script src="../plugins/moment/moment.min.js"></script>
<script src="../plugins/daterangepicker/daterangepicker.js"></script>
<!-- Tempusdominus Bootstrap 4 -->
<script src="../plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js"></script>
<!-- Summernote -->
<script src="../plugins/summernote/summernote-bs4.min.js"></script>
<!-- overlayScrollbars -->
<script src="../plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js"></script>
<!-- AdminLTE App -->
<script src="../dist/js/adminlte.js"></script>
<!-- AdminLTE dashboard demo (This is only for demo purposes) -->
<script src="../dist/js/pages/dashboard.js"></script>
<script>
function confirmDelete() {
    return confirm("Apakah Anda yakin ingin menghapus jadwal periksa ini?");
}
</script>
</body>
</html>