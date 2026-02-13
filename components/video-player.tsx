"use client"

import { useRef, useState, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Heart, Share2, MessageCircle } from "lucide-react"
import { Watermark } from "./watermark"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { useMonetization } from "@/hooks/use-monetization"
import { useAuth } from "@/context/auth-context"

interface VideoProps {
    id: string
    cloudflareId?: string
    src?: string // Fallback or direct URL
    poster?: string
    username: string
    description: string
    likes?: number
    comments?: number
    isActive: boolean
    isPremium?: boolean // from DB
}

export function VideoPlayer({ id, cloudflareId, src, poster, username, description, likes = 0, comments = 0, isActive, isPremium = false }: VideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [playing, setPlaying] = useState(false)
    const [muted, setMuted] = useState(true)
    const [isUnlocked, setIsUnlocked] = useState(!isPremium)
    const { subscribeToCreator } = useMonetization()
    const { user } = useAuth()
    const watermarkId = user?.id || "ANONYMOUS_VIEWER"

    // Determine Video Source
    // If cloudflareId is present, use the standard Cloudflare HLS/Dash URLs
    // The customer domain should ideally be in env, but for now we use the generic one or standard
    // Standard: https://videodelivery.net/<id>/manifest/video.m3u8
    // Or: https://customer-<subdomain>.cloudflarestream.com/<id>/manifest/video.m3u8
    // Using generic videodelivery.net for simplicity if generic domain not provided

    const streamDomain = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN || "videodelivery.net"
    const videoSrc = cloudflareId
        ? `https://${streamDomain}/${cloudflareId}/manifest/video.m3u8`
        : src

    // For poster, cloudflare provides one too
    const posterSrc = cloudflareId
        ? `https://${streamDomain}/${cloudflareId}/thumbnails/thumbnail.jpg`
        : poster

    useEffect(() => {
        if (isActive) {
            if (isPremium && !isUnlocked) {
                // Don't autoplay if locked
                return
            }

            const timeout = setTimeout(() => {
                videoRef.current?.play().catch(() => {
                    console.log("Autoplay blocked")
                })
                setPlaying(true)
            }, 300)
            return () => clearTimeout(timeout)
        } else {
            videoRef.current?.pause()
            setPlaying(false)
        }
    }, [isActive, isPremium, isUnlocked])

    const togglePlay = () => {
        if (isPremium && !isUnlocked) return

        if (videoRef.current?.paused) {
            videoRef.current.play()
            setPlaying(true)
        } else {
            videoRef.current?.pause()
            setPlaying(false)
        }
    }

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted
            setMuted(videoRef.current.muted)
        }
    }

    const handleUnlock = async () => {
        // Trigger payment flow
        const { success } = await subscribeToCreator(username) // In real app, creatorId
        if (success) {
            setIsUnlocked(true)
            // Wait a bit then play
            setTimeout(() => {
                videoRef.current?.play()
                setPlaying(true)
            }, 500)
        }
    }

    return (
        <div className="relative w-full h-[100dvh] bg-black snap-start shrink-0 flex items-center justify-center overflow-hidden">
            <video
                ref={videoRef}
                src={videoSrc}
                poster={posterSrc}
                className={cn("w-full h-full object-cover", (isPremium && !isUnlocked) && "blur-xl scale-110")}
                loop
                playsInline
                muted={muted}
                onClick={togglePlay}
            />

            <Watermark userId={watermarkId} />

            {/* Premium Lock Overlay */}
            {isPremium && !isUnlocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 p-6 text-center animate-in fade-in">
                    <div className="mb-4 p-4 bg-[var(--accent)] rounded-full shadow-[0_0_30px_rgba(224,255,34,0.3)]">
                        <Play className="w-8 h-8 text-black ml-1" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Premium Content</h3>
                    <p className="text-zinc-300 mb-6 max-w-xs">Subscribe to @{username} to unlock exclusive access.</p>
                    <Button size="lg" className="w-full max-w-xs font-bold text-lg" onClick={handleUnlock}>
                        Subscribe for $9.99/mo
                    </Button>
                </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none p-4 flex flex-col justify-end z-10">
                <div className="flex justify-between items-end pb-20 md:pb-8 pointer-events-auto">
                    <div className="flex-1 mr-12">
                        <h3 className="font-bold text-lg text-white mb-1">@{username}</h3>
                        <p className="text-sm text-zinc-200 line-clamp-2">{description}</p>
                    </div>

                    <div className="flex flex-col gap-6 items-center">
                        <div className="group flex flex-col items-center gap-1">
                            <div className="p-3 bg-zinc-800/50 backdrop-blur-md rounded-full hover:bg-[var(--accent)] hover:text-black transition-colors cursor-pointer">
                                <Heart className="w-6 h-6 fill-current hover:text-black" />
                            </div>
                            <span className="text-xs font-medium">{likes}</span>
                        </div>

                        <div className="group flex flex-col items-center gap-1">
                            <div className="p-3 bg-zinc-800/50 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors cursor-pointer">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium">{comments}</span>
                        </div>

                        <button onClick={toggleMute} className="p-3 bg-zinc-800/50 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                            {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {!playing && (!isPremium || isUnlocked) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
                        <Play className="w-12 h-12 text-white fill-white opacity-80" />
                    </div>
                </div>
            )}
        </div>
    )
}
