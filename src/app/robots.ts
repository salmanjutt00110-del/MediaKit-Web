import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mediakit.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/download/file*', '/api/thumbnail*'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/download/file*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
