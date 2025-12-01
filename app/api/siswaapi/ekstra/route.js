// app/api/siswa/daftar-ekstra/route.js
import { NextResponse } from 'next/server';
import db from '../../../db/db';

export async function POST(request) {
  try {
    const { nis, id_ekstra } = await request.json();

    // 1. Cek apakah siswa sudah terdaftar di ekstra lain
    const checkQuery = 'SELECT * FROM tb_peserta_ekstra WHERE nis = ?';
    const [existing] = await db.query(checkQuery, [nis]);

    if (existing.length > 0) {
      return NextResponse.json({ message: 'Anda sudah terdaftar di satu ekstrakurikuler.' }, { status: 409 });
    }

    // 2. Jika belum, daftarkan siswa dengan status "menunggu"
    const insertQuery = 'INSERT INTO tb_peserta_ekstra (nis, id_ekstra, tgl_daftar, status) VALUES (?, ?, CURDATE(), ?)';
    await db.query(insertQuery, [nis, id_ekstra, 'menunggu']);

    return NextResponse.json({ message: 'Pendaftaran berhasil! Mohon tunggu persetujuan dari pembina.' }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}