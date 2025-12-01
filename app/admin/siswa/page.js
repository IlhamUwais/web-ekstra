'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../../component/modal'; // Pastikan path komponen benar
import { toast } from 'react-toastify';
import Select from 'react-select';

export default function KelolaSiswaPage() {
  const [siswa, setSiswa] = useState({ data: [], total: 0 });
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // --- STATE BARU UNTUK VALIDASI ---
  const [validationErrors, setValidationErrors] = useState({ nis: '', nama: '' });
  const [isChecking, setIsChecking] = useState({ nis: false, nama: false });

  const [filters, setFilters] = useState({
    status: 'aktif',
    id_kelas: 'Semua', 
  });
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async (currentPage, currentFilters, append = false) => {
    if (!append) setLoading(true);
    const queryParams = new URLSearchParams({ ...currentFilters, page: currentPage }).toString();
    try {
      const resSiswa = await fetch(`/api/siswa?${queryParams}`);
      if (!resSiswa.ok) throw new Error('Gagal mengambil data siswa');
      const dataSiswa = await resSiswa.json();
      if (append) {
        setSiswa(prev => ({ data: [...prev.data, ...dataSiswa.data], total: dataSiswa.total }));
      } else {
        setSiswa(dataSiswa);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const resKelas = await fetch('/api/kelas');
        if (!resKelas.ok) throw new Error('Gagal memuat data kelas');
        const dataKelas = await resKelas.json();
        setKelas(dataKelas);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchKelas();
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchData(page, filters, true);
    } else {
      fetchData(1, filters, false);
    }
  }, [page, filters, fetchData]);
  
  // --- LOGIKA BARU UNTUK VALIDASI REAL-TIME ---
  const checkAvailability = useCallback(async (field, value) => {
    if (!value) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
      return;
    }
    
    setIsChecking(prev => ({ ...prev, [field]: true }));
    try {
      const res = await fetch('/api/admin/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value, excludeNis: isEditing ? formData.nis : null })
      });
      const data = await res.json();
      if (data.isTaken) {
        setValidationErrors(prev => ({ ...prev, [field]: `${field.charAt(0).toUpperCase() + field.slice(1)} sudah dipakai` }));
      } else {
        setValidationErrors(prev => ({ ...prev, [field]: '' }));
      }
    } catch (error) {
      console.error("Validation check failed", error);
    } finally {
      setIsChecking(prev => ({ ...prev, [field]: false }));
    }
  }, [isEditing, formData.nis]);

  // --- useEffect BARU UNTUK DEBOUNCING VALIDASI ---
  useEffect(() => {
    if (isEditing) return; // Validasi NIS hanya saat menambah baru
    const handler = setTimeout(() => {
      if (formData.nis) checkAvailability('nis', formData.nis);
    }, 500);
    return () => clearTimeout(handler);
  }, [formData.nis, isEditing, checkAvailability]);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (formData.nama) checkAvailability('nama', formData.nama);
    }, 500);
    return () => clearTimeout(handler);
  }, [formData.nama, checkAvailability]);


  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const kelasOptions = useMemo(() => {
    const options = kelas.map(k => ({
      value: k.id_kelas,
      label: `${k.nama_kelas}`
    }));
    return [{ value: 'Semua', label: 'Semua Kelas' }, ...options];
  }, [kelas]);
  
