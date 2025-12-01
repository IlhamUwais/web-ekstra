// app/api/siswa/status-ekstra/[nis]/route.js
import { NextResponse } from 'next/server';
import db from '../../../../../db/db';

export async function GET(request, { params }) {
  const { nis } = params;
  try {
    const query = `
      SELECT 
        pe.id_ekstra, 
        pe.status, 
        e.nama_ekstra, 
        p.nama AS nama_pembina, 
        e.hari, 
        e.jam_mulai, 
        e.jam_selesai 
      FROM 
        tb_peserta_ekstra pe
      JOIN 
        tb_ekstrakurikuler e ON pe.id_ekstra = e.id_ekstra
      JOIN 
        tb_pembina p ON e.id_pembina = p.id_pembina
      WHERE 
        pe.nis = ?
    `;
    const [rows] = await db.query(query, [nis]);
    
    if (rows.length > 0) {
      return NextResponse.json(rows[0], { status: 200 });
    } else {
      return NextResponse.json({ message: 'Siswa tidak terdaftar di ekstrakurikuler manapun' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching status ekstrakurikuler' }, { status: 500 });
  }
}