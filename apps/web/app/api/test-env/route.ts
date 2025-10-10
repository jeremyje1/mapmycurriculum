import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasCronSecret: !!process.env.CRON_SECRET,
    cronSecretLength: process.env.CRON_SECRET?.length || 0,
  });
}
