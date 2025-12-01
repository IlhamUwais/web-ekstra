'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function EkstraSayaPage() {
  const { user } = useAuth();
  const [myEkstra, setMyEkstra] = useState(null);
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Ambil dulu status pendaftaran siswa
        const resStatus = await fetch(`/api/siswaapi/ekstra/status-ekstra/${user.id}`);
        if (!resStatus.ok) {
          // Jika status 404, berarti siswa belum daftar, ini bukan error
          if (resStatus.status === 404) {
            setMyEkstra(null);
          } else {
            throw new Error("Gagal mengambil status pendaftaran.");
          }
        } else {
          const dataStatus = await resStatus.json();
          setMyEkstra(dataStatus);

          // 2. Jika statusnya "diterima", ambil daftar anggota
          if (dataStatus.status === 'diterima') {
            const resAnggota = await fetch(`/api/ekstrakulikuler/anggota/${dataStatus.id_ekstra}`);
            const dataAnggota = await resAnggota.json();
            setAnggotaList(dataAnggota.data);
          }
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-xl font-semibold text-gray-600">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Ekstrakurikuler Saya</h1>
      {!myEkstra ? (
        <p className="text-gray-600 text-center">
          Anda belum terdaftar di ekstrakurikuler manapun. Silakan mendaftar melalui halaman Daftar Ekstrakurikuler.
        </p>
      ) : (
        <div>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{myEkstra.nama_ekstra}</h2>
            <p className="text-gray-600"><strong>Pembina:</strong> {myEkstra.nama_pembina}</p>
            <p className="text-gray-600"><strong>Jadwal:</strong> {myEkstra.hari}, {myEkstra.jam_mulai} - {myEkstra.jam_selesai}</p>
            <p className="text-gray-600">
              <strong>Status Pendaftaran : </strong> 
              <span className={`font-bold ${myEkstra.status === 'diterima' ? 'text-green-600' : 'text-orange-600'}`}>
                {myEkstra.status.toUpperCase()}
              </span>
            </p>
          </div>

          {myEkstra.status === 'diterima' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Daftar Anggota</h3>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200 text-gray-700">
                        <th className="p-4 text-left font-semibold">NIS</th>
                        <th className="p-4 text-left font-semibold">Nama</th>
                        <th className="p-4 text-left font-semibold">Kelas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anggotaList.map(anggota => (
                        <tr key={anggota.nis} className="border-b hover:bg-gray-50 transition-colors duration-200">
                          <td className="p-4 text-gray-600">{anggota.nis}</td>
                          <td className="p-4 text-gray-600">{anggota.nama}</td>
                          <td className="p-4 text-gray-600">{anggota.nama_kelas}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}