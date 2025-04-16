'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiPlus, FiUpload, FiTrash2, FiSearch, FiDownload } from 'react-icons/fi';
import { MalKabulKarti, MalKabulUrun, Urun } from '@/types';
import * as XLSX from 'xlsx';

export default function MalKabulSayfasi() {
  const router = useRouter();
  const [tedarikciUnvani, setTedarikciUnvani] = useState('');
  const [tarih, setTarih] = useState('');
  const [not, setNot] = useState('');
  const [urunArama, setUrunArama] = useState('');
  const [seciliUrunler, setSeciliUrunler] = useState<MalKabulUrun[]>([]);
  const [tumUrunler, setTumUrunler] = useState<Urun[]>([]);

  useEffect(() => {
    // Sistemdeki ürünleri yükle
    const urunleriYukle = () => {
      try {
        const storageData = localStorage.getItem('urunler');
        if (storageData) {
          const urunler = JSON.parse(storageData);
          setTumUrunler(urunler);
        }
      } catch (error) {
        console.error('Ürün yükleme hatası:', error);
      }
    };

    urunleriYukle();
  }, []);

  const filtreliUrunler = tumUrunler.filter(urun =>
    urun.kod.toLowerCase().includes(urunArama.toLowerCase()) ||
    urun.urunAdi.toLowerCase().includes(urunArama.toLowerCase())
  );

  const urunEkle = (urun: Urun) => {
    if (!seciliUrunler.some(u => u.urunKodu === urun.kod)) {
      setSeciliUrunler([...seciliUrunler, {
        urunKodu: urun.kod,
        urunAdi: urun.urunAdi,
        beklenenAdet: 0
      }]);
    }
  };

  const urunSil = (index: number) => {
    setSeciliUrunler(seciliUrunler.filter((_, i) => i !== index));
  };

  const beklenenAdetGuncelle = (index: number, adet: number) => {
    setSeciliUrunler(seciliUrunler.map((urun, i) =>
      i === index ? { ...urun, beklenenAdet: adet } : urun
    ));
  };

  const exceldenYukle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Hata mesajları için dizi
          const hatalar: string[] = [];
          const bulunamayanUrunler: string[] = [];

          const yeniUrunler: MalKabulUrun[] = jsonData
            .map((row: any) => {
              // Farklı kolon isimleri için kontrol
              const urunKodu = row.UrunKodu || row['Ürün Kodu'] || row.Kod || row.kod || row.Code;
              const beklenenAdet = row.BeklenenAdet || row['Beklenen Adet'] || row.Adet || row.Miktar || row.Quantity;

              if (!urunKodu) {
                hatalar.push(`Satır ${jsonData.indexOf(row) + 1}: Ürün kodu bulunamadı`);
                return null;
              }

              if (beklenenAdet === undefined || beklenenAdet === null) {
                hatalar.push(`Satır ${jsonData.indexOf(row) + 1}: Beklenen adet bulunamadı`);
                return null;
              }

              const mevcutUrun = tumUrunler.find(u => u.kod === urunKodu);
              if (!mevcutUrun) {
                bulunamayanUrunler.push(urunKodu);
                return null;
              }

              return {
                urunKodu: mevcutUrun.kod,
                urunAdi: mevcutUrun.urunAdi,
                beklenenAdet: parseInt(beklenenAdet) || 0
              };
            })
            .filter((urun): urun is MalKabulUrun => urun !== null);

          // Hataları göster
          if (hatalar.length > 0) {
            alert(`Excel dosyasında hatalar bulundu:\n\n${hatalar.join('\n')}`);
            return;
          }

          // Bulunamayan ürünleri göster
          if (bulunamayanUrunler.length > 0) {
            alert(`Aşağıdaki ürün kodları sistemde bulunamadı:\n\n${bulunamayanUrunler.join('\n')}\n\nLütfen ürün kodlarını kontrol edin.`);
            return;
          }

          if (yeniUrunler.length === 0) {
            alert('Excel dosyasından hiç ürün eklenemedi. Lütfen dosya içeriğini kontrol edin.');
            return;
          }

          setSeciliUrunler([...seciliUrunler, ...yeniUrunler]);
          alert(`${yeniUrunler.length} ürün başarıyla eklendi.`);
        } catch (error) {
          console.error('Excel yükleme hatası:', error);
          alert('Excel dosyası yüklenirken bir hata oluştu! Lütfen dosya formatını kontrol edin.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const downloadExcelTemplate = () => {
    // Örnek veri oluştur
    const exampleData = [
      { 'Ürün Kodu': 'URN001', 'Beklenen Adet': 10 },
      { 'Ürün Kodu': 'URN002', 'Beklenen Adet': 5 },
    ];

    // Excel workbook oluştur
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exampleData);

    // Başlık stillerini ayarla
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "CCCCCC" } }
    };

    // Sütun genişliklerini ayarla
    const wscols = [
      { wch: 20 }, // Ürün Kodu sütunu
      { wch: 20 }  // Beklenen Adet sütunu
    ];
    worksheet['!cols'] = wscols;

    // Workbook'a worksheet'i ekle
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mal Kabul Şablonu');

    // Excel dosyasını indir
    XLSX.writeFile(workbook, 'mal-kabul-sablonu.xlsx');
  };

  const malKabulOlustur = () => {
    if (!tedarikciUnvani || !tarih || seciliUrunler.length === 0) {
      alert('Lütfen gerekli alanları doldurun.');
      return;
    }

    try {
      const storageData = localStorage.getItem('malKabuller');
      const mevcutMalKabuller: MalKabulKarti[] = storageData ? JSON.parse(storageData) : [];
      
      const yeniMalKabul: MalKabulKarti = {
        id: Math.random().toString(36).substr(2, 9),
        malKabulNo: `MK${String(mevcutMalKabuller.length + 1).padStart(3, '0')}`,
        tedarikciUnvani,
        tarih: new Date(tarih),
        not: not || undefined,
        urunler: seciliUrunler,
        durum: 'beklemede',
        olusturanKullanici: 'admin'
      };

      localStorage.setItem('malKabuller', JSON.stringify([...mevcutMalKabuller, yeniMalKabul]));
      router.push('/yonetici/mal-kabul-listesi');
    } catch (error) {
      console.error('Mal kabul oluşturma hatası:', error);
      alert('Mal kabul oluşturulurken bir hata oluştu.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Mal Kabul Oluştur</h1>
        
        {/* Temel Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tedarikçi Ünvanı
            </label>
            <input
              type="text"
              value={tedarikciUnvani}
              onChange={(e) => setTedarikciUnvani(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tedarikçi ünvanını girin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarih
            </label>
            <input
              type="datetime-local"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Not (Opsiyonel)
          </label>
          <textarea
            value={not}
            onChange={(e) => setNot(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mal kabul ile ilgili notları buraya yazabilirsiniz"
          />
        </div>

        {/* Excel Yükleme */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excel ile Ürün Yükle
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
              <FiUpload className="mr-2" />
              <span>Excel Dosyası Seç</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={exceldenYukle}
                className="hidden"
              />
            </label>
            <button
              onClick={downloadExcelTemplate}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <FiDownload className="mr-1" />
              Örnek Excel İndir
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Excel dosyasında 'UrunKodu' ve 'BeklenenAdet' sütunları bulunmalıdır.
          </p>
        </div>

        {/* Ürün Arama ve Ekleme */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ürün Ara ve Ekle
          </label>
          <div className="relative">
            <input
              type="text"
              value={urunArama}
              onChange={(e) => setUrunArama(e.target.value)}
              className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ürün kodu veya adı ile arama yapın"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {urunArama && (
            <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
              {filtreliUrunler.map(urun => (
                <div
                  key={urun.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => urunEkle(urun)}
                >
                  <div>
                    <div className="font-medium">{urun.kod}</div>
                    <div className="text-sm text-gray-500">{urun.urunAdi}</div>
                  </div>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiPlus />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seçili Ürünler Listesi */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Seçili Ürünler</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
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
                    Beklenen Adet
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seciliUrunler.map((urun, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {urun.urunKodu}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {urun.urunAdi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={urun.beklenenAdet}
                        onChange={(e) => beklenenAdetGuncelle(index, parseInt(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => urunSil(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
                {seciliUrunler.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Henüz ürün eklenmedi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end">
          <button
            onClick={malKabulOlustur}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Mal Kabul Oluştur
          </button>
        </div>
      </div>
    </div>
  );
} 