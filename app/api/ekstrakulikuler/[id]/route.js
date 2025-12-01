import { NextResponse } from 'next/server';
import db from '../../../db/db';

export async function PUT(request, { params }) {
  const { id } = params;
  const { nama_ekstra, id_pembina, id_ruangan, hari, jam_mulai, jam_selesai } = await request.json();

  // Cek konflik Ruangan (kecuali dengan jadwalnya sendiri)
  const roomConflictQuery = `SELECT nama_ekstra FROM tb_ekstrakurikuler WHERE hari = ? AND id_ruangan = ? AND id_ekstra != ? AND status = 'aktif' AND ((jam_mulai < ?) AND (jam_selesai > ?))`;
  const [roomConflicts] = await db.query(roomConflictQuery, [hari, id_ruangan, id, jam_selesai, jam_mulai]);
  if (roomConflicts.length > 0) {
      return NextResponse.json({ message: `Jadwal & Ruangan konflik dengan: ${roomConflicts[0].nama_ekstra}` }, { status: 409 });
  }

  // Cek konflik Pembina (kecuali dengan jadwalnya sendiri)
  const coachConflictQuery = `SELECT nama_ekstra FROM tb_ekstrakurikuler WHERE hari = ? AND id_pembina = ? AND id_ekstra != ? AND status = 'aktif' AND ((jam_mulai < ?) AND (jam_selesai > ?))`;
  const [coachConflicts] = await db.query(coachConflictQuery, [hari, id_pembina, id, jam_selesai, jam_mulai]);
  if (coachConflicts.length > 0) {
      return NextResponse.json({ message: `Pembina sudah ada jadwal lain di jam yang sama: ${coachConflicts[0].nama_ekstra}` }, { status: 409 });
  }

  const updateQuery = 'UPDATE tb_ekstrakurikuler SET nama_ekstra = ?, id_pembina = ?, id_ruangan = ?, hari = ?, jam_mulai = ?, jam_selesai = ? WHERE id_ekstra = ?';
  await db.query(updateQuery, [nama_ekstra, id_pembina, id_ruangan, hari, jam_mulai, jam_selesai, id]);

  return NextResponse.json({ message: 'Ekstrakurikuler berhasil diupdate' });
}