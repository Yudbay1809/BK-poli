
<?php 
// mengaktifkan session php
session_start();
 
// menghubungkan dengan koneksi
include '../koneksi.php';
 
// menangkap data yang dikirim dari form
$nama = $_POST['nama'];
$no_ktp = $_POST['no_ktp'];
 
// menyeleksi data admin dengan username dan no_ktp yang sesuai
$data = mysqli_query($koneksi,"select * from pasien where nama='$nama' and no_ktp='$no_ktp'");
 
// menghitung jumlah data yang ditemukan
$cek = mysqli_num_rows($data);
 
if($cek > 0){
	$_SESSION['nama'] = $nama;
	$_SESSION['status'] = "login";
	header("location: pasien.php");
}else{
    $_SESSION["login_error"] = "Kombinasi Username dan no_ktp tidak valid.";
    header("Location: login.php");
    exit();
}
?>
