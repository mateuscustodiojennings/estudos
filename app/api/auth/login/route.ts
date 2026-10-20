import { NextRequest, NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/lib/mongodb';
import { comparePassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

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

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nome de usuário e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const user = await db.collection('users').findOne({ username });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário ou senha incorretos.' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Usuário ou senha incorretos.' },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user.userId, username: user.username });
    const response = NextResponse.json({
      success: true,
      user: { userId: user.userId, username: user.username },
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
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Falha interna ao processar login. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
