// app/api/kelas/route.js
import { NextResponse } from 'next/server';
import db from '../../db/db';

// GET: Mengambil semua data kelas
export async function GET() {
  try {
    const query = 'SELECT * FROM tb_kelas ORDER BY jenjang, jurusan, nama_kelas ASC';
    const [rows] = await db.query(query);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching kelas' }, { status: 500 });
  }
}

// POST: Menambah kelas baru
export async function POST(request) {
  try {
    const { jenjang, jurusan, nama_kelas } = await request.json();
    const query = 'INSERT INTO tb_kelas (jenjang, jurusan, nama_kelas) VALUES (?, ?, ?)';
    await db.query(query, [jenjang, jurusan, nama_kelas]);
    return NextResponse.json({ message: 'Kelas berhasil ditambahkan' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating kelas' }, { status: 500 });
  }
}