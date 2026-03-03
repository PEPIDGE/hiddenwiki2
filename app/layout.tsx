import type { Metadata } from 'next'
import { Share_Tech_Mono, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '700'],
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400'],
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
    <html lang="bg" className={`${spaceGrotesk.variable} ${shareTechMono.variable}`}>
      <body className="font-mono antialiased bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
