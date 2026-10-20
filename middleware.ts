import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Aplica regras de CORS especificamente para as rotas da API
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');

    // Em ambiente de desenvolvimento e para origens locais ou Render
    const isLocalOrAllowed =
      !origin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('0.0.0.0') ||
      origin.includes('192.168.') ||
      origin.includes('10.') ||
      origin.endsWith('.onrender.com');

    // Resposta para requisições de preflight (OPTIONS)
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });

      if (origin && isLocalOrAllowed) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      } else {
        response.headers.set('Access-Control-Allow-Origin', origin || '*');
      }

      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Accept, Cookie, Cache-Control'
      );
      response.headers.set('Access-Control-Max-Age', '86400');

      return response;
    }

    // Para as demais requisições (GET, POST, etc.)
    const response = NextResponse.next();

    if (origin && isLocalOrAllowed) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Cookie, Cache-Control'
    );

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
