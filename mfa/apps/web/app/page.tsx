'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          router.replace('/dashboard');
          return;
        }
      } catch {
        // fall through
      }
    }
    router.replace('/login');
  }, [router]);

  return null;
}
