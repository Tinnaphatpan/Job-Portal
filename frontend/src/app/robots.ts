import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/change-password', '/google-callback'],
    },
    sitemap: 'https://tinnaphatjobportal.vercel.app/sitemap.xml',
  };
}
