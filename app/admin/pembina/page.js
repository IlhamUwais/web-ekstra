'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '../../component/modal'; // Pastikan path benar
import { toast } from 'react-toastify';

export default function KelolaPembinaPage() {
  const [pembina, setPembina] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const [filters, setFilters] = useState({ status: 'aktif', search: '' });
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchQuery }));
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- PERBAIKAN 1: Fungsi ini sekarang menerima 'currentFilters' sebagai objek ---
  const fetchData = useCallback(async (currentPage, currentFilters, append = false) => {
    if (!append) setLoading(true);
    
    // --- PERBAIKAN 2: URLSearchParams sekarang menggunakan seluruh objek currentFilters ---
    const queryParams = new URLSearchParams({
      ...currentFilters,
      page: currentPage,
    }).toString();
    
    try {
      const res = await fetch(`/api/pembina?${queryParams}`);
      if (!res.ok) throw new Error('Gagal mengambil data pembina');
      const dataPembina = await res.json();
      
      if (append) {
        setPembina(prev => ({
          data: [...prev.data, ...dataPembina.data],
          total: dataPembina.total
        }));
      } else {
        setPembina(dataPembina);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchData(page, filters, true);
    } else {
      fetchData(1, filters, false);
    }
  }, [page, filters, fetchData]);

  const handleStatusChange = async (id, newStatus) => {
    const action = newStatus === 'nonaktif' ? 'menonaktifkan' : 'mengaktifkan';
    if (confirm(`Apakah Anda yakin ingin ${action} pembina ini?`)) {
      try {
        const res = await fetch(`/api/pembina/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        
        toast.success(result.message);
        setPage(1);
        // --- PERBAIKAN 3: Memanggil fetchData dengan objek 'filters' yang benar ---
        fetchData(1, filters);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const openModal = (dataPembina = null) => {
    if (dataPembina) {
      setIsEditing(true);
      setFormData({
        id_pembina: dataPembina.id_pembina,
        nama: dataPembina.nama,
        username: dataPembina.username,
        password: ''
      });
    } else {
      setIsEditing(false);
      setFormData({
        nama: '',
        username: '',
        password: ''
      });
    }
    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `/api/pembina/${formData.id_pembina}` : '/api/pembina';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(`Pembina berhasil ${isEditing ? 'diupdate' : 'ditambahkan'}.`);
      closeModal();
      setPage(1);
      // --- PERBAIKAN 4: Memanggil fetchData dengan objek 'filters' yang benar ---
      fetchData(1, filters);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading && page === 1) return (
      <div className="flex items-center justify-center min-h-screen">Loading...</div>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Manajemen Pembina</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pembina..."
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
          Tambah Pembina
        </button>
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <div className="bg-white rounded-xl p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{isEditing ? 'Edit Pembina' : 'Tambah Pembina Baru'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p>Nama Pembina</p>
                <input type="text" name="nama" value={formData.nama || ''} onChange={handleChange} placeholder="Nama Lengkap" required className="p-2 border rounded-lg"/>
                <p>Username</p>
                <input type="text" name="username" value={formData.username || ''} onChange={handleChange} placeholder="Username" required className="p-2 border rounded-lg"/>
                <p>Password</p>
                <input type="password" name="password" value={formData.password || ''} onChange={handleChange} placeholder={isEditing ? 'Password (biarkan kosong jika tidak diubah)' : 'Password'} required={!isEditing} className="p-2 border rounded-lg"/>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={closeModal} className="bg-gray-300 px-4 py-2 rounded-lg">Batal</button>
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
                <th className="p-4 text-left font-semibold">Nama</th>
                <th className="p-4 text-left font-semibold">Username</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pembina.data.map(p => (
                <tr key={p.id_pembina} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-600">{p.nama}</td>
                  <td className="p-4 text-gray-600">{p.username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => openModal(p)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-yellow-600">Edit</button>
                    {p.status === 'aktif' ? (
                      <button onClick={() => handleStatusChange(p.id_pembina, 'nonaktif')} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Nonaktifkan</button>
                    ) : (
                      <button onClick={() => handleStatusChange(p.id_pembina, 'aktif')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Aktifkan</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {pembina.data.length < pembina.total && (
        <div className="text-center mt-6">
          <button onClick={() => setPage(p => p + 1)} disabled={loading} className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:bg-gray-400">
            {loading ? 'Memuat...' : 'Lihat Lainnya'}
          </button>
        </div>
      )}
    </div>
  );
};