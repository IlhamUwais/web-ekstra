// app/api/pembina/chart/izin/route.js
import { NextResponse } from 'next/server';
import db from '../../../../db/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id_ekstra = searchParams.get('id_ekstra');

  if (!id_ekstra) {
    return NextResponse.json({ message: 'ID Ekstra dibutuhkan' }, { status: 400 });
  }

  try {
    // Query ini menghitung jumlah siswa izin per tanggal untuk 30 hari terakhir
    const query = `
      SELECT 
        tanggal, 
        COUNT(*) AS jumlah_izin 
      FROM 
        tb_presensi 
      WHERE 
        id_ekstra = ? 
        AND status = 'I' 
        AND tanggal >= CURDATE() - INTERVAL 30 DAY 
      GROUP BY 
        tanggal 
      ORDER BY 
        tanggal ASC
    `;
    const [rows] = await db.query(query, [id_ekstra]);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching chart data' }, { status: 500 });
  }
}