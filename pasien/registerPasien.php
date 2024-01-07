<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Pasien - Sistem Informasi Poliklinik</title>
    <link rel="stylesheet" href="../dist/css/adminlte.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
</head>

<body class="bg-light">
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-4 mx-auto">
                <form class="p-4 border rounded-3 bg-white" action="register_process.php" method="post">
                    <!-- Teks "Login pasien" akan tergantikan oleh logo di CSS -->
                    <h2 class="text-center mb-4">Login Pasien</h2>
                    <div class="mb-3">
                        <label for="nama" class="form-label">Nama:</label>
                        <input type="text" class="form-control" id="nama" name="nama" required>
                    </div>
                    <div class="mb-3">
                        <label for="alamat" class="form-label">Alamat:</label>
                        <input type="alamat" class="form-control" id="alamat" name="alamat" required>
                    </div>
                    <div class="mb-3">
                        <label for="no_ktp" class="form-label">No KTP:</label>
                        <input type="no_ktp" class="form-control" id="no_ktp" name="no_ktp" required>
                    </div>
                    <div class="mb-3">
                        <label for="no_hp" class="form-label">No HP:</label>
                        <input type="no_hp" class="form-control" id="no_hp" name="no_hp" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Login</button>
                </form>
                <div class="text-center">
                    <p class="mt-3">Sudah punya akun? <a href="login.php">Login</a></p>
            </div>
        </div>
    </div>