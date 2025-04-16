'use client';

import { useState, useEffect } from 'react';
import { Urun } from '@/types';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiSearch, FiX } from 'react-icons/fi';

const inputClasses = "mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out text-base placeholder-gray-400 bg-white hover:border-blue-400";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

export default function UrunYonetimi() {
  const [urunler, setUrunler] = useState<Urun[]>([]);
  const [filtrelenenUrunler, setFiltrelenenUrunler] = useState<Urun[]>([]);
  const [aramaMetni, setAramaMetni] = useState('');
  const [yeniUrun, setYeniUrun] = useState<Partial<Urun>>({
    kod: '',
    urunAdi: '',
    birim: '',
    aciklama: ''
  });
  const [editMode, setEditMode] = useState<string | null>(null);
  const [yuklemeMesaji, setYuklemeMesaji] = useState<{ tip: 'basari' | 'hata'; mesaj: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const storedUrunler = localStorage.getItem('urunler');
    if (storedUrunler) {
      const parsedUrunler = JSON.parse(storedUrunler).map((urun: any) => ({
        ...urun,
        createdAt: new Date(urun.createdAt),
        updatedAt: new Date(urun.updatedAt)
      }));
      setUrunler(parsedUrunler);
      setFiltrelenenUrunler(parsedUrunler);
    }
  }, []);

  useEffect(() => {
    const filtreliListe = urunler.filter(urun =>
      urun.urunAdi.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      urun.kod.toLowerCase().includes(aramaMetni.toLowerCase())
    );
    setFiltrelenenUrunler(filtreliListe);
  }, [aramaMetni, urunler]);

  const saveUrunler = (yeniUrunler: Urun[]) => {
    localStorage.setItem('urunler', JSON.stringify(yeniUrunler));
    setUrunler(yeniUrunler);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    
    if (editMode) {
      const updatedUrunler = urunler.map(urun => 
        urun.id === editMode ? {
          ...urun,
          ...yeniUrun,
          updatedAt: now
        } : urun
      );
      saveUrunler(updatedUrunler);
      setEditMode(null);
      setShowForm(false);
      setYuklemeMesaji({ tip: 'basari', mesaj: 'Ürün başarıyla güncellendi!' });
    } else {
      const yeniUrunData: Urun = {
        ...yeniUrun as Urun,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: now,
        updatedAt: now
      };
      saveUrunler([...urunler, yeniUrunData]);
      setShowForm(false);
      setYuklemeMesaji({ tip: 'basari', mesaj: 'Yeni ürün başarıyla eklendi!' });
    }

    setYeniUrun({
      kod: '',
      urunAdi: '',
      birim: '',
      aciklama: ''
    });

    setTimeout(() => {
      setYuklemeMesaji(null);
    }, 3000);
  };

  const handleEdit = (urun: Urun) => {
    setYeniUrun({
      kod: urun.kod,
      urunAdi: urun.urunAdi,
      birim: urun.birim,
      aciklama: urun.aciklama
    });
    setEditMode(urun.id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      const updatedUrunler = urunler.filter(urun => urun.id !== id);
      saveUrunler(updatedUrunler);
    }
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

          const yeniUrunler = jsonData.map((item: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            urunAdi: item.urunAdi || item['Ürün Adı'] || '',
            kod: item.kod || item['Ürün Kodu'] || '',
            birim: item.birim || item['Birim'] || '',
            aciklama: item.aciklama || item['Açıklama'] || '',
            createdAt: new Date(),
            updatedAt: new Date()
          }));

          const guncelUrunler = [...urunler, ...yeniUrunler];
          saveUrunler(guncelUrunler);
          setYuklemeMesaji({ tip: 'basari', mesaj: `${yeniUrunler.length} ürün başarıyla yüklendi!` });
        } catch (error) {
          setYuklemeMesaji({ tip: 'hata', mesaj: 'Excel dosyası yüklenirken bir hata oluştu!' });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 rounded-lg shadow-lg text-white">
        <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
        <p className="mt-2 text-blue-100">
          Sistemdeki ürünleri yönetin, düzenleyin ve takip edin.
        </p>
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
          >
            <FiPlus className="mr-2" />
            Yeni Ürün Ekle
          </button>
          <label className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 transition-colors duration-200 cursor-pointer">
            <FiUpload className="mr-2" />
            Excel'den Yükle
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={exceldenYukle}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <AnimatePresence>
        {yuklemeMesaji && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-md ${
              yuklemeMesaji.tip === 'basari' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            } flex items-center justify-between`}
          >
            <span>{yuklemeMesaji.mesaj}</span>
            <button
              onClick={() => setYuklemeMesaji(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {editMode ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditMode(null);
                    setYeniUrun({
                      kod: '',
                      urunAdi: '',
                      birim: '',
                      aciklama: ''
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-150"
                >
                  <FiX size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className={labelClasses}>
                      Ürün Kodu
                    </label>
                    <input
                      type="text"
                      value={yeniUrun.kod}
                      onChange={(e) => setYeniUrun({...yeniUrun, kod: e.target.value})}
                      className={inputClasses}
                      placeholder="Örn: PRD001"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClasses}>
                      Ürün Adı
                    </label>
                    <input
                      type="text"
                      value={yeniUrun.urunAdi}
                      onChange={(e) => setYeniUrun({...yeniUrun, urunAdi: e.target.value})}
                      className={inputClasses}
                      placeholder="Ürün adını girin"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClasses}>
                      Birim
                    </label>
                    <input
                      type="text"
                      value={yeniUrun.birim || ''}
                      onChange={(e) => setYeniUrun({...yeniUrun, birim: e.target.value})}
                      className={inputClasses}
                      placeholder="Adet, Kg, Lt vb."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClasses}>
                      Açıklama
                    </label>
                    <textarea
                      value={yeniUrun.aciklama || ''}
                      onChange={(e) => setYeniUrun({...yeniUrun, aciklama: e.target.value})}
                      className={inputClasses}
                      placeholder="Ürün hakkında açıklama girin"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditMode(null);
                      setYeniUrun({
                        kod: '',
                        urunAdi: '',
                        birim: '',
                        aciklama: ''
                      });
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  >
                    {editMode ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ürün Listesi</h2>
            <div className="relative w-72">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
              />
            </div>
          </div>
        </div>
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
                  Birim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Güncelleme
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtrelenenUrunler.map((urun) => (
                <motion.tr
                  key={urun.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {urun.kod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {urun.urunAdi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {urun.birim || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {urun.aciklama || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {urun.updatedAt.toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        handleEdit(urun);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center"
                    >
                      <FiEdit2 className="mr-1" />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(urun.id)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center"
                    >
                      <FiTrash2 className="mr-1" />
                      Sil
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtrelenenUrunler.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 text-lg">
                {aramaMetni ? 'Arama sonucunda ürün bulunamadı.' : 'Henüz ürün eklenmemiş.'}
              </div>
              {!aramaMetni && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FiPlus className="mr-2" />
                  İlk Ürünü Ekle
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 