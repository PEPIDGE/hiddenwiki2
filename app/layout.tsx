import type { Metadata } from 'next'
import { Handjet, Martian_Mono, Tektur } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { HcProvider } from '@/lib/hc/client'
import { MarketProvider } from '@/lib/blackmarket/client'
import './globals.css'

const martianMono = Martian_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-martian',
  axes: ['wdth'],
})

const tektur = Tektur({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-tektur',
  axes: ['wdth'],
})

const handjet = Handjet({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-handjet',
})

export const metadata: Metadata = {
  title: 'HIDDEN WIKI 2',
  description: 'Разследване. Декриптиране. Истината чака.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bg" className={`${martianMono.variable} ${tektur.variable} ${handjet.variable}`}>
      <body className="font-mono antialiased bg-background text-foreground">
        <HcProvider><MarketProvider>{children}</MarketProvider></HcProvider>
        <Analytics />
      </body>
    </html>
  )
}
