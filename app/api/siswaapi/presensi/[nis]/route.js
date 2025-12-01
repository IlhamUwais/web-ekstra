import { NextResponse } from 'next/server';
import db from '../../../../db/db';

export async function GET(request, { params }) {
  const { nis } = params;
  try {
    // Query ini mengambil data dari tb_presensi dan menggabungkannya
    // dengan tb_ekstrakurikuler untuk mendapatkan nama ekstranya.
    const query = `
      SELECT
        p.id_presensi,
        p.tanggal,
        p.status,
        p.catatan,
        e.nama_ekstra
      FROM
        tb_presensi p
      JOIN
        tb_ekstrakurikuler e ON p.id_ekstra = e.id_ekstra
      WHERE
        p.nis = ?
      ORDER BY
        p.tanggal DESC
    `;
    const [rows] = await db.query(query, [nis]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("API Error fetching riwayat presensi:", error);
    return NextResponse.json({ message: 'Gagal mengambil riwayat presensi' }, { status: 500 });
  }
}