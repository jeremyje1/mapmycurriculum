export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    environment: process.env.VERCEL_ENV || 'development'
  }, { headers: { 'Cache-Control': 'no-store' } });
}
