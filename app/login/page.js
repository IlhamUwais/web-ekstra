"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify'; // Ditambahkan untuk notifikasi yang lebih baik

export default function LoginPage() {
  const { login } = useAuth();

  // State untuk role tidak lagi diperlukan
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // State untuk loading

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Body sekarang tidak lagi mengirim 'role'
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // AuthContext akan menangani redirect berdasarkan role dari API
        login(data.user);
      } else {
        setMessage(`Error: ${data.message}`);
        toast.error(data.message); // Notifikasi toast untuk error
      }
    } catch (error) {
      const errorMessage = "Tidak dapat terhubung ke server.";
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Login
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          {/* DIV UNTUK PEMILIHAN ROLE DIHAPUS DARI SINI */}
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Username atau NIS:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan username atau NIS"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan password"
            />
          </div>
          <button
            type="submit"
            disabled={loading} // Tombol dinonaktifkan saat loading
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 mt-4 disabled:bg-gray-400"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
        {/* Pesan error tidak lagi ditampilkan di bawah, karena sudah ada toast */}
      </div>
    </div>
  );
}