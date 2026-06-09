'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface UserStatus {
  twoFactorEnabled: boolean;
}

export default function DashboardPage() {
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .get<UserStatus>('/api/v1/auth/me')
      .then(({ data }) => setMfaEnabled(data.twoFactorEnabled))
      .catch(() => setMfaEnabled(false));
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-8">You&apos;re logged in securely.</p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">
              Two-Factor Authentication
            </h2>
            <p className="text-gray-400 text-sm">
              Add an extra layer of security to your account
            </p>
          </div>
          {mfaEnabled === null ? (
            <span className="text-gray-500 text-sm">Loading…</span>
          ) : mfaEnabled ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
              Enabled
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400">
              Disabled
            </span>
          )}
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/security"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
          >
            Manage MFA
          </Link>
        </div>
      </div>
    </>
  );
}
