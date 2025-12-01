// app/api/pembina/route.js
import { NextResponse } from 'next/server';
import db from '../../db/db';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search'); // <-- 1. Ambil parameter search
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    let whereClauses = [];
    let params = [];

    if (status && status !== 'Semua') {
      whereClauses.push('status = ?');
      params.push(status);
    }
    
    // <-- 2. Tambahkan kondisi search jika ada
    if (search) {
      // Menggunakan LIKE untuk pencarian sebagian nama
      whereClauses.push('nama LIKE ?');
      params.push(`%${search}%`); 
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM tb_pembina ${whereString}`;
    const [countRows] = await db.query(countQuery, params);
    const total = countRows[0].total;

    const dataQuery = `
      SELECT id_pembina, nama, username, status 
      FROM tb_pembina
      ${whereString}
      ORDER BY nama ASC 
      LIMIT ? OFFSET ?
    `;
    const [dataRows] = await db.query(dataQuery, [...params, limit, offset]);

    return NextResponse.json({ data: dataRows, total }, { status: 200 });
  } catch (error) {
    console.error("API Error fetching pembina:", error);
    return NextResponse.json({ message: 'Error fetching pembina' }, { status: 500 });
  }
}

// POST: Menambah pembina baru
export async function POST(request) {
  try {
    const { nama, username, password } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO tb_pembina (nama, username, password) VALUES (?, ?, ?)';
    await db.query(query, [nama, username, hashedPassword]);
    return NextResponse.json({ message: 'Pembina berhasil ditambahkan' }, { status: 201 });
  } catch (error) {
    // Menangani error jika username sudah ada (UNIQUE constraint)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Username sudah digunakan' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error creating pembina' }, { status: 500 });
  }
}