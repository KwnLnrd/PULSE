"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import Link from "next/link"

export function Hero() {
    return (
        <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black via-black/90 to-[#050505]">
            {/* Background Ambience */}
            <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)] rounded-full blur-[128px] opacity-20 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900 rounded-full blur-[128px] opacity-20" />
            </div>

            <div className="container relative z-10 flex flex-col items-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6">
                        PULSE
                        <span className="text-[var(--accent)] text-7xl md:text-9xl block md:inline">.</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-xl text-zinc-400 max-w-md mb-8 tracking-wide"
                >
                    The next generation of content interaction.
                    <br /> All your favorite creators, zero limits.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex gap-4"
                >
                    <Link href="/feed">
                        <Button size="lg" className="rounded-full text-lg shadow-[0_0_20px_rgba(224,255,34,0.3)] hover:shadow-[0_0_30px_rgba(224,255,34,0.5)] transition-all">
                            Start Watching <Play className="ml-2 w-4 h-4 fill-current" />
                        </Button>
                    </Link>
                </motion.div>
            </div>

            <div className="absolute bottom-10 left-0 right-0 text-center">
                <span className="text-xs text-zinc-600 uppercase tracking-[0.2em]">Scroll to discover</span>
            </div>
        </section>
    )
}
