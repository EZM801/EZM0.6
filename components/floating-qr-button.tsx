"use client"

import { useState } from "react"
import { QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QRScanner } from "@/components/qr-scanner"
import { useQrCodeHandler } from "@/components/qr-code-handler"

export function FloatingQrButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const { handleQrCode } = useQrCodeHandler()

  const handleQrCodeScanned = (data: string) => {
    setLastScannedCode(data)

    // Process the QR code
    handleQrCode(data)

    // Close the dialog after a short delay
    setTimeout(() => {
      setIsOpen(false)
      // Reset the last scanned code after the dialog closes
      setTimeout(() => setLastScannedCode(null), 300)
    }, 2000)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-gradient-start to-gradient-end hover:shadow-xl transition-all duration-300 z-50 animate-pulse hover:animate-none"
        size="icon"
        aria-label="Scan QR Code"
      >
        <QrCode className="h-6 w-6 text-white" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>Use your camera to scan a QR code for tracking items.</DialogDescription>
          </DialogHeader>
          <QRScanner onScan={handleQrCodeScanned} />
          {lastScannedCode && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
              <p className="font-medium">QR Code Scanned!</p>
              <p className="text-sm">{lastScannedCode}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