const handleStatusChange = async (nis, newStatus) => {

 const confirmationText = newStatus === 'nonaktif' ? 'Apakah Anda yakin ingin menonaktifkan siswa ini?' : 'Apakah Anda yakin ingin mengaktifkan kembali siswa ini?';
 if (confirm(confirmationText)) {
try {
 const res = await fetch(`/api/siswa/${nis}/status`, {
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
toast.error(error.message); }
 }
 };

  const openModal = (dataSiswa = null) => {
    setValidationErrors({ nis: '', nama: '' });
    if (dataSiswa) {
      setIsEditing(true);
      setFormData({ nis: dataSiswa.nis, nama: dataSiswa.nama, jk: dataSiswa.jk, id_kelas: dataSiswa.id_kelas, password: '' });
    } else {
      setIsEditing(false);
      setFormData({ nis: '', nama: '', jk: 'L', id_kelas: kelas.length > 0 ? kelas[0].id_kelas : '', password: '' });
    }
    setModalIsOpen(true);
  };
  const closeModal = () => setModalIsOpen(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset validasi saat user mengetik lagi
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validationErrors.nis || validationErrors.nama) {
      toast.error('Mohon perbaiki error pada form sebelum menyimpan.');
      return;
    }
    const url = isEditing ? `/api/siswa/${formData.nis}` : '/api/siswa';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      
      toast.success(`Siswa berhasil ${isEditing ? 'diupdate' : 'ditambahkan'}!`);
      closeModal();
      setPage(1);
      fetchData(1, filters);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading && page === 1) return (
    <div className="flex items-center justify-center min-h-screen">Loading...</div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Manajemen Siswa</h1>
      <p className="text-center text-gray-500 mb-6">Menampilkan {siswa.data.length} dari {siswa.total} siswa</p>
      
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
        <p className="font-semibold text-gray-700">Filter:</p>
        <select name="status" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="p-2 border rounded-lg">
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
          <option value="Semua">Semua Status</option>
        </select>
        <Select
          instanceId="kelas-filter"
          className="w-full sm:w-80"
          options={kelasOptions}
          value={kelasOptions.find(opt => opt.value === filters.id_kelas)}
          onChange={(selectedOption) => handleFilterChange('id_kelas', selectedOption.value)}
          placeholder="Cari atau pilih kelas..."
        />
      </div>

      <div className="mb-6 text-center">
        <button onClick={() => openModal()} className="bg-blue-500 text-white px-6 py-3 rounded-lg">Tambah Siswa</button>
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <div className="bg-white rounded-xl p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">{isEditing ? 'Edit Siswa' : 'Tambah Siswa Baru'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div>
              <p>NIS</p>
              <input type="text" name="nis" value={formData.nis || ''} onChange={handleChange} placeholder="NIS" required disabled={isEditing} className="p-2 border rounded-lg disabled:bg-gray-100 w-full" />
              {isChecking.nis && <p className="text-sm text-gray-500 mt-1">Mengecek...</p>}
              {validationErrors.nis && <p className="text-sm text-red-500 mt-1">{validationErrors.nis}</p>}
            </div>

            <div>
              <p>Nama Lengkap</p>
              <input type="text" name="nama" value={formData.nama || ''} onChange={handleChange} placeholder="Nama Lengkap" required className="p-2 border rounded-lg w-full" />
              {isChecking.nama && <p className="text-sm text-gray-500 mt-1">Mengecek...</p>}
              {validationErrors.nama && <p className="text-sm text-red-500 mt-1">{validationErrors.nama}</p>}
            </div>

            <p>Jenis Kelamin</p>
            <select name="jk" value={formData.jk || 'L'} onChange={handleChange} className="p-2 border rounded-lg">
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
            
            <p>Kelas</p>
            <select name="id_kelas" value={formData.id_kelas || ''} onChange={handleChange} required className="p-2 border rounded-lg">
              <option value="">Pilih Kelas</option>
              {kelas.map(k => (<option key={`modal-kelas-${k.id_kelas}`} value={k.id_kelas}>{k.nama_kelas}</option>))}
            </select>
            
            <p>Password</p>
            <input type="password" name="password" value={formData.password || ''} onChange={handleChange} placeholder={isEditing ? 'Password (opsional)' : 'Password'} required={!isEditing} className="p-2 border rounded-lg" />
            
            <div className="flex justify-end gap-4 mt-6">
              <button type="button" onClick={closeModal} className="bg-gray-300 px-4 py-2 rounded-lg">Batal</button>
              <button type="submit" disabled={isChecking.nis || isChecking.nama || !!validationErrors.nis || !!validationErrors.nama} className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-400">{isEditing ? 'Update' : 'Simpan'}</button>
            </div>
          </form>
        </div>
      </Modal>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-4 text-left font-semibold">NIS</th>
                <th className="p-4 text-left font-semibold">Nama</th>
                <th className="p-4 text-left font-semibold">JK</th>
                <th className="p-4 text-left font-semibold">Kelas</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {siswa.data.map(s => (
                <tr key={s.nis} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-600">{s.nis}</td>
                  <td className="p-4 text-gray-600">{s.nama}</td>
                  <td className="p-4 text-gray-600">{s.jk}</td>
                  <td className="p-4 text-gray-600">{s.nama_kelas}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => openModal(s)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-yellow-600">Edit</button>
                    {s.status === 'aktif' ? (
                      <button onClick={() => handleStatusChange(s.nis, 'nonaktif')} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Nonaktifkan</button>
                    ) : (
                      <button onClick={() => handleStatusChange(s.nis, 'aktif')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Aktifkan</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {siswa.data.length < siswa.total && (
        <div className="text-center mt-6">
          <button onClick={() => setPage(p => p + 1)} disabled={loading} className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:bg-gray-400">
            {loading ? 'Memuat...' : 'Lihat Lainnya'}
          </button>
        </div>
      )}
    </div>
  );
}