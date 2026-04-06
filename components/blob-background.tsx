"use client"

import { useEffect, useRef } from "react"

interface BlobBackgroundProps {
  className?: string
}

export function BlobBackground({ className = "" }: BlobBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Blob parameters
    const blobs = [
      { x: canvas.width * 0.1, y: canvas.height * 0.2, radius: 200, color: "#a6e02b", speed: 0.0005 },
      { x: canvas.width * 0.9, y: canvas.height * 0.8, radius: 250, color: "#30d5c8", speed: 0.0007 },
      { x: canvas.width * 0.8, y: canvas.height * 0.1, radius: 180, color: "#4cd6b4", speed: 0.0006 },
    ]

    // Animation
    let animationFrameId: number
    let time = 0

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw blobs
      blobs.forEach((blob) => {
        const x = blob.x + Math.sin(time * blob.speed * 10) * 30
        const y = blob.y + Math.cos(time * blob.speed * 10) * 30

        ctx.beginPath()

        // Create blob shape
        for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
          const noise = 0.5 + 0.5 * Math.sin(angle * 8 + time * blob.speed)
          const radius = blob.radius * (0.9 + 0.1 * noise)
          const blobX = x + Math.cos(angle) * radius
          const blobY = y + Math.sin(angle) * radius

          if (angle === 0) {
            ctx.moveTo(blobX, blobY)
          } else {
            ctx.lineTo(blobX, blobY)
          }
        }

        ctx.closePath()

        // Fill with gradient
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, blob.radius)
        gradient.addColorStop(0, blob.color + "80") // Semi-transparent
        gradient.addColorStop(1, blob.color + "00") // Transparent

        ctx.fillStyle = gradient
        ctx.fill()
      })

      time += 1
      animationFrameId = window.requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className={`fixed inset-0 -z-10 pointer-events-none ${className}`} />
}

