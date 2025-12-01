// app/api/pembina/ekstra/[id_pembina]/route.js
import { NextResponse } from 'next/server';
import db from '../../../../db/db';

export async function GET(request, { params }) {
  try {
    const { id_pembina } = params;
    
    // --- PERBAIKAN DI SINI ---
    // Query ini sekarang mengambil SEMUA ekstra yang cocok dengan id_pembina
    const query = "SELECT * FROM tb_ekstrakurikuler WHERE id_pembina = ? AND status = 'aktif'";
    
    const [rows] = await db.query(query, [id_pembina]);
    
    // Langsung kembalikan semua baris yang ditemukan sebagai array
    return NextResponse.json(rows);

  } catch (error) {
    console.error("API Error fetching ekstra pembina:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}