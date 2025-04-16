'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SayimKarti } from '@/types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function RaporlarSayfasi() {
  const [sayimlar, setSayimlar] = useState<SayimKarti[]>([]);
  const [filtrelenenSayimlar, setFiltrelenenSayimlar] = useState<SayimKarti[]>([]);
  const [aramaMetni, setAramaMetni] = useState('');
  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');
  const [istatistikler, setIstatistikler] = useState({
    toplamSayim: 0,
    toplamUrun: 0,
    eksikUrun: 0,
    fazlaUrun: 0,
    ortalamaDogruluk: 0,
    enCokEksikUrun: '',
    enCokFazlaUrun: ''
  });

  useEffect(() => {
    const storageData = localStorage.getItem('sayimlar');
    if (storageData) {
      const tumSayimlar: SayimKarti[] = JSON.parse(storageData).map((s: any) => ({
        ...s,
        tarih: new Date(s.tarih),
        tamamlanmaTarihi: s.tamamlanmaTarihi ? new Date(s.tamamlanmaTarihi) : undefined
      }));

      const tamamlananSayimlar = tumSayimlar.filter(s => s.durum === 'tamamlandi');
      setSayimlar(tamamlananSayimlar);
      setFiltrelenenSayimlar(tamamlananSayimlar);

      // Gelişmiş istatistikleri hesapla
      let eksikUrun = 0;
      let fazlaUrun = 0;
      let toplamUrun = 0;
      let dogruSayilanUrun = 0;
      const urunIstatistikleri: { [key: string]: { eksik: number; fazla: number } } = {};

      tamamlananSayimlar.forEach(sayim => {
        toplamUrun += sayim.urunler.length;
        sayim.urunler.forEach(urun => {
          const fark = (urun.sayilanAdet || 0) - urun.beklenenAdet;
          if (fark < 0) {
            eksikUrun++;
            if (!urunIstatistikleri[urun.urunAdi]) {
              urunIstatistikleri[urun.urunAdi] = { eksik: 0, fazla: 0 };
            }
            urunIstatistikleri[urun.urunAdi].eksik++;
          } else if (fark > 0) {
            fazlaUrun++;
            if (!urunIstatistikleri[urun.urunAdi]) {
              urunIstatistikleri[urun.urunAdi] = { eksik: 0, fazla: 0 };
            }
            urunIstatistikleri[urun.urunAdi].fazla++;
          } else {
            dogruSayilanUrun++;
          }
        });
      });

      // En çok eksik ve fazla olan ürünleri bul
      let enCokEksikUrun = '';
      let enCokFazlaUrun = '';
      let maxEksik = 0;
      let maxFazla = 0;

      Object.entries(urunIstatistikleri).forEach(([urunAdi, istat]) => {
        if (istat.eksik > maxEksik) {
          maxEksik = istat.eksik;
          enCokEksikUrun = urunAdi;
        }
        if (istat.fazla > maxFazla) {
          maxFazla = istat.fazla;
          enCokFazlaUrun = urunAdi;
        }
      });

      setIstatistikler({
        toplamSayim: tamamlananSayimlar.length,
        toplamUrun,
        eksikUrun,
        fazlaUrun,
        ortalamaDogruluk: (dogruSayilanUrun / toplamUrun) * 100,
        enCokEksikUrun,
        enCokFazlaUrun
      });
    }
  }, []);

  // Filtreleme fonksiyonu
  useEffect(() => {
    let filtrelenmis = [...sayimlar];

    // Metin araması
    if (aramaMetni) {
      filtrelenmis = filtrelenmis.filter(sayim =>
        sayim.sayimAdi.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        sayim.sayimNo.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        sayim.tamamlayanKullanici?.toLowerCase().includes(aramaMetni.toLowerCase())
      );
    }

    // Tarih filtresi
    if (baslangicTarihi) {
      filtrelenmis = filtrelenmis.filter(sayim =>
        sayim.tamamlanmaTarihi && sayim.tamamlanmaTarihi >= new Date(baslangicTarihi)
      );
    }
    if (bitisTarihi) {
      filtrelenmis = filtrelenmis.filter(sayim =>
        sayim.tamamlanmaTarihi && sayim.tamamlanmaTarihi <= new Date(bitisTarihi)
      );
    }

    setFiltrelenenSayimlar(filtrelenmis);
  }, [aramaMetni, baslangicTarihi, bitisTarihi, sayimlar]);

  const formatTarih = (tarih: Date) => {
    return tarih.toLocaleDateString('tr-TR');
  };

  // Grafik verileri
  const pieData = {
    labels: ['Doğru Sayılan', 'Eksik', 'Fazla'],
    datasets: [
      {
        data: [
          istatistikler.toplamUrun - istatistikler.eksikUrun - istatistikler.fazlaUrun,
          istatistikler.eksikUrun,
          istatistikler.fazlaUrun
        ],
        backgroundColor: ['#60A5FA', '#F87171', '#4ADE80'],
        borderColor: ['#2563EB', '#DC2626', '#16A34A'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Son 7 Gün'],
    datasets: [
      {
        label: 'Tamamlanan Sayımlar',
        data: [
          sayimlar.filter(s => 
            s.tamamlanmaTarihi && 
            s.tamamlanmaTarihi >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length
        ],
        backgroundColor: '#60A5FA',
      }
    ],
  };

  const excelExport = () => {
    // Excel için veri hazırla
    const workbook = XLSX.utils.book_new();
    
    // Genel istatistikler sayfası
    const istatistikData = [
      ['Toplam Sayım', istatistikler.toplamSayim],
      ['Toplam Ürün', istatistikler.toplamUrun],
      ['Eksik Ürün', istatistikler.eksikUrun],
      ['Fazla Ürün', istatistikler.fazlaUrun]
    ];
    const istatistikWs = XLSX.utils.aoa_to_sheet(istatistikData);
    XLSX.utils.book_append_sheet(workbook, istatistikWs, 'Genel İstatistikler');

    // Detaylı sayım raporu sayfası
    const sayimData = [
      ['Sayım No', 'Sayım Adı', 'Tarih', 'Tamamlayan', 'Ürün Sayısı', 'Eksik Ürün', 'Fazla Ürün']
    ];

    sayimlar.forEach(sayim => {
      let eksik = 0;
      let fazla = 0;
      sayim.urunler.forEach(urun => {
        const fark = (urun.sayilanAdet || 0) - urun.beklenenAdet;
        if (fark < 0) eksik++;
        if (fark > 0) fazla++;
      });

      sayimData.push([
        sayim.sayimNo,
        sayim.sayimAdi,
        formatTarih(sayim.tamamlanmaTarihi || sayim.tarih),
        sayim.tamamlayanKullanici || '-',
        sayim.urunler.length.toString(),
        eksik.toString(),
        fazla.toString()
      ]);
    });

    const sayimWs = XLSX.utils.aoa_to_sheet(sayimData);
    XLSX.utils.book_append_sheet(workbook, sayimWs, 'Sayım Detayları');

    // Excel dosyasını indir
    XLSX.writeFile(workbook, 'sayim-raporu.xlsx');
  };

  const pdfExport = () => {
    // PDF'i oluştur
    const doc = new jsPDF('p', 'mm', 'a4');
    let lastTableY = 40;

    // Başlık
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80); // Koyu mavi
    doc.text("Sayim Raporu", doc.internal.pageSize.width / 2, 15, { align: 'center' });
    
    // Tarih
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141); // Gri
    const tarih = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(tarih, doc.internal.pageSize.width / 2, 22, { align: 'center' });
    
    // Genel İstatistikler Başlığı
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185); // Mavi
    doc.text("Genel Istatistikler", 14, 35);
    
    const istatistikData = [
      ['Toplam Sayim:', istatistikler.toplamSayim.toString()],
      ['Toplam Urun:', istatistikler.toplamUrun.toString()],
      ['Eksik Urun:', istatistikler.eksikUrun.toString()],
      ['Fazla Urun:', istatistikler.fazlaUrun.toString()]
    ];

    // İstatistik tablosu
    autoTable(doc, {
      startY: lastTableY,
      head: [['Istatistik', 'Deger']],
      body: istatistikData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 11,
        textColor: 44,
        cellPadding: 5
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'center' }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: function(data) {
        if (data.cursor) {
          lastTableY = data.cursor.y;
        }
      }
    });

    // Sayım Detayları Başlığı
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185); // Mavi
    doc.text("Sayim Detaylari", 14, lastTableY + 15);

    const sayimData = sayimlar.map(sayim => {
      let eksik = 0;
      let fazla = 0;
      sayim.urunler.forEach(urun => {
        const fark = (urun.sayilanAdet || 0) - urun.beklenenAdet;
        if (fark < 0) eksik++;
        if (fark > 0) fazla++;
      });

      return [
        sayim.sayimNo,
        sayim.sayimAdi,
        formatTarih(sayim.tamamlanmaTarihi || sayim.tarih),
        sayim.tamamlayanKullanici || '-',
        sayim.urunler.length.toString(),
        eksik.toString(),
        fazla.toString()
      ];
    });

    // Detay tablosu
    autoTable(doc, {
      startY: lastTableY + 20,
      head: [[
        'Sayim No',
        'Sayim Adi',
        'Tarih',
        'Tamamlayan',
        'Urun Sayisi',
        'Eksik',
        'Fazla'
      ]],
      body: sayimData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: 44,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 20, halign: 'center' }
      },
      margin: { left: 14, right: 14 },
      didParseCell: function(data) {
        // Eksik ve fazla sütunlarını renklendir
        if (data.section === 'body') {
          if (data.column.index === 5) { // Eksik sütunu
            data.cell.styles.textColor = [231, 76, 60]; // Kırmızı
          } else if (data.column.index === 6) { // Fazla sütunu
            data.cell.styles.textColor = [46, 204, 113]; // Yeşil
          }
        }
      }
    });

    // Alt bilgi
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(127, 140, 141); // Gri

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const sayfaText = `Sayfa ${i} / ${pageCount}`;
      doc.text(
        sayfaText,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // PDF dosyasını indir
    const dosyaAdi = `sayim-raporu-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(dosyaAdi);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Filtreleme Araçları */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arama</label>
            <input
              type="text"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              placeholder="Sayım adı, no veya kullanıcı..."
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
            <input
              type="date"
              value={baslangicTarihi}
              onChange={(e) => setBaslangicTarihi(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              value={bitisTarihi}
              onChange={(e) => setBitisTarihi(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Başlık ve Export Butonları */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sayım Raporları</h1>
        <div className="space-x-4">
          <button
            onClick={excelExport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Excel'e Aktar
          </button>
          <button
            onClick={pdfExport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            PDF'e Aktar
          </button>
        </div>
      </div>

      {/* İstatistik Kartları ve Grafikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 p-6 rounded-lg"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-200">
              <svg className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-blue-800">Toplam Sayım</h2>
              <p className="text-3xl font-bold text-blue-900">{istatistikler.toplamSayim}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-purple-50 p-6 rounded-lg"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-200">
              <svg className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-purple-800">Ortalama Doğruluk</h2>
              <p className="text-3xl font-bold text-purple-900">%{istatistikler.ortalamaDogruluk.toFixed(1)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50 p-6 rounded-lg"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-200">
              <svg className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-red-800">En Çok Eksik Ürün</h2>
              <p className="text-xl font-bold text-red-900">{istatistikler.enCokEksikUrun || "-"}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-green-50 p-6 rounded-lg"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-200">
              <svg className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-green-800">En Çok Fazla Ürün</h2>
              <p className="text-xl font-bold text-green-900">{istatistikler.enCokFazlaUrun || "-"}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Ürün Sayım Dağılımı</h3>
          <div className="h-64">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Son 7 Gün Sayım Aktivitesi</h3>
          <div className="h-64">
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Sayım Listesi */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Tamamlanan Sayımlar ({filtrelenenSayimlar.length})
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {filtrelenenSayimlar.map((sayim) => {
              let eksik = 0;
              let fazla = 0;
              sayim.urunler.forEach(urun => {
                const fark = (urun.sayilanAdet || 0) - urun.beklenenAdet;
                if (fark < 0) eksik++;
                if (fark > 0) fazla++;
              });

              return (
                <li key={sayim.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-blue-600">
                          {sayim.sayimNo}
                        </div>
                        <div className="text-sm text-gray-900 font-semibold">
                          {sayim.sayimAdi}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sayim.tamamlayanKullanici} tarafından tamamlandı
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8">
                      <div className="text-sm text-gray-500">
                        <div>Toplam: {sayim.urunler.length} ürün</div>
                        <div className="text-red-600">Eksik: {eksik}</div>
                        <div className="text-green-600">Fazla: {fazla}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTarih(sayim.tamamlanmaTarihi || sayim.tarih)}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
} 