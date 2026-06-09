import { AsyncLocalStorage } from 'async_hooks';

interface TraceContext {
  traceId: string;
  userId?: string;
}

export const traceStorage = new AsyncLocalStorage<TraceContext>();

export function getTraceContext(): TraceContext | undefined {
  return traceStorage.getStore();
}

export function getTraceId(): string {
  return traceStorage.getStore()?.traceId ?? '-';
}

export function getUserId(): string | undefined {
  return traceStorage.getStore()?.userId;
}

export function setUserId(userId: string): void {
  const store = traceStorage.getStore();
  if (store) store.userId = userId;
}
