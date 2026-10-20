import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/mongodb';

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({
      user,
      isDatabaseConfigured: isDatabaseConfigured(),
    });
  } catch (error) {
    return NextResponse.json({ user: null, isDatabaseConfigured: isDatabaseConfigured() });
  }
}
