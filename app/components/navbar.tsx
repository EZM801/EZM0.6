"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { 
  Home, 
  User, 
  LayoutDashboard, 
  LogIn, 
  UserPlus, 
  Truck,
  LogOut,
  Settings
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useState } from "react"

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const isAuthenticated = status === "authenticated"
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      show: true
    },
    {
      href: "/signup",
      label: "Sign Up",
      icon: UserPlus,
      show: !isAuthenticated
    },
    {
      href: "/login",
      label: "Login",
      icon: LogIn,
      show: !isAuthenticated
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: isAuthenticated
    }
  ]

  return (
    <nav className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 w-full">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-emerald-500">
              Eazy Move
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            if (!item.show) return null
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-500",
                  pathname === item.href
                    ? "text-emerald-500"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
          
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || 'User'} />
                    <AvatarFallback>{session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
} 