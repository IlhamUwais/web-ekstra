'use client';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react'; // <-- useState ditambahkan
import { useRouter } from 'next/navigation';
import Sidebar from '../component/sidebar'; // <-- Path disesuaikan ke folder components

export default function SiswaLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  // --- STATE BARU ---
  // State untuk menyimpan apakah siswa punya ekstra atau tidak
  const [hasEkstra, setHasEkstra] = useState(false);
  // State untuk loading pengecekan menu
  const [loadingMenu, setLoadingMenu] = useState(true);

  // --- useEffect BARU: Untuk mengecek status ekstra siswa ---
  useEffect(() => {
    // Pastikan user sudah ada sebelum melakukan fetch
    if (user && user.id) {
      const checkEkstraStatus = async () => {
        try {
          const res = await fetch(`/api/siswaapi/ekstra/status-ekstra/${user.id}`);
          // Jika request berhasil (status 200 OK), berarti siswa punya ekstra
          if (res.ok) {
            setHasEkstra(true);
          } else {
            setHasEkstra(false);
          }
        } catch (error) {
          console.error("Gagal mengecek status ekstra:", error);
          setHasEkstra(false);
        } finally {
          setLoadingMenu(false);
        }
      };
      
      checkEkstraStatus();
    }
  }, [user]); // Dijalankan setiap kali data user berubah


  useEffect(() => {
    // --- PERBAIKAN: Pengecekan role harusnya 'siswa' bukan 'admin' ---
    if (!user || user.role !== 'siswa') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'siswa' || loadingMenu) {
    return <div>Loading...</div>;
  }
  
  // --- MENU DIBUAT DINAMIS ---
  // Mulai dengan menu dasar yang selalu ada
  const menuItems = [
    { label: "Dashboard", href: "/siswa/dashboard" }, // Dashboard ditambahkan
    { label: "Daftar Ekstra", href: "/siswa/ekstra" }, // Path diperbaiki
  ];

  // Jika siswa memiliki ekstra, tambahkan menu "Ekstra Saya"
  if (hasEkstra) {
    menuItems.push({ label: "Ekstra Saya", href: "/siswa/ekstra-saya" });
    menuItems.push({ label: "Riwayat Saya", href: "/siswa/riwayat-presensi" });
  }

  return (
    <> 
      <div className="flex h-screen">
        <Sidebar menuItems={menuItems} user={user} logout={logout} />
        <main className="flex-1 bg-gray-100 p-6 overflow-auto">{children}</main>
      </div>
    </>
  );
}