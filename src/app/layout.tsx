import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/features/cart/CartContext';
import { AuthProvider } from '@/features/auth/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#6B1C23',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: 'Style Velaris ✨ | Cosméticos y Accesorios',
  description: '¡Haz tu encargo fácil y rápido! Cosméticos, labiales, accesorios y belleza Style Velaris. Pagas al recibir en efectivo o Nequi ✨',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icon-192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: '/',
    siteName: 'Style Velaris',
    title: 'Style Velaris ✨ | Cosméticos y Accesorios',
    description: '¡Haz tu encargo fácil y rápido! Cosméticos, labiales, accesorios y belleza. Pagas al recibir en efectivo o Nequi ✨',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Style Velaris - Cosméticos y Accesorios',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Style Velaris ✨ | Cosméticos y Accesorios',
    description: '¡Haz tu encargo fácil y rápido! Cosméticos, labiales y accesorios. Pagas al recibir en efectivo o Nequi ✨',
    images: ['/og-image.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Style Velaris',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Style Velaris" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* WhatsApp & Social Open Graph Link Preview Tags */}
        <meta property="og:title" content="Style Velaris ✨ | Cosméticos y Accesorios" />
        <meta property="og:description" content="¡Haz tu encargo fácil y rápido! Cosméticos, labiales, accesorios y belleza. Pagas al recibir en efectivo o Nequi ✨" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
