'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiBox, FiCalendar, FiClock, FiCheckCircle, FiAlertTriangle, FiX, FiPrinter } from 'react-icons/fi';
import { MalKabulKarti, MalKabulUrun, MalKabulWithSayim, MalKabulUrunWithSayim } from '@/types';

export default function MalKabulDetay() {
  const params = useParams();
  const router = useRouter();
  const [malKabul, setMalKabul] = useState<MalKabulWithSayim | null>(null);
  const [istatistikler, setIstatistikler] = useState({
    toplamUrun: 0,
    tamamlanan: 0,
    eksik: 0,
    fazla: 0
  });

  useEffect(() => {
    const malKabulYukle = () => {
      try {
        const storageData = localStorage.getItem('malKabuller');
        if (storageData) {
          const tumMalKabuller = JSON.parse(storageData);
          const mevcutMalKabul = tumMalKabuller.find((mk: MalKabulKarti) => mk.id === params.id);
          if (mevcutMalKabul) {
            // Convert MalKabulUrun to MalKabulUrunWithSayim
            const guncelUrunler: MalKabulUrunWithSayim[] = mevcutMalKabul.urunler.map((urun: MalKabulUrun) => ({
              ...urun,
              kod: urun.urunKodu,
              sayilanAdet: 0,
              sonSayimTarihi: undefined
            }));

            const guncelMalKabul: MalKabulWithSayim = {
              ...mevcutMalKabul,
              urunler: guncelUrunler,
              tarih: new Date(mevcutMalKabul.tarih),
              tamamlandi: mevcutMalKabul.durum === 'tamamlandi',
              tamamlanmaTarihi: mevcutMalKabul.tamamlanmaTarihi ? new Date(mevcutMalKabul.tamamlanmaTarihi) : new Date()
            };

            setMalKabul(guncelMalKabul);

            // İstatistikleri hesapla
            let tamamlanan = 0;
            let eksik = 0;
            let fazla = 0;

            guncelUrunler.forEach((urun) => {
              if (urun.sayilanAdet === urun.beklenenAdet) tamamlanan++;
              if (urun.sayilanAdet < urun.beklenenAdet) eksik++;
              if (urun.sayilanAdet > urun.beklenenAdet) fazla++;
            });

            setIstatistikler({
              toplamUrun: guncelUrunler.length,
              tamamlanan,
              eksik,
              fazla
            });
          }
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };

    malKabulYukle();
  }, [params.id]);

  const formatTarih = (tarih: Date) => {
    return tarih.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDurumRengi = (sayilan: number | undefined, beklenen: number) => {
    if (sayilan === undefined) return 'bg-gray-100 text-gray-600';
    if (sayilan === beklenen) return 'bg-green-100 text-green-600';
    if (sayilan < beklenen) return 'bg-red-100 text-red-600';
    return 'bg-yellow-100 text-yellow-600';
  };

  const getDurumMetni = (sayilan: number | undefined, beklenen: number) => {
    if (sayilan === undefined) return 'Sayılmadı';
    if (sayilan === beklenen) return 'Tamam';
    if (sayilan < beklenen) return `Eksik (-${beklenen - sayilan})`;
    return `Fazla (+${sayilan - beklenen})`;
  };

  const raporuYazdir = () => {
    window.print();
  };

  if (!malKabul) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Yükleniyor...</h2>
          <p>Mal kabul bilgileri yükleniyor, lütfen bekleyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 print:bg-white print:shadow-none">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white print:text-gray-900 mb-2">{malKabul.malKabulNo}</h1>
            <p className="text-blue-100 print:text-gray-600">Tedarikçi: {malKabul.tedarikciUnvani}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-4 py-2 rounded-lg ${
              malKabul.durum === 'tamamlandi' 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-white'
            } print:bg-white print:text-gray-900 print:border print:border-gray-300`}>
              <FiBox className="mr-2 h-5 w-5" />
              {malKabul.durum === 'tamamlandi' ? 'Tamamlandı' : 'Beklemede'}
            </span>
            <button
              onClick={raporuYazdir}
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors print:hidden"
            >
              <FiPrinter className="mr-2 h-5 w-5" />
              Yazdır
            </button>
          </div>
        </div>
      </div>

      {/* Mal Kabul Bilgileri */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiCalendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mal Kabul Tarihi</p>
              <p className="font-medium">{formatTarih(malKabul.tarih)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FiBox className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Toplam Ürün</p>
              <p className="font-medium">{malKabul.urunler.length} ürün</p>
            </div>
          </div>

          {malKabul.tamamlanmaTarihi && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FiCheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tamamlanma Tarihi</p>
                <p className="font-medium">{formatTarih(malKabul.tamamlanmaTarihi)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiBox className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-sm text-gray-500">Toplam Ürün</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{istatistikler.toplamUrun}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiCheckCircle className="h-6 w-6 text-green-600" />
              <span className="ml-2 text-sm text-gray-500">Tamamlanan</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{istatistikler.tamamlanan}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiX className="h-6 w-6 text-red-600" />
              <span className="ml-2 text-sm text-gray-500">Eksik</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{istatistikler.eksik}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiAlertTriangle className="h-6 w-6 text-yellow-600" />
              <span className="ml-2 text-sm text-gray-500">Fazla</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{istatistikler.fazla}</span>
          </div>
        </div>
      </div>

      {/* Not */}
      {malKabul.not && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Not</h2>
          <p className="text-gray-600">{malKabul.not}</p>
        </div>
      )}

      {/* Ürün Listesi */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün Kodu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beklenen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sayılan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Sayım
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {malKabul.urunler.map((urun) => (
                <tr key={urun.urunKodu} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {urun.kod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {urun.urunAdi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {urun.beklenenAdet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {urun.sayilanAdet ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {urun.sonSayimTarihi ? new Date(urun.sonSayimTarihi).toLocaleTimeString('tr-TR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getDurumRengi(urun.sayilanAdet, urun.beklenenAdet)
                    }`}>
                      {getDurumMetni(urun.sayilanAdet, urun.beklenenAdet)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 