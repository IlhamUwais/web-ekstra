'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '../../component/modal'; // Pastikan path benar
import { toast } from 'react-toastify';

export default function KelolaEkstraPage() {
  // STATE UTAMA
  const [ekstra, setEkstra] = useState({ data: [], total: 0 });
  const [pembinaList, setPembinaList] = useState([]);
  const [ruanganList, setRuanganList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // STATE MODAL
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [jadwalPembina, setJadwalPembina] = useState([]);
  const [loadingJadwalPembina, setLoadingJadwalPembina] = useState(false);
  // --- STATE BARU ---
  const [jadwalRuangan, setJadwalRuangan] = useState([]);
  const [loadingJadwalRuangan, setLoadingJadwalRuangan] = useState(false);

  // STATE FILTER & PAGINATION
  const [filters, setFilters] = useState({ status: 'aktif', search: '' });
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Debouncing untuk search
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchQuery }));
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch data utama (ekstrakulikuler)
  const fetchData = useCallback(async (currentPage, currentFilters, append = false) => {
    if (!append) setLoading(true);
    const queryParams = new URLSearchParams({ ...currentFilters, page: currentPage }).toString();
    try {
      const res = await fetch(`/api/ekstrakulikuler?${queryParams}`);
      if (!res.ok) throw new Error("Gagal memuat data ekstrakulikuler");
      const data = await res.json();
      if (append) {
        setEkstra(prev => ({ data: [...prev.data, ...data.data], total: data.total }));
      } else {
        setEkstra(data);
      }
    } catch (error) { toast.error(error.message); }
    finally { setLoading(false); }
  }, []);

  // Fetch data pendukung (pembina & ruangan)
  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        const [resPembina, resRuangan] = await Promise.all([
          fetch('/api/pembina?status=aktif'),
          fetch('/api/admin/ruangan') // Path tidak diubah sesuai permintaan
        ]);
        const dataPembina = await resPembina.json();
        const dataRuangan = await resRuangan.json();
        setPembinaList(dataPembina.data || dataPembina);
        setRuanganList(dataRuangan.data || dataRuangan);
      } catch (error) { toast.error("Gagal memuat data pembina/ruangan."); }
    };
    fetchSupporters();
  }, []);

  // Memicu fetch data utama
  useEffect(() => {
    if (page > 1) {
      fetchData(page, filters, true);
    } else {
      fetchData(1, filters, false);
    }
  }, [page, filters, fetchData]);
  
  const handleStatusChange = async (id, newStatus) => {
      const action = newStatus === 'nonaktif' ? 'menonaktifkan' : 'mengaktifkan';
      if (confirm(`Apakah Anda yakin ingin ${action} ekstrakulikuler ini?`)) {
          try {
              const res = await fetch(`/api/ekstrakulikuler/${id}/status`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: newStatus })
              });
              const result = await res.json();
              if (!res.ok) throw new Error(result.message);
              toast.success(result.message);
              setPage(1);
              fetchData(1, filters);
          } catch (error) {
              toast.error(error.message);
          }
      }
  };

  const fetchJadwalPembina = async (id_pembina) => {
    if (!id_pembina) { setJadwalPembina([]); return; }
    setLoadingJadwalPembina(true);
    try {
      const res = await fetch(`/api/pembina/jadwal/${id_pembina}`);
      if (!res.ok) throw new Error('Gagal memuat jadwal pembina');
      setJadwalPembina(await res.json());
    } catch (error) { toast.error(error.message); }
    finally { setLoadingJadwalPembina(false); }
  };

  // --- FUNGSI BARU ---
  const fetchJadwalRuangan = async (id_ruangan) => {
    if (!id_ruangan) { setJadwalRuangan([]); return; }
    setLoadingJadwalRuangan(true);
    try {
      const res = await fetch(`/api/admin/ruangan/jadwal/${id_ruangan}`);
      if (!res.ok) throw new Error('Gagal memuat jadwal ruangan');
      setJadwalRuangan(await res.json());
    } catch (error) { toast.error(error.message); }
    finally { setLoadingJadwalRuangan(false); }
  };
  
  const openModal = (dataEkstra = null) => {
    setJadwalPembina([]);
    setJadwalRuangan([]); // Reset jadwal ruangan
    if (dataEkstra) {
      setIsEditing(true);
      setFormData({
        id_ekstra: dataEkstra.id_ekstra,
        nama_ekstra: dataEkstra.nama_ekstra,
        id_pembina: dataEkstra.id_pembina,
        id_ruangan: dataEkstra.id_ruangan,
        hari: dataEkstra.hari,
        jam_mulai: dataEkstra.jam_mulai,
        jam_selesai: dataEkstra.jam_selesai,
      });
      if (dataEkstra.id_pembina) fetchJadwalPembina(dataEkstra.id_pembina);
      if (dataEkstra.id_ruangan) fetchJadwalRuangan(dataEkstra.id_ruangan); // Pre-fetch saat edit
    } else {
      setIsEditing(false);
      setFormData({
        nama_ekstra: '', id_pembina: '', id_ruangan: '', hari: 'Senin', jam_mulai: '15:00', jam_selesai: '17:00'
      });
    }
    setModalIsOpen(true);
  };
  const closeModal = () => setModalIsOpen(false);
  
  // --- PERUBAHAN DI SINI ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    if (name === 'id_pembina') {
      fetchJadwalPembina(value);
    }
    if (name === 'id_ruangan') {
      fetchJadwalRuangan(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `/api/ekstrakulikuler/${formData.id_ekstra}` : '/api/ekstrakulikuler';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(`Ekstra berhasil ${isEditing ? 'diupdate' : 'ditambahkan'}!`);
      closeModal();
      setPage(1);
      fetchData(1, filters);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading && page === 1) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Manajemen ekstrakulikuler</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama ekstrakulikuler..."
            className="p-2 border rounded-lg w-full sm:w-64"
          />
          <div className="flex items-center gap-2">
            <label>Status:</label>
            <select 
              value={filters.status} 
              onChange={(e) => {
                setFilters(prev => ({ ...prev, status: e.target.value }));
                setPage(1);
              }}
              className="p-2 border rounded-lg"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="Semua">Semua</option>
            </select>
          </div>
        </div>
        <button onClick={() => openModal()} className="bg-blue-500 text-white px-6 py-3 rounded-lg w-full md:w-auto">
          Tambah Ekstra Baru
        </button>
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <div className="bg-white rounded-xl p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{isEditing ? 'Edit ekstrakulikuler' : 'Tambah ekstrakulikuler'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p>Nama ekstrakulikuler</p>
                <input type="text" name="nama_ekstra" value={formData.nama_ekstra || ''} onChange={handleChange} placeholder="Nama ekstrakulikuler" required className="p-2 border rounded-lg" />
                
                <p>Pilih Pembina</p>
                <select name="id_pembina" value={formData.id_pembina || ''} onChange={handleChange} required className="p-2 border rounded-lg">
                    <option value="">Pilih Pembina</option>
                    {pembinaList.map(p => <option key={p.id_pembina} value={p.id_pembina}>{p.nama}</option>)}
                </select>
                
                {loadingJadwalPembina ? (
                  <div className="text-sm text-gray-500 p-2 border rounded-lg">Memuat jadwal pembina...</div>
                ) : jadwalPembina.length > 0 && (
                  <div className="text-sm text-gray-700 p-2 border border-blue-200 bg-blue-50 rounded-lg">
                    <p className="font-semibold mb-1">Jadwal Pembina Terpilih:</p>
                    <ul className="list-disc pl-5">
                      {jadwalPembina.map((jadwal, index) => (
                        <li key={index}>
                          {jadwal.nama_ekstra} ({jadwal.hari}, {jadwal.jam_mulai.slice(0,5)}-{jadwal.jam_selesai.slice(0,5)})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <p>Pilih Ruangan</p>
                <select name="id_ruangan" value={formData.id_ruangan || ''} onChange={handleChange} required className="p-2 border rounded-lg">
                    <option value="">Pilih Ruangan</option>
                    {ruanganList.map(r => <option key={r.id_ruangan} value={r.id_ruangan}>{r.nama_ruangan}</option>)}
                </select>
                
                {/* --- BAGIAN BARU: TAMPILAN JADWAL RUANGAN --- */}
                {loadingJadwalRuangan ? (
                  <div className="text-sm text-gray-500 p-2 border rounded-lg">Memuat jadwal ruangan...</div>
                ) : jadwalRuangan.length > 0 && (
                  <div className="text-sm text-gray-700 p-2 border border-orange-200 bg-orange-50 rounded-lg">
                    <p className="font-semibold mb-1">Jadwal Ruangan Terpakai:</p>
                    <ul className="list-disc pl-5">
                      {jadwalRuangan.map((jadwal, index) => (
                        <li key={index}>
                          {jadwal.nama_ekstra} ({jadwal.hari}, {jadwal.jam_mulai.slice(0,5)}-{jadwal.jam_selesai.slice(0,5)}) oleh {jadwal.nama_pembina}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p>Waktu</p>
                <select name="hari" value={formData.hari || 'Senin'} onChange={handleChange} className="p-2 border rounded-lg">
                    <option>Senin</option><option>Selasa</option><option>Rabu</option><option>Kamis</option><option>Jumat</option><option>Sabtu</option>
                </select>
                <div className="flex gap-4">
                    <input type="time" name="jam_mulai" value={formData.jam_mulai || ''} onChange={handleChange} required className="p-2 border rounded-lg w-full"/>
                    <input type="time" name="jam_selesai" value={formData.jam_selesai || ''} onChange={handleChange} required className="p-2 border rounded-lg w-full"/>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                    <button type="button" onClick={closeModal} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Batal</button>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">{isEditing ? 'Update' : 'Simpan'}</button>
                </div>
            </form>
        </div>
      </Modal>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-4 text-left font-semibold">Nama Ekstra</th>
                <th className="p-4 text-left font-semibold">Pembina</th>
                <th className="p-4 text-left font-semibold">Ruangan</th>
                <th className="p-4 text-left font-semibold">Jadwal</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ekstra.data.map(e => (
                <tr key={e.id_ekstra} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-600">{e.nama_ekstra}</td>
                  <td className="p-4 text-gray-600">{e.nama_pembina || <span className="text-gray-400">N/A</span>}</td>
                  <td className="p-4 text-gray-600">{e.nama_ruangan || <span className="text-gray-400">N/A</span>}</td>
                  <td className="p-4 text-gray-600">{e.hari}, {e.jam_mulai.slice(0,5)} - {e.jam_selesai.slice(0,5)}</td>
                  <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${e.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{e.status}</span></td>
                  <td className="p-4">
                    <button onClick={() => openModal(e)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2">Edit</button>
                    {e.status === 'aktif' ? (
                      <button onClick={() => handleStatusChange(e.id_ekstra, 'nonaktif')} className="bg-red-500 text-white px-4 py-2 rounded-lg">Nonaktifkan</button>
                    ) : (
                      <button onClick={() => handleStatusChange(e.id_ekstra, 'aktif')} className="bg-green-500 text-white px-4 py-2 rounded-lg">Aktifkan</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {ekstra.data.length < ekstra.total && (
        <div className="text-center mt-6">
          <button onClick={() => setPage(p => p + 1)} disabled={loading} className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:bg-gray-400">
            {loading ? 'Memuat...' : 'Lihat Lainnya'}
          </button>
        </div>
      )}
    </div>
  );
}