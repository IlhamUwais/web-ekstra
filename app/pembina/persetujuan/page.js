'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function PersetujuanPage() {
  // AMBIL selectedEkstraId dan daftar ekstra DARI CONTEXT
  const { user, selectedEkstraId, pembinaEkstraList } = useAuth();
  
  // DIHAPUS: State lokal 'ekstra' tidak lagi diperlukan
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect disederhanakan, sekarang hanya bergantung pada selectedEkstraId
  useEffect(() => {
    // Jangan jalankan fetch jika belum ada ekstra yang dipilih
    if (!selectedEkstraId) {
      setLoading(false);
      setPendingList([]); // Kosongkan daftar jika tidak ada pilihan
      return;
    }

    const fetchPendingList = async () => {
      setLoading(true);
      try {
        // Path API diperbaiki
        const res = await fetch(`/api/pemAPI/persetujuan/${selectedEkstraId}`);
        if (!res.ok) throw new Error("Gagal memuat daftar persetujuan.");
        const data = await res.json();
        setPendingList(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingList();
  }, [selectedEkstraId]); // Dependensi utama adalah ekstra yang dipilih

  const handleApproval = async (nis, status) => {
    if (!selectedEkstraId) {
      toast.error("Pilih ekstrakurikuler terlebih dahulu.");
      return;
    }
    try {
      // Path API dan body diperbaiki
      const res = await fetch('/api/pemAPI/persetujuan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nis, id_ekstra: selectedEkstraId, status })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(`Siswa berhasil ${status}!`);
      
      // Refresh daftar dengan memfilter state yang ada untuk respons instan
      setPendingList(currentList => currentList.filter(p => p.nis !== nis));
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Cari nama ekstra yang sedang aktif dari daftar di context
  const namaEkstraTerpilih = pembinaEkstraList.find(e => e.id_ekstra == selectedEkstraId)?.nama_ekstra;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
    </div>
  );
  
  if (!selectedEkstraId) return (
      <div className="p-6">
          <h1 className="text-xl font-semibold text-gray-600">Silakan pilih ekstrakurikuler dari dropdown di atas.</h1>
      </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Persetujuan Siswa: {namaEkstraTerpilih}</h1>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-4 text-left font-semibold">NIS</th>
                <th className="p-4 text-left font-semibold">Nama Siswa</th>
                <th className="p-4 text-left font-semibold">Kelas</th>
                <th className="p-4 text-left font-semibold">Tanggal Daftar</th>
                <th className="p-4 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.length > 0 ? pendingList.map(p => (
                <tr key={p.nis} className="border-b hover:bg-gray-50 transition-colors duration-200">
                  <td className="p-4 text-gray-600">{p.nis}</td>
                  <td className="p-4 text-gray-600">{p.nama}</td>
                  <td className="p-4 text-gray-600">{p.nama_kelas}</td>
                  <td className="p-4 text-gray-600">{new Date(p.tgl_daftar).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleApproval(p.nis, 'diterima')}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-green-600 transition-colors duration-200"
                    >
                      Terima
                    </button>
                    <button
                      onClick={() => handleApproval(p.nis, 'ditolak')}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      Tolak
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">Tidak ada pendaftar baru.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}