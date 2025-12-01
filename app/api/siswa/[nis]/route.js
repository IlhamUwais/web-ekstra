// app/api/siswa/[nis]/route.js
import { NextResponse } from 'next/server';
import db from '../../../db/db';
import bcrypt from 'bcryptjs';

// PUT: Mengupdate data siswa berdasarkan NIS
export async function PUT(request, { params }) {
  const { nis } = params;
  try {
    const { nama, jk, id_kelas, password } = await request.json();

    let query;
    let queryParams;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE tb_siswa SET nama = ?, jk = ?, id_kelas = ?, password = ? WHERE nis = ?`;
      queryParams = [nama, jk, id_kelas, hashedPassword, nis];
    } else {
      query = `UPDATE tb_siswa SET nama = ?, jk = ?, id_kelas = ? WHERE nis = ?`;
      queryParams = [nama, jk, id_kelas, nis];
    }
    await db.query(query, queryParams);
    return NextResponse.json({ message: 'Siswa berhasil diupdate' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating siswa' }, { status: 500 });
  }
}

// DELETE: Menghapus data siswa berdasarkan NIS
// DELETE: Mengubah status siswa menjadi 'nonaktif' (SOFT DELETE)
export async function DELETE(request, { params }) {
  const { nis } = params;
  try {
    const query = "UPDATE tb_siswa SET status = 'nonaktif' WHERE nis = ?";
    await db.query(query, [nis]);
    return NextResponse.json({ message: 'Siswa berhasil dinonaktifkan' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deactivating siswa' }, { status: 500 });
  }
}