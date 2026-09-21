import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Style Velaris - Tienda y Encargos',
    short_name: 'Style Velaris',
    description: 'Catálogo y sistema de encargos de cosméticos y accesorios Style Velaris.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6B1C23',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
