'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SayimKarti } from '@/types';

export default function SayimDetaySayfasi() {
  const params = useParams();
  const router = useRouter();
  const [sayim, setSayim] = useState<SayimKarti | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    // localStorage'dan sayımı yükle
    if (typeof window !== 'undefined') {
      const storageData = localStorage.getItem('sayimlar');
      if (storageData) {
        const sayimlar = JSON.parse(storageData).map((s: any) => ({
          ...s,
          tarih: new Date(s.tarih),
          tamamlanmaTarihi: s.tamamlanmaTarihi ? new Date(s.tamamlanmaTarihi) : undefined
        }));
        
        const bulunanSayim = sayimlar.find((s: SayimKarti) => s.id === params.id);
        if (bulunanSayim) {
          setSayim(bulunanSayim);
        }
      }
      setYukleniyor(false);
    }
  }, [params.id]);

  const formatTarih = (tarih: Date) => {
    return tarih.toLocaleDateString('tr-TR');
  };

  if (yukleniyor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!sayim) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Sayım Bulunamadı</h1>
        <p className="text-gray-600 mb-4">
          Aradığınız sayım kaydına ulaşılamadı.
        </p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white px-6 py-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sayim.sayimAdi}</h1>
            <p className="text-gray-600 mt-1">Sayım No: {sayim.sayimNo}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            sayim.durum === 'tamamlandi' 
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {sayim.durum === 'tamamlandi' ? 'Tamamlandı' : 'Beklemede'}
          </span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow overflow-hidden sm:rounded-lg"
      >
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Sayım Detayları
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Oluşturan Kullanıcı</dt>
              <dd className="mt-1 text-sm text-gray-900">{sayim.olusturanKullanici}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Oluşturma Tarihi</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatTarih(sayim.tarih)}</dd>
            </div>
            {sayim.durum === 'tamamlandi' && (
              <>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Tamamlayan Kullanıcı</dt>
                  <dd className="mt-1 text-sm text-gray-900">{sayim.tamamlayanKullanici}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Tamamlanma Tarihi</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {sayim.tamamlanmaTarihi ? formatTarih(sayim.tamamlanmaTarihi) : '-'}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </motion.div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Ürün Listesi
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Toplam {sayim.urunler.length} ürün
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün Kodu
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beklenen Adet
                </th>
                {sayim.durum === 'tamamlandi' && (
                  <>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sayılan Adet
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fark
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sayim.urunler.map((urun) => {
                const fark = sayim.durum === 'tamamlandi' 
                  ? (urun.sayilanAdet || 0) - urun.beklenenAdet
                  : 0;
                
                return (
                  <tr key={urun.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {urun.kod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {urun.beklenenAdet}
                    </td>
                    {sayim.durum === 'tamamlandi' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {urun.sayilanAdet || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full font-medium ${
                            fark === 0
                              ? 'bg-blue-100 text-blue-800'
                              : fark > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {fark === 0 ? 'Doğru' : fark > 0 ? `+${fark}` : fark}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Geri Dön
        </button>
        {sayim.durum === 'tamamlandi' && (
          <button
            onClick={() => router.push('/yonetici/raporlar')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
          >
            Raporlara Git
          </button>
        )}
      </div>
    </div>
  );
} 