import { NextResponse } from 'next/server';
import db from '../../../../db/db';

export async function GET(request, { params }) {
  const { id } = params; // id di sini adalah id_ekstra
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    let whereClauses = ["pe.id_ekstra = ?", "pe.status = 'diterima'"]; // Hanya ambil yang statusnya diterima
    let queryParams = [id];

    if (search) {
      whereClauses.push('s.nama LIKE ?');
      queryParams.push(`%${search}%`);
    }

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    const countQuery = `SELECT COUNT(*) as total FROM tb_peserta_ekstra pe JOIN tb_siswa s ON pe.nis = s.nis ${whereString}`;
    const [countRows] = await db.query(countQuery, queryParams);
    const total = countRows[0].total;

    const dataQuery = `
      SELECT s.nis, s.nama, k.nama_kelas, pe.status 
      FROM tb_peserta_ekstra pe
      JOIN tb_siswa s ON pe.nis = s.nis
      JOIN tb_kelas k ON s.id_kelas = k.id_kelas
      ${whereString}
      ORDER BY s.nama ASC
      LIMIT ? OFFSET ?
    `;
    const [dataRows] = await db.query(dataQuery, [...queryParams, limit, offset]);

    return NextResponse.json({ data: dataRows, total });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching anggota' }, { status: 500 });
  }
}