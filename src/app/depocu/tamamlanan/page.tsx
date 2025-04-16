'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SayimKarti } from '@/types';
import { FiBox, FiCalendar, FiSearch, FiFilter, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function TamamlananSayimlar() {
  const [sayimlar, setSayimlar] = useState<SayimKarti[]>([]);
  const [filtrelenmisSayimlar, setFiltrelenmisSayimlar] = useState<SayimKarti[]>([]);
  const [aramaMetni, setAramaMetni] = useState('');
  const [siralama, setSiralama] = useState<'tarih' | 'urun' | 'sure'>('tarih');

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
          const tamamlananlar = tumSayimlar.filter((sayim: SayimKarti) => sayim.durum === 'tamamlandi');
          setSayimlar(tamamlananlar);
          setFiltrelenmisSayimlar(tamamlananlar);
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
        return (b.tamamlanmaTarihi?.getTime() || 0) - (a.tamamlanmaTarihi?.getTime() || 0);
      } else if (siralama === 'urun') {
        return b.urunler.length - a.urunler.length;
      } else {
        // Tamamlanma süresi sıralaması
        const aSure = a.tamamlanmaTarihi ? a.tamamlanmaTarihi.getTime() - a.tarih.getTime() : 0;
        const bSure = b.tamamlanmaTarihi ? b.tamamlanmaTarihi.getTime() - b.tarih.getTime() : 0;
        return bSure - aSure;
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

  const hesaplaSure = (baslangic: Date, bitis: Date) => {
    const fark = bitis.getTime() - baslangic.getTime();
    const dakika = Math.floor(fark / (1000 * 60));
    const saat = Math.floor(dakika / 60);
    const gun = Math.floor(saat / 24);

    if (gun > 0) {
      return `${gun} gün`;
    } else if (saat > 0) {
      return `${saat} saat`;
    } else {
      return `${dakika} dakika`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Tamamlanan Sayımlar</h1>
        <p className="text-green-100">
          Tamamlanan sayımların detaylarını görüntüleyin
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="h-5 w-5 text-gray-400" />
            <select
              value={siralama}
              onChange={(e) => setSiralama(e.target.value as 'tarih' | 'urun' | 'sure')}
              className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
            >
              <option value="tarih">Tamamlanma Tarihine Göre</option>
              <option value="urun">Ürün Sayısına Göre</option>
              <option value="sure">Tamamlanma Süresine Göre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sayım Listesi */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filtrelenmisSayimlar.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <FiCheckCircle className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {aramaMetni ? 'Arama Sonucu Bulunamadı' : 'Tamamlanan Sayım Yok'}
            </h3>
            <p className="text-gray-500">
              {aramaMetni 
                ? 'Farklı arama kriterleri deneyebilirsiniz.'
                : 'Henüz tamamlanmış sayım bulunmamaktadır.'}
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
                  href={`/depocu/tamamlanan/${sayim.id}`}
                  className="block hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <FiCheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-green-600">
                              {sayim.sayimNo}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Tamamlandı
                            </span>
                          </div>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {sayim.sayimAdi}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <FiCalendar className="h-4 w-4 mr-1" />
                              {formatTarih(sayim.tamamlanmaTarihi || sayim.tarih)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <FiBox className="h-4 w-4 mr-1" />
                              {sayim.urunler.length} Ürün
                            </div>
                            {sayim.tamamlanmaTarihi && (
                              <div className="flex items-center text-sm text-gray-500">
                                <FiClock className="h-4 w-4 mr-1" />
                                {hesaplaSure(sayim.tarih, sayim.tamamlanmaTarihi)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-lg text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                          Detayları Gör
                          <FiCheckCircle className="ml-2 h-4 w-4" />
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