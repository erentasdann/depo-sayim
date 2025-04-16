'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiBox, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import { MalKabulKarti } from '@/types';

export default function MalKabulListesi() {
  const [malKabuller, setMalKabuller] = useState<MalKabulKarti[]>([]);
  const [filtrelenmisListe, setFiltrelenmisListe] = useState<MalKabulKarti[]>([]);
  const [aramaMetni, setAramaMetni] = useState('');
  const [durum, setDurum] = useState<'hepsi' | 'beklemede' | 'tamamlandi'>('hepsi');

  useEffect(() => {
    const malKabulleriYukle = () => {
      try {
        const storageData = localStorage.getItem('malKabuller');
        if (storageData) {
          const veriler = JSON.parse(storageData).map((mk: any) => ({
            ...mk,
            tarih: new Date(mk.tarih),
            tamamlanmaTarihi: mk.tamamlanmaTarihi ? new Date(mk.tamamlanmaTarihi) : undefined
          }));
          setMalKabuller(veriler);
          setFiltrelenmisListe(veriler);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };

    malKabulleriYukle();
  }, []);

  useEffect(() => {
    let sonuclar = [...malKabuller];

    if (aramaMetni) {
      sonuclar = sonuclar.filter(mk =>
        mk.malKabulNo.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        mk.tedarikciUnvani.toLowerCase().includes(aramaMetni.toLowerCase())
      );
    }

    if (durum !== 'hepsi') {
      sonuclar = sonuclar.filter(mk => mk.durum === durum);
    }

    sonuclar.sort((a, b) => b.tarih.getTime() - a.tarih.getTime());
    setFiltrelenmisListe(sonuclar);
  }, [malKabuller, aramaMetni, durum]);

  const formatTarih = (tarih: Date) => {
    return tarih.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      {/* Başlık ve Yeni Ekle */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mal Kabul Listesi</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tüm mal kabul işlemlerini görüntüleyin ve yönetin
          </p>
        </div>
        <Link
          href="/yonetici/mal-kabul"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <FiPlus className="mr-2 -ml-1 h-5 w-5" />
          Yeni Mal Kabul
        </Link>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mal kabul no veya tedarikçi ara..."
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="h-5 w-5 text-gray-400" />
            <select
              value={durum}
              onChange={(e) => setDurum(e.target.value as 'hepsi' | 'beklemede' | 'tamamlandi')}
              className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hepsi">Tüm Durumlar</option>
              <option value="beklemede">Bekleyenler</option>
              <option value="tamamlandi">Tamamlananlar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filtrelenmisListe.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <FiBox className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {aramaMetni ? 'Arama Sonucu Bulunamadı' : 'Mal Kabul Kaydı Yok'}
            </h3>
            <p className="text-gray-500">
              {aramaMetni 
                ? 'Farklı arama kriterleri deneyebilirsiniz.'
                : 'Yeni bir mal kabul kaydı oluşturmak için yukarıdaki butonu kullanın.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mal Kabul No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tedarikçi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtrelenmisListe.map((malKabul) => (
                  <tr key={malKabul.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{malKabul.malKabulNo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{malKabul.tedarikciUnvani}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatTarih(malKabul.tarih)}</div>
                      {malKabul.tamamlanmaTarihi && (
                        <div className="text-xs text-gray-400">
                          Tamamlanma: {formatTarih(malKabul.tamamlanmaTarihi)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {malKabul.urunler.length} ürün
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        malKabul.durum === 'tamamlandi'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {malKabul.durum === 'tamamlandi' ? 'Tamamlandı' : 'Beklemede'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/yonetici/mal-kabul/${malKabul.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {malKabul.durum === 'tamamlandi' ? 'Rapor' : 'Detay'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 