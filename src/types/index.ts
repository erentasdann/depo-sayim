export interface Urun {
  id: string;
  kod: string;
  urunAdi: string;
  birim?: string;
  aciklama?: string;
  createdAt: Date;
  updatedAt: Date;
  beklenenAdet: number;
  sayilanAdet?: number;
}

export interface SayimKarti {
  id: string;
  sayimNo: string;
  tarih: Date;
  sayimAdi: string;
  aciklama?: string;
  urunler: Urun[];
  not?: string;
  durum: 'beklemede' | 'tamamlandi';
  olusturanKullanici: string;
  tamamlayanKullanici?: string;
  tamamlanmaTarihi?: Date;
}

export interface Kullanici {
  id: string;
  kullaniciAdi: string;
  sifre: string;
  rol: 'yonetici' | 'depocu';
}

export type SayimRaporu = {
  sayimKarti: SayimKarti;
  fazlaUrunler: {
    urunKodu: string;
    beklenen: number;
    sayilan: number;
    fark: number;
  }[];
  eksikUrunler: {
    urunKodu: string;
    beklenen: number;
    sayilan: number;
    fark: number;
  }[];
  dogruUrunler: {
    urunKodu: string;
    beklenen: number;
    sayilan: number;
  }[];
};

export interface MalKabulUrun {
  urunKodu: string;
  urunAdi: string;
  beklenenAdet: number;
}

export interface MalKabulUrunWithSayim extends MalKabulUrun {
  id?: string;
  kod?: string;
  sayilanAdet: number;
  sonSayimTarihi?: Date;
}

export interface MalKabulKarti {
  id: string;
  malKabulNo: string;
  tedarikciUnvani: string;
  tarih: Date;
  not?: string;
  urunler: MalKabulUrun[];
  durum: 'beklemede' | 'tamamlandi';
  olusturanKullanici: string;
  tamamlayanKullanici?: string;
  tamamlanmaTarihi?: Date;
}

export interface MalKabulWithSayim extends Omit<MalKabulKarti, 'urunler'> {
  urunler: MalKabulUrunWithSayim[];
  tamamlandi: boolean;
  tamamlanmaTarihi: Date;
} 