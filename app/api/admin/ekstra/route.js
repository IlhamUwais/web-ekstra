import { NextResponse } from 'next/server';
import db from '../../../db/db';

// GET: Mengambil semua data ekstrakurikuler
export async function GET() {
  try {
    const query = `
      SELECT e.*, p.nama AS nama_pembina 
      FROM tb_ekstrakurikuler e
      JOIN tb_pembina p ON e.id_pembina = p.id_pembina
      ORDER BY e.nama_ekstra ASC
    `;
    const [rows] = await db.query(query);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching ekstrakurikuler' }, { status: 500 });
  }
}

// POST: Menambah ekstrakurikuler baru
export async function POST(request) {
  try {
    const { nama_ekstra, id_pembina, hari, jam_mulai, jam_selesai } = await request.json();

    // Validasi jadwal tumpang tindih
    const conflictQuery = `
      SELECT * FROM tb_ekstrakurikuler 
      WHERE hari = ? 
      AND (
        (jam_mulai < ? AND jam_selesai > ?) OR
        (jam_mulai >= ? AND jam_mulai < ?) OR
        (jam_selesai > ? AND jam_selesai <= ?)
      )
    `;
    const [conflictRows] = await db.query(conflictQuery, [hari, jam_selesai, jam_mulai, jam_mulai, jam_selesai, jam_mulai, jam_selesai]);

    if (conflictRows.length > 0) {
      return NextResponse.json({ message: `Jadwal konflik dengan ekstrakurikuler lain: ${conflictRows[0].nama_ekstra}` }, { status: 409 });
    }

    const insertQuery = 'INSERT INTO tb_ekstrakurikuler (nama_ekstra, id_pembina, hari, jam_mulai, jam_selesai) VALUES (?, ?, ?, ?, ?)';
    await db.query(insertQuery, [nama_ekstra, id_pembina, hari, jam_mulai, jam_selesai]);
    
    return NextResponse.json({ message: 'Ekstrakurikuler berhasil ditambahkan' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating ekstrakurikuler' }, { status: 500 });
  }
}