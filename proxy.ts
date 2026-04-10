import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const password = process.env['FRONTEND_PASSWORD'];

  if (!password) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('error', 'config');
    return NextResponse.redirect(url);
  }

  if (session !== password) {
    // API routes return 401 instead of redirecting to login
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(dashboard|chat)(.*)', '/api/ideas(.*)', '/api/chat(.*)'],
};
