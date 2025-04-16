'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SayimKarti } from '@/types';
import { FiBox, FiCalendar, FiSearch, FiFilter, FiChevronRight } from 'react-icons/fi';

export default function BekleyenSayimlar() {
  const [sayimlar, setSayimlar] = useState<SayimKarti[]>([]);
  const [filtrelenmisSayimlar, setFiltrelenmisSayimlar] = useState<SayimKarti[]>([]);
  const [aramaMetni, setAramaMetni] = useState('');
  const [siralama, setSiralama] = useState<'tarih' | 'urun'>('tarih');

  useEffect(() => {
    const sayimlariYukle = () => {
      try {
        const storageData = localStorage.getItem('sayimlar');
        if (storageData) {
          const tumSayimlar = JSON.parse(storageData).map((sayim: any) => ({
            ...sayim,
            tarih: new Date(sayim.tarih),
            tamamlanmaTarihi: sayim.tamamlanmaTarihi ? new Date(sayim.tamamlanmaTarihi) : undefined
          }));
          const bekleyenler = tumSayimlar.filter((sayim: SayimKarti) => sayim.durum === 'beklemede');
          setSayimlar(bekleyenler);
          setFiltrelenmisSayimlar(bekleyenler);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };

    sayimlariYukle();
  }, []);

  useEffect(() => {
    let sonuclar = [...sayimlar];

    // Arama filtreleme
    if (aramaMetni) {
      sonuclar = sonuclar.filter(sayim => 
        sayim.sayimNo.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        sayim.sayimAdi.toLowerCase().includes(aramaMetni.toLowerCase())
      );
    }

    // Sıralama
    sonuclar.sort((a, b) => {
      if (siralama === 'tarih') {
        return b.tarih.getTime() - a.tarih.getTime();
      } else {
        return b.urunler.length - a.urunler.length;
      }
    });

    setFiltrelenmisSayimlar(sonuclar);
  }, [sayimlar, aramaMetni, siralama]);

  const formatTarih = (tarih: Date) => {
    return tarih.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Bekleyen Sayımlar</h1>
        <p className="text-blue-100">
          Tüm bekleyen sayımları görüntüleyin ve yönetin
        </p>
      </div>

      {/* Filtreler ve Arama */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Sayım ara..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="h-5 w-5 text-gray-400" />
            <select
              value={siralama}
              onChange={(e) => setSiralama(e.target.value as 'tarih' | 'urun')}
              className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="tarih">Tarihe Göre</option>
              <option value="urun">Ürün Sayısına Göre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sayım Listesi */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filtrelenmisSayimlar.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <FiBox className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {aramaMetni ? 'Arama Sonucu Bulunamadı' : 'Bekleyen Sayım Yok'}
            </h3>
            <p className="text-gray-500">
              {aramaMetni 
                ? 'Farklı arama kriterleri deneyebilirsiniz.'
                : 'Şu anda bekleyen sayım bulunmamaktadır.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filtrelenmisSayimlar.map((sayim) => (
              <motion.div
                key={sayim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={`/depocu/sayim/${sayim.id}`}
                  className="block hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FiBox className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-blue-600">
                              {sayim.sayimNo}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Bekliyor
                            </span>
                          </div>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {sayim.sayimAdi}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <FiCalendar className="h-4 w-4 mr-1" />
                              {formatTarih(sayim.tarih)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <FiBox className="h-4 w-4 mr-1" />
                              {sayim.urunler.length} Ürün
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Sayımı Başlat
                          <FiChevronRight className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 