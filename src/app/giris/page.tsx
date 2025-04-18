'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiPackage, FiUsers, FiLock, FiUser, FiArrowRight, FiCheck } from 'react-icons/fi';

export default function GirisSayfasi() {
  const router = useRouter();
  const [rol, setRol] = useState<string | null>(null);
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');

  const girisYap = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kullaniciAdi || !sifre) {
      setHata('Kullanıcı adı ve şifre gereklidir.');
      return;
    }
    
    // Demo amaçlı basit kimlik doğrulama - gerçek uygulamada API ile yapılmalıdır
    if (kullaniciAdi === 'admin' && sifre === 'tasdanlar.2751' && rol === 'yonetici') {
      // Yönetici girişi başarılı
      if (typeof window !== 'undefined') {
        localStorage.setItem('kullanici', JSON.stringify({ id: '1', kullaniciAdi, rol }));
      }
      router.push('/yonetici');
    } else if (kullaniciAdi === 'depo' && sifre === 'depo.2025' && rol === 'depocu') {
      // Depocu girişi başarılı
      if (typeof window !== 'undefined') {
        localStorage.setItem('kullanici', JSON.stringify({ id: '2', kullaniciAdi, rol }));
      }
      router.push('/depocu');
    } else {
      setHata('Geçersiz kullanıcı adı veya şifre.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          {/* Sol taraf - Karşılama bölümü */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white md:w-1/2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold mb-6">Depo Sayım Sistemi</h1>
              <p className="text-blue-100 mb-8">
                Stok yönetimi ve sayım işlemlerinizi kolayca gerçekleştirin.
                Güvenli ve hızlı erişim için giriş yapın.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <FiPackage className="h-6 w-6" />
                  </div>
                  <p className="ml-4">Hızlı ve kolay stok sayımı</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <FiCheck className="h-6 w-6" />
                  </div>
                  <p className="ml-4">Detaylı raporlama ve analiz</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <FiUsers className="h-6 w-6" />
                  </div>
                  <p className="ml-4">Rol bazlı erişim kontrolü</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sağ taraf - Giriş formu */}
          <div className="p-12 md:w-1/2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sisteme Giriş</h2>
                <p className="text-gray-600">Lütfen giriş yapmak için rolünüzü seçin</p>
              </div>

              {/* Rol seçimi */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRol('yonetici')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    rol === 'yonetici'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <FiUsers className="h-6 w-6 mx-auto mb-2" />
                  <span className="block text-sm font-medium">Yönetici</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRol('depocu')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    rol === 'depocu'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <FiPackage className="h-6 w-6 mx-auto mb-2" />
                  <span className="block text-sm font-medium">Depo</span>
                </motion.button>
              </div>

              {/* Giriş formu */}
              {rol && (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={girisYap}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kullanıcı Adı
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={kullaniciAdi}
                        onChange={(e) => setKullaniciAdi(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder=""
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={sifre}
                        onChange={(e) => setSifre(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder=""
                        required
                      />
                    </div>
                  </div>

                  {hata && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm"
                    >
                      {hata}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => setRol(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Geri
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <span>Giriş Yap</span>
                      <FiArrowRight className="ml-2 h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 