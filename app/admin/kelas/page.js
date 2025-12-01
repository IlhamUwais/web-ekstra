'use client';

import { useState, useEffect } from 'react';
import Modal from '../../component/modal';
import { toast } from 'react-toastify';

export default function KelolaKelasPage() {
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kelas2');
      const data = await res.json();
      setKelasList(data);
    } catch (error) {
      toast.error('Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (kelas = null) => {
    if (kelas) {
      setIsEditing(true);
      setFormData({
        id_kelas: kelas.id_kelas,
        jenjang: kelas.jenjang,
        jurusan: kelas.jurusan,
        nama_kelas: kelas.nama_kelas,
      });
    } else {
      setIsEditing(false);
      setFormData({
        jenjang: '10',
        jurusan: 'PPLG',
        nama_kelas: '',
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
    const url = isEditing ? `/api/kelas2/${formData.id_kelas}` : '/api/kelas2';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      
      toast.success(`Kelas berhasil ${isEditing ? 'diupdate' : 'ditambahkan'}!`);
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      try {
        const res = await fetch(`/api/kelas2/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        
        toast.success('Kelas berhasil dihapus!');
        fetchData();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-xl font-semibold text-gray-600">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Manajemen Kelas</h1>
      <div className="mb-6 text-center">
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Tambah Kelas Baru
        </button>
      </div>

      {/* Modal untuk Form */}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <div className="bg-white rounded-xl p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">{isEditing ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p>Jenjang</p>
            <select
              name="jenjang"
              value={formData.jenjang || '10'}
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
            <p>Jurusan</p>
            <select
              name="jurusan"
              value={formData.jurusan || 'PPLG'}
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AKL">AKL</option>
              <option value="MPLB">MPLB</option>
              <option value="PM">PM</option>
              <option value="PPLG">PPLG</option>
            </select>
            <p>Nama Kelas</p>
            <input
              type="text"
              name="nama_kelas"
              value={formData.nama_kelas || ''}
              onChange={handleChange}
              placeholder="Nama Kelas (Contoh: XII PPLG 2)"
              required
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                {isEditing ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Tabel Daftar Kelas */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-4 text-left font-semibold">ID</th>
                <th className="p-4 text-left font-semibold">Jenjang</th>
                <th className="p-4 text-left font-semibold">Jurusan</th>
                <th className="p-4 text-left font-semibold">Nama Kelas</th>
                <th className="p-4 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kelasList.map(k => (
                <tr key={k.id_kelas} className="border-b hover:bg-gray-50 transition-colors duration-200">
                  <td className="p-4 text-gray-600">{k.id_kelas}</td>
                  <td className="p-4 text-gray-600">{k.jenjang}</td>
                  <td className="p-4 text-gray-600">{k.jurusan}</td>
                  <td className="p-4 text-gray-600">{k.nama_kelas}</td>
                  <td className="p-4">
                    <button
                      onClick={() => openModal(k)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-yellow-600 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(k.id_kelas)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}