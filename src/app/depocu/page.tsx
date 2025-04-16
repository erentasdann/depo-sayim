'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SayimKarti } from '@/types';
import { FiClock, FiCheckCircle, FiCalendar, FiArrowRight, FiBox, FiTrendingUp } from 'react-icons/fi';

export default function DepocuAnaSayfa() {
  const [bekleyenSayimlar, setBekleyenSayimlar] = useState<SayimKarti[]>([]);
  const [tamamlananSayimlar, setTamamlananSayimlar] = useState<SayimKarti[]>([]);
  const [sayimIstatistikleri, setSayimIstatistikleri] = useState({
    bekleyen: 0,
    tamamlanan: 0,
    bugunTamamlanan: 0,
    toplamUrun: 0,
    ortalamaUrun: 0
  });

  useEffect(() => {
    let sayimlar: SayimKarti[] = [];
    
    try {
      if (typeof window !== 'undefined') {
        const storageData = localStorage.getItem('sayimlar');
        if (storageData) {
          sayimlar = JSON.parse(storageData).map((sayim: any) => ({
            ...sayim,
            tarih: new Date(sayim.tarih),
            tamamlanmaTarihi: sayim.tamamlanmaTarihi ? new Date(sayim.tamamlanmaTarihi) : undefined
          }));
        } else {
          localStorage.setItem('sayimlar', JSON.stringify([]));
          sayimlar = [];
        }
        
        const bekleyen = sayimlar.filter(s => s.durum === 'beklemede');
        const tamamlanan = sayimlar.filter(s => s.durum === 'tamamlandi');
        
        const bugun = new Date();
        const bugunTamamlanan = tamamlanan.filter(s => {
          if (!s.tamamlanmaTarihi) return false;
          const tamamlanmaTarihi = new Date(s.tamamlanmaTarihi);
          return tamamlanmaTarihi.getDate() === bugun.getDate() &&
                 tamamlanmaTarihi.getMonth() === bugun.getMonth() &&
                 tamamlanmaTarihi.getFullYear() === bugun.getFullYear();
        });

        // Toplam ürün sayısı ve ortalama ürün sayısı hesaplama
        const toplamUrun = sayimlar.reduce((acc, sayim) => acc + sayim.urunler.length, 0);
        const ortalamaUrun = sayimlar.length > 0 ? Math.round(toplamUrun / sayimlar.length) : 0;
        
        setBekleyenSayimlar(bekleyen);
        setTamamlananSayimlar(tamamlanan.slice(0, 5));
        
        setSayimIstatistikleri({
          bekleyen: bekleyen.length,
          tamamlanan: tamamlanan.length,
          bugunTamamlanan: bugunTamamlanan.length,
          toplamUrun,
          ortalamaUrun
        });
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  }, []);

  const formatTarih = (tarih: Date) => {
    return tarih.toLocaleDateString('tr-TR');
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-white">Depo Sayım Kontrol Paneli</h1>
        <p className="text-blue-100 mt-2">
          Bekleyen sayımları kontrol edin ve tamamlanan sayımları görüntüleyin.
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiClock className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              Aktif
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">{sayimIstatistikleri.bekleyen}</h3>
            <p className="text-sm text-gray-500">Bekleyen Sayım</p>
          </div>
          <Link href="/depocu/bekleyen-sayimlar" className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center">
            Detayları Gör
            <FiArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="bg-green-100 p-3 rounded-lg">
              <FiCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
              Tamamlandı
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">{sayimIstatistikleri.tamamlanan}</h3>
            <p className="text-sm text-gray-500">Tamamlanan Sayım</p>
          </div>
          <Link href="/depocu/tamamlanan" className="mt-4 text-green-600 hover:text-green-700 text-sm font-medium inline-flex items-center">
            Detayları Gör
            <FiArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiCalendar className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
              Bugün
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">{sayimIstatistikleri.bugunTamamlanan}</h3>
            <p className="text-sm text-gray-500">Bugün Tamamlanan</p>
          </div>
          <div className="mt-4 text-gray-500 text-sm">
            {new Date().toLocaleDateString('tr-TR')}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FiBox className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
              Toplam
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">{sayimIstatistikleri.toplamUrun}</h3>
            <p className="text-sm text-gray-500">Toplam Ürün</p>
          </div>
          <div className="mt-4 text-gray-500 text-sm">
            Tüm sayımlardaki ürünler
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="bg-pink-100 p-3 rounded-lg">
              <FiTrendingUp className="h-6 w-6 text-pink-600" />
            </div>
            <span className="text-sm font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-md">
              Ortalama
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">{sayimIstatistikleri.ortalamaUrun}</h3>
            <p className="text-sm text-gray-500">Ortalama Ürün</p>
          </div>
          <div className="mt-4 text-gray-500 text-sm">
            Sayım başına düşen
          </div>
        </motion.div>
      </div>

      {/* Bekleyen Sayımlar */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Bekleyen Sayımlar</h2>
            <Link 
              href="/depocu/bekleyen-sayimlar"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
            >
              Tümünü Gör
              <FiArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        {bekleyenSayimlar.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <FiClock className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bekleyen Sayım Yok</h3>
            <p className="text-gray-500">
              Şu anda bekleyen sayım bulunmamaktadır.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bekleyenSayimlar.map((sayim) => (
              <Link 
                key={sayim.id}
                href={`/depocu/sayim/${sayim.id}`}
                className="block hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FiBox className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-600">{sayim.sayimNo}</p>
                        <p className="text-base font-semibold text-gray-900">{sayim.sayimAdi}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatTarih(sayim.tarih)}</p>
                        <p className="text-sm text-gray-500">{sayim.urunler.length} Ürün</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Sayımı Başlat
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Son Tamamlanan Sayımlar */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Son Tamamlanan Sayımlar</h2>
            <Link 
              href="/depocu/tamamlanan"
              className="text-green-600 hover:text-green-700 text-sm font-medium inline-flex items-center"
            >
              Tümünü Gör
              <FiArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        {tamamlananSayimlar.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <FiCheckCircle className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tamamlanan Sayım Yok</h3>
            <p className="text-gray-500">
              Henüz tamamlanmış sayım bulunmamaktadır.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tamamlananSayimlar.map((sayim) => (
              <Link 
                key={sayim.id}
                href={`/depocu/tamamlanan/${sayim.id}`}
                className="block hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <FiCheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-600">{sayim.sayimNo}</p>
                        <p className="text-base font-semibold text-gray-900">{sayim.sayimAdi}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatTarih(sayim.tamamlanmaTarihi || sayim.tarih)}
                      </p>
                      <p className="text-sm text-gray-500">{sayim.urunler.length} Ürün</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 