<?php
include_once("../koneksi.php");

$title = 'Poliklinik | Riwayat Pasien';

// Breadcrumb section
ob_start(); ?>
<ol class="breadcrumb float-sm-right">
  <li class="breadcrumb-item"><a href="<?= $base_dokter; ?>">Home</a></li>
  <li class="breadcrumb-item active">Riwayat Pasien</li>
</ol>
<?php
$breadcrumb = ob_get_clean();
ob_flush();

// Title Section
ob_start(); ?>
Riwayat Pasien
<?php
$main_title = ob_get_clean();
ob_flush();

// Content section
ob_start();
?>
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Daftar Riwayat Pasien</h3>
  </div>
  <div class="card-body">
    <table id="example1" class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>No</th>
          <!-- ... (bagian lainnya) ... -->
        </tr>
      </thead>
      <tbody>
        <?php
        $no = 1;
        $data = $pdo->query("SELECT * FROM pasien");
        if ($data->rowCount() == 0) {
          echo "<tr><td colspan='7' align='center'>Tidak ada data</td></tr>";
        } else {
          while ($d = $data->fetch()) {
            ?>
            <tr>
              <td><?= $no++; ?></td>
              <!-- ... (bagian lainnya) ... -->
            </tr>
            <?php
            $pasien_id = $d['id'];
            $data2 = $pdo->query("SELECT 
                                  p.nama AS 'nama_pasien',
                                  pr.*,
                                  d.nama AS 'nama_dokter',
                                  dpo.keluhan AS 'keluhan',
                                  GROUP_CONCAT(o.nama_obat SEPARATOR ', ') AS 'obat'
                              FROM periksa pr
                              LEFT JOIN daftar_poli dpo ON (pr.id_daftar_poli = dpo.id)
                              LEFT JOIN jadwal_periksa jp ON (dpo.id_jadwal = jp.id)
                              LEFT JOIN dokter d ON (jp.id_dokter = d.id)
                              LEFT JOIN pasien p ON (dpo.id_pasien = p.id)
                              LEFT JOIN detail_periksa dp ON (pr.id = dp.id_periksa)
                              LEFT JOIN obat o ON (dp.id_obat = o.id)
                              WHERE dpo.id_pasien = '$pasien_id'
                              GROUP BY pr.id
                              ORDER BY pr.tgl_periksa DESC;");
            ?>
            <!-- ... (bagian lainnya) ... -->
            <?php if ($data2->rowCount() == 0) : ?>
              <tr>
                <td colspan="7" align="center">Tidak ada riwayat periksa</td>
              </tr>
            <?php else : ?>
              <!-- ... (bagian lainnya) ... -->
            <?php endif; ?>
          <?php
          }
        }
        ?>
      </tbody>
    </table>
  </div>
</div>
<?php
$content = ob_get_clean();
ob_flush();
?>