'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function AnggotaEkstraPage() {
  const { user, selectedEkstraId, pembinaEkstraList } = useAuth();

  const [anggota, setAnggota] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchData = useCallback(async (currentPage, search, append = false) => {
    if (!selectedEkstraId) return;
    if (!append) setLoading(true);

    const queryParams = new URLSearchParams({ page: currentPage, search }).toString();

    try {
      const res = await fetch(`/api/ekstrakulikuler/anggota/${selectedEkstraId}?${queryParams}`);
      if (!res.ok) throw new Error('Gagal memuat data anggota');
      const dataAnggota = await res.json();

      if (append) {
        setAnggota(prev => ({ data: [...prev.data, ...dataAnggota.data], total: dataAnggota.total }));
      } else {
        setAnggota(dataAnggota);
      }
    } catch (error) { toast.error(error.message); }
    finally { setLoading(false); }
  }, [selectedEkstraId]);

  useEffect(() => {
    if (page > 1) {
      fetchData(page, debouncedSearchQuery, true);
    } else {
      fetchData(1, debouncedSearchQuery, false);
    }
  }, [page, debouncedSearchQuery, fetchData]);

  const handleKeluarkan = async (nis) => {
    if (confirm(`Apakah Anda yakin ingin mengeluarkan siswa ini dari ekstrakurikuler? Data presensi tidak akan hilang.`)) {
      try {
        const res = await fetch(`/api/pembina/anggota`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nis, id_ekstra: selectedEkstraId })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        toast.success(result.message);
        setPage(1);
        fetchData(1, debouncedSearchQuery);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const namaEkstraTerpilih = pembinaEkstraList.find(e => e.id_ekstra == selectedEkstraId)?.nama_ekstra;

  if (loading && page === 1) return <div>Loading...</div>;

  if (!selectedEkstraId) return (
      <div className="p-6"><h1 className="text-xl font-semibold">Silakan pilih ekstrakurikuler dari dropdown di atas.</h1></div>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Anggota Ekstrakurikuler: {namaEkstraTerpilih}</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama anggota..."
          className="p-2 border rounded-lg w-full md:w-auto"
        />
        {/* Tombol Tambah Anggota bisa ditambahkan di sini nanti */}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 text-left">NIS</th>
              <th className="p-4 text-left">Nama</th>
              <th className="p-4 text-left">Kelas</th>
              <th className="p-4 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {anggota.data.map(a => (
              <tr key={a.nis} className="border-b">
                <td className="p-4">{a.nis}</td>
                <td className="p-4">{a.nama}</td>
                <td className="p-4">{a.nama_kelas}</td>
                <td className="p-4">
                  <button onClick={() => handleKeluarkan(a.nis)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Keluarkan</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {anggota.data.length < anggota.total && (
        <div className="text-center mt-6">
          <button onClick={() => setPage(p => p + 1)} disabled={loading} className="bg-gray-200 px-6 py-3 rounded-lg">
            {loading ? 'Memuat...' : 'Lihat Lainnya'}
          </button>
        </div>
      )}
    </div>
  );
}