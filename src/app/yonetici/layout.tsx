'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function YoneticiLayout({
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
      if (kullaniciObj.rol !== 'yonetici') {
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
                <h1 className="text-2xl font-bold text-blue-800">Depo Sayım</h1>
              </div>
              <nav className="ml-8 flex space-x-4">
                <Link href="/yonetici" className="border-b-2 border-blue-500 text-gray-900 px-1 pt-1 inline-flex items-center text-sm font-medium">
                  Ana Sayfa
                </Link>
                <Link href="/yonetici/urunler" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium">
                  Ürün Yönetimi
                </Link>
                <Link href="/yonetici/sayimlar" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium">
                  Tüm Sayımlar
                </Link>
                <div className="relative group inline-flex items-center">
                  <button className="border-transparent text-gray-500 group-hover:text-gray-700 group-hover:border-gray-300 border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium h-full">
                    Mal Kabul
                    <svg className="ml-2 h-4 w-4 transform transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute hidden group-hover:block w-48 top-full left-0 pt-2 z-50">
                    <div className="bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 transform opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out">
                      <Link href="/yonetici/mal-kabul" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150">
                        Yeni Mal Kabul
                      </Link>
                      <Link href="/yonetici/mal-kabul-listesi" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150">
                        Mal Kabul Listesi
                      </Link>
                    </div>
                  </div>
                </div>
                <Link href="/yonetici/yeni-sayim" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium">
                  Yeni Sayım
                </Link>
                <Link href="/yonetici/raporlar" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium">
                  Raporlar
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="flex items-center pr-4 border-r border-gray-200">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
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