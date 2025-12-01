import { NextResponse } from 'next/server';
import db from '../../../../db/db';

export async function PUT(request, { params }) {
    const { id } = params;
    const { status } = await request.json();
    const query = "UPDATE tb_ekstrakurikuler SET status = ? WHERE id_ekstra = ?";
    await db.query(query, [status, id]);
    return NextResponse.json({ message: `Status ekstrakurikuler berhasil diubah menjadi ${status}` });
}