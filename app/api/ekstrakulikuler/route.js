import { NextResponse } from 'next/server';
import db from '../../db/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    let whereClauses = [];
    let params = [];

    if (status && status !== 'Semua') {
      whereClauses.push('e.status = ?');
      params.push(status);
    }
    if (search) {
      whereClauses.push('e.nama_ekstra LIKE ?');
      params.push(`%${search}%`);
    }
    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM tb_ekstrakurikuler e ${whereString}`;
    const [countRows] = await db.query(countQuery, params);
    const total = countRows[0].total;

    const dataQuery = `
      SELECT e.*, p.nama AS nama_pembina, r.nama_ruangan 
      FROM tb_ekstrakurikuler e
      LEFT JOIN tb_pembina p ON e.id_pembina = p.id_pembina
      LEFT JOIN tb_ruangan r ON e.id_ruangan = r.id_ruangan
      ${whereString}
      ORDER BY e.nama_ekstra ASC LIMIT ? OFFSET ?
    `;
    const [dataRows] = await db.query(dataQuery, [...params, limit, offset]);

    return NextResponse.json({ data: dataRows, total });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching ekstra' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nama_ekstra, id_pembina, id_ruangan, hari, jam_mulai, jam_selesai } = await request.json();

    // 1. Pengecekan konflik Ruangan & Waktu
    const roomConflictQuery = `SELECT nama_ekstra FROM tb_ekstrakurikuler WHERE hari = ? AND id_ruangan = ? AND status = 'aktif' AND ((jam_mulai < ?) AND (jam_selesai > ?))`;
    const [roomConflicts] = await db.query(roomConflictQuery, [hari, id_ruangan, jam_selesai, jam_mulai]);
    if (roomConflicts.length > 0) {
      return NextResponse.json({ message: `Jadwal & Ruangan konflik dengan: ${roomConflicts[0].nama_ekstra}` }, { status: 409 });
    }
    
    // 2. Pengecekan konflik Pembina & Waktu
    const coachConflictQuery = `SELECT nama_ekstra FROM tb_ekstrakurikuler WHERE hari = ? AND id_pembina = ? AND status = 'aktif' AND ((jam_mulai < ?) AND (jam_selesai > ?))`;
    const [coachConflicts] = await db.query(coachConflictQuery, [hari, id_pembina, jam_selesai, jam_mulai]);
    if (coachConflicts.length > 0) {
      return NextResponse.json({ message: `Pembina sudah ada jadwal lain di jam yang sama: ${coachConflicts[0].nama_ekstra}` }, { status: 409 });
    }

    const insertQuery = 'INSERT INTO tb_ekstrakurikuler (nama_ekstra, id_pembina, id_ruangan, hari, jam_mulai, jam_selesai) VALUES (?, ?, ?, ?, ?, ?)';
    await db.query(insertQuery, [nama_ekstra, id_pembina, id_ruangan, hari, jam_mulai, jam_selesai]);
    
    return NextResponse.json({ message: 'Ekstrakurikuler berhasil ditambahkan' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating ekstra' }, { status: 500 });
  }
}