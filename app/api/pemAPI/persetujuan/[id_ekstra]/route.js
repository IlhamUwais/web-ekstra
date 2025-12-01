// app/api/pembina/persetujuan/[id_ekstra]/route.js
import { NextResponse } from 'next/server';
import db from '../../../../db/db';

export async function GET(request, { params }) {
  const { id_ekstra } = params;
  try {
    const query = `
      SELECT s.nis, s.nama, k.nama_kelas, pe.tgl_daftar 
      FROM tb_peserta_ekstra pe
      JOIN tb_siswa s ON pe.nis = s.nis
      JOIN tb_kelas k ON s.id_kelas = k.id_kelas
      WHERE pe.id_ekstra = ? AND pe.status = 'menunggu'
    `;
    const [rows] = await db.query(query, [id_ekstra]);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching pending students" }, { status: 500 });
  }
}