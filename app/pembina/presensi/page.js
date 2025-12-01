'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Fungsi helper untuk mendapatkan nama hari ini dalam Bahasa Indonesia
const getNamaHariIni = () => {
    return new Date().toLocaleDateString('id-ID', { weekday: 'long' });
};

export default function PresensiPage() {
  // Ambil user, pilihan ekstra, dan daftar ekstra dari context
  const { user, selectedEkstraId, pembinaEkstraList } = useAuth();
  
  const [presensiList, setPresensiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Cari detail ekstra yang sedang dipilih dari daftar di context
  const ekstraTerpilih = useMemo(() => {
    if (!selectedEkstraId || pembinaEkstraList.length === 0) return null;
    return pembinaEkstraList.find(e => e.id_ekstra == selectedEkstraId);
  }, [selectedEkstraId, pembinaEkstraList]);

  // Cek apakah hari ini adalah hari yang dijadwalkan untuk ekstra terpilih
  const isJadwalHariIni = ekstraTerpilih?.hari === getNamaHariIni();

  // useEffect sekarang bergantung pada ekstra yang dipilih dan apakah hari ini sesuai jadwal
  useEffect(() => {
    // Jangan jalankan fetch jika belum ada ekstra yang dipilih ATAU bukan harinya
    if (!selectedEkstraId || !isJadwalHariIni) {
      setLoading(false);
      setPresensiList([]);
      return;
    }

    const fetchPresensiList = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pemAPI/presensi?id_ekstra=${selectedEkstraId}`);
        if (!res.ok) throw new Error("Gagal memuat daftar presensi");
        const data = await res.json();
        
        const formattedData = data.map(p => ({ 
          ...p, 
          status: p.status || 'H',  
          catatan: p.catatan || '' 
        }));
        setPresensiList(formattedData);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPresensiList();
  }, [selectedEkstraId, isJadwalHariIni]);

  const filteredList = useMemo(() => {
    if (!searchQuery) return presensiList;
    return presensiList.filter(p => 
      p.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, presensiList]);

  const handleInputChange = (nis, field, value) => {
    setPresensiList(currentList =>
      currentList.map(item =>
        item.nis === nis ? { ...item, [field]: value } : item
      )
    );
  };
  
  const handleSubmit = async () => {
    if (!selectedEkstraId) {
        toast.error("Pilih ekstrakurikuler terlebih dahulu.");
        return;
    }
    try {
       const res = await fetch('/api/pemAPI/presensi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_ekstra: selectedEkstraId, presensiData: presensiList })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        toast.success(result.message);
    } catch (error) {
        toast.error(error.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl font-semibold text-gray-600">Loading...</div>
    </div>
  );

  if (!selectedEkstraId) return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-600">Silakan pilih ekstrakurikuler dari dropdown di atas untuk memulai presensi.</h1>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Presensi Ekstrakurikuler</h1>
          {ekstraTerpilih && <p className="text-xl text-gray-600">{ekstraTerpilih.nama_ekstra}</p>}
          <p className="text-gray-500 mt-1">
            <strong>Tanggal:</strong> {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {/* Tombol Simpan hanya muncul jika sesuai jadwal */}
        {isJadwalHariIni && (
          <button 
            onClick={handleSubmit} 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto"
          >
            Simpan Presensi
          </button>
        )}
      </div>

      {/* Tampilan utama: jika sesuai jadwal tampilkan tabel, jika tidak tampilkan pesan */}
      {isJadwalHariIni ? (
        <>
          <div className="mb-4">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa..."
              className="w-full max-w-sm p-2 border rounded-lg"
            />
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="p-4 text-left font-semibold">Nama Siswa</th>
                    <th className="p-4 text-left font-semibold">Kelas</th>
                    <th className="p-4 text-left font-semibold">Status Kehadiran</th>
                    <th className="p-4 text-left font-semibold">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map(p => (
                    <tr key={p.nis} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-600">{p.nama}</td>
                      <td className="p-4 text-gray-600">{p.nama_kelas}</td>
                      <td className="p-4">
                        <select value={p.status} onChange={(e) => handleInputChange(p.nis, 'status', e.target.value)} className="p-2 border rounded-lg w-full">
                          <option value="H">Hadir</option>
                          <option value="I">Izin</option>
                          <option value="S">Sakit</option>
                          <option value="A">Alfa</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <input 
                          type="text" 
                          value={p.catatan} 
                          onChange={(e) => handleInputChange(p.nis, 'catatan', e.target.value)} 
                          placeholder="Catatan..."
                          className="w-full p-2 border rounded-lg"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
          <strong className="font-bold">Info:</strong>
          <span className="block sm:inline"> Presensi untuk ekstrakurikuler ini hanya bisa dilakukan pada hari <strong>{ekstraTerpilih?.hari}</strong>.</span>
        </div>
      )}
    </div>
  );
}