import { useEffect, useState } from "react";
import { Film, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getSignedImageUrl } from "@/lib/site-content";
import { normalizeServiceVideos, SERVICE_VIDEO_BUCKET, SERVICE_VIDEO_KEY, type ServiceVideo } from "@/lib/service-videos";

const ServiceReels = () => {
  const [videos, setVideos] = useState<ServiceVideo[]>(() => normalizeServiceVideos([]));
  const [urls, setUrls] = useState<Record<number, string | null>>({});
  const [failed, setFailed] = useState(false);
  const load = async () => {
    try {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", SERVICE_VIDEO_KEY).maybeSingle();
      if (error) throw error;
      const list = normalizeServiceVideos(data?.value as unknown as ServiceVideo[] ?? []);
      const entries = await Promise.all(list.map(async (video) => [video.slot, await getSignedImageUrl(SERVICE_VIDEO_BUCKET, video.path)] as const));
      setVideos(list); setUrls(Object.fromEntries(entries)); setFailed(false);
    } catch { setFailed(true); }
  };
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => { void load(); }, 50 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <div className="mb-16" aria-label="Vídeos dos serviços">
    <h3 className="text-2xl font-bold text-primary mb-6">Serviços em vídeo</h3>
    {failed && <div className="flex flex-wrap items-center gap-3 mb-4"><p className="text-sm">Não foi possível carregar os vídeos.</p><Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente</Button></div>}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {videos.map((video) => <figure key={video.slot} className="min-w-0">
        <div className="aspect-[9/16] rounded-lg border border-border bg-muted overflow-hidden">
          {urls[video.slot] ? <video src={urls[video.slot] ?? undefined} controls playsInline preload="metadata" aria-label={video.title || `Vídeo ${video.slot}`} className="w-full h-full object-contain" onPlay={(event) => { document.querySelectorAll("video").forEach((other) => { if (other !== event.currentTarget) other.pause(); }); }} /> : <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground"><Film className="w-8 h-8" /><span className="text-sm text-center px-2">{video.path ? "Vídeo indisponível" : `Vídeo ${video.slot} em breve`}</span></div>}
        </div>
        {video.title && <figcaption className="font-medium text-foreground text-sm mt-3 break-words">{video.title}</figcaption>}
      </figure>)}
    </div>
  </div>;
};
export default ServiceReels;