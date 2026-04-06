"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Menu, Truck, Home, Box, User, LogIn, Mail, LogOut, Settings, Package, Users, Wrench, Car } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"
import { toast } from "sonner"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut({ callbackUrl: "/" })
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to log out. Please try again.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Define base navigation items
  const baseNavItems = [
    { href: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
  ]

  // Define company user navigation items
  const companyNavItems = [
    { href: "/dashboard/company", label: "Dashboard", icon: <Box className="h-4 w-4" /> },
    { href: "/dashboard/company/users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { href: "/dashboard/company/moves", label: "Moves", icon: <Truck className="h-4 w-4" /> },
    { href: "/dashboard/company/equipment", label: "Equipment", icon: <Wrench className="h-4 w-4" /> },
    { href: "/dashboard/company/supplies", label: "Supplies", icon: <Package className="h-4 w-4" /> },
    { href: "/dashboard/company/vehicles", label: "Vehicles", icon: <Car className="h-4 w-4" /> },
  ]

  // Define regular user navigation items
  const regularUserNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Box className="h-4 w-4" /> },
    { href: "/dashboard/move", label: "Moves", icon: <Truck className="h-4 w-4" /> },
    { href: "/dashboard/items", label: "Items", icon: <Package className="h-4 w-4" /> },
  ]

  // Define common navigation items
  const commonNavItems = [
    { href: "/services", label: "Services", icon: <Truck className="h-4 w-4" /> },
    { href: "/contact", label: "Contact", icon: <Mail className="h-4 w-4" /> },
  ]

  // Combine navigation items based on user type
  let navItems = [...baseNavItems]
  
  if (status === "loading") {
    // Show minimal navigation while loading
    navItems = [...baseNavItems, ...commonNavItems]
  } else if (session) {
    const userType = session.user?.userType?.toUpperCase()
    if (userType === "COMPANY") {
      navItems = [...navItems, ...companyNavItems]
    } else {
      navItems = [...navItems, ...regularUserNavItems]
    }
    navItems = [...navItems, ...commonNavItems]
  } else {
    navItems = [
      ...navItems,
      ...commonNavItems,
      { href: "/signup", label: "Sign Up", icon: <User className="h-4 w-4" /> },
      { href: "/login", label: "Login", icon: <LogIn className="h-4 w-4" /> }
    ]
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm" : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">EZM</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {session.user?.firstName?.[0] || session.user?.email?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {session.user?.firstName || session.user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="md:hidden"
                onClick={() => setIsOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                      pathname === item.href ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

