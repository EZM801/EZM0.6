"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import Providers from "./providers"
import { Navbar } from "./components/navbar"
import { BlobBackground } from "@/components/blob-background"
import { FloatingQrButton } from "@/components/floating-qr-button"

export default function ProvidersWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <SessionProvider>
        <BlobBackground />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <FloatingQrButton />
        </div>
        <Toaster />
      </SessionProvider>
    </Providers>
  )
} 