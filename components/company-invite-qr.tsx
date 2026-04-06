"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Image from "next/image"

export function CompanyInviteQR() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)

  async function generateQRCode() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/company/employees/invite", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to generate QR code")
      }

      const data = await response.json()
      setQrCode(data.qrCode)
      setExpiresAt(new Date(data.expiresAt))
      toast.success("QR code generated successfully")
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error("Failed to generate QR code")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Company Invite QR Code</CardTitle>
        <CardDescription>
          Generate a QR code that new employees can scan to join your company
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {qrCode ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-64 h-64 border rounded-lg overflow-hidden">
              <Image
                src={qrCode}
                alt="Company Invite QR Code"
                fill
                className="object-contain p-2"
              />
            </div>
            {expiresAt && (
              <p className="text-sm text-muted-foreground">
                Expires: {expiresAt.toLocaleDateString()} at{" "}
                {expiresAt.toLocaleTimeString()}
              </p>
            )}
          </div>
        ) : (
          <Button onClick={generateQRCode} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate QR Code"}
          </Button>
        )}
        {qrCode && (
          <Button
            variant="outline"
            onClick={() => {
              setQrCode(null)
              setExpiresAt(null)
            }}
          >
            Generate New Code
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 