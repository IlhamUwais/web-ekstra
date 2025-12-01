// app/api/siswa/route.js
import { NextResponse } from 'next/server';
import db from '../../db/db';
import bcrypt from 'bcryptjs';

// GET: Mengambil data siswa dengan filter status dan pagination
// app/api/siswa/route.js
// ... (fungsi POST tetap sama)

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  const status = searchParams.get('status');
  // HANYA FILTER BERDASARKAN id_kelas
  const id_kelas = searchParams.get('id_kelas');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    let whereClauses = [];
    let params = [];

    if (status && status !== 'Semua') {
      whereClauses.push('s.status = ?');
      params.push(status);
    }
    // HANYA JIKA id_kelas DIPILIH
    if (id_kelas && id_kelas !== 'Semua') {
      whereClauses.push('s.id_kelas = ?');
      params.push(id_kelas);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM tb_siswa s ${whereString}`;
    const [countRows] = await db.query(countQuery, params);
    const total = countRows[0].total;

    const dataQuery = `
      SELECT s.nis, s.nama, s.jk, s.id_kelas, s.status, k.nama_kelas 
      FROM tb_siswa s
      JOIN tb_kelas k ON s.id_kelas = k.id_kelas
      ${whereString}
      ORDER BY s.nama ASC 
      LIMIT ? OFFSET ?
    `;
    const [dataRows] = await db.query(dataQuery, [...params, limit, offset]);

    return NextResponse.json({ data: dataRows, total }, { status: 200 });
  } catch (error) {
    console.error("API Error fetching siswa:", error);
    return NextResponse.json({ message: 'Error di sisi server saat mengambil data siswa' }, { status: 500 });
  }
}

// POST: Menambah siswa baru (tidak berubah, status default 'aktif')
export async function POST(request) {
  try {
    const { nis, nama, jk, id_kelas, password } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO tb_siswa (nis, nama, jk, id_kelas, password) VALUES (?, ?, ?, ?, ?)';
    await db.query(query, [nis, nama, jk, id_kelas, hashedPassword]);
    return NextResponse.json({ message: 'Siswa berhasil ditambahkan' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating siswa' }, { status: 500 });
  }
}