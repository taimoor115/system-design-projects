'use client';

import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();

  function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  function isAuthenticated(): boolean {
    const token = getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  function getUserId(): string | null {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub as string;
    } catch {
      return null;
    }
  }

  function logout(): void {
    localStorage.removeItem('accessToken');
    router.push('/login');
  }

  return { getToken, isAuthenticated, getUserId, logout };
}
