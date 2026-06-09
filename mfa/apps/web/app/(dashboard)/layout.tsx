'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 <= Date.now()) {
        localStorage.removeItem('accessToken');
        router.replace('/login');
      }
    } catch {
      localStorage.removeItem('accessToken');
      router.replace('/login');
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('accessToken');
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg text-indigo-400">MFADemo</span>
          <Link
            href="/dashboard"
            className="text-gray-300 hover:text-white text-sm transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/security"
            className="text-gray-300 hover:text-white text-sm transition-colors"
          >
            Security Settings
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          Logout
        </button>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
