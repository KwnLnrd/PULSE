import { Feed } from "@/components/feed";
import { createClient } from "@/lib/supabase/server";
import { VideoItem } from "@/components/feed";

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
    const supabase = await createClient()

    const { data: videos } = await supabase
        .from('videos')
        .select(`
      *,
      profiles (
        username
      )
    `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

    // Transform data to match VideoItem interface
    const formattedVideos: VideoItem[] | undefined = videos?.map((video: any) => ({
        ...video,
        username: video.profiles?.username || 'unknown',
    }))

    return (
        <main className="w-full h-screen bg-black overflow-hidden intro-y">
            <Feed initialVideos={formattedVideos} />
        </main>
    );
}
