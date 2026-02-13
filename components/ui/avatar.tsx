"use client"

import { User } from "lucide-react"

interface AvatarProps {
    src?: string | null
    alt?: string
    size?: "sm" | "md" | "lg" | "xl"
    className?: string
}

export function Avatar({ src, alt, size = "md", className = "" }: AvatarProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-20 h-20",
        xl: "w-32 h-32"
    }

    return (
        <div className={`relative overflow-hidden rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 ${sizeClasses[size]} ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={alt || "User avatar"}
                    className="w-full h-full object-cover"
                />
            ) : (
                <User className="text-zinc-500 w-1/2 h-1/2" />
            )}
        </div>
    )
}
