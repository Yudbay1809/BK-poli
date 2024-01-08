<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Informasi Poliklinik</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <link href="https://getbootstrap.com/docs/5.3/assets/css/docs.css" rel="stylesheet">
  
    <!-- Google Font: Source Sans Pro -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="plugins/fontawesome-free/css/all.min.css">
    <!-- Ionicons -->
    <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
    <!-- Tempusdominus Bootstrap 4 -->
    <link rel="stylesheet" href="plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css">
    <!-- iCheck -->
    <link rel="stylesheet" href="plugins/icheck-bootstrap/icheck-bootstrap.min.css">
    <!-- JQVMap -->
    <link rel="stylesheet" href="plugins/jqvmap/jqvmap.min.css">
    <!-- Theme style -->
    <link rel="stylesheet" href="dist/css/adminlte.min.css">
    <!-- overlayScrollbars -->
    <link rel="stylesheet" href="plugins/overlayScrollbars/css/OverlayScrollbars.min.css">
    <!-- Daterange picker -->
    <link rel="stylesheet" href="plugins/daterangepicker/daterangepicker.css">
    <!-- summernote -->
    <link rel="stylesheet" href="plugins/summernote/summernote-bs4.min.css">


    <div class="preloader flex-column justify-content-center align-items-center">
  </div>
</head>

<body class="hold-transition sidebar-mini layout-fixed">
    <header class="bg-dark text-white text-center py-5">
        <h1 class="display-4">BK POLIKLINIK</h1>
        <p class="lead">Sebatas Capstone BK</p>
    </header>

    <section class="container my-5">
    <div id="carouselExampleControlsNoTouching" class="carousel slide" data-bs-touch="false">
      <div class="carousel-inner">
        <div class="carousel-item active">
          <img class="bd-placeholder-img bd-placeholder-img-lg d-block w-100" width="800" height="400" src="picture/alat.jpg" role="img" aria-label="Placeholder: First slide" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#777"></rect></img>
        </div>
        <div class="carousel-item">
          <img class="bd-placeholder-img bd-placeholder-img-lg d-block w-100" width="800" height="400" src="picture/ruangan.jpg" role="img" aria-label="Placeholder: Second slide" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#666"></rect></img>
        </div>
        <div class="carousel-item">
          <img class="bd-placeholder-img bd-placeholder-img-lg d-block w-100" width="800" height="400" src="picture/rs.jpg" role="img" aria-label="Placeholder: Third slide" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#555"></rect></img>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControlsNoTouching" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControlsNoTouching" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
    </section>

    <div class="row row-cols-1 row-cols-md-3 g-4">  
  <div class="col">
    <div class="card h-100">
    <img src="picture/admin_profil.png" class="rounded-circle" alt="Cinque Terre" width="304" height="236">
      <div class="card-body">
        <h5 class="card-title">Admin</h5>
        <p class="card-text">Selamat Datang Silahkan Login Terlebih dahulu</p>
      </div>
      <div class="card-footer">
        <a href="admin/login.php" class="btn btn-primary" role="button" aria-disabled="true">Login</a>
      </div>
    </div>
  </div>
  <div class="col">
    <div class="card h-100">
    <img src="picture/admin_profil.png" class="rounded-circle" alt="Cinque Terre" width="304" height="236">
      <div class="card-body">
        <h5 class="card-title">Dokter</h5>
        <p class="card-text">Selamat Datang Silahkan Login Terlebih dahulu.</p>
      </div>
      <div class="card-footer">
      <a href="dokter/login.php" class="btn btn-primary" role="button" aria-disabled="true">Login</a>
      </div>
    </div>
  </div>
  <div class="col">
    <div class="card h-100">
    <img src="picture/admin_profil.png" class="rounded-circle" alt="Cinque Terre" width="304" height="236">
      <div class="card-body">
        <h5 class="card-title">Pasien</h5>
        <p class="card-text">Selamat Datang Silahkan Login Terlebih dahulu</p>
      </div>
      <div class="card-footer">
      <a href="pasien/login.php" class="btn btn-primary" role="button" aria-disabled="true">Login</a>
      </div>
    </div>
  </div>
</div>
<!-- jQuery -->
<script src="plugins/jquery/jquery.min.js"></script>
<!-- jQuery UI 1.11.4 -->
<script src="plugins/jquery-ui/jquery-ui.min.js"></script>
<!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
<script>
  $.widget.bridge('uibutton', $.ui.button)
</script>
<!-- Bootstrap 4 -->
<script src="plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<!-- ChartJS -->
<script src="plugins/chart.js/Chart.min.js"></script>
<!-- Sparkline -->
<script src="plugins/sparklines/sparkline.js"></script>
<!-- JQVMap -->
<script src="plugins/jqvmap/jquery.vmap.min.js"></script>
<script src="plugins/jqvmap/maps/jquery.vmap.usa.js"></script>
<!-- jQuery Knob Chart -->
<script src="plugins/jquery-knob/jquery.knob.min.js"></script>
<!-- daterangepicker -->
<script src="plugins/moment/moment.min.js"></script>
<script src="plugins/daterangepicker/daterangepicker.js"></script>
<!-- Tempusdominus Bootstrap 4 -->
<script src="plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js"></script>
<!-- Summernote -->
<script src="plugins/summernote/summernote-bs4.min.js"></script>
<!-- overlayScrollbars -->
<script src="plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js"></script>
<!-- AdminLTE App -->
<script src="dist/js/adminlte.js"></script>

<!-- AdminLTE dashboard demo (This is only for demo purposes) -->
<script src="dist/js/pages/dashboard.js"></script>
</body>

</html>
