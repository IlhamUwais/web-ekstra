
import { NextResponse } from 'next/server';
import db from '../../../db/db';
import bcrypt from 'bcryptjs';

// ... (fungsi GET dan DELETE jika ada di file yang sama) ...

export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const { nama, username, password } = await request.json();
    
    let query;
    let queryParams;

    // Cek jika ada password baru yang dikirim
    if (password && password.length > 0) {
      // 2. Hash password baru jika ada
      const hashedPassword = await bcrypt.hash(password, 10);
      
      query = 'UPDATE tb_pembina SET nama = ?, username = ?, password = ? WHERE id_pembina = ?';
      // 3. Gunakan hashedPassword dalam query
      queryParams = [nama, username, hashedPassword, id];
    } else {
      // Jika tidak ada password baru, jangan update kolom password
      query = 'UPDATE tb_pembina SET nama = ?, username = ? WHERE id_pembina = ?';
      queryParams = [nama, username, id];
    }

    await db.query(query, queryParams);
    return NextResponse.json({ message: 'Pembina berhasil diupdate' }, { status: 200 });
  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Username sudah digunakan' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error updating pembina' }, { status: 500 });
  }
}

// DELETE: Menghapus data pembina berdasarkan ID
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const query = 'DELETE FROM tb_pembina WHERE id_pembina = ?';
    await db.query(query, [id]);
    return NextResponse.json({ message: 'Pembina berhasil dihapus' }, { status: 200 });
  } catch (error) {
    // Menangani error jika pembina masih terhubung dengan ekstrakurikuler
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return NextResponse.json({ message: 'Tidak bisa menghapus, pembina ini masih mengajar ekstrakurikuler!' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error deleting pembina' }, { status: 500 });
  }
}