'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiBox, FiCalendar, FiClock, FiCheckCircle, FiAlertTriangle, FiX, FiBarChart2 } from 'react-icons/fi';
import { MalKabulKarti, MalKabulUrun, MalKabulUrunWithSayim, MalKabulWithSayim } from '@/types';

export default function MalKabulSayim() {
  const params = useParams();
  const router = useRouter();
  const [malKabul, setMalKabul] = useState<MalKabulWithSayim | null>(null);
  const [sayilanAdet, setSayilanAdet] = useState<number>(1);
  const [barkod, setBarkod] = useState<string>('');
  const [sonIslem, setSonIslem] = useState<{
    urun: string;
    adet: number;
    tarih: Date;
  } | null>(null);
  const barkodInputRef = useRef<HTMLInputElement>(null);
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
            // Mevcut sayım verilerini koru
            const guncelUrunler: MalKabulUrunWithSayim[] = mevcutMalKabul.urunler.map((urun: any) => ({
              ...urun,
              kod: urun.urunKodu,
              id: urun.urunKodu,
              sayilanAdet: urun.sayilanAdet !== undefined ? urun.sayilanAdet : 0,
              sonSayimTarihi: urun.sonSayimTarihi ? new Date(urun.sonSayimTarihi) : undefined
            }));

            const guncelMalKabul: MalKabulWithSayim = {
              ...mevcutMalKabul,
              urunler: guncelUrunler,
              tarih: new Date(mevcutMalKabul.tarih),
              tamamlanmaTarihi: mevcutMalKabul.tamamlanmaTarihi ? new Date(mevcutMalKabul.tamamlanmaTarihi) : undefined,
              tamamlandi: mevcutMalKabul.tamamlandi || false,
              durum: mevcutMalKabul.durum || 'bekliyor'
            };

            setMalKabul(guncelMalKabul);

            // İstatistikleri hesapla
            istatistikleriGuncelle(guncelUrunler);
          }
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };

    malKabulYukle();
    // Sayfa yüklendiğinde barkod input'una odaklan
    if (barkodInputRef.current) {
      barkodInputRef.current.focus();
    }
  }, [params.id]);

  const istatistikleriGuncelle = (urunler: MalKabulUrunWithSayim[]) => {
    let tamamlanan = 0;
    let eksik = 0;
    let fazla = 0;

    urunler.forEach((urun) => {
      if (urun.sayilanAdet === urun.beklenenAdet) tamamlanan++;
      if (urun.sayilanAdet !== undefined && urun.sayilanAdet < urun.beklenenAdet) eksik++;
      if (urun.sayilanAdet !== undefined && urun.sayilanAdet > urun.beklenenAdet) fazla++;
    });

    setIstatistikler({
      toplamUrun: urunler.length,
      tamamlanan,
      eksik,
      fazla
    });
  };

  const handleBarkodOkutma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!malKabul || !barkod.trim()) return;

    const urun = malKabul.urunler.find(u => u.kod === barkod.trim());
    if (urun) {
      const guncelUrunler = malKabul.urunler.map(u => {
        if (u.kod === barkod.trim()) {
          return {
            ...u,
            sayilanAdet: (u.sayilanAdet || 0) + sayilanAdet,
            sonSayimTarihi: new Date()
          };
        }
        return u;
      });

      const guncelMalKabul: MalKabulWithSayim = {
        ...malKabul,
        urunler: guncelUrunler,
        tamamlandi: false,
        tamamlanmaTarihi: new Date()
      };

      // Local storage güncelle
      const storageData = localStorage.getItem('malKabuller');
      if (storageData) {
        const tumMalKabuller = JSON.parse(storageData);
        const guncelTumMalKabuller = tumMalKabuller.map((mk: MalKabulKarti) =>
          mk.id === malKabul.id ? guncelMalKabul : mk
        );
        localStorage.setItem('malKabuller', JSON.stringify(guncelTumMalKabuller));
      }

      setMalKabul(guncelMalKabul);
      istatistikleriGuncelle(guncelUrunler);
      setSonIslem({
        urun: urun.urunAdi,
        adet: sayilanAdet,
        tarih: new Date()
      });
      setBarkod('');
      setSayilanAdet(1);

      // Barkod input'una tekrar odaklan
      if (barkodInputRef.current) {
        barkodInputRef.current.focus();
      }
    } else {
      alert('Ürün bulunamadı!');
      setBarkod('');
      if (barkodInputRef.current) {
        barkodInputRef.current.focus();
      }
    }
  };

  const handleSayimTamamla = () => {
    if (!malKabul) return;

    // Tüm ürünlerin sayılıp sayılmadığını kontrol et
    const tumUrunlerSayildi = malKabul.urunler.every(urun => urun.sayilanAdet !== undefined);
    
    if (!tumUrunlerSayildi) {
      alert('Tüm ürünler sayılmadan mal kabul tamamlanamaz!');
      return;
    }

    const guncelMalKabul: MalKabulWithSayim = {
      ...malKabul,
      tamamlandi: true,
      tamamlanmaTarihi: new Date(),
      durum: 'tamamlandi' as const
    };

    // Local storage'ı güncelle
    const storageData = localStorage.getItem('malKabuller');
    if (storageData) {
      const tumMalKabuller = JSON.parse(storageData);
      const guncelTumMalKabuller = tumMalKabuller.map((mk: MalKabulKarti) =>
        mk.id === malKabul.id ? {
          ...mk,
          urunler: guncelMalKabul.urunler,
          tamamlandi: true,
          tamamlanmaTarihi: new Date(),
          durum: 'tamamlandi'
        } : mk
      );
      
      try {
        localStorage.setItem('malKabuller', JSON.stringify(guncelTumMalKabuller));
        setMalKabul(guncelMalKabul);
        router.push('/depocu/mal-kabul');
      } catch (error) {
        console.error('Mal kabul tamamlama hatası:', error);
        alert('Mal kabul tamamlanırken bir hata oluştu!');
      }
    }
  };

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
    if (sayilan === 0) return 'bg-blue-100 text-blue-600';
    if (sayilan < beklenen) return 'bg-red-100 text-red-600';
    return 'bg-yellow-100 text-yellow-600';
  };

  const getDurumMetni = (sayilan: number | undefined, beklenen: number) => {
    if (sayilan === undefined) return 'Sayılmadı';
    if (sayilan === beklenen) return 'Tamam';
    if (sayilan === 0) return 'Sıfır Sayıldı';
    if (sayilan < beklenen) return `Eksik (-${beklenen - sayilan})`;
    return `Fazla (+${sayilan - beklenen})`;
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

  // Eğer mal kabul tamamlanmışsa sadece detayları göster
  if (malKabul.durum === 'tamamlandi') {
    return (
      <div className="space-y-6">
        {/* Başlık */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{malKabul.malKabulNo}</h1>
              <p className="text-green-100">Tedarikçi: {malKabul.tedarikciUnvani}</p>
            </div>
            <span className="inline-flex items-center px-4 py-2 rounded-lg bg-green-500 text-white">
              <FiCheckCircle className="mr-2 h-5 w-5" />
              Tamamlandı
            </span>
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

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FiCheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tamamlanma Tarihi</p>
                <p className="font-medium">{formatTarih(malKabul.tamamlanmaTarihi!)}</p>
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
                    Son Sayım
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {malKabul.urunler.map((urun) => (
                  <tr key={`${malKabul.id}-${urun.kod}`} className="hover:bg-gray-50">
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

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{malKabul.malKabulNo}</h1>
            <p className="text-blue-100">Tedarikçi: {malKabul.tedarikciUnvani}</p>
          </div>
          <span className="inline-flex items-center px-4 py-2 rounded-lg bg-yellow-500 text-white">
            <FiBox className="mr-2 h-5 w-5" />
            Mal Kabul Sayımı
          </span>
        </div>
      </div>

      {/* Barkod Okutma Formu */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleBarkodOkutma} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barkod
              </label>
              <input
                ref={barkodInputRef}
                type="text"
                value={barkod}
                onChange={(e) => setBarkod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Barkod okutun veya girin"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adet
              </label>
              <input
                type="number"
                min="1"
                value={sayilanAdet}
                onChange={(e) => setSayilanAdet(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sayımı Kaydet
          </button>
        </form>

        {/* Son İşlem Bilgisi */}
        {sonIslem && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Son Sayım: {sonIslem.urun} - {sonIslem.adet} adet
                </p>
                <p className="text-xs text-green-600">
                  {new Date(sonIslem.tarih).toLocaleTimeString('tr-TR')}
                </p>
              </div>
            </div>
          </div>
        )}
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

          {malKabul.not && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FiClock className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Not</p>
                <p className="font-medium">{malKabul.not}</p>
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
                <tr key={`${malKabul.id}-${urun.kod}`} className="hover:bg-gray-50">
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

      {/* Tamamla Butonu */}
      <div className="flex justify-end">
        <button
          onClick={handleSayimTamamla}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Mal Kabul Sayımını Tamamla
        </button>
      </div>
    </div>
  );
} 