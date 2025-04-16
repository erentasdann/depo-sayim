'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SayimKarti } from '@/types';
import { FiBox, FiBarChart2, FiCheck, FiX, FiAlertTriangle, FiPackage } from 'react-icons/fi';

interface UrunSayim {
  id: string;
  kod: string;
  urunAdi: string;
  beklenenAdet: number;
  sayilanAdet: number;
  sonSayimTarihi?: Date;
}

export default function SayimDetay() {
  const params = useParams();
  const [sayim, setSayim] = useState<SayimKarti | null>(null);
  const [urunler, setUrunler] = useState<UrunSayim[]>([]);
  const [barkod, setBarkod] = useState('');
  const [adet, setAdet] = useState<number>(1);
  const [sonIslem, setSonIslem] = useState<{
    urun?: UrunSayim;
    durum: 'basarili' | 'hata' | 'uyari';
    mesaj: string;
  } | null>(null);
  const barkodInputRef = useRef<HTMLInputElement>(null);
  const adetInputRef = useRef<HTMLInputElement>(null);
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
            setSayim(mevcutSayim);
            setUrunler(mevcutSayim.urunler.map((urun: any) => ({
              ...urun,
              sayilanAdet: 0,
              sonSayimTarihi: undefined
            })));
            setIstatistikler({
              toplamUrun: mevcutSayim.urunler.length,
              tamamlanan: 0,
              eksik: 0,
              fazla: 0
            });
          }
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };

    sayimiYukle();
  }, [params.id]);

  useEffect(() => {
    // Sayfa yüklendiğinde adet input'una odaklan
    if (adetInputRef.current) {
      adetInputRef.current.focus();
    }
  }, []);

  const handleBarkodOkuma = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barkod.trim() || adet <= 0) return;

    const urun = urunler.find(u => u.kod === barkod);
    
    if (urun) {
      const yeniUrunler = urunler.map(u => {
        if (u.kod === barkod) {
          return {
            ...u,
            sayilanAdet: u.sayilanAdet + adet,
            sonSayimTarihi: new Date()
          };
        }
        return u;
      });

      setUrunler(yeniUrunler);
      setSonIslem({
        urun,
        durum: 'basarili',
        mesaj: `${urun.kod} - ${urun.urunAdi} sayıldı (${adet} adet, Toplam: ${urun.sayilanAdet + adet}/${urun.beklenenAdet})`
      });

      // İstatistikleri güncelle
      const istatistik = hesaplaIstatistikler(yeniUrunler);
      setIstatistikler(istatistik);
    } else {
      setSonIslem({
        durum: 'hata',
        mesaj: `Barkod bulunamadı: ${barkod}`
      });
    }

    setBarkod('');
    setAdet(1);
    if (adetInputRef.current) {
      adetInputRef.current.focus();
      adetInputRef.current.select();
    }
  };

  const handleAdetGiris = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (barkodInputRef.current) {
        barkodInputRef.current.focus();
      }
    }
  };

  const hesaplaIstatistikler = (guncelUrunler: UrunSayim[]) => {
    let tamamlanan = 0;
    let eksik = 0;
    let fazla = 0;

    guncelUrunler.forEach(urun => {
      if (urun.sayilanAdet === urun.beklenenAdet) tamamlanan++;
      if (urun.sayilanAdet < urun.beklenenAdet) eksik++;
      if (urun.sayilanAdet > urun.beklenenAdet) fazla++;
    });

    return {
      toplamUrun: guncelUrunler.length,
      tamamlanan,
      eksik,
      fazla
    };
  };

  const getDurumRengi = (sayilan: number, beklenen: number) => {
    if (sayilan === 0) return 'bg-gray-100 text-gray-600';
    if (sayilan < beklenen) return 'bg-red-100 text-red-600';
    if (sayilan > beklenen) return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  const sayimiTamamla = () => {
    try {
      const storageData = localStorage.getItem('sayimlar');
      if (storageData && sayim) {
        const tumSayimlar = JSON.parse(storageData);
        const guncelSayimlar = tumSayimlar.map((s: any) => {
          if (s.id === sayim.id) {
            return {
              ...s,
              durum: 'tamamlandi',
              tamamlanmaTarihi: new Date(),
              urunler: urunler.map(u => ({
                ...u,
                sayilanAdet: u.sayilanAdet
              }))
            };
          }
          return s;
        });
        
        localStorage.setItem('sayimlar', JSON.stringify(guncelSayimlar));
        window.location.href = '/depocu/tamamlanan';
      }
    } catch (error) {
      console.error('Sayım tamamlama hatası:', error);
    }
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">{sayim.sayimAdi}</h1>
        <p className="text-blue-100">Sayım No: {sayim.sayimNo}</p>
      </div>

      {/* Barkod Okuyucu ve Son İşlem */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleBarkodOkuma} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Adet Girişi */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPackage className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={adetInputRef}
                type="number"
                min="1"
                value={adet}
                onChange={(e) => setAdet(Number(e.target.value))}
                onKeyDown={handleAdetGiris}
                placeholder="Adet girin..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            {/* Barkod Girişi */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiBox className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={barkodInputRef}
                type="text"
                value={barkod}
                onChange={(e) => setBarkod(e.target.value)}
                placeholder="Barkodu okutun..."
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Oku
              </button>
            </div>
          </div>
        </form>

        {sonIslem && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-lg ${
              sonIslem.durum === 'basarili' ? 'bg-green-50 text-green-800' :
              sonIslem.durum === 'hata' ? 'bg-red-50 text-red-800' :
              'bg-yellow-50 text-yellow-800'
            }`}
          >
            {sonIslem.mesaj}
          </motion.div>
        )}
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
              <FiCheck className="h-6 w-6 text-green-600" />
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
                  Son Sayım
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {urunler.map((urun) => (
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
                    {urun.sonSayimTarihi ? new Date(urun.sonSayimTarihi).toLocaleTimeString('tr-TR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getDurumRengi(urun.sayilanAdet, urun.beklenenAdet)
                    }`}>
                      {urun.sayilanAdet === 0 ? 'Sayılmadı' :
                       urun.sayilanAdet < urun.beklenenAdet ? 'Eksik' :
                       urun.sayilanAdet > urun.beklenenAdet ? 'Fazla' : 'Tamam'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tamamla Butonu */}
      <div className="flex justify-end">
        <button
          onClick={sayimiTamamla}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Sayımı Tamamla
        </button>
      </div>
    </div>
  );
} 