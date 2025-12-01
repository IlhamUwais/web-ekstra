'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function DaftarEkstraPage() {
  const { user } = useAuth();
  const [ekstraList, setEkstraList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEkstra = async () => {
      try {
        const res = await fetch('/api/ekstrakulikuler');
        const data = await res.json();
        setEkstraList(data.data);
      } catch (error) {
        toast.error("Gagal memuat daftar ekstrakurikuler.");
      } finally {
        setLoading(false);
      }
    };
    fetchEkstra();
  }, []);

  const handleDaftar = async (id_ekstra) => {
    if (!confirm('Apakah Anda yakin ingin mendaftar di ekstrakurikuler ini?')) {
      return;
    }
    
    try {
      const res = await fetch('/api/siswaapi/ekstra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nis: user.id, id_ekstra: id_ekstra }) // user.id adalah nis
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success(result.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-xl font-semibold text-gray-600">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Daftar Ekstrakurikuler</h1>
      <p className="text-gray-600 mb-6 text-center">Pilih ekstrakurikuler yang Anda minati dan klik tombol Daftar.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ekstraList.map(ekstra => (
          <div
            key={ekstra.id_ekstra}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{ekstra.nama_ekstra}</h3>
            <p className="text-gray-600"><strong>Pembina:</strong> {ekstra.nama_pembina}</p>
            <p className="text-gray-600"><strong>Jadwal:</strong> {ekstra.hari}, {ekstra.jam_mulai} - {ekstra.jam_selesai}</p>
            <button
              onClick={() => handleDaftar(ekstra.id_ekstra)}
              className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Daftar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}