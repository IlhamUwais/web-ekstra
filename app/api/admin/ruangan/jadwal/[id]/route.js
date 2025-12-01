import { NextResponse } from 'next/server';
import db from '../../../../../db/db';

export async function GET(request, { params }) {
  const { id } = params; // Ini adalah id_ruangan
  try {
    const query = `
      SELECT 
        e.nama_ekstra, 
        e.hari, 
        e.jam_mulai, 
        e.jam_selesai,
        p.nama as nama_pembina
      FROM 
        tb_ekstrakurikuler e
      LEFT JOIN
        tb_pembina p ON e.id_pembina = p.id_pembina
      WHERE 
        e.id_ruangan = ? AND e.status = 'aktif'
      ORDER BY 
        e.hari, e.jam_mulai
    `;
    const [rows] = await db.query(query, [id]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("API Error fetching jadwal ruangan:", error);
    return NextResponse.json({ message: 'Error fetching jadwal ruangan' }, { status: 500 });
  }
}