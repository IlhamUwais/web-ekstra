"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function Sidebar({ menuItems }) {
  const router = useRouter();

  const handleLogOut = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  

  return (
    <aside className="w-64 bg-gray-900 text-white p-6 shadow-lg namaclass-sidebar">
      <h2 className="text-2xl mb-8 font-bold text-neon-blue flex items-center gap-2 animate-pulse">
        Haloo
      </h2>
      <nav className="space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block py-2 px-4 rounded-lg text-gray-300 hover:bg-neon-green hover:text-green-900 hover:scale-105 transition-all duration-300 ease-in-out group relative overflow-hidden"
          >
            <span className="relative z-10 font-pixel">{item.label}</span>
            <span className="absolute inset-0 bg-neon-green opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></span>
          </Link>
          
        
        ))}
        
      </nav>
      <button 
      className="block py-2 px-4 rounded-lg text-gray-300 hover:bg-red-500 mt-3 hover:text-gray-900 hover:scale-105 transition-all duration-300 ease-in-out group relative overflow-hidden z-10 space-y-3"
      onClick={handleLogOut}
      
      >Logout</button>
     {/* <span className="absolute inset-0 bg-neon-green opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></span> */}
    </aside>
  );
}