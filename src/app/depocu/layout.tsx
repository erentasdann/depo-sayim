'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DepocuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  
  useEffect(() => {
    // Kullanıcı giriş kontrolü
    if (typeof window !== 'undefined') {
      const kullanici = localStorage.getItem('kullanici');
      if (!kullanici) {
        router.push('/giris');
        return;
      }
      
      const kullaniciObj = JSON.parse(kullanici);
      if (kullaniciObj.rol !== 'depocu') {
        router.push('/giris');
        return;
      }
      
      setKullaniciAdi(kullaniciObj.kullaniciAdi);
    }
  }, [router]);

  const cikisYap = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kullanici');
      router.push('/giris');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Üst Menü */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-indigo-800">Depo Sayım</h1>
              </div>
              <nav className="ml-8 flex space-x-4">
                <Link href="/depocu" className="border-b-2 border-indigo-500 text-gray-900 px-1 pt-1 inline-flex items-center text-sm font-medium">
                  Ana Sayfa
                </Link>
                <Link href="/depocu/bekleyen-sayimlar" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium">
                  Bekleyen Sayımlar
                </Link>
                <Link href="/depocu/tamamlanan" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium">
                  Tamamlanan Sayımlar
                </Link>
                <Link href="/depocu/mal-kabul" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium">
                 Mal Kabul Sayımları
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="flex items-center pr-4 border-r border-gray-200">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                  {kullaniciAdi.charAt(0).toUpperCase()}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{kullaniciAdi}</span>
              </div>
              <button
                onClick={cikisYap}
                className="ml-4 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 