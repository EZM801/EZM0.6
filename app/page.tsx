import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Box, Home, Truck } from "lucide-react"
import { ServicesSection } from "@/components/services-section"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end">
        <div className="container flex flex-col items-center gap-8 text-center md:gap-12">
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white">
              Moving Made <span className="text-white">Eazy</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-white/90 md:text-xl">
              Organize your move efficiently with our comprehensive planning tools. Track items, manage supplies, and
              coordinate your entire moving process.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-transparent border-white text-white hover:bg-white/10 rounded-full"
            >
              <Link href="/#about">Learn More</Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto mb-12 max-w-[800px] text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
              Everything You Need for a Smooth Move
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our comprehensive tools help you plan, organize, and execute your move with ease.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="border-none rounded-3xl soft-shadow card-hover">
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <div className="rounded-full bg-gradient-to-r from-gradient-start to-gradient-mid p-4">
                  <Box className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold">Item Tracking</h3>
                <p className="text-center text-muted-foreground">
                  Keep track of all your belongings with our intuitive item management system.
                </p>
              </CardContent>
            </Card>
            <Card className="border-none rounded-3xl soft-shadow card-hover">
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <div className="rounded-full bg-gradient-to-r from-gradient-start to-gradient-mid p-4">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold">Move Planning</h3>
                <p className="text-center text-muted-foreground">
                  Plan your entire move from start to finish with our comprehensive planning tools.
                </p>
              </CardContent>
            </Card>
            <Card className="border-none rounded-3xl soft-shadow card-hover">
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <div className="rounded-full bg-gradient-to-r from-gradient-start to-gradient-mid p-4">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold">Location Management</h3>
                <p className="text-center text-muted-foreground">
                  Manage multiple locations and track where your items are going.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8">
            <div className="flex flex-col justify-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl gradient-text">About Eazy Move</h2>
              <p className="text-muted-foreground">
                Eazy Move was founded with a simple mission: to take the stress out of moving. We understand that moving
                can be one of life's most stressful events, which is why we've created a comprehensive platform to help
                you organize every aspect of your move.
              </p>
              <p className="text-muted-foreground">
                Our team of moving experts and software developers have combined their knowledge to create tools that
                make tracking items, managing supplies, and coordinating your move as simple as possible.
              </p>
              <div className="flex flex-col gap-2 pt-4 sm:flex-row">
                <Button asChild className="rounded-full">
                  <Link href="/signup">
                    Join Eazy Move <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-3xl md:aspect-square animate-float">
              <Image
                src="/placeholder.svg?height=600&width=600&text=Moving+Made+Easy"
                alt="Moving boxes and a happy family"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto mb-12 max-w-[800px] text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
              What Our Users Say
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of satisfied movers who have simplified their moving experience.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-none rounded-3xl soft-shadow card-hover">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-center gap-2 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "Eazy Move made our recent relocation so much simpler. We were able to track all our items and
                    coordinate with our movers effortlessly."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={`/placeholder.svg?height=40&width=40&text=User${i}`}
                        alt="User"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-muted-foreground">Moved from NY to CA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end text-white py-16 md:py-24">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Simplify Your Move?</h2>
          <p className="mx-auto mt-4 max-w-[600px] text-white/80">
            Join thousands of users who have made their moving experience stress-free with Eazy Move.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 bg-white text-primary hover:bg-white/90 rounded-full"
            asChild
          >
            <Link href="/signup">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

