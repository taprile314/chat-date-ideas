'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-lg font-bold">
            Date Ideas
          </Link>
          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                pathname.startsWith('/dashboard')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Ideas
            </Link>
            <Link
              href="/chat"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                pathname === '/chat'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Chat
            </Link>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
