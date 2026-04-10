import { NextRequest, NextResponse } from 'next/server';
import { config as appConfig } from '@/src/config';

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!appConfig.frontendPassword) {
    return NextResponse.json(
      { error: 'Contraseña no configurada en el servidor' },
      { status: 500 }
    );
  }

  if (password !== appConfig.frontendPassword) {
    return NextResponse.json(
      { error: 'Contraseña incorrecta' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('session', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
