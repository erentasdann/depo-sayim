'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiBox, FiClock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { MalKabulKarti } from '@/types';

export default function DepocuMalKabulListesi() {
  const [bekleyenMalKabuller, setBekleyenMalKabuller] = useState<MalKabulKarti[]>([]);
  const [tamamlananMalKabuller, setTamamlananMalKabuller] = useState<MalKabulKarti[]>([]);

  useEffect(() => {
    const malKabulleriYukle = () => {
      try {
        const storageData = localStorage.getItem('malKabuller');
        if (storageData) {
          const tumMalKabuller = JSON.parse(storageData).map((mk: any) => ({
            ...mk,
            tarih: new Date(mk.tarih),
            tamamlanmaTarihi: mk.tamamlanmaTarihi ? new Date(mk.tamamlanmaTarihi) : undefined
          }));

          // Bekleyen ve tamamlanan mal kabulleri ayır
          const bekleyenler = tumMalKabuller.filter((mk: MalKabulKarti) => mk.durum === 'beklemede');
          const tamamlananlar = tumMalKabuller.filter((mk: MalKabulKarti) => mk.durum === 'tamamlandi');

          // Tarihe göre sırala (en yeniler üstte)
          bekleyenler.sort((a: MalKabulKarti, b: MalKabulKarti) => b.tarih.getTime() - a.tarih.getTime());
          tamamlananlar.sort((a: MalKabulKarti, b: MalKabulKarti) => 
            (b.tamamlanmaTarihi?.getTime() ?? 0) - (a.tamamlanmaTarihi?.getTime() ?? 0)
          );

          setBekleyenMalKabuller(bekleyenler);
          setTamamlananMalKabuller(tamamlananlar);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };

    malKabulleriYukle();
  }, []);

  const formatTarih = (tarih: Date) => {
    return tarih.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hesaplaSure = (baslangic: Date) => {
    const fark = new Date().getTime() - baslangic.getTime();
    const dakika = Math.floor(fark / (1000 * 60));
    const saat = Math.floor(dakika / 60);
    const gun = Math.floor(saat / 24);

    if (gun > 0) return `${gun} gün önce`;
    if (saat > 0) return `${saat} saat önce`;
    return `${dakika} dakika önce`;
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mal Kabul İşlemleri</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bekleyen ve tamamlanan mal kabul işlemlerini görüntüleyin
          </p>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <FiClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bekleyen Mal Kabul</p>
                <p className="text-2xl font-bold text-gray-900">{bekleyenMalKabuller.length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tamamlanan Mal Kabul</p>
                <p className="text-2xl font-bold text-gray-900">{tamamlananMalKabuller.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bekleyen Mal Kabuller */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Bekleyen Mal Kabuller</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sayım bekleyen mal kabul işlemleri
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {bekleyenMalKabuller.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Bekleyen mal kabul işlemi bulunmuyor
            </div>
          ) : (
            bekleyenMalKabuller.map((malKabul) => (
              <Link 
                key={malKabul.id}
                href={`/depocu/mal-kabul/${malKabul.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FiBox className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{malKabul.malKabulNo}</p>
                        <p className="text-sm text-gray-500">{malKabul.tedarikciUnvani}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{formatTarih(malKabul.tarih)}</p>
                        <p className="text-sm text-gray-500">{hesaplaSure(malKabul.tarih)}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {malKabul.urunler.length} ürün
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Son Tamamlanan Mal Kabuller */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Son Tamamlanan Mal Kabuller</h2>
          <p className="mt-1 text-sm text-gray-500">
            Son tamamlanan mal kabul işlemleri
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {tamamlananMalKabuller.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Tamamlanan mal kabul işlemi bulunmuyor
            </div>
          ) : (
            tamamlananMalKabuller.slice(0, 5).map((malKabul) => (
              <Link
                key={malKabul.id}
                href={`/depocu/mal-kabul/${malKabul.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <FiCheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{malKabul.malKabulNo}</p>
                        <p className="text-sm text-gray-500">{malKabul.tedarikciUnvani}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          {malKabul.tamamlanmaTarihi ? formatTarih(malKabul.tamamlanmaTarihi) : '-'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {malKabul.tamamlanmaTarihi ? hesaplaSure(malKabul.tamamlanmaTarihi) : '-'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Detay
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 