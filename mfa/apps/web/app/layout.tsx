import { ErrorBoundary } from "@/src/components/error-boundary"
import { QueryProvider } from "@/src/lib/react-query/query-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "MFA Demo",
  description: "Multi-Factor Authentication demo application",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>{children}</QueryProvider>
        </ErrorBoundary>
        <Toaster duration={2000} position="bottom-right" richColors closeButton />
      </body>
    </html>
  )
}
