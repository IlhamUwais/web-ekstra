import { NextResponse } from 'next/server';
import db from '../../db/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ message: 'Username dan password dibutuhkan' }, { status: 400 });
    }

    // 1. Cek di tabel admin (tabel admin tidak punya kolom status)
    let query = `SELECT id_admin AS id, username, password as hashedPassword FROM tb_admin WHERE username = ?`;
    let [rows] = await db.query(query, [username]);
    if (rows.length > 0) {
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
      if (passwordMatch) {
        delete user.hashedPassword;
        return NextResponse.json({ message: 'Login berhasil!', user: { ...user, role: 'admin' } }, { status: 200 });
      }
    }

    // 2. Cek di tabel pembina
    // DITAMBAHKAN: Pengecekan "AND status = 'aktif'"
    query = `SELECT id_pembina AS id, nama, username, password as hashedPassword FROM tb_pembina WHERE username = ? AND status = 'aktif'`;
    [rows] = await db.query(query, [username]);
    if (rows.length > 0) {
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
      if (passwordMatch) {
        delete user.hashedPassword;
        return NextResponse.json({ message: 'Login berhasil!', user: { ...user, role: 'pembina' } }, { status: 200 });
      }
    }

    // 3. Cek di tabel siswa
    // DITAMBAHKAN: Pengecekan "AND status = 'aktif'"
    query = `SELECT nis AS id, nama, password as hashedPassword FROM tb_siswa WHERE nis = ? AND status = 'aktif'`;
    [rows] = await db.query(query, [username]);
    if (rows.length > 0) {
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
      if (passwordMatch) {
        delete user.hashedPassword;
        return NextResponse.json({ message: 'Login berhasil!', user: { ...user, role: 'siswa' } }, { status: 200 });
      }
    }

    // Jika tidak ditemukan atau password salah
    return NextResponse.json({ message: 'Username atau password salah' }, { status: 401 });

  } catch (error) {
    console.error('SERVER LOGIN ERROR:', error); // Log error di server
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}