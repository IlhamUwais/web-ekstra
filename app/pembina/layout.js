'use client';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../component/sidebar'; // Pastikan path benar

export default function PembinaLayout({ children }) {
  // Ambil state dan fungsi dari AuthContext
  const { user, logout, pembinaEkstraList, setPembinaEkstraList, selectedEkstraId, setSelectedEkstraId } = useAuth();
  const router = useRouter();

  // useEffect untuk melindungi rute (tidak berubah)
  useEffect(() => {
    if (!user || user.role !== 'pembina') {
      router.push('/login');
    }
  }, [user, router]);

  // useEffect BARU untuk mengambil daftar ekstra yang diampu pembina
  useEffect(() => {
    if (user && user.role === 'pembina') {
      const fetchMyEkstraList = async () => {
        try {
          const res = await fetch(`/api/pemAPI/ekstra/${user.id}`);
          const data = await res.json();
          if (res.ok) {
            const ekstraArray = Array.isArray(data) ? data : [data];
            setPembinaEkstraList(ekstraArray);
            // Jika belum ada pilihan, set default ke ekstra pertama
            if (!selectedEkstraId && ekstraArray.length > 0) {
              setSelectedEkstraId(ekstraArray[0].id_ekstra);
            }
          } else {
            setPembinaEkstraList([]);
          }
        } catch (error) {
          console.error("Gagal memuat daftar ekstra pembina:", error);
        }
      };
      fetchMyEkstraList();
    }
  }, [user, setPembinaEkstraList, setSelectedEkstraId, selectedEkstraId]);

  if (!user || user.role !== 'pembina') {
    return <div>Loading...</div>;
  }
  
  // Menu sidebar sekarang bisa statis lagi
  const menuItems = [
    { label: "Dashboard", href: "/pembina/dashboard" },
    { label: "Persetujuan Siswa", href: "/pembina/persetujuan" },
    { label: "Presensi Hari Ini", href: "/pembina/presensi" },
    { label: "Anggota", href: "/pembina/anggota" },
    { label: "Rekap Siswa", href: "/pembina/rekap" },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar menuItems={menuItems} user={user} logout={logout} />
      <main className="flex-1 bg-gray-100 p-6 overflow-auto">
        {/* DROPDOWN SEKARANG ADA DI SINI, DI ATAS SEMUA HALAMAN PEMBINA */}
        {pembinaEkstraList.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Ekstrakurikuler:</label>
            <select
              value={selectedEkstraId}
              onChange={(e) => setSelectedEkstraId(e.target.value)}
              className="p-2 border rounded-lg shadow-sm w-full sm:w-auto"
            >
              {pembinaEkstraList.map(ekstra => (
                <option key={ekstra.id_ekstra} value={ekstra.id_ekstra}>{ekstra.nama_ekstra}</option>
              ))}
            </select>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}