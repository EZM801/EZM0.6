import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Dashboard | EZM",
  description: "Manage your moves and layouts",
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  )
}

