// app/api/pembina/dashboard/route.js
import { NextResponse } from 'next/server';
import db from '../../db/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id_ekstra = searchParams.get('id_ekstra');
  const tanggal = searchParams.get('tanggal');

  if (!id_ekstra) {
    return NextResponse.json({ message: 'ID Ekstra dibutuhkan' }, { status: 400 });
  }

  try {
    // Query Total Peserta & Siswa Sering Izin (tetap sama)
    const totalPesertaQuery = "SELECT COUNT(*) AS total FROM tb_peserta_ekstra WHERE id_ekstra = ? AND status = 'diterima'";
    const [totalPesertaRows] = await db.query(totalPesertaQuery, [id_ekstra]);
    const total_peserta = totalPesertaRows[0].total;

       // --- PERUBAHAN DI SINI ---
    const seringAbsenQuery = `
      SELECT s.nama, COUNT(p.id_presensi) AS jumlah_absen 
      FROM tb_presensi p JOIN tb_siswa s ON p.nis = s.nis
      WHERE p.id_ekstra = ? AND p.status IN ('I', 'S', 'A')
      GROUP BY s.nis, s.nama 
      ORDER BY jumlah_absen DESC 
      -- LIMIT 5 DIHAPUS DARI SINI
    `;
    const [siswa_sering_absen] = await db.query(seringAbsenQuery, [id_ekstra]);

    // BARU: Satu query untuk semua detail & rekap harian
    const detail_harian = { H: [], I: [], S: [], A: [] };
    const rekap_harian = { H: 0, I: 0, S: 0, A: 0 };

    if (tanggal) {
      const harianQuery = `
        SELECT s.nama, p.status, p.catatan 
        FROM tb_presensi p JOIN tb_siswa s ON p.nis = s.nis
        WHERE p.id_ekstra = ? AND p.tanggal = ?
      `;
      const [harianRows] = await db.query(harianQuery, [id_ekstra, tanggal]);

      // Olah data mentah menjadi struktur yang rapi
      harianRows.forEach(row => {
        if (detail_harian[row.status]) {
          detail_harian[row.status].push({ nama: row.nama, catatan: row.catatan });
        }
      });

      // Hitung rekap berdasarkan panjang array
      for (const status in detail_harian) {
        rekap_harian[status] = detail_harian[status].length;
      }
    }

    return NextResponse.json({
      total_peserta,
      siswa_sering_absen,
      rekap_harian,
      detail_harian
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching dashboard data' }, { status: 500 });
  }
}