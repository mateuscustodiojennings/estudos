import { NextResponse } from 'next/server';
import { isDatabaseConfigured, getDb } from '@/lib/mongodb';

export async function GET() {
  const isDbConfigured = isDatabaseConfigured();
  let dbStatus = 'not_configured';

  if (isDbConfigured) {
    try {
      const db = await getDb();
      await db.command({ ping: 1 });
      dbStatus = 'connected';
    } catch (err: any) {
      dbStatus = `error: ${err.message}`;
    }
  }

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      configured: isDbConfigured,
      status: dbStatus,
    },
    nodeEnv: process.env.NODE_ENV || 'development',
  });
}
