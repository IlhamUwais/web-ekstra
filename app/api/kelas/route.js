// app/api/kelas/route.js
import { NextResponse } from 'next/server';
import db from '../../db/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT id_kelas, nama_kelas FROM tb_kelas ORDER BY nama_kelas ASC');
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching kelas' }, { status: 500 });
  }
}