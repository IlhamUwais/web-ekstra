'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import IzinChart from '../../component/izinchart'; // Pastikan path komponen benar

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function PembinaDashboard() {
  // --- PERUBAHAN: Ambil semua data yang relevan dari Context ---
  const { user, selectedEkstraId, pembinaEkstraList } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [loading, setLoading] = useState(true);
  
  const [activeStatus, setActiveStatus] = useState('I');
  const [visibleCount, setVisibleCount] = useState(5);
  const [absenVisibleCount, setAbsenVisibleCount] = useState(5);
  const MAX_ABSEN_VISIBLE = 5;

  // --- DIHAPUS: useEffect untuk fetchMyEkstraList sudah pindah ke layout ---

  // useEffect untuk mengambil DATA DASHBOARD berdasarkan pilihan dari context
  useEffect(() => {
    // Jangan jalankan fetch jika belum ada ekstra yang terpilih
    if (!selectedEkstraId) {
        setLoading(pembinaEkstraList.length > 0); // Tetap loading jika daftar ekstra ada tapi belum dipilih
        return;
    };

    const fetchDashboardDetails = async () => {
      setLoading(true);
      try {
        const [resDashboard, resChart] = await Promise.all([
          fetch(`/api/pembinaDash?id_ekstra=${selectedEkstraId}&tanggal=${selectedDate}`),
          fetch(`/api/pemAPI/chart/izin?id_ekstra=${selectedEkstraId}`)
        ]);
        
        const dataDashboard = await resDashboard.json();
        const dataChart = await resChart.json();

        if (resDashboard.ok) setDashboardData(dataDashboard);
        if (resChart.ok) setChartData(dataChart);
      } catch (error) {
        toast.error("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardDetails();
  }, [selectedEkstraId, selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  const handleStatusClick = (status) => {
    setActiveStatus(status);
    setVisibleCount(5);
  };
  
  const handleShowMore = () => {
    setVisibleCount(prev => prev + 5);
  };
  
  const activeListData = dashboardData?.detail_harian?.[activeStatus] || [];
  const statusColors = { H: 'text-green-600', I: 'text-yellow-600', S: 'text-orange-600', A: 'text-red-600'};

  if (!user || (loading && !dashboardData)) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-xl font-semibold text-gray-600">Loading dashboard...</div>
    </div>
  );
  
  // Tampilan jika pembina tidak punya ekstra sama sekali
  if (pembinaEkstraList.length === 0 && !loading) return (
    <div className="text-center p-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Pembina</h1>
      <p className="text-xl font-semibold text-gray-600 mt-4">Anda tidak ditugaskan untuk ekstrakurikuler manapun.</p>
    </div>
  );

  return (
    <div>
      {/* --- DIHAPUS: Judul dan dropdown sudah pindah ke layout --- */}

      {loading ? (
        <div className="text-center text-xl font-semibold text-gray-600">Memuat data...</div>
      ) : dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Total Peserta</h3>
            <p className="text-4xl font-bold text-blue-600">{dashboardData.total_peserta}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Siswa Paling Sering Absen</h3>
            {dashboardData.siswa_sering_absen?.length > 0 ? (
              <>
                <ul className="space-y-2">
                  {dashboardData.siswa_sering_absen.slice(0, absenVisibleCount).map((siswa, index) => (
                    <li key={index} className="text-gray-600">
                      {siswa.nama} <span className="text-gray-400">({siswa.jumlah_absen} kali)</span>
                    </li>
                  ))}
                </ul>
                {dashboardData.siswa_sering_absen.length > absenVisibleCount && (
                  <button onClick={() => setAbsenVisibleCount(dashboardData.siswa_sering_absen.length)} className="text-blue-500 text-sm mt-2">
                    Lihat Semua ({dashboardData.siswa_sering_absen.length})
                  </button>
                )}
                {absenVisibleCount > MAX_ABSEN_VISIBLE && (
                  <button onClick={() => setAbsenVisibleCount(MAX_ABSEN_VISIBLE)} className="text-gray-500 text-sm mt-2 ml-2">
                    Sembunyikan
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-500">Tidak ada data absensi siswa.</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Rekap Kehadiran per Tanggal</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-around text-center mb-4">
              {Object.entries(dashboardData.rekap_harian).map(([status, jumlah]) => (
                <div key={status} onClick={() => handleStatusClick(status)} className="cursor-pointer p-2 rounded-lg" style={{ border: activeStatus === status ? '2px solid #3B82F6' : '2px solid transparent' }}>
                  <p className={`text-2xl font-bold ${statusColors[status]}`}>{jumlah}</p>
                  <p className="text-sm text-gray-500">{ {H: 'Hadir', I: 'Izin', S: 'Sakit', A: 'Alfa'}[status] }</p>
                </div>
              ))}
            </div>
            <hr className="my-2"/>
            <h4 className="font-semibold text-gray-600 text-sm mt-4">Detail Siswa ({ {H: 'Hadir', I: 'Izin', S: 'Sakit', A: 'Alfa'}[activeStatus] }):</h4>
            {activeListData.length > 0 ? (
              <>
                <ul className="space-y-1 mt-2 text-sm max-h-32 overflow-y-auto">
                  {activeListData.slice(0, visibleCount).map((siswa, index) => (
                    <li key={index} className="text-gray-600">
                      <strong>{siswa.nama}</strong>: {siswa.catatan || 'Tidak ada catatan.'}
                    </li>
                  ))}
                </ul>
                {activeListData.length > visibleCount && (
                  <button onClick={handleShowMore} className="text-blue-500 text-sm mt-2">Lihat Lainnya...</button>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm mt-2">Tidak ada data untuk status ini.</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 lg:col-span-3">
            {chartData && chartData.length > 0 ? (
              <IzinChart chartData={chartData} />
            ) : (
              <p className="text-gray-500">Tidak ada data izin dalam 30 hari terakhir untuk ditampilkan di chart.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}