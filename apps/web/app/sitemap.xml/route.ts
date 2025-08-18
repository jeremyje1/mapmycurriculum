import { NextResponse } from 'next/server';

export const runtime = 'edge';

const BASE = 'https://platform.mapmycurriculum.com';

export async function GET() {
  const urls = [
    '/',
    '/login',
    '/signup',
    '/contact',
    '/privacy',
    '/terms'
  ];
  const urlEntries = urls.map(u => '  <url><loc>' + BASE + u + '</loc></url>').join('\n');
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urlEntries + '\n</urlset>';
  return new NextResponse(body, { headers: { 'Content-Type': 'application/xml' } });
}
