"use client"

import { useEffect, useRef } from "react"

interface WatermarkProps {
    userId: string
    className?: string
}

export function Watermark({ userId, className }: WatermarkProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions to match container or fixed size
        // For overlay, we want it explicitly covering
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                canvas.width = entry.contentRect.width
                canvas.height = entry.contentRect.height
                drawWatermark()
            }
        })

        resizeObserver.observe(canvas.parentElement || document.body)

        function drawWatermark() {
            if (!ctx || !canvas) return
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            ctx.font = "14px monospace"
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)" // Subtle visibility
            ctx.rotate(-45 * Math.PI / 180)

            const text = `AEGIS-ID: ${userId}`
            const spacing = 150

            // Grid of watermarks
            for (let x = -canvas.width; x < canvas.width * 2; x += spacing) {
                for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
                    ctx.fillText(text, x, y)
                }
            }

            // Reset rotation for next draw call if needed (but we clear rect anyway)
            ctx.setTransform(1, 0, 0, 1, 0, 0)
        }

        drawWatermark()

        return () => {
            resizeObserver.disconnect()
        }
    }, [userId])

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 pointer-events-none z-50 ${className}`}
        />
    )
}
