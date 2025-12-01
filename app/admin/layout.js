// app/admin/layout.js
'use client';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../component/sidebar';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika tidak ada user ATAU role-nya bukan admin, tendang ke halaman login
    if (!user || user.role !== 'admin') {
      router.push('/login');
    }
  }, [user, router]);

  // Jika user belum ter-load, tampilkan loading untuk mencegah flash content
  if (!user || user.role !== 'admin') {
    return <div>Loading...</div>;
  }
  
  // Gaya CSS sederhana untuk navigasi
  const navStyle = { display: 'flex', gap: '20px', padding: '10px', backgroundColor: '#f0f0f0' };

    const menuItems = [
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "Siswa", href: "/admin/siswa" },
      { label: "Pembina", href: "/admin/pembina" },
      { label: "Ekstra", href: "/admin/ekstra" },
      { label: "Kelas", href: "/admin/kelas" },
      { label: "Kelola Ruangan", href: "/admin/ruangan" },


  ];

  return (
    <> 
       <div className="flex h-screen">
         <Sidebar menuItems={menuItems} />
         <main className="flex-1 bg-gray p-6 overflow-auto">{children}</main>
       </div>
       </>
  );
}