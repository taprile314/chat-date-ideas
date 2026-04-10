import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const password = process.env['FRONTEND_PASSWORD'];

  if (session && password && session === password) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
