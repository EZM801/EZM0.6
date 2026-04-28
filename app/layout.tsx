import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ProvidersWrapper from "./providers-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EZM - Easy Move Management",
  description: "Simplify your moving process with EZM",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`} suppressHydrationWarning>
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>
  )
}
import './globals.css'
