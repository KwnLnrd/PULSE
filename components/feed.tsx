"use client"

import { useEffect, useRef, useState } from "react"
import { VideoPlayer } from "./video-player"

// Mock Data
const MOCK_VIDEOS = [
    {
        id: "1",
        src: "https://customer-w41rcfe7u50n48k3.cloudflarestream.com/6b9e68b5471711df95781fa8d578c778/manifest/video.m3u8", // Replace with real or placeholder
        // Using a sample clear mp4 for testing if m3u8 fails in standard video tag without hls.js (Safari supports native hls)
        // For standard dev, let's use a reliable MP4 placeholder
        backupSrc: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
        poster: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d",
        username: "neon_vibes",
        description: "Cyberpunk aesthetic created with Unreal Engine 5 🦾 #cyberpunk #neon",
        likes: 1204,
        comments: 45
    },
    {
        id: "2",
        backupSrc: "https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-186-large.mp4",
        poster: "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
        username: "art_flow",
        description: "The beauty of ink. 🎨 #premium",
        likes: 8500,
        comments: 120
    },
    {
        id: "3",
        backupSrc: "https://assets.mixkit.co/videos/preview/mixkit-vertical-shot-of-a-woman-running-on-a-bridge-40545-large.mp4",
        poster: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325",
        username: "fit_life",
        description: "Morning run on the bridge 🏃‍♀️ #fitness",
        likes: 340,
        comments: 12
    }
]

export function Feed() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [activeId, setActiveId] = useState<string>(MOCK_VIDEOS[0].id)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('data-id')
                    if (id) setActiveId(id)
                }
            })
        }, {
            threshold: 0.6 // 60% visibility required to trigger
        })

        const children = container.querySelectorAll('[data-id]')
        children.forEach(el => observer.observe(el))

        return () => observer.disconnect()
    }, [])

    return (
        <div
            ref={containerRef}
            className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide"
        >
            {MOCK_VIDEOS.map((video) => (
                <div key={video.id} data-id={video.id} className="snap-start h-full">
                    <VideoPlayer
                        src={video.backupSrc} // Use mp4 for wider compat in MVP without hls.js setup yet
                        poster={video.poster}
                        username={video.username}
                        description={video.description}
                        likes={video.likes}
                        comments={video.comments}
                        isActive={activeId === video.id}
                    />
                </div>
            ))}
        </div>
    )
}
