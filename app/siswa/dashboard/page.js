// app/siswa/dashboard/page.js
'use client';
import { useAuth } from '../../context/AuthContext';

export default function SiswaDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Selamat Datang, {user?.nama}!</h1>
      <p>Ini adalah halaman dashboard Anda. Silakan gunakan menu navigasi di atas untuk mendaftar ekstrakurikuler atau melihat status pendaftaran Anda.</p>
    </div>
  );
}