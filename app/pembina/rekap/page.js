'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function RekapPresensiPage() {
  const { user, selectedEkstraId, pembinaEkstraList } = useAuth();

  // State sekarang menyimpan objek dengan header dan data
  const [rekap, setRekap] = useState({ header_tanggal: [], rekapData: [] });
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!selectedEkstraId) {
      setLoading(false);
      setRekap({ header_tanggal: [], rekapData: [] });
      return;
    }

    const fetchRekapData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pembina/rekap?id_ekstra=${selectedEkstraId}&bulan=${selectedMonth}&tahun=${selectedYear}`);
        if (!res.ok) throw new Error("Gagal memuat data rekapitulasi.");
        const data = await res.json();
        setRekap(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRekapData();
  }, [selectedEkstraId, selectedMonth, selectedYear]);

  const namaEkstraTerpilih = pembinaEkstraList.find(e => e.id_ekstra == selectedEkstraId)?.nama_ekstra;
  const yearOptions = Array.from({length: 3}, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Rekap Presensi Bulanan: {namaEkstraTerpilih}</h1>

      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
        <p className="font-semibold text-gray-700">Pilih Periode:</p>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2 border rounded-lg">
          {Array.from({length: 12}, (_, i) => (
            <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>
          ))}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="p-2 border rounded-lg">
          {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>

      {loading ? (
        <p>Memuat data rekap...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-700 sticky left-0 bg-gray-200">Nama Siswa</th>
                  {/* Header Tanggal Dinamis */}
                  {rekap.header_tanggal.map(tgl => (
                    <th key={tgl} className="p-4 text-center font-semibold text-gray-700">
                      {new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </th>
                  ))}
                  <th className="p-4 text-center font-semibold text-gray-700">Jumlah Hadir</th>
                </tr>
              </thead>
              <tbody>
                {rekap.rekapData.length > 0 ? rekap.rekapData.map(item => (
                  <tr key={item.nis} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-600 sticky left-0 bg-white hover:bg-gray-50">{item.nama}</td>
                    {/* Isi Presensi Dinamis */}
                    {rekap.header_tanggal.map(tgl => (
                      <td key={`${item.nis}-${tgl}`} className="p-4 text-center text-gray-600 font-medium">
                        {item.kehadiran[tgl]}
                      </td>
                    ))}
                    <td className="p-4 text-center text-gray-800 font-bold">{item.jumlah_kehadiran}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={rekap.header_tanggal.length + 2} className="p-4 text-center text-gray-500">
                      Tidak ada data presensi untuk periode yang dipilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}