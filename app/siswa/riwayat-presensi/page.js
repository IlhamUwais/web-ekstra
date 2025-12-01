'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function RiwayatPresensiPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pastikan user sudah ada sebelum melakukan fetch
    if (user && user.id) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/siswaapi/presensi/${user.id}`);
          if (!res.ok) throw new Error("Gagal memuat riwayat presensi.");
          const data = await res.json();
          setHistory(data);
        } catch (error) {
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchHistory();
    }
  }, [user]); // Dijalankan setiap kali data user tersedia/berubah

  const getStatusBadge = (status) => {
    switch (status) {
      case 'H': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Hadir</span>;
      case 'I': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Izin</span>;
      case 'S': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Sakit</span>;
      case 'A': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Alfa</span>;
      default: return status;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl font-semibold text-gray-600">Loading...</div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Riwayat Presensi Saya</h1>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-700">Tanggal</th>
                <th className="p-4 text-left font-semibold text-gray-700">Ekstrakurikuler</th>
                <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                <th className="p-4 text-left font-semibold text-gray-700">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map(item => (
                <tr key={item.id_presensi} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-600">{new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                  <td className="p-4 text-gray-600">{item.nama_ekstra}</td>
                  <td className="p-4 text-gray-600">{getStatusBadge(item.status)}</td>
                  <td className="p-4 text-gray-600">{item.catatan || '-'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    Belum ada riwayat presensi yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}