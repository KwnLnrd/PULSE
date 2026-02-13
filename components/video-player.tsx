"use client"

import { useRef, useState, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Heart, Share2, MessageCircle } from "lucide-react"
import { Watermark } from "./watermark"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

interface VideoProps {
    src: string
    poster?: string
    username: string
    description: string
    likes?: number
    comments?: number
    isActive: boolean
}

export function VideoPlayer({ src, poster, username, description, likes = 0, comments = 0, isActive }: VideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [playing, setPlaying] = useState(false)
    const [muted, setMuted] = useState(true)

    useEffect(() => {
        if (isActive) {
            // Small delay to allow scroll to settle
            const timeout = setTimeout(() => {
                videoRef.current?.play().catch(() => {
                    // Autoplay policy might block unmuted
                    console.log("Autoplay blocked or waiting for interaction")
                })
                setPlaying(true)
            }, 300)
            return () => clearTimeout(timeout)
        } else {
            videoRef.current?.pause()
            setPlaying(false)
        }
    }, [isActive])

    const togglePlay = () => {
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

    return (
        <div className="relative w-full h-[100dvh] bg-black snap-start shrink-0 flex items-center justify-center overflow-hidden">
            {/* Video Element */}
            {/* Note: object-cover for vertical fill */}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-cover"
                loop
                playsInline
                muted={muted}
                onClick={togglePlay}
            />

            {/* AEGIS Watermark Layer */}
            <Watermark userId="USER_8X92_TEST" />

            {/* Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none p-4 flex flex-col justify-end">

                <div className="flex justify-between items-end pb-20 md:pb-8 pointer-events-auto">
                    {/* Info */}
                    <div className="flex-1 mr-12">
                        <h3 className="font-bold text-lg text-white mb-1">@{username}</h3>
                        <p className="text-sm text-zinc-200 line-clamp-2">{description}</p>
                    </div>

                    {/* Sidebar Actions */}
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

            {/* Play/Pause indicator (centered, absolute) */}
            {!playing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
                        <Play className="w-12 h-12 text-white fill-white opacity-80" />
                    </div>
                </div>
            )}
        </div>
    )
}
