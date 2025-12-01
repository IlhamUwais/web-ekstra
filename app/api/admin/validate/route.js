import { NextResponse } from 'next/server';
import db from '../../../db/db';

export async function POST(request) {
  try {
    const { field, value, excludeNis } = await request.json();

    if (!field || !value) {
      return NextResponse.json({ message: 'Field dan value dibutuhkan' }, { status: 400 });
    }

    let query = '';
    let params = [value];

    // Tentukan kolom mana yang akan dicek
    if (field === 'nis') {
      query = 'SELECT nis FROM tb_siswa WHERE nis = ?';
    } else if (field === 'nama') {
      query = 'SELECT nama FROM tb_siswa WHERE nama = ?';
    } else {
      return NextResponse.json({ message: 'Field tidak valid' }, { status: 400 });
    }
    
    // Saat edit, kita tidak mau membandingkan dengan data siswa itu sendiri
    if (excludeNis) {
      query += ' AND nis != ?';
      params.push(excludeNis);
    }

    const [rows] = await db.query(query, params);

    // Kirim balik apakah data sudah ada atau tidak
    return NextResponse.json({ isTaken: rows.length > 0 });

  } catch (error) {
    console.error('Validation Error:', error);
    return NextResponse.json({ message: 'Error pada server' }, { status: 500 });
  }
}