// app/context/AuthContext.js
'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // State untuk loading awal
  const router = useRouter();

   const [pembinaEkstraList, setPembinaEkstraList] = useState([]);
  const [selectedEkstraId, setSelectedEkstraId] = useState('');
  // 1. Cek localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // Selesai loading
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    if (userData.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (userData.role === 'siswa') {
      router.push('/siswa/ekstra');
    } else if (userData.role === 'pembina') { // <-- Tambahkan ini
      router.push('/pembina/dashboard');
    }
  };

  const logout = () => {
    // 3. Hapus user dari localStorage saat logout
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  // Kita bungkus children dengan pengecekan loading
  // agar tidak terjadi "flash" redirect ke login
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      // --- TAMBAHKAN INI UNTUK DIKIRIM KE SEMUA KOMPONEN ---  
      pembinaEkstraList, 
      setPembinaEkstraList,
      selectedEkstraId,
      setSelectedEkstraId
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};