import { NextResponse } from 'next/server';
import db from '../../../db/db';

// Fungsi helper untuk mendapatkan semua tanggal untuk hari tertentu dalam sebulan
function getDatesForDayInMonth(year, month, dayName) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates = [];
  const dayIndex = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].indexOf(dayName);

  for (let i = 1; i <= daysInMonth; i++) {
    let date = new Date(year, month - 1, i);
    if (date.getDay() === dayIndex) {
      // Format tanggal menjadi YYYY-MM-DD
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  return dates;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id_ekstra = searchParams.get('id_ekstra');
  const bulan = parseInt(searchParams.get('bulan'), 10);
  const tahun = parseInt(searchParams.get('tahun'), 10);

  if (!id_ekstra || !bulan || !tahun) {
    return NextResponse.json({ message: 'Parameter tidak lengkap' }, { status: 400 });
  }

  try {
    // 1. Dapatkan detail ekstra, terutama harinya
    const [ekstraRows] = await db.query('SELECT hari FROM tb_ekstrakurikuler WHERE id_ekstra = ?', [id_ekstra]);
    if (ekstraRows.length === 0) {
      return NextResponse.json({ message: 'Ekstrakurikuler tidak ditemukan' }, { status: 404 });
    }
    const hariJadwal = ekstraRows[0].hari;

    // 2. Hasilkan daftar tanggal untuk header tabel
    const header_tanggal = getDatesForDayInMonth(tahun, bulan, hariJadwal);

    // 3. Ambil daftar semua siswa yang diterima di ekstra ini
    const siswaQuery = `
      SELECT s.nis, s.nama, k.nama_kelas 
      FROM tb_peserta_ekstra pe
      JOIN tb_siswa s ON pe.nis = s.nis
      JOIN tb_kelas k ON s.id_kelas = k.id_kelas
      WHERE pe.id_ekstra = ? AND pe.status = 'diterima'
      ORDER BY s.nama ASC
    `;
    const [siswaRows] = await db.query(siswaQuery, [id_ekstra]);

    // 4. Ambil semua data presensi di bulan & tahun yang dipilih untuk ekstra ini
    const presensiQuery = 'SELECT nis, tanggal, status FROM tb_presensi WHERE id_ekstra = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?';
    const [presensiRows] = await db.query(presensiQuery, [id_ekstra, bulan, tahun]);

    // 5. Olah data mentah menjadi format matriks
    const rekapData = siswaRows.map(siswa => {
      let jumlah_kehadiran = 0;
      const kehadiran = {};

      header_tanggal.forEach(tgl => {
        const presensi = presensiRows.find(p => p.nis === siswa.nis && p.tanggal.toISOString().split('T')[0] === tgl);
        if (presensi) {
          kehadiran[tgl] = presensi.status;
          if (presensi.status === 'H') {
            jumlah_kehadiran++;
          }
        } else {
          kehadiran[tgl] = '-';
        }
      });

      return {
        ...siswa,
        kehadiran,
        jumlah_kehadiran
      };
    });

    return NextResponse.json({ header_tanggal, rekapData });
  } catch (error) {
    console.error("API Error fetching rekap:", error);
    return NextResponse.json({ message: 'Gagal mengambil data rekap' }, { status: 500 });
  }
}