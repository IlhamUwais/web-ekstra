import { NextResponse } from 'next/server';
import db from '../../../../db/db';

export async function GET(request, { params }) {
  const { id } = params; // Ini adalah id_pembina
  try {
    const query = `
      SELECT 
        e.nama_ekstra, 
        e.hari, 
        e.jam_mulai, 
        e.jam_selesai, 
        r.nama_ruangan 
      FROM 
        tb_ekstrakurikuler e
      LEFT JOIN 
        tb_ruangan r ON e.id_ruangan = r.id_ruangan
      WHERE 
        e.id_pembina = ? AND e.status = 'aktif'
      ORDER BY 
        e.hari, e.jam_mulai
    `;
    const [rows] = await db.query(query, [id]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("API Error fetching jadwal pembina:", error);
    return NextResponse.json({ message: 'Error fetching jadwal pembina' }, { status: 500 });
  }
}