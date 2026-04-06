import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Sparkles, Home, Warehouse, Package, ExternalLink } from "lucide-react"

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  ctaText: string
  ctaLink: string
}

function ServiceCard({ icon, title, description, ctaText, ctaLink }: ServiceCardProps) {
  return (
    <Card className="border-none rounded-3xl soft-shadow card-hover">
      <CardHeader className="pb-3">
        <div className="rounded-full bg-gradient-to-r from-gradient-start to-gradient-mid p-4 w-fit">{icon}</div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>Our trusted partners provide quality services at competitive rates.</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full rounded-full">
          <Link href={ctaLink} className="flex items-center justify-center">
            {ctaText}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function ServicesSection() {
  const services = [
    {
      icon: <Truck className="h-6 w-6 text-white" />,
      title: "Professional Movers",
      description: "Experienced movers to handle your relocation with care",
      ctaText: "Find Movers",
      ctaLink: "/services/movers",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-white" />,
      title: "Cleaning Services",
      description: "Move-in and move-out cleaning for a fresh start",
      ctaText: "Book Cleaners",
      ctaLink: "/services/cleaners",
    },
    {
      icon: <Home className="h-6 w-6 text-white" />,
      title: "Rental Agents",
      description: "Find your perfect new home with expert rental agents",
      ctaText: "Contact Agents",
      ctaLink: "/services/rental-agents",
    },
    {
      icon: <Warehouse className="h-6 w-6 text-white" />,
      title: "Storage Units",
      description: "Secure storage solutions for short or long-term needs",
      ctaText: "Find Storage",
      ctaLink: "/services/storage",
    },
    {
      icon: <Package className="h-6 w-6 text-white" />,
      title: "Moving Supplies",
      description: "Quality boxes, tape, blankets, and other packing essentials",
      ctaText: "Shop Supplies",
      ctaLink: "/services/supplies",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="mx-auto mb-12 max-w-[800px] text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">Moving Services</h2>
          <p className="mt-4 text-muted-foreground">Connect with our trusted partners to make your move even easier</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
              ctaText={service.ctaText}
              ctaLink={service.ctaLink}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

