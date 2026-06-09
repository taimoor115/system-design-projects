'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';

export default function MfaVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [useRecovery, setUseRecovery] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('mfaToken');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (failedAttempts >= 5) return;

    const mfaToken = sessionStorage.getItem('mfaToken');
    if (!mfaToken) {
      router.replace('/login');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post<{ accessToken: string }>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/mfa/validate`,
        { code },
        { headers: { Authorization: `Bearer ${mfaToken}` } },
      );
      sessionStorage.removeItem('mfaToken');
      localStorage.setItem('accessToken', data.accessToken);
      router.push('/dashboard');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        setError('Too many attempts. Please wait.');
      } else {
        setError(axiosErr.response?.data?.message ?? 'Invalid code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const tooManyAttempts = failedAttempts >= 5;

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-2">
        Enter Authentication Code
      </h1>
      <p className="text-gray-400 text-sm mb-6">
        {useRecovery
          ? 'Enter one of your recovery codes'
          : 'Enter the 6-digit code from your authenticator app, or a recovery code'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type={useRecovery ? 'text' : 'text'}
          inputMode={useRecovery ? 'text' : 'numeric'}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={10}
          required
          disabled={tooManyAttempts}
          placeholder={useRecovery ? 'Enter recovery code' : '000000'}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-center text-xl tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || tooManyAttempts}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 transition-colors"
        >
          {loading ? 'Verifying…' : 'Verify'}
        </button>
        <button
          type="button"
          onClick={() => {
            setUseRecovery((v) => !v);
            setCode('');
            setError('');
          }}
          className="w-full text-gray-400 hover:text-gray-300 text-sm underline"
        >
          {useRecovery
            ? 'Use authenticator app instead'
            : 'Use recovery code instead'}
        </button>
      </form>
    </>
  );
}
