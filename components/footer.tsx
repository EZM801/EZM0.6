import Link from "next/link"
import { Truck } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-gradient-start to-gradient-end text-white">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold gradient-text">Eazy Move</span>
            </Link>
            <p className="text-muted-foreground">Simplifying your moving experience, one box at a time.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/#about" className="text-sm text-muted-foreground hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="text-sm text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                    My Moves
                  </Link>
                </li>
                <li>
                  <Link href="/supplies" className="text-sm text-muted-foreground hover:text-foreground">
                    Supplies
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Eazy Move. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

