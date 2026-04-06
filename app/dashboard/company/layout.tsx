"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardNav } from "../../../components/dashboard-nav"
import { UserNav } from "../../../components/user-nav"

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.userType !== "COMPANY") {
      router.push("/dashboard")
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  const companyNavItems = [
    {
      title: "Overview",
      href: "/dashboard/company",
      icon: "home",
    },
    {
      title: "Users",
      href: "/dashboard/company/users",
      icon: "users",
    },
    {
      title: "Moves",
      href: "/dashboard/company/moves",
      icon: "truck",
    },
    {
      title: "Equipment",
      href: "/dashboard/company/equipment",
      icon: "tool",
    },
    {
      title: "Supplies",
      href: "/dashboard/company/supplies",
      icon: "box",
    },
    {
      title: "Vehicles",
      href: "/dashboard/company/vehicles",
      icon: "car",
    },
    {
      title: "Settings",
      href: "/dashboard/company/settings",
      icon: "settings",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <DashboardNav items={companyNavItems} />
          <div className="flex flex-1 items-center justify-end space-x-2">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

