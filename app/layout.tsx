import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers' // Import your newly created Providers component
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Genesis AM — Cross-Chain Feed',
  description:
    'A decentralized, cross-chain microblogging timeline for Genesis Key holders across Base and Solana.',
  metadataBase: new URL('https://your-domain.xyz'), // Update with your actual production domain
  generator: 'v0.app',
  openGraph: {
    title: 'Genesis AM — Cross-Chain Feed',
    description: 'A decentralized, cross-chain microblogging timeline for Genesis Key holders across Base and Solana.',
    url: 'https://your-domain.xyz',
    siteName: 'Genesis AM',
    images: [
      {
        url: '/og-image.png', // Ensure a 1200x630px image is placed in your public folder
        width: 1200,
        height: 630,
        alt: 'Genesis AM Cross-Chain Feed Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Genesis AM — Cross-Chain Feed',
    description: 'A decentralized, cross-chain microblogging timeline for Genesis Key holders across Base and Solana.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-background font-sans antialiased">
        {/* Wrapping children in Providers allows your app to use Wagmi and RainbowKit */}
        <Providers>
          {children}
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}