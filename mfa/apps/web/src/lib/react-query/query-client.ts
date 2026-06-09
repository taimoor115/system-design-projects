import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import { AxiosError } from "axios";
import ms from "ms";

function getErrorStatus(error: unknown): number | null {
  if (error instanceof AxiosError) {
    return error.response?.status ?? null;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }

  return null;
}

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) {
    return false;
  }

  const status = getErrorStatus(error);

  if (status === 401 || status === 403) {
    return false;
  }

  if (error instanceof AxiosError) {
    if (!error.response) {
      return true;
    }

    return error.response.status >= 500;
  }

  return true;
}

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: ms("1m"),
      gcTime: ms("5m"),
      refetchOnWindowFocus: false,
      retry: shouldRetryQuery,
    },
    mutations: {
      retry: false,
    },
  },
};

export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig);
}
