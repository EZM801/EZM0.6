import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ServicesSection } from "@/components/services-section"
import { ArrowLeft } from "lucide-react"

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      <div className="container py-10">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl gradient-text mb-4">
          Moving Services
        </h1>
        <p className="text-xl text-muted-foreground max-w-[800px]">
          We've partnered with the best service providers to make your move as smooth as possible. From professional
          movers to cleaning services, we've got you covered.
        </p>
      </div>

      <ServicesSection />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-[800px] text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl gradient-text mb-6">Become a Partner</h2>
            <p className="text-muted-foreground mb-8">
              Are you a moving service provider? Partner with Eazy Move to reach more customers and grow your business.
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/partner-with-us">Partner With Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

