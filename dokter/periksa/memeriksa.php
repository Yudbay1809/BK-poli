<?php
// Sertakan file koneksi.php
include "../../koneksi.php";

// Periksa apakah parameter id_pasien telah diterima
if (isset($_GET['id_pasien'])) {
    // Ambil nilai id_pasien dari parameter URL
    $id_pasien = $_GET['id_pasien'];

    // Query untuk mengambil detail pasien berdasarkan id_pasien
    $query_detail = "SELECT * FROM pasien WHERE id = $id_pasien";
    $result_detail = $koneksi->query($query_detail);

    // Query untuk mengambil daftar obat
    $query_obat = "SELECT * FROM obat";
    $result_obat = $koneksi->query($query_obat);

    // Query untuk mengambil id_daftar_poli berdasarkan id_pasien
    $query_id_daftar_poli = "SELECT id FROM daftar_poli WHERE id_pasien = $id_pasien";
    $result_id_daftar_poli = $koneksi->query($query_id_daftar_poli);

    // Periksa apakah query berhasil dijalankan
    if ($result_detail === false || $result_obat === false || $result_id_daftar_poli === false) {
        die("Error: " . $koneksi->error);
    }

    // Periksa apakah ada data yang ditemukan
    if ($result_detail->num_rows > 0) {
        // Ambil data pasien
        $row_detail = $result_detail->fetch_assoc();
        $nama_pasien = $row_detail["nama"];

        // Ambil id_daftar_poli
        if ($result_id_daftar_poli->num_rows > 0) {
            $row_id_daftar_poli = $result_id_daftar_poli->fetch_assoc();
            $id_daftar_poli = $row_id_daftar_poli['id'];
        } else {
            // Handle jika data daftar_poli tidak ditemukan
            echo "Data daftar_poli tidak ditemukan.";
            exit;
        }

        // Tutup koneksi hasil detail dan id_daftar_poli
        $result_detail->close();
        $result_id_daftar_poli->close();
        ?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dokter | Dashboard</title>

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
        <a href="../dokter.php" class="nav-link">Home</a>
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
          <a href="#" class="d-block">Dokter</a>
        </div>
      </div>

      <!-- SidebarSearch Form -->

      <!-- Sidebar Menu -->
      <nav class="mt-2">
        <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
              <li class="nav-item">
              <a href="../periksa/jadwal_periksa.php" class="nav-link active">
              <!--<i class="nav-icon fas fa-tachometer-alt"></i>-->
              <p>
                Jadwal Periksa
              </p>
            </a>
            <li class="nav-item menu-open">
            <a href="m_pasien.php" class="nav-link active">
              <!--<i class="nav-icon fas fa-tachometer-alt"></i>-->
              <p>
                Memeriksa Pasien
              </p>
            </a>
            <a href="../r_pasien/r_pasien.php" class="nav-link active">
              <!--<i class="nav-icon fas fa-tachometer-alt"></i>-->
              <p>
                Riwayat Pasien
              </p>
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
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">Periksa Pasien</h1>
          </div><!-- /.col -->
          <!-- /.col -->
        </div><!-- /.row -->
      </div><!-- /.container-fluid -->
    </div>
    <!-- /.content-header -->

    <!-- Main content -->
    <section>
    <div class="container-fluid">
    <div calss = "row">
        <div class="card">
            <div class="card-header">
    <div class="content-header">
    <form action="simpan_periksa.php" method="post">
    <div class="form-group">
        <label for="nama_pasien">Nama Pasien</label>
        <input type="text" class="form-control" id="nama_pasien" placeholder="Nomor Pasien:" name="nama_pasien" value="<?= $nama_pasien; ?>" readonly>
        <input type='hidden' name='id_daftar_poli' value='<?php echo $id_daftar_poli; ?>'>

    </div>
    <div class="form-group">
        <label for="tanggal_periksa">Tanggal Periksa</label>
        <input type="datetime-local" class="form-control" id="tanggal_periksa" name="tanggal_periksa" required>
    </div>
    <div class="form-group">
        <label for="catatan">Catatan</label>
        <input type="text" class="form-control" id="catatan" name="catatan" required>
    </div>
    <div class="form-group">
        <label for="id_poli">Pilih Obat</label>
        <select multiple="multiple" class="select2" name='obat[]' required>
                    <?php
                    // Menampilkan opsi dropdown untuk obat dengan harga dan kemasan
                    while ($row_obat = $result_obat->fetch_assoc()) {
                        $harga_rp = "Rp " . number_format($row_obat['harga'], 0, ',', '.');
                        echo "<option value='" . $row_obat['id'] . "' data-harga='" . $row_obat['harga'] . "'>" . $row_obat['nama_obat'] . " - " . $harga_rp . " - " . $row_obat['kemasan'] . "</option>";
                    }
                    ?>
        </select>
    </div>
    <div class="form-group">
        <label for="total_biaya_obat">Total Harga Obat</label>
        <input type="text" class="form-control" id="total_biaya_obat" name="total_biaya_obat" required readonly>
    </div>
    <div class="form-group">
    <label for="total_biaya_periksa">Biaya Periksa</label>
        <input type="text" class="form-control" id="total_biaya_periksa" name="total_biaya_periksa" required readonly value="Rp 0">
    </div>
    <button type="submit" class="btn btn-primary">Simpan</button>
</form>
</form>
          </section>
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

<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
            <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
            <script>
                $(document).ready(function () {
                    $('.select2').select2();

                    // Fungsi untuk menghitung Total Harga saat obat dipilih atau dihapus
                    function hitungTotalBiaya() {
                        var totalBiaya = 0;
                        $('select[name="obat[]"] option:selected').each(function () {
                            totalBiaya += parseInt($(this).data('harga'));
                        });

                        // Menambahkan biaya periksa ke total biaya obat
                        var biayaPeriksa = 150000; // Biaya periksa tetap
                        var totalBiayaPeriksa = totalBiaya + biayaPeriksa;

                        // Menampilkan total biaya periksa di input dan biaya periksa
                        $('#total_biaya_obat').val('Rp ' + number_format(totalBiaya, 0, ',', '.'));
                        $('#total_biaya_periksa').val('Rp ' + number_format(totalBiayaPeriksa, 0, ',', '.'));

                        // Meng-update nilai input hidden 'total_biaya_periksa'
                        $('input[name="total_biaya_periksa"]').val(totalBiayaPeriksa);
                    }

                    // Panggil fungsi saat halaman dimuat
                    hitungTotalBiaya();

                    // Event listener untuk perubahan pada select obat
                    $('select[name="obat[]"]').on('change', function () {
                        hitungTotalBiaya();
                    });
                });

                // Fungsi untuk format angka ke format Rupiah
                function number_format(number, decimals, dec_point, thousands_sep) {
                    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
                    var n = !isFinite(+number) ? 0 : +number,
                        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
                        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
                        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
                        s = '',
                        toFixedFix = function (n, prec) {
                            var k = Math.pow(10, prec);
                            return '' + Math.round(n * k) / k;
                        };

                    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
                    if (s[0].length > 3) {
                        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
                    }
                    if ((s[1] || '').length < prec) {
                        s[1] = s[1] || '';
                        s[1] += new Array(prec - s[1].length + 1).join('0');
                    }

                    return s.join(dec);
                }
            </script>
</body>
</html>

<?php
        // Tutup koneksi hasil obat
        $result_obat->close();
    } else {
        echo "Data pasien tidak ditemukan.";
    }
} else {
    echo "Parameter id_pasien tidak ditemukan.";
}

// Tutup koneksi
$koneksi->close();
?>