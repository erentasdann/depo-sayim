'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SayimKarti } from '@/types';

export type Bildirim = {
  id: string;
  tip: 'yeni' | 'tamamlandi' | 'eksik' | 'fazla';
  mesaj: string;
  tarih: Date;
  okundu: boolean;
  detayUrl?: string;
};

export default function Bildirimler() {
  const [bildirimler, setBildirimler] = useState<Bildirim[]>([]);
  const [acik, setAcik] = useState(false);
  const [okunmamisSayisi, setOkunmamisSayisi] = useState(0);

  useEffect(() => {
    // LocalStorage'dan sayımları kontrol et ve bildirimleri oluştur
    const bildirimleriKontrolEt = () => {
      const storageData = localStorage.getItem('sayimlar');
      if (!storageData) return;

      const sayimlar: SayimKarti[] = JSON.parse(storageData).map((s: any) => ({
        ...s,
        tarih: new Date(s.tarih),
        tamamlanmaTarihi: s.tamamlanmaTarihi ? new Date(s.tamamlanmaTarihi) : undefined
      }));

      const mevcutBildirimler = JSON.parse(localStorage.getItem('bildirimler') || '[]');
      const yeniBildirimler: Bildirim[] = [];

      // Son 24 saat içindeki yeni sayımları kontrol et
      const sonYirmiDortSaat = new Date();
      sonYirmiDortSaat.setHours(sonYirmiDortSaat.getHours() - 24);

      sayimlar.forEach(sayim => {
        // Yeni sayımlar
        if (new Date(sayim.tarih) > sonYirmiDortSaat && !mevcutBildirimler.find((b: Bildirim) => b.id === `yeni-${sayim.id}`)) {
          yeniBildirimler.push({
            id: `yeni-${sayim.id}`,
            tip: 'yeni',
            mesaj: `Yeni sayım oluşturuldu: ${sayim.sayimAdi}`,
            tarih: new Date(sayim.tarih),
            okundu: false,
            detayUrl: `/yonetici/sayimlar/${sayim.id}`
          });
        }

        // Tamamlanan sayımlar
        if (sayim.durum === 'tamamlandi' && sayim.tamamlanmaTarihi && 
            new Date(sayim.tamamlanmaTarihi) > sonYirmiDortSaat && 
            !mevcutBildirimler.find((b: Bildirim) => b.id === `tamamlandi-${sayim.id}`)) {
          yeniBildirimler.push({
            id: `tamamlandi-${sayim.id}`,
            tip: 'tamamlandi',
            mesaj: `Sayım tamamlandı: ${sayim.sayimAdi}`,
            tarih: new Date(sayim.tamamlanmaTarihi),
            okundu: false,
            detayUrl: `/yonetici/sayimlar/${sayim.id}`
          });

          // Eksik ve fazla ürün kontrolleri
          let eksikUrunler = 0;
          let fazlaUrunler = 0;

          sayim.urunler.forEach(urun => {
            const fark = (urun.sayilanAdet || 0) - urun.beklenenAdet;
            if (fark < 0) eksikUrunler++;
            if (fark > 0) fazlaUrunler++;
          });

          if (eksikUrunler > 0) {
            yeniBildirimler.push({
              id: `eksik-${sayim.id}`,
              tip: 'eksik',
              mesaj: `${sayim.sayimAdi}: ${eksikUrunler} üründe eksik tespit edildi`,
              tarih: new Date(sayim.tamamlanmaTarihi),
              okundu: false,
              detayUrl: `/yonetici/sayimlar/${sayim.id}`
            });
          }

          if (fazlaUrunler > 0) {
            yeniBildirimler.push({
              id: `fazla-${sayim.id}`,
              tip: 'fazla',
              mesaj: `${sayim.sayimAdi}: ${fazlaUrunler} üründe fazla tespit edildi`,
              tarih: new Date(sayim.tamamlanmaTarihi),
              okundu: false,
              detayUrl: `/yonetici/sayimlar/${sayim.id}`
            });
          }
        }
      });

      // Yeni bildirimleri mevcut bildirimlerle birleştir
      const tumBildirimler = [...mevcutBildirimler, ...yeniBildirimler]
        .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime())
        .slice(0, 50); // Son 50 bildirimi tut

      localStorage.setItem('bildirimler', JSON.stringify(tumBildirimler));
      setBildirimler(tumBildirimler);
      setOkunmamisSayisi(tumBildirimler.filter(b => !b.okundu).length);
    };

    bildirimleriKontrolEt();
    const interval = setInterval(bildirimleriKontrolEt, 60000); // Her dakika kontrol et

    return () => clearInterval(interval);
  }, []);

  const bildirimOku = (bildirimId: string) => {
    const guncelBildirimler = bildirimler.map(b => 
      b.id === bildirimId ? { ...b, okundu: true } : b
    );
    setBildirimler(guncelBildirimler);
    localStorage.setItem('bildirimler', JSON.stringify(guncelBildirimler));
    setOkunmamisSayisi(guncelBildirimler.filter(b => !b.okundu).length);
  };

  const tumunuOku = () => {
    const guncelBildirimler = bildirimler.map(b => ({ ...b, okundu: true }));
    setBildirimler(guncelBildirimler);
    localStorage.setItem('bildirimler', JSON.stringify(guncelBildirimler));
    setOkunmamisSayisi(0);
  };

  const formatTarih = (tarih: Date) => {
    const simdi = new Date();
    const fark = simdi.getTime() - new Date(tarih).getTime();
    const dakika = Math.floor(fark / 60000);
    const saat = Math.floor(dakika / 60);
    const gun = Math.floor(saat / 24);

    if (dakika < 60) return `${dakika} dakika önce`;
    if (saat < 24) return `${saat} saat önce`;
    return `${gun} gün önce`;
  };

  const getBildirimRenk = (tip: Bildirim['tip']) => {
    switch (tip) {
      case 'yeni': return 'bg-blue-50 text-blue-800';
      case 'tamamlandi': return 'bg-green-50 text-green-800';
      case 'eksik': return 'bg-red-50 text-red-800';
      case 'fazla': return 'bg-yellow-50 text-yellow-800';
      default: return 'bg-gray-50 text-gray-800';
    }
  };

  const getBildirimIcon = (tip: Bildirim['tip']) => {
    switch (tip) {
      case 'yeni':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'tamamlandi':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'eksik':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      case 'fazla':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Bildirim Butonu */}
      <button
        onClick={() => setAcik(!acik)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {okunmamisSayisi > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {okunmamisSayisi}
          </span>
        )}
      </button>

      {/* Bildirim Paneli */}
      <AnimatePresence>
        {acik && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Bildirimler</h3>
                {okunmamisSayisi > 0 && (
                  <button
                    onClick={tumunuOku}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Tümünü Okundu İşaretle
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {bildirimler.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Bildirim bulunmamaktadır
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {bildirimler.map((bildirim) => (
                    <div
                      key={bildirim.id}
                      className={`p-4 ${!bildirim.okundu ? 'bg-gray-50' : ''} hover:bg-gray-100 transition-colors duration-200`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 ${getBildirimRenk(bildirim.tip)} p-2 rounded-lg`}>
                          {getBildirimIcon(bildirim.tip)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {bildirim.mesaj}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTarih(bildirim.tarih)}
                          </p>
                        </div>
                        {!bildirim.okundu && (
                          <button
                            onClick={() => bildirimOku(bildirim.id)}
                            className="ml-3 text-sm text-blue-600 hover:text-blue-800"
                          >
                            Okundu İşaretle
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 