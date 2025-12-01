import { NextResponse } from 'next/server';
import db from '../../../db/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE nama_ruangan LIKE ?';
      params.push(`%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) as total FROM tb_ruangan ${whereClause}`;
    const [countRows] = await db.query(countQuery, params);
    const total = countRows[0].total;

    const dataQuery = `SELECT * FROM tb_ruangan ${whereClause} ORDER BY nama_ruangan ASC LIMIT ? OFFSET ?`;
    const [dataRows] = await db.query(dataQuery, [...params, limit, offset]);

    return NextResponse.json({ data: dataRows, total });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching ruangan' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nama_ruangan } = await request.json();
    if (!nama_ruangan) {
      return NextResponse.json({ message: 'Nama ruangan dibutuhkan' }, { status: 400 });
    }
    await db.query('INSERT INTO tb_ruangan (nama_ruangan) VALUES (?)', [nama_ruangan]);
    return NextResponse.json({ message: 'Ruangan berhasil ditambahkan' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating ruangan' }, { status: 500 });
  }
}