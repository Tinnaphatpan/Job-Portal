import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/change-password'],
    },
    sitemap: 'https://tinnaphatjobportal.vercel.app/sitemap.xml',
  };
}
