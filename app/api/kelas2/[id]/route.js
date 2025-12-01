// app/api/kelas/[id]/route.js
import { NextResponse } from 'next/server';
import db from '../../../db/db';

// PUT: Mengupdate data kelas
export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const { jenjang, jurusan, nama_kelas } = await request.json();
    const query = 'UPDATE tb_kelas SET jenjang = ?, jurusan = ?, nama_kelas = ? WHERE id_kelas = ?';
    await db.query(query, [jenjang, jurusan, nama_kelas, id]);
    return NextResponse.json({ message: 'Kelas berhasil diupdate' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating kelas' }, { status: 500 });
  }
}

// DELETE: Menghapus data kelas
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const query = 'DELETE FROM tb_kelas WHERE id_kelas = ?';
    await db.query(query, [id]);
    return NextResponse.json({ message: 'Kelas berhasil dihapus' }, { status: 200 });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return NextResponse.json({ message: 'Tidak bisa menghapus, kelas ini masih memiliki siswa!' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error deleting kelas' }, { status: 500 });
  }
}