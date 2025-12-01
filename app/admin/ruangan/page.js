'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '../../component/modal';
import { toast } from 'react-toastify';

export default function KelolaRuanganPage() {
  const [ruangan, setRuangan] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchData = useCallback(async (currentPage, search, append = false) => {
    if (!append) setLoading(true);
    const queryParams = new URLSearchParams({ page: currentPage, search }).toString();
    try {
      const res = await fetch(`/api/admin/ruangan?${queryParams}`);
      if (!res.ok) throw new Error('Gagal memuat data ruangan');
      const dataRuangan = await res.json();
      if (append) {
        setRuangan(prev => ({ data: [...prev.data, ...dataRuangan.data], total: dataRuangan.total }));
      } else {
        setRuangan(dataRuangan);
      }
    } catch (error) { toast.error(error.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchData(page, debouncedSearchQuery, true);
    } else {
      fetchData(1, debouncedSearchQuery, false);
    }
  }, [page, debouncedSearchQuery, fetchData]);

  const openModal = (dataRuangan = null) => {
    if (dataRuangan) {
      setIsEditing(true);
      setFormData({ id_ruangan: dataRuangan.id_ruangan, nama_ruangan: dataRuangan.nama_ruangan });
    } else {
      setIsEditing(false);
      setFormData({ nama_ruangan: '' });
    }
    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);
  const handleChange = (e) => setFormData({ ...formData, nama_ruangan: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `/api/admin/ruangan/${formData.id_ruangan}` : '/api/admin/ruangan';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(`Ruangan berhasil ${isEditing ? 'diupdate' : 'ditambahkan'}.`);
      closeModal();
      setPage(1);
      fetchData(1, debouncedSearchQuery);
    } catch (error) { toast.error(error.message); }
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) {
      try {
        const res = await fetch(`/api/admin/ruangan/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        toast.success('Ruangan berhasil dihapus!');
        setPage(1);
        fetchData(1, debouncedSearchQuery);
      } catch (error) { toast.error(error.message); }
    }
  };

  if (loading && page === 1) return (
      <div className="flex items-center justify-center min-h-screen">Loading...</div>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Manajemen Ruangan</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama ruangan..."
          className="p-2 border rounded-lg w-full md:w-80"
        />
        <button onClick={() => openModal()} className="bg-blue-500 text-white px-6 py-3 rounded-lg w-full md:w-auto">
          Tambah Ruangan
        </button>
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}</h2>
        <form onSubmit={handleSubmit}>
          <p>Nama Ruangan</p>
          <input type="text" name="nama_ruangan" value={formData.nama_ruangan || ''} onChange={handleChange} placeholder="Nama Ruangan" required className="w-full p-2 border rounded-lg mb-4"/>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={closeModal} className="bg-gray-300 px-4 py-2 rounded-lg">Batal</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">{isEditing ? 'Update' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200"><th className="p-4 text-left">Nama Ruangan</th><th className="p-4 text-left">Aksi</th></tr>
          </thead>
          <tbody>
            {ruangan.data.map(r => (
              <tr key={r.id_ruangan} className="border-b">
                <td className="p-4">{r.nama_ruangan}</td>
                <td className="p-4">
                  <button onClick={() => openModal(r)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2">Edit</button>
                  <button onClick={() => handleDelete(r.id_ruangan)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ruangan.data.length < ruangan.total && (
        <div className="text-center mt-6">
          <button onClick={() => setPage(p => p + 1)} disabled={loading} className="bg-gray-200 px-6 py-3 rounded-lg">
            {loading ? 'Memuat...' : 'Lihat Lainnya'}
          </button>
        </div>
      )}
    </div>
  );
}