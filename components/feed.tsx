"use client"

import { useEffect, useRef, useState } from "react"
import { VideoPlayer } from "./video-player"

// Type definition matching DB + overrides
export type VideoItem = {
    id: string
    cloudflare_id?: string
    user_id?: string
    title?: string
    description?: string // DB has description
    price_type?: 'free' | 'ppv' | 'sub_only'
    price_amount?: number
    likes_count?: number
    username?: string // Joined from profiles
    // Fallbacks
    src?: string
    poster?: string
    likes?: number
    comments?: number
}

// Mock Data as fallback
const MOCK_VIDEOS: VideoItem[] = [
    {
        id: "mock-1",
        src: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
        poster: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d",
        username: "neon_vibes",
        description: "Cyberpunk aesthetic created with Unreal Engine 5 🦾 #cyberpunk #neon",
        likes: 1204,
        comments: 45
    },
    {
        id: "mock-2",
        src: "https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-186-large.mp4",
        poster: "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
        username: "art_flow",
        description: "The beauty of ink. 🎨 #premium",
        price_type: 'sub_only',
        likes: 8500,
        comments: 120
    }
]

export function Feed({ initialVideos = [] }: { initialVideos?: VideoItem[] }) {
    const containerRef = useRef<HTMLDivElement>(null)

    // Use initialVideos if provided, otherwise fallback
    const videos = initialVideos.length > 0 ? initialVideos : MOCK_VIDEOS

    const [activeId, setActiveId] = useState<string>(videos[0]?.id)

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
            threshold: 0.6
        })

        const children = container.querySelectorAll('[data-id]')
        children.forEach(el => observer.observe(el))

        return () => observer.disconnect()
    }, [videos])

    return (
        <div
            ref={containerRef}
            className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide"
        >
            {videos.map((video) => (
                <div key={video.id} data-id={video.id} className="snap-start h-full">
                    <VideoPlayer
                        id={video.id}
                        cloudflareId={video.cloudflare_id}
                        src={video.src}
                        poster={video.poster}
                        username={video.username || 'unknown_user'}
                        description={video.description || ''}
                        likes={video.likes_count || video.likes}
                        comments={video.comments}
                        isActive={activeId === video.id}
                        isPremium={video.price_type === 'sub_only' || video.price_type === 'ppv' || video.description?.includes('#premium')}
                    />
                </div>
            ))}
        </div>
    )
}
