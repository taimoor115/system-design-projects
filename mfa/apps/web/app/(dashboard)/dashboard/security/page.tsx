'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { AxiosError } from 'axios';

type PageState =
  | 'loading'
  | 'disabled'
  | 'setup'
  | 'recovery-codes'
  | 'enabled';

interface SetupData {
  qrCodeDataUrl: string;
  base32Secret: string;
}

export default function SecurityPage() {
  const [state, setState] = useState<PageState>('loading');
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [confirmCode, setConfirmCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const { data } = await api.get<{ twoFactorEnabled: boolean }>('/api/v1/auth/me');
      setState(data.twoFactorEnabled ? 'enabled' : 'disabled');
    } catch {
      setState('disabled');
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function handleSetup() {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<SetupData>('/api/v1/mfa/setup');
      setSetupData(data);
      setState('setup');
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      setError(e.response?.data?.message ?? 'Failed to start MFA setup');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!confirmCode) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<{ recoveryCodes: string[] }>('/api/v1/mfa/confirm', {
        code: confirmCode,
      });
      setRecoveryCodes(data.recoveryCodes);
      setState('recovery-codes');
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      setError(e.response?.data?.message ?? 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setError('');
    setLoading(true);
    try {
      await api.post('/api/v1/mfa/disable');
      setState('disabled');
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      setError(e.response?.data?.message ?? 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  }

  function downloadCodes() {
    const content = recoveryCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copySecret() {
    if (!setupData) return;
    await navigator.clipboard.writeText(setupData.base32Secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (state === 'loading') {
    return <p className="text-gray-400">Loading…</p>;
  }

  if (state === 'disabled') {
    return (
      <>
        <h1 className="text-2xl font-bold text-white mb-2">Security Settings</h1>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-1">
            Two-Factor Authentication
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Two-Factor Authentication is not enabled
          </p>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            onClick={handleSetup}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 transition-colors"
          >
            {loading ? 'Setting up…' : 'Enable 2FA'}
          </button>
        </div>
      </>
    );
  }

  if (state === 'setup' && setupData) {
    return (
      <>
        <h1 className="text-2xl font-bold text-white mb-2">Set Up Authenticator</h1>
        <p className="text-gray-400 text-sm mb-6">
          Scan the QR code with your authenticator app, then enter the 6-digit code to confirm.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col items-center">
            <img
              src={setupData.qrCodeDataUrl}
              alt="MFA QR Code"
              className="w-48 h-48 rounded-lg"
            />
          </div>

          <div>
            <p className="text-gray-400 text-xs mb-1">Manual entry key</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono bg-gray-800 text-green-400 p-3 rounded text-sm break-all">
                {setupData.base32Secret}
              </code>
              <button
                onClick={copySecret}
                className="shrink-0 text-xs text-gray-400 hover:text-white border border-gray-700 rounded px-2 py-1"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Confirmation code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              placeholder="000000"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-center text-xl tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={loading || confirmCode.length !== 6}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 transition-colors"
          >
            {loading ? 'Verifying…' : "I've scanned the QR code — Confirm"}
          </button>
        </div>
      </>
    );
  }

  if (state === 'recovery-codes') {
    return (
      <>
        <h1 className="text-2xl font-bold text-green-400 mb-2">
          MFA Enabled Successfully
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Your account is now protected with two-factor authentication.
        </p>

        <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6">
          <p className="text-yellow-300 text-sm font-medium">
            Save these codes now. They will never be shown again.
          </p>
          <p className="text-yellow-400 text-xs mt-1">
            Use them to access your account if you lose your authenticator device.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-2">
            {recoveryCodes.map((code) => (
              <code
                key={code}
                className="font-mono bg-gray-800 text-green-400 p-3 rounded text-sm text-center"
              >
                {code}
              </code>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={downloadCodes}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg px-4 py-2 transition-colors"
          >
            Download codes
          </button>
          <button
            onClick={() => setState('enabled')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-4 py-2 transition-colors"
          >
            I&apos;ve saved my codes
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-2">Security Settings</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-white">
            Two-Factor Authentication
          </h2>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
            Active
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Two-Factor Authentication is active. Your account is protected.
        </p>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button
          onClick={handleDisable}
          disabled={loading}
          className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 transition-colors"
        >
          {loading ? 'Disabling…' : 'Disable 2FA'}
        </button>
      </div>
    </>
  );
}
