'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SayimKarti } from '@/types';
import Bildirimler from '@/components/Bildirimler';
import { PlusIcon, ChartBarIcon, CubeIcon } from '@heroicons/react/24/outline';

// Demo verisi
const demoSayimlar: SayimKarti[] = [
  {
    id: '1',
    sayimNo: 'SAY001',
    tarih: new Date(),
    sayimAdi: 'Genel Sayım 1',
    urunler: [
      { id: '1', kod: 'PRD001', urunAdi: 'Ürün 1', beklenenAdet: 100, createdAt: new Date(), updatedAt: new Date() },
      { id: '2', kod: 'PRD002', urunAdi: 'Ürün 2', beklenenAdet: 150, createdAt: new Date(), updatedAt: new Date() },
      { id: '3', kod: 'PRD003', urunAdi: 'Ürün 3', beklenenAdet: 200, createdAt: new Date(), updatedAt: new Date() }
    ],
    durum: 'beklemede',
    olusturanKullanici: 'admin'
  },
  {
    id: '2',
    sayimNo: 'SAY002',
    tarih: new Date(),
    sayimAdi: 'Genel Sayım 2',
    urunler: [
      { id: '4', kod: 'PRD004', urunAdi: 'Ürün 4', beklenenAdet: 75, createdAt: new Date(), updatedAt: new Date() },
      { id: '5', kod: 'PRD005', urunAdi: 'Ürün 5', beklenenAdet: 125, createdAt: new Date(), updatedAt: new Date() },
      { id: '6', kod: 'PRD006', urunAdi: 'Ürün 6', beklenenAdet: 175, createdAt: new Date(), updatedAt: new Date() }
    ],
    durum: 'beklemede',
    olusturanKullanici: 'admin'
  }
];

