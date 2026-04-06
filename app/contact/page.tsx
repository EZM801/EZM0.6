import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, ArrowLeft, Send } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ContactPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 rounded-full">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tighter gradient-text mb-4">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-[800px]">
          Have a question about our service? We're here to help you with any inquiries you might have.
        </p>
      </div>

      <Tabs defaultValue="contact-form" className="space-y-8">
        <TabsList className="rounded-full p-1">
          <TabsTrigger value="contact-form" className="rounded-full">
            Contact Form
          </TabsTrigger>
          <TabsTrigger value="faq" className="rounded-full">
            FAQs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact-form">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="border-none rounded-3xl soft-shadow">
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and our team will get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="Your name" className="rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="your.email@example.com" className="rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select>
                        <SelectTrigger className="rounded-full">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please describe your question or issue in detail..."
                        className="min-h-[150px] rounded-2xl"
                      />
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="rounded-full">
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-1">
              <Card className="border-none rounded-3xl soft-shadow h-full">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Reach out to us directly using the information below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium">Address</h3>
                      <p className="text-sm text-muted-foreground">
                        123 Moving Street
                        <br />
                        Suite 456
                        <br />
                        Seattle, WA 98101
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-sm text-muted-foreground">
                        <a href="tel:+18005551234" className="hover:text-primary transition-colors">
                          (800) 555-1234
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-sm text-muted-foreground">
                        <a href="mailto:support@eazymove.com" className="hover:text-primary transition-colors">
                          support@eazymove.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium">Hours</h3>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM
                        <br />
                        Saturday: 10:00 AM - 4:00 PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <Card className="border-none rounded-3xl soft-shadow">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to commonly asked questions about our service.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">How do I create a move plan?</h3>
                  <p className="text-muted-foreground">
                    You can create a new move plan by logging into your dashboard and clicking on the "Add Move" button.
                    Follow the step-by-step process to enter your current and new addresses, moving date, and other
                    details.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Can I track my inventory items?</h3>
                  <p className="text-muted-foreground">
                    Yes, Eazy Move allows you to create detailed item lists for each room. You can add photos, notes,
                    and even generate QR codes for easy tracking during your move.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Does Eazy Move offer moving services?</h3>
                  <p className="text-muted-foreground">
                    Eazy Move itself doesn't provide moving services, but we partner with reputable moving companies
                    that can help with your relocation. You can find these partners in the "Services" section.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">How can I change my account information?</h3>
                  <p className="text-muted-foreground">
                    You can update your profile information, change your password, and manage notification preferences
                    in the "Profile" section of your dashboard.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Is there a mobile app available?</h3>
                  <p className="text-muted-foreground">
                    Yes, we offer mobile apps for both iOS and Android devices. You can scan the QR code displayed on
                    your dashboard to download the app or find it in the respective app stores.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Don't see your question here?{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact our support team
                </Link>{" "}
                for assistance.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Our Support Team is Ready to Help</h2>
        <p className="text-muted-foreground max-w-[600px] mx-auto mb-8">
          Whether you have questions about our service, need technical assistance, or want to provide feedback, our
          dedicated support team is here for you.
        </p>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/signup">Get Started with Eazy Move</Link>
        </Button>
      </div>
    </div>
  )
}

