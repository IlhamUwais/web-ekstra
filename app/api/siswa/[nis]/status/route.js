// app/api/siswa/[nis]/status/route.js
import { NextResponse } from 'next/server';
import db from '../../../../db/db';

export async function PUT(request, { params }) {
  const { nis } = params;
  try {
    const { status } = await request.json();
    if (status !== 'aktif' && status !== 'nonaktif') {
      return NextResponse.json({ message: 'Status tidak valid' }, { status: 400 });
    }

    const query = "UPDATE tb_siswa SET status = ? WHERE nis = ?";
    await db.query(query, [status, nis]);
    
    return NextResponse.json({ message: `Status siswa berhasil diubah menjadi ${status}` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating siswa status' }, { status: 500 });
  }
}