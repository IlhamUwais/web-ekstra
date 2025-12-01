// app/api/pembina/presensi/route.js
import { NextResponse } from 'next/server';
import db from '../../../db/db';

// GET: Mengambil daftar siswa untuk presensi hari ini
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id_ekstra = searchParams.get('id_ekstra');

  if (!id_ekstra) {
    return NextResponse.json({ message: 'ID Ekstra dibutuhkan' }, { status: 400 });
  }

  try {
    // Query ini mengambil semua siswa yang diterima, lalu MENGGABUNGKAN (LEFT JOIN)
    // data presensi jika ada untuk hari ini (CURDATE()).
    const query = `
      SELECT 
        s.nis, 
        s.nama, 
        k.nama_kelas,
        p.status,
        p.catatan
      FROM 
        tb_peserta_ekstra pe
      JOIN 
        tb_siswa s ON pe.nis = s.nis
      JOIN 
        tb_kelas k ON s.id_kelas = k.id_kelas
      LEFT JOIN 
        tb_presensi p ON pe.nis = p.nis AND p.id_ekstra = pe.id_ekstra AND p.tanggal = CURDATE()
      WHERE 
        pe.id_ekstra = ? AND pe.status = 'diterima'
      ORDER BY 
        s.nama ASC
    `;
    const [rows] = await db.query(query, [id_ekstra]);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching presensi list' }, { status: 500 });
  }
}

// POST: Menyimpan data presensi
export async function POST(request) {
  const connection = await db.getConnection();
  try {
    const { id_ekstra, presensiData } = await request.json();

    await connection.beginTransaction(); // Mulai transaksi

    // Loop melalui setiap data presensi yang dikirim dari frontend
    for (const data of presensiData) {
      // Hapus data lama (jika ada) untuk siswa ini di hari ini
      await connection.query(
        'DELETE FROM tb_presensi WHERE nis = ? AND id_ekstra = ? AND tanggal = CURDATE()',
        [data.nis, id_ekstra]
      );

      // Masukkan data baru jika statusnya bukan kosong
      if (data.status) {
        await connection.query(
          'INSERT INTO tb_presensi (nis, id_ekstra, tanggal, status, catatan) VALUES (?, ?, CURDATE(), ?, ?)',
          [data.nis, id_ekstra, data.status, data.catatan]
        );
      }
    }

    await connection.commit(); // Konfirmasi semua perubahan jika berhasil
    return NextResponse.json({ message: 'Presensi berhasil disimpan!' }, { status: 200 });

  } catch (error) {
    await connection.rollback(); // Batalkan semua perubahan jika ada error
    console.error(error);
    return NextResponse.json({ message: 'Error saving presensi' }, { status: 500 });
  } finally {
    connection.release(); // Selalu lepaskan koneksi
  }
}