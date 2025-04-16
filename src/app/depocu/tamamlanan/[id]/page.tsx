'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SayimKarti, Urun } from '@/types';
import { FiBox, FiCalendar, FiClock, FiCheckCircle, FiAlertTriangle, FiX } from 'react-icons/fi';

interface UrunSayimDetay extends Urun {
  sayilanAdet: number;
}

export default function TamamlananSayimDetay() {
  const params = useParams();
  const [sayim, setSayim] = useState<(SayimKarti & { urunler: UrunSayimDetay[] }) | null>(null);
  const [istatistikler, setIstatistikler] = useState({
    toplamUrun: 0,
    tamamlanan: 0,
    eksik: 0,
    fazla: 0
  });

  useEffect(() => {
    const sayimiYukle = () => {
      try {
        const storageData = localStorage.getItem('sayimlar');
        if (storageData) {
          const tumSayimlar = JSON.parse(storageData);
          const mevcutSayim = tumSayimlar.find((s: any) => s.id === params.id);
          if (mevcutSayim) {
            // Sayılan adet undefined ise 0 olarak ayarla
            const guncelUrunler = mevcutSayim.urunler.map((urun: Urun) => ({
              ...urun,
              sayilanAdet: urun.sayilanAdet || 0
            }));

            setSayim({
              ...mevcutSayim,
              urunler: guncelUrunler,
              tarih: new Date(mevcutSayim.tarih),
              tamamlanmaTarihi: mevcutSayim.tamamlanmaTarihi ? new Date(mevcutSayim.tamamlanmaTarihi) : undefined
            });

            // İstatistikleri hesapla
            let tamamlanan = 0;
            let eksik = 0;
            let fazla = 0;

            guncelUrunler.forEach((urun: UrunSayimDetay) => {
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

    sayimiYukle();
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

  const getDurumRengi = (sayilan: number, beklenen: number) => {
    if (sayilan === beklenen) return 'bg-green-100 text-green-600';
    if (sayilan < beklenen) return 'bg-red-100 text-red-600';
    return 'bg-yellow-100 text-yellow-600';
  };

  if (!sayim) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiBox className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sayım Bulunamadı</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{sayim.sayimAdi}</h1>
            <p className="text-green-100">Sayım No: {sayim.sayimNo}</p>
          </div>
          <span className="inline-flex items-center px-4 py-2 rounded-lg bg-green-500 text-white">
            <FiCheckCircle className="mr-2 h-5 w-5" />
            Tamamlandı
          </span>
        </div>
      </div>

      {/* Sayım Bilgileri */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiCalendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Başlangıç Tarihi</p>
              <p className="font-medium">{formatTarih(sayim.tarih)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tamamlanma Tarihi</p>
              <p className="font-medium">{sayim.tamamlanmaTarihi ? formatTarih(sayim.tamamlanmaTarihi) : '-'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FiClock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tamamlanma Süresi</p>
              <p className="font-medium">
                {sayim.tamamlanmaTarihi ? hesaplaSure(sayim.tarih, sayim.tamamlanmaTarihi) : '-'}
              </p>
            </div>
          </div>
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
                  Fark
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sayim.urunler.map((urun: UrunSayimDetay) => {
                const fark = urun.sayilanAdet - urun.beklenenAdet;
                return (
                  <tr key={urun.id} className="hover:bg-gray-50">
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
                      {urun.sayilanAdet}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fark === 0 ? '-' : fark > 0 ? `+${fark}` : fark}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getDurumRengi(urun.sayilanAdet, urun.beklenenAdet)
                      }`}>
                        {urun.sayilanAdet === urun.beklenenAdet ? 'Tamam' :
                         urun.sayilanAdet < urun.beklenenAdet ? 'Eksik' : 'Fazla'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 