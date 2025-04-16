'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SayimKarti } from '@/types';

export default function TumSayimlarSayfasi() {
  const [sayimlar, setSayimlar] = useState<SayimKarti[]>([]);
  const [filtrelemeDurum, setFiltrelemeDurum] = useState<'hepsi' | 'beklemede' | 'tamamlandi'>('hepsi');
  const [aramaMetni, setAramaMetni] = useState('');
  const [siralama, setSiralama] = useState<'tarih-yeni' | 'tarih-eski'>('tarih-yeni');

  useEffect(() => {
    // localStorage'dan sayımları yükle
    if (typeof window !== 'undefined') {
      const storageData = localStorage.getItem('sayimlar');
      if (storageData) {
        const yuklenenSayimlar = JSON.parse(storageData).map((sayim: any) => ({
          ...sayim,
          tarih: new Date(sayim.tarih),
          tamamlanmaTarihi: sayim.tamamlanmaTarihi ? new Date(sayim.tamamlanmaTarihi) : undefined
        }));
        setSayimlar(yuklenenSayimlar);
      }
    }
  }, []);

  // Filtreleme ve sıralama fonksiyonu
  const filtrelenmisVeSiralanmisSayimlar = () => {
    let sonuc = [...sayimlar];

    // Durum filtreleme
    if (filtrelemeDurum !== 'hepsi') {
      sonuc = sonuc.filter(sayim => sayim.durum === filtrelemeDurum);
    }

    // Arama metni filtreleme
    if (aramaMetni) {
      const aramaMetniKucuk = aramaMetni.toLowerCase();
      sonuc = sonuc.filter(sayim => 
        sayim.sayimNo.toLowerCase().includes(aramaMetniKucuk) ||
        sayim.sayimAdi.toLowerCase().includes(aramaMetniKucuk)
      );
    }

    // Tarihe göre sıralama
    sonuc.sort((a, b) => {
      const tarihA = a.tamamlanmaTarihi || a.tarih;
      const tarihB = b.tamamlanmaTarihi || b.tarih;
      return siralama === 'tarih-yeni' 
        ? tarihB.getTime() - tarihA.getTime()
        : tarihA.getTime() - tarihB.getTime();
    });

    return sonuc;
  };

  const formatTarih = (tarih: Date) => {
    return tarih.toLocaleDateString('tr-TR');
  };

  const filtrelenmisListe = filtrelenmisVeSiralanmisSayimlar();

  return (
    <div className="space-y-6">
      <div className="bg-white px-6 py-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Tüm Sayımlar</h1>
        <p className="text-gray-600 mt-2">
          Sistemdeki tüm sayımları görüntüleyin ve yönetin.
        </p>
      </div>

      {/* Filtreleme ve Arama */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="durum" className="block text-sm font-medium text-gray-700 mb-1">
              Durum
            </label>
            <select
              id="durum"
              value={filtrelemeDurum}
              onChange={(e) => setFiltrelemeDurum(e.target.value as any)}
              className="input-field"
            >
              <option value="hepsi">Hepsi</option>
              <option value="beklemede">Beklemede</option>
              <option value="tamamlandi">Tamamlandı</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="siralama" className="block text-sm font-medium text-gray-700 mb-1">
              Sıralama
            </label>
            <select
              id="siralama"
              value={siralama}
              onChange={(e) => setSiralama(e.target.value as any)}
              className="input-field"
            >
              <option value="tarih-yeni">En Yeni</option>
              <option value="tarih-eski">En Eski</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="arama" className="block text-sm font-medium text-gray-700 mb-1">
              Arama
            </label>
            <input
              type="text"
              id="arama"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              placeholder="Sayım no veya adı ile ara..."
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Sayım Listesi */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow overflow-hidden sm:rounded-lg"
      >
        {filtrelenmisListe.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg">Sayım bulunamadı</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sayım No / Ad
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün Sayısı
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtrelenmisListe.map((sayim) => (
                <tr key={sayim.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-blue-600">
                      {sayim.sayimNo}
                    </div>
                    <div className="text-sm text-gray-900">
                      {sayim.sayimAdi}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTarih(sayim.tamamlanmaTarihi || sayim.tarih)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sayim.urunler.length} ürün
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sayim.durum === 'tamamlandi' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sayim.durum === 'tamamlandi' ? 'Tamamlandı' : 'Beklemede'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/yonetici/sayimlar/${sayim.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {sayim.durum === 'tamamlandi' ? 'Rapor' : 'Detay'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
} 