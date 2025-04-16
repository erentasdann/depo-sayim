'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus, FiSave, FiX, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { Urun, SayimKarti } from '@/types';

const inputClasses = "mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out text-base placeholder-gray-400 bg-white hover:border-blue-400";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

interface SeciliUrun extends Urun {
  beklenenAdet: number;
}

export default function YeniSayim() {
  const router = useRouter();
  const [urunler, setUrunler] = useState<Urun[]>([]);
  const [seciliUrunler, setSeciliUrunler] = useState<SeciliUrun[]>([]);
  const [sayimAdi, setSayimAdi] = useState('');
  const [aramaMetni, setAramaMetni] = useState('');
  const [showAramaSonuclari, setShowAramaSonuclari] = useState(false);
  const [bildirim, setBildirim] = useState<{mesaj: string; tip: 'basari' | 'hata'} | null>(null);

  useEffect(() => {
    const storedUrunler = localStorage.getItem('urunler');
    if (storedUrunler) {
      setUrunler(JSON.parse(storedUrunler));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (seciliUrunler.length === 0) {
      setBildirim({
        mesaj: 'Lütfen en az bir ürün seçin!',
        tip: 'hata'
      });
      return;
    }

    if (seciliUrunler.some(urun => urun.beklenenAdet <= 0)) {
      setBildirim({
        mesaj: 'Lütfen tüm ürünler için beklenen adet girin!',
        tip: 'hata'
      });
      return;
    }

    const storedSayimlar = localStorage.getItem('sayimlar');
    const mevcutSayimlar: SayimKarti[] = storedSayimlar ? JSON.parse(storedSayimlar) : [];
    
    const yeniSayim: SayimKarti = {
      id: Math.random().toString(36).substr(2, 9),
      sayimNo: `SAY${String(mevcutSayimlar.length + 1).padStart(3, '0')}`,
      tarih: new Date(),
      sayimAdi: sayimAdi || `Genel Sayım ${mevcutSayimlar.length + 1}`,
      urunler: seciliUrunler,
      durum: 'beklemede',
      olusturanKullanici: 'admin'
    };

    localStorage.setItem('sayimlar', JSON.stringify([...mevcutSayimlar, yeniSayim]));
    setBildirim({
      mesaj: 'Sayım başarıyla oluşturuldu!',
      tip: 'basari'
    });
    setTimeout(() => {
      router.push('/yonetici');
    }, 1500);
  };

  const filtreliUrunler = urunler.filter(urun => 
    !seciliUrunler.find(secili => secili.id === urun.id) &&
    (urun.urunAdi.toLowerCase().includes(aramaMetni.toLowerCase()) ||
     urun.kod.toLowerCase().includes(aramaMetni.toLowerCase()))
  );

  const handleUrunSec = (urun: Urun) => {
    setSeciliUrunler([...seciliUrunler, { ...urun, beklenenAdet: 1 }]);
    setAramaMetni('');
    setShowAramaSonuclari(false);
  };

  const handleAdetDegistir = (urunId: string, adet: number) => {
    setSeciliUrunler(seciliUrunler.map(urun => 
      urun.id === urunId ? { ...urun, beklenenAdet: adet } : urun
    ));
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {bildirim && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
              bildirim.tip === 'basari' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            <FiAlertCircle className="text-xl" />
            <p>{bildirim.mesaj}</p>
            <button
              onClick={() => setBildirim(null)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 rounded-lg shadow-lg text-white">
        <h1 className="text-3xl font-bold">Yeni Sayım Oluştur</h1>
        <p className="mt-2 text-blue-100">
          Yeni bir sayım kartı oluşturmak için aşağıdaki formu doldurun.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="max-w-2xl">
            <label className={labelClasses}>
              Sayım Adı
            </label>
            <input
              type="text"
              value={sayimAdi}
              onChange={(e) => setSayimAdi(e.target.value)}
              className={inputClasses}
              placeholder="Örn: Aylık Genel Sayım"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Ürün Seçimi</h2>
            <p className="mt-1 text-sm text-gray-500">
              Ürün aramak için aşağıdaki alanı kullanın.
            </p>
            <div className="mt-4 relative">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ürün kodu veya adı ile arama yapın..."
                  value={aramaMetni}
                  onChange={(e) => {
                    setAramaMetni(e.target.value);
                    setShowAramaSonuclari(true);
                  }}
                  className="pl-12 pr-4 py-3 w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {showAramaSonuclari && aramaMetni && (
                <div className="absolute z-10 left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
                  {filtreliUrunler.length > 0 ? (
                    filtreliUrunler.map((urun) => (
                      <motion.div
                        key={urun.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleUrunSec(urun)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{urun.kod}</p>
                            <p className="text-sm text-gray-500">{urun.urunAdi}</p>
                          </div>
                          <FiPlus className="text-blue-500" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Ürün bulunamadı
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Seçili Ürünler ({seciliUrunler.length})</h3>
            <div className="space-y-3">
              {seciliUrunler.map((urun) => (
                <motion.div
                  key={urun.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{urun.kod}</p>
                    <p className="text-sm text-gray-500">{urun.urunAdi}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Beklenen Adet:</label>
                      <input
                        type="number"
                        value={urun.beklenenAdet}
                        onChange={(e) => handleAdetDegistir(urun.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSeciliUrunler(seciliUrunler.filter(u => u.id !== urun.id))}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-150"
                    >
                      <FiMinus size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {seciliUrunler.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Henüz ürün seçilmedi. Yukarıdaki arama kutusunu kullanarak ürün ekleyebilirsiniz.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 inline-flex items-center"
          >
            <FiSave className="mr-2" />
            Sayım Oluştur
          </button>
        </div>
      </form>
    </div>
  );
} 