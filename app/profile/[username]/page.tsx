import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, Share2 } from "lucide-react"

export default async function ProfilePage({ params }: { params: { username: string } }) {
    // Use params directly as they are provided in Next.js page props
    // Note: In Next.js 15, params might be a promise in some configs, 
    // but standard page props are usually objects. 
    // If strict mode requires it, we can await it if the type definition changes.
    // For now, assume standard string extraction.

    // This is a server component, so we can fetch data directly
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', decodeURIComponent(params.username))
        .single()

    if (!profile) {
        // For MVP, if it's the current user but no profile row exists yet (unlikely if trigger works), show something else or 404
        // For now, let's just 404
        return notFound()
    }

    return (
        <main className="min-h-screen bg-black text-white pb-20">
            {/* Header / Cover (Optional, keeping simple for now) */}
            <div className="h-32 bg-gradient-to-r from-zinc-900 to-zinc-800"></div>

            <div className="container px-4 mx-auto -mt-16">
                <div className="flex flex-col items-center">
                    <Avatar src={profile.avatar_url} size="xl" className="border-4 border-black" />

                    <h1 className="mt-4 text-2xl font-bold">{profile.full_name || profile.username}</h1>
                    <p className="text-zinc-500">@{profile.username}</p>

                    <div className="flex gap-8 mt-6 border-y border-zinc-800 py-4 w-full justify-center">
                        <div className="text-center">
                            <span className="block font-bold text-lg">0</span>
                            <span className="text-xs text-zinc-500 uppercase tracking-widest">Following</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-lg">0</span>
                            <span className="text-xs text-zinc-500 uppercase tracking-widest">Followers</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-lg">0</span>
                            <span className="text-xs text-zinc-500 uppercase tracking-widest">Likes</span>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <Button>Follow</Button>
                        <Button variant="outline" size="icon"><Share2 className="w-4 h-4" /></Button>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="mt-12">
                    <h3 className="text-lg font-bold mb-4">Videos</h3>
                    <div className="grid grid-cols-3 gap-1">
                        {/* Mock Empty State */}
                        <div className="aspect-[9/16] bg-zinc-900 rounded-md flex items-center justify-center text-zinc-700">
                            <span className="text-xs">No videos</span>
                        </div>
                        <div className="aspect-[9/16] bg-zinc-900 rounded-md"></div>
                        <div className="aspect-[9/16] bg-zinc-900 rounded-md"></div>
                    </div>
                </div>
            </div>
        </main>
    )
}
