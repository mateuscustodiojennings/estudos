import { NextRequest, NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/lib/mongodb';
import { hashPassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Banco de dados MongoDB Atlas não está configurado. Configure a variável MONGODB_URI.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: 'O nome de usuário deve ter pelo menos 3 caracteres.' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { error: 'O nome de usuário deve conter apenas letras, números, hífens ou sublinhados.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const existing = await db.collection('users').findOne({ username });
    if (existing) {
      return NextResponse.json(
        { error: 'Este nome de usuário já está cadastrado. Por favor, escolha outro ou faça login.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    await db.collection('users').insertOne({
      userId,
      username,
      passwordHash,
      createdAt: now,
    });

    const token = signToken({ userId, username });
    const response = NextResponse.json({
      success: true,
      user: { userId, username },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 dias
    });

    return response;
  } catch (error: any) {
    console.error('Erro no registro de usuário:', error);
    return NextResponse.json(
      { error: 'Falha interna ao processar cadastro. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
