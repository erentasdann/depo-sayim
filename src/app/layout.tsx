import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Depo Sayım Sistemi',
  description: 'Profesyonel depo sayım ve stok takip sistemi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <div className="min-h-screen">
          <main className="p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
