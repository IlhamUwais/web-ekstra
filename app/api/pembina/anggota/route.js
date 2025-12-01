import { NextResponse } from 'next/server';
import db from '../../../db/db';

// Menggunakan metode DELETE untuk mengeluarkan siswa
export async function DELETE(request) {
  try {
    const { nis, id_ekstra } = await request.json();

    // Hapus record pendaftaran siswa dari ekstrakurikuler
    // Ini tidak akan menghapus riwayat presensinya
    const query = "DELETE FROM tb_peserta_ekstra WHERE nis = ? AND id_ekstra = ?";
    await db.query(query, [nis, id_ekstra]);

    return NextResponse.json({ message: `Siswa berhasil dikeluarkan dari ekstrakurikuler` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error saat mengeluarkan anggota" }, { status: 500 });
  }
}