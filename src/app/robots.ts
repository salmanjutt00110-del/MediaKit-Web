import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://mediakit.website';

  const disallowed = [
    '/api/',
    '/admin/',
    '/search',
    '/search?*',
    '/*?*url=',
    '/*?*q=',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowed,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: disallowed,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: disallowed,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
