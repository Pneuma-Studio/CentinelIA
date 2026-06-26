import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.centinelia.mx';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/portal/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
