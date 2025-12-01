import { NextResponse } from 'next/server';
import db from '../../../../db/db';

export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const { nama_ruangan } = await request.json();
    if (!nama_ruangan) {
      return NextResponse.json({ message: 'Nama ruangan dibutuhkan' }, { status: 400 });
    }
    await db.query('UPDATE tb_ruangan SET nama_ruangan = ? WHERE id_ruangan = ?', [nama_ruangan, id]);
    return NextResponse.json({ message: 'Ruangan berhasil diupdate' });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating ruangan' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    // Ini adalah hard delete, bukan soft delete
    await db.query('DELETE FROM tb_ruangan WHERE id_ruangan = ?', [id]);
    return NextResponse.json({ message: 'Ruangan berhasil dihapus' });
  } catch (error) {
    // Menangani error jika ruangan masih terhubung dengan jadwal ekstra
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return NextResponse.json({ message: 'Tidak bisa menghapus, ruangan ini sedang dipakai oleh jadwal ekstrakurikuler!' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error deleting ruangan' }, { status: 500 });
  }
}