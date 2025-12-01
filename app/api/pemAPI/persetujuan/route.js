// app/api/pembina/persetujuan/route.js
import { NextResponse } from 'next/server';
import db from '../../../db/db';

export async function PUT(request) {
  try {
    const { nis, id_ekstra, status } = await request.json();

    if (status === 'diterima') {
      const query = "UPDATE tb_peserta_ekstra SET status = 'diterima' WHERE nis = ? AND id_ekstra = ?";
      await db.query(query, [nis, id_ekstra]);
    } else if (status === 'ditolak') {
      // Jika ditolak, kita hapus saja record pendaftarannya agar bersih
      const query = "DELETE FROM tb_peserta_ekstra WHERE nis = ? AND id_ekstra = ?";
      await db.query(query, [nis, id_ekstra]);
    }

    return NextResponse.json({ message: `Siswa berhasil ${status}` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error processing approval" }, { status: 500 });
  }
}