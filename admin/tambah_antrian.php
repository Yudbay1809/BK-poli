<html>
    <head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap" rel="stylesheet">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/boxicons@latest/css/boxicons.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
        <script src="datepicker.js"></script>

        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <link href="style.css" rel="stylesheet">
        <style>
            .container-tambah-antrian{
                background-color: white;
                padding: 3%;
                gap: 5%;
                margin-top: 5vh;
                margin-left: 2vw;
                margin-right: 2vw;
                border-radius: 12px;
            }
            .label-input{
                font-family: PoppinsMedium;
                font-size: 14px;
                color: #4D455D;
                margin-top: 1vh;
            }
            .btn-tambah{
                background-color: #B1B2FF;
                font-family: PoppinsBold;
                color: white;
                border: none;
                border-radius: 5px;
                width: 100%;
                margin-top: 4vh;
                height: 5vh;
            }
        </style>
    </head>
    <body id="body-pd" onload="myFunction()">
        <header class="header" id="header">
            <div class="header_toggle"> 
                <span style="align-self: center;margin-left: 3%;" id="hello"></span>
            </div>
            <div class="header_img"> 
                <a href="notif.html" style="align-self: center;margin-left: 5%;">
                    <img width="60%"  src="../image/Notification.png" alt=""> 
                </a>
                <div style="display: flex;flex-direction: row;">
                    <a href="profil.html" style="align-self: center;">
                        <img width="60%" src="../image/profile.png" alt=""> 
                    </a>
                </div>
            </div>
        </header>
        <div class="l-navbar" id="nav-bar">
            <nav class="nav">
                <div> 
                    <a href="#" class="nav_logo"> <img width="60%" src="../image/logo_nav.png"></a>
                    <div class="nav_list"> 
                        <a href="index.html" class="nav_link  " > <i class='bx bxs-grid-alt nav-icon'></i> <span class="nav_name">Dashboard</span> </a> 
                        
                        <a href="#antrianSubmenu " data-toggle="collapse" class="nav_link dropdown-toggle active"> <i class='bx bxs-group nav-icon'></i> <span class="nav_name">Antrian</span> <i class='bx bxs-down-arrow' style="margin-left: 200%;"></i></a>
                        <ul class="collapse list-unstyled collapse show" id="antrianSubmenu">
                            <li>
                                <a class="nav_link_sub active" href="tambah_antrian.html">Tambah Antrian</a>
                            </li>
                            <li>
                                <a class="nav_link_sub" href="data_antrian.html">Data Antrian</a>
                            </li>
                        </ul> 
                        <a href="#obatSubmenu " data-toggle="collapse" class="nav_link dropdown-toggle "> <i class='bx bxs-capsule nav-icon'></i> <span class="nav_name">Obat</span> <i class='bx bxs-down-arrow' style="margin-left: 320%;"></i></a>
                        <ul class="collapse list-unstyled " id="obatSubmenu">
                            <li>
                                <a class="nav_link_sub  " href="tambah_stok_obat.html">Tambah Stok Obat</a>
                            </li>
                            <li>
                                <a class="nav_link_sub" href="stok_obat.html">Stok Obat</a>
                            </li>
                            <li>
                                <a class="nav_link_sub" href="tambah_kode_obat.html">Tambah Obat</a>
                            </li>
                            <li>
                                <a class="nav_link_sub" href="kode_obat.html">Data Obat</a>
                            </li>
                        </ul> 
                        <a href="#pasienSubmenu " data-toggle="collapse" class="nav_link dropdown-toggle "> <i class='bx bxs-user-plus nav-icon'></i> <span class="nav_name">Pasien</span> <i class='bx bxs-down-arrow' style="margin-left: 250%;"></i></a>
                        <ul class="collapse list-unstyled " id="pasienSubmenu">
                            <li>
                                <a class="nav_link_sub" href="data_pasien.html">Profil Pasien</a>
                            </li>
                            <li>
                                <a class="nav_link_sub " href="tambah_rekam_medis.html">Tambah Rekam Medis</a>
                            </li>
                            <li>
                                <a class="nav_link_sub" href="rekam_medis.html">Rekam Medis</a>
                            </li>
                            <li>
                                <a class="nav_link_sub" href="pengajuan_rekam_medis.html">Pengajuan Rekam Medis</a>
                            </li>
                        </ul>
                        <a href="data_dokter.html"  class="nav_link "> <i class='bx bxs-first-aid nav-icon'></i> <span class="nav_name">Dokter</span> </a>

                        <a href="#jadwalSubmenu " data-toggle="collapse" class="nav_link dropdown-toggle "> <i class='bx bxs-calendar nav-icon'></i> <span class="nav_name">Jadwal</span> <i class='bx bxs-down-arrow' style="margin-left: 240%;"></i></a>
                        <ul class="collapse list-unstyled " id="jadwalSubmenu">
                            <li>
                                <a class="nav_link_sub " href="tambah_jadwal_konsultasi.html">Tambah Jadwal Konsultasi</a>
                            </li>
                            <li>
                                <a class="nav_link_sub" href="jadwal_konsultasi.html">Jadwal Konsultasi</a>
                            </li>
                            <li>
                                <a class="nav_link_sub" href="tambah_jadwal_medical_checkup.html">Tambah Jadwal Medical Check Up</a>
                            </li>
                            <li>
                                <a class="nav_link_sub" href="jadwal_medical_checkup.html">Jadwal Medical Check Up</a>
                            </li>
                        </ul>
                        <button class="btn-logout" onclick="window.location.href='../index.html'">
                            <i class='bx bx-exit'></i>
                            Log Out
                        </button>
                    </div>
                </div> 
            </nav>
        </div>
        <!--Container Main start-->
        <div style="display: flex;flex-direction: row;justify-content: space-between;">
            <div style="width: 55.5%;margin-left: 14.8%;margin-top: 9vh;">
                <div class="container-btn-tambah-data">
                    <a href="tambah_stok_obat.html" class="btn-tambah-data"  style="background: linear-gradient(108.35deg, #FFA5A5 -0.72%, #FFC0C0 56.92%);justify-content: center;">
                        <img width="6%" style="height: 3vh;" src="../image/tambah_obat_icon.png">
                        <span style="margin-left: 5%;text-decoration: none;font-size: 18px;">Tambah Stok Obat</span>
                    </a>
                    <a href="pengajuan_rekam_medis.html" class="btn-tambah-data" style="background: linear-gradient(101.24deg, #A9CBFF 6.89%, #B4D2FF 59.19%, #BED8FF 86.21%, #C9DEFF 99.62%);justify-content: center;">
                        <img width="6%" style="height: 4vh;" src="../image/pengajuan_rekam_medis_icon.png" >
                        <span style="margin-left: 5%;text-decoration: none;font-size: 18px;">Pengajuan Rekam Medis</span>
                    </a>
                </div>
                <div class="container-tambah-antrian">
                    <div>
                        <div style="display: flex;margin-top: 1vh;margin-bottom: 1vh;">
                            <i class='bx bxs-group nav-icon' style="color: #7DB9B6;font-size: 30px;"></i> 
                            <span class="nav-name" style="font-size: 16px; margin-left: 1vw;">Tambah Antrian</span>
                        </div>
                        <form id="form">
                            <div class="form-group " style="width: 100%;">
                                <label class="label-input">Nama Pasien</label>
                                <select name="nama_pasien" id="select_pasien" style="background-position: 97%;color: #4D455D;font-family: PoppinsRegular;" class="form-control select-konsultasi" >
                                    <option disabled selected value="val1">Pilih Pasien</option>  
                                </select>
                            </div>
                            <div class="form-group " style="width: 100%;">
                                <label class="label-input">Nama Dokter</label>
                                <select name="nama_dokter" id="select_dokter" style="background-position: 97%;color: #4D455D;font-family: PoppinsRegular;" class="form-control select-konsultasi" >
                                    <option disabled selected value="val1">Pilih Dokter</option>
                                </select>
                            </div>
                            <a class="label-input cancel" style="text-decoration: none;color: #E96479;cursor: pointer;float: right;margin-top: 3vh;">
                                Cancel
                            </a>
                            <button type="submit" class="btn-tambah">Tambah</button>
                          </form>
                    </div>
                </div>
            </div>
            <div style="background-color: white;height: 91vh;margin-top: 9vh;width: 29.4%;text-align: -webkit-center;position: fixed;right: 0;">
                <div class="form-group mb-0" id="datepicker" style="margin: 3%;">
                    <input class="form-control" type="hidden" data-provide="datepicker" id="tanggal" name="tanggal" value="" >
                    
                </div>
                <div style="display: flex;flex-direction: row;margin-left: 18%;margin-top: 5%;">
                    <p>Jadwal &nbsp</p>
                    <p id="demo"></p>
                    <img width="5%" height="3%" style="position: absolute;right: 17%;margin-top: 2px;"  src="../image/tombol_tambah.png" onclick="window.location.href='tambah_jadwal.html'">
                </div>
                <div style="display: flex;flex-direction: column;" id="jadwal">
                   
                </div>
            </div>
        </div>   
    </body>
    <script>
        document.addEventListener("DOMContentLoaded", function(event) {
        nav = document.getElementById('nav-bar')
        nav.classList.toggle('show')
            
        
        
        /*===== LINK ACTIVE =====*/
        const linkColor = document.querySelectorAll('.nav_link')
        
        function colorLink(){
        if(linkColor){
        linkColor.forEach(l=> l.classList.remove('active'))
        this.classList.add('active')
        }
        }
        linkColor.forEach(l=> l.addEventListener('click', colorLink))
       // Your code to run since DOM is loaded and ready

       const collapseToggles = document.querySelectorAll('[data-toggle="collapse"]');
        const collapseElements = document.querySelectorAll('.collapse');

        collapseToggles.forEach(function (toggle) {
        toggle.addEventListener('click', function () {
            // Get the target collapse element ID from the "href" attribute
            const targetId = this.getAttribute('href');

            // Loop through all collapse elements
            collapseElements.forEach(function (collapse) {
            // Check if the current collapse is not the target collapse
            if (collapse.id !== targetId) {
                // Close the other collapse elements
                collapse.classList.remove('show');
            }
            });
        });
        });

        //pilih pasien
        $("#select_pasien").select2();

        $.ajax
                ({

                    url:'https://us-east-1.aws.data.mongodb-api.com/app/poliklinik-uukuv/endpoint/get_user_pasien',
                    success: (res)=>{
                        $.each(res,(index,data)=>{
                    
                        $('#select_pasien').append(
                            '<option>'+data.nama+'</option>'  
                        ); 
                    }
                    );
                },
                error:(err)=>{console.log(err);}
                });

        //pilih dokter        

        $("#select_dokter").select2();

        $.ajax
                ({

                    url:'https://us-east-1.aws.data.mongodb-api.com/app/poliklinik-uukuv/endpoint/get_user_dokter',
                    success: (res)=>{
                        $.each(res,(index,data)=>{
                    
                        $('#select_dokter').append(
                            '<option>'+data.nama+'</option>'  
                        ); 
                    }
                    );
                },
                error:(err)=>{console.log(err);}
                });   

        });
        $(function(){
        $( "#datepicker" ).datepicker({
            format: "dd-mm-yyyy",
            toggleActive: true,
            changeMonth: true,
            changeYear: true
         });
        }); 
        var tanggal = document.getElementById("tanggal")
        var today = new Date(); // Membuat objek Date dengan tanggal dan waktu saat ini
        var day = today.getDate(); // Mengambil tanggal (1-31)
        var month = today.getMonth() + 1; // Mengambil bulan (0-11). Ingat untuk menambahkan 1 karena indeks bulan dimulai dari 0.
        var year = today.getFullYear(); // Mengambil tahun empat digit

        // Menampilkan tanggal hari ini di elemen dengan id "tanggal-hari-ini"
        if(month < 10){
            tanggal.value = day + "-" + 0+month + "-" + year;
            var tes = tanggal.value;
        }else{
            tanggal.value = day + "-" + month + "-" + year;
            var tes = tanggal.value;
        }

        function myFunction(){
            var value = tanggal.value
            document.getElementById("demo").innerHTML = value
            var jadwal = document.getElementById("jadwal")
            jadwal.innerHTML = ''
            $.ajax
                ({

                    url:'https://us-east-1.aws.data.mongodb-api.com/app/poliklinik-uukuv/endpoint/get_jadwal_by_tanggal?tanggal='+value,
                    success: (res)=>{
                        $.each(res,(index,data)=>{
                    
                        if(data.status == "selesai"){

                            
                            $('#jadwal').append(
                            '<div class="card-jadwal" id="card-jadwal">'+
                            '<div class="div-jadwal">'+
                                '<span class="txt-nama-dokter">'+data.nama_dokter+'</span>'+
                                '<div style="display: flex;flex-direction: row;align-items: center;width: 12vw;margin-left: 2%;"><p class="txt-waktu">'+data.jam+'</p><p class="txt-waktu" style="margin: 2%;"> . </p><p class="txt-waktu">'+data.kategori+'</p></div>'+ 
                            '</div id="aksi">'+ 
                                    '<img width="9%" style="margin-left: 30%;" src="../image/btn_delete_jadwal.png" class="delete" id="btnDelete" data-id="'+data._id+'">'+
                            '</div>'+
                            '</div>'    
                        ); 
                        $(".card-jadwal").css("background-color", "#B1B2FF");
                        $(".txt-nama-dokter").css("color", "#ffffff");
                        $(".txt-waktu").css("color", "#ffffff");
                        }else{
                        $('#jadwal').append(
                            ' <div class="card-jadwal" id="card-jadwal">'+
                            '<div class="div-jadwal">'+
                                '<span class="txt-nama-dokter">'+data.nama_dokter+'</span>'+
                                '<div style="display: flex;flex-direction: row;align-items: center;width: 12vw;margin-left: 2%;"><p class="txt-waktu">'+data.jam+'</p><p class="txt-waktu" style="margin: 2%;"> . </p><p class="txt-waktu">'+data.kategori+'</p></div>'+ 
                            '</div id="aksi">'+ 
                                    '<img width="10%" style="margin-left: 20%;" src="../image/btn_ckls.png" class="setuju" id="btnSetuju" data-id="'+data._id+'">'+
                                    '<img width="9%" style="margin-left: 1%;" src="../image/btn_silang.png" id="btnTolak" class="delete" data-id="'+data._id+'">'+
                                    '<img width="9%" style="margin-left: 30%;display: none;" src="../image/btn_delete_jadwal.png" class="delete" id="btnDelete2" data-id="'+data._id+'">'+
                            '</div>'+
                            '</div>'    
                        ); 
                        }
                    }
                    );
                },
                error:(err)=>{console.log(err);}
                });
        }
        tanggal.onchange = myFunction;
        tanggal.onblur = myFunction;

        //hello text
        var username = localStorage.getItem('username');
        var hello = document.getElementById("hello")
        hello.innerHTML += "Hello, "+username+"!"

        $('#jadwal').on('click', '.setuju', (e) => {
            var id = e.target.dataset.id;
            $.ajax({
                url:'https://us-east-1.aws.data.mongodb-api.com/app/poliklinik-uukuv/endpoint/update_statusjadwal_by_id',
                type: 'PUT',
                data: {
                    id: id
                },success: (res) => {
                    $(".card-jadwal").css("background-color", "#B1B2FF");
                    $(".txt-nama-dokter").css("color", "#ffffff");
                    $(".txt-waktu").css("color", "#ffffff");
                    $("#btnSetuju").hide();
                    $("#btnTolak").hide();
                    $("#btnDelete2").show();
                },
                error: (err) => { 
                    console.log(err);
                }
            });
        });
        $('#jadwal').on('click', '.delete', (e) => {
            var id = e.target.dataset.id;
            $.ajax({
                        url:'https://us-east-1.aws.data.mongodb-api.com/app/poliklinik-uukuv/endpoint/delete_jadwal?id='+id,
                        type: 'DELETE',
                        success: (res) => {
                            location.reload();
                        },
                        error: (err) => {
                            console.log(err);
                        }
                    });
        }); 
        $('#form').on('click', '.cancel', () => {
            location.reload();
        }); 

        $('#select_pasien').change(
        ()=>{
        $.ajax
            ({
                url:'https://us-east-1.aws.data.mongodb-api.com/app/poliklinik-uukuv/endpoint/get_user_by_nama?nama='+$('#select_pasien option:selected').val(),
                type: 'GET',
                success: (res)=>{
                    $.ajax
                        ({

                            url:'https://us-east-1.aws.data.mongodb-api.com/app/poliklinik-uukuv/endpoint/get_antrian',
                            type: 'GET',
                            success: (res2)=>{
                                $('#form').submit(
                                    ()=>{
                                        $.ajax({
                                            url:"https://us-east-1.aws.data.mongodb-api.com/app/poliklinik-uukuv/endpoint/insert_antrian",
                                            type: 'POST',
                                            data: {
                                                urutan:res2.length+1,
                                                nama_pasien:$('#select_pasien option:selected').val(),
                                                nim:res.nim,
                                                nama_dokter:$('#select_dokter option:selected').val()
                                            },
                                            beforeSend: ()=>{
                                                $('#form button').prop('disabled',true);
                                            },
                                            success: (res) => {
                                                form.reset();
                                            },
                                            error: (err) => {
                                                console.log(err);
                                            }
                                        });
                                        
                                        return false;
                                    }
                                );
                        },
                        error:(err)=>{console.log(err);}
                        });

                },
                error:(err)=>{console.log(err);}
            });

        }
                                );
    </script>
</html>