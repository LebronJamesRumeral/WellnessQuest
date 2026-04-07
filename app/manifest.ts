import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WellnessQuest',
    short_name: 'WellnessQuest',
    description: 'Transform your wellness journey into an epic adventure.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f2f2',
    theme_color: '#5a7acd',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}