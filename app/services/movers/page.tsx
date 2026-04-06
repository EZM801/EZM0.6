import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ArrowLeft, Star, MapPin, Phone, Clock, CheckCircle } from "lucide-react"

// Mock data for demonstration
const movers = [
  {
    id: "1",
    name: "Elite Moving Services",
    rating: 4.8,
    reviews: 156,
    location: "Seattle, WA",
    phone: "(206) 555-1234",
    hours: "Mon-Sat: 8AM-6PM",
    image: "/placeholder.svg?height=300&width=300&text=Elite+Moving",
    features: ["Local & Long Distance", "Packing Services", "Furniture Assembly"],
  },
  {
    id: "2",
    name: "Swift Relocation Experts",
    rating: 4.7,
    reviews: 124,
    location: "Portland, OR",
    phone: "(503) 555-5678",
    hours: "Mon-Sun: 7AM-8PM",
    image: "/placeholder.svg?height=300&width=300&text=Swift+Relocation",
    features: ["Residential & Commercial", "Storage Solutions", "Same-Day Service"],
  },
  {
    id: "3",
    name: "Careful Movers Co.",
    rating: 4.9,
    reviews: 203,
    location: "San Francisco, CA",
    phone: "(415) 555-9012",
    hours: "Mon-Fri: 8AM-7PM",
    image: "/placeholder.svg?height=300&width=300&text=Careful+Movers",
    features: ["Specialty Item Moving", "Full-Service Packing", "Insurance Options"],
  },
]

export default function MoversPage() {
  return (
    <div className="container py-10">
      <Button variant="ghost" asChild className="mb-4 rounded-full">
        <Link href="/services">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
        </Link>
      </Button>

      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight gradient-text mb-4">Professional Movers</h1>
        <p className="text-muted-foreground max-w-[800px]">
          Our network of professional moving companies can help make your relocation stress-free. All partners are
          vetted for quality, reliability, and customer satisfaction.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {movers.map((mover) => (
          <Card key={mover.id} className="border-none rounded-3xl soft-shadow card-hover">
            <CardHeader className="pb-3">
              <div className="relative aspect-video overflow-hidden rounded-xl mb-4">
                <Image src={mover.image || "/placeholder.svg"} alt={mover.name} fill className="object-cover" />
              </div>
              <div className="flex items-center justify-between">
                <CardTitle>{mover.name}</CardTitle>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                  <span className="font-medium">{mover.rating}</span>
                  <span className="text-xs text-muted-foreground ml-1">({mover.reviews})</span>
                </div>
              </div>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {mover.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{mover.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{mover.hours}</span>
              </div>
              <div className="pt-2">
                <p className="text-sm font-medium mb-2">Services:</p>
                <div className="flex flex-wrap gap-2">
                  {mover.features.map((feature) => (
                    <div key={feature} className="flex items-center text-xs bg-muted rounded-full px-3 py-1">
                      <CheckCircle className="h-3 w-3 mr-1 text-primary" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full rounded-full">Get a Quote</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 bg-muted/30 rounded-3xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Need Help Finding the Right Movers?</h2>
        <p className="text-muted-foreground mb-6 max-w-[600px] mx-auto">
          Let us match you with the perfect moving company based on your specific needs, budget, and timeline.
        </p>
        <Button size="lg" className="rounded-full">
          Request Personalized Recommendations
        </Button>
      </div>
    </div>
  )
}

