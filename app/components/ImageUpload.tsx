"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon, Camera, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageChange: (file: File | null) => void
  currentImage?: string
}

export function ImageUpload({ onImageChange, currentImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        onImageChange(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setShowCamera(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
            const reader = new FileReader()
            reader.onloadend = () => {
              setPreview(reader.result as string)
              onImageChange(file)
            }
            reader.readAsDataURL(file)
          }
        }, 'image/jpeg')
      }
    }
    stopCamera()
  }

  const removeImage = () => {
    setPreview(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={showCamera ? stopCamera : startCamera}
        >
          <Camera className="mr-2 h-4 w-4" />
          {showCamera ? 'Stop Camera' : 'Take Photo'}
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {showCamera && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <Button
            type="button"
            onClick={captureImage}
            className="absolute bottom-4 right-4"
          >
            Capture
          </Button>
        </div>
      )}

      {preview && !showCamera && (
        <div className="relative">
          <div className="relative h-48 w-full rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 