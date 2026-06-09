"use client"

import {
  DehydratedState,
  HydrationBoundary,
  QueryClientProvider,
} from "@tanstack/react-query"
import { ReactNode, useState } from "react"
import { createQueryClient } from "./query-client"
import dynamic from "next/dynamic"

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
        import("@tanstack/react-query-devtools").then((m) => ({
          default: m.ReactQueryDevtools,
        }))
      )
    : () => null

type QueryProviderProps = {
  children: ReactNode
  state?: DehydratedState
}

export function QueryProvider({
  children,
  state,
}: QueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={state}>
        {children}
      </HydrationBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