export default function YoneticiAnaSayfa() {
  const [bekleyenSayimlar, setBekleyenSayimlar] = useState<SayimKarti[]>([]);
  const [tamamlananSayimlar, setTamamlananSayimlar] = useState<SayimKarti[]>([]);
  const [istatistikler, setIstatistikler] = useState({
    toplam: 0,
    bekleyen: 0,
    tamamlanan: 0,
    toplamUrun: 0,
    eksikUrun: 0,
    fazlaUrun: 0,
    sonSayimTarihi: null as Date | null
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageData = localStorage.getItem('sayimlar');
      if (storageData) {
        const sayimlar: SayimKarti[] = JSON.parse(storageData).map((s: any) => ({
          ...s,
          tarih: new Date(s.tarih),
          tamamlanmaTarihi: s.tamamlanmaTarihi ? new Date(s.tamamlanmaTarihi) : undefined
        }));
        
        const bekleyen = sayimlar.filter((s: SayimKarti) => s.durum === 'beklemede');
        const tamamlanan = sayimlar.filter((s: SayimKarti) => s.durum === 'tamamlandi');
        
        setBekleyenSayimlar(bekleyen);
        setTamamlananSayimlar(tamamlanan);

        // Gelişmiş istatistikleri hesapla
        const toplamUrun = sayimlar.reduce((acc: number, sayim: SayimKarti) => 
          acc + sayim.urunler.length, 0
        );
        let eksikUrun = 0;
        let fazlaUrun = 0;
        let sonSayimTarihi: Date | null = null;

        tamamlanan.forEach((sayim: SayimKarti) => {
          sayim.urunler.forEach((urun) => {
            const fark = (urun.sayilanAdet || 0) - urun.beklenenAdet;
            if (fark < 0) eksikUrun++;
            if (fark > 0) fazlaUrun++;
          });

          if (!sonSayimTarihi || (sayim.tamamlanmaTarihi && sayim.tamamlanmaTarihi > sonSayimTarihi)) {
            sonSayimTarihi = sayim.tamamlanmaTarihi || null;
          }
        });
        
        setIstatistikler({
          toplam: sayimlar.length,
          bekleyen: bekleyen.length,
          tamamlanan: tamamlanan.length,
          toplamUrun,
          eksikUrun,
          fazlaUrun,
          sonSayimTarihi
        });
      }
    }
  }, []);

  const formatTarih = (tarih: Date) => {
    return tarih.toLocaleDateString('tr-TR');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yönetici Kontrol Paneli</h1>
          <p className="mt-1 text-sm text-gray-500">
            Hoş geldiniz! Depo sayım sistemi yönetim paneline erişim sağladınız.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Bildirimler />
          <Link href="/yonetici/yeni-sayim" className="btn-primary">
            + Yeni Sayım Oluştur
          </Link>
        </div>
      </div>

      {/* Gelişmiş İstatistik Kartları */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow rounded-lg text-white">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white/20 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-white/80 truncate">
                    Toplam Sayım
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    {istatistikler.toplam}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 overflow-hidden shadow rounded-lg text-white">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white/20 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-white/80 truncate">
                    Bekleyen Sayım
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    {istatistikler.bekleyen}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 overflow-hidden shadow rounded-lg text-white">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white/20 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-white/80 truncate">
                    Tamamlanan Sayım
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    {istatistikler.tamamlanan}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 overflow-hidden shadow rounded-lg text-white">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white/20 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-white/80 truncate">
                    Toplam Ürün
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    {istatistikler.toplamUrun}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Özet İstatistikler */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Hızlı Özet</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">Eksik Ürün Sayısı</h4>
                  <p className="mt-1 text-2xl font-semibold text-red-900">{istatistikler.eksikUrun}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800">Fazla Ürün Sayısı</h4>
                  <p className="mt-1 text-2xl font-semibold text-green-900">{istatistikler.fazlaUrun}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Son Sayım Tarihi</h4>
                  <p className="mt-1 text-lg font-semibold text-blue-900">
                    {istatistikler.sonSayimTarihi ? formatTarih(istatistikler.sonSayimTarihi) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Son Bekleyen Sayımlar */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Bekleyen Sayımlar</h2>
          {bekleyenSayimlar.length > 0 && (
            <Link 
              href="/yonetici/sayimlar"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Tümünü Gör →
            </Link>
          )}
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {bekleyenSayimlar.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg mb-1">Bekleyen sayım bulunmamaktadır</p>
                <p className="text-sm">Yeni bir sayım oluşturmak için yukarıdaki butonu kullanabilirsiniz.</p>
              </li>
            ) : (
              bekleyenSayimlar.map((sayim) => (
                <li key={sayim.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-blue-600">
                            {sayim.sayimNo}
                          </div>
                          <div className="text-sm text-gray-900 font-semibold">
                            {sayim.sayimAdi}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sayim.urunler.length} ürün
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          {formatTarih(sayim.tarih)}
                        </div>
                        <Link 
                          href={`/yonetici/sayimlar/${sayim.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                        >
                          Detay
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Son Tamamlanan Sayımlar */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Son Tamamlanan Sayımlar</h2>
          {tamamlananSayimlar.length > 0 && (
            <Link 
              href="/yonetici/raporlar"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Tüm Raporları Gör →
            </Link>
          )}
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {tamamlananSayimlar.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">Henüz tamamlanan sayım bulunmamaktadır</p>
              </li>
            ) : (
              tamamlananSayimlar.slice(0, 5).map((sayim) => (
                <li key={sayim.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-blue-600">
                            {sayim.sayimNo}
                          </div>
                          <div className="text-sm text-gray-900 font-semibold">
                            {sayim.sayimAdi}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sayim.tamamlayanKullanici} tarafından tamamlandı
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          {formatTarih(sayim.tamamlanmaTarihi || sayim.tarih)}
                        </div>
                        <Link 
                          href={`/yonetici/sayimlar/${sayim.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                        >
                          Rapor
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Menü kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Yeni Sayım kartı */}
        <Link href="/yonetici/yeni-sayim">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <PlusIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Yeni Sayım</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Yeni bir sayım kartı oluştur
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Raporlar kartı */}
        <Link href="/yonetici/raporlar">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Raporlar</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Sayım raporlarını görüntüle
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Ürün Yönetimi kartı */}
        <Link href="/yonetici/urunler">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <CubeIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Ürün Yönetimi</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Ürünleri ekle, düzenle ve yönet
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
} 