// app/api/pembina/[id]/status/route.js
import { NextResponse } from 'next/server';
import db from '../../../../db/db';

export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const { status } = await request.json();
    if (status !== 'aktif' && status !== 'nonaktif') {
      return NextResponse.json({ message: 'Status tidak valid' }, { status: 400 });
    }

    const query = "UPDATE tb_pembina SET status = ? WHERE id_pembina = ?";
    await db.query(query, [status, id]);
    
    return NextResponse.json({ message: `Status pembina berhasil diubah menjadi ${status}` }, { status: 200 });
  } catch (error) {
    console.error("API Error updating status:", error);
    return NextResponse.json({ message: 'Error updating status pembina' }, { status: 500 });
  }
}