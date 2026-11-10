import { useEffect, useRef, useState } from "react";
import { Film, Loader2, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getSignedImageUrl, saveSettings } from "@/lib/site-content";
import { normalizeServiceVideos, SERVICE_VIDEO_BUCKET, SERVICE_VIDEO_KEY, type ServiceVideo } from "@/lib/service-videos";
import { toast } from "sonner";

function VideoEditor({ video, url, busy, onSave }: { video: ServiceVideo; url: string | null; busy: boolean; onSave: (video: ServiceVideo, file: File | null) => Promise<boolean> }) {
  const [title, setTitle] = useState(video.title);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { setTitle(video.title); setFile(null); }, [video]);
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const objectUrl = URL.createObjectURL(file); setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return <article className="border border-border rounded-lg overflow-hidden bg-card">
    <div className="aspect-[9/16] max-h-80 bg-muted flex items-center justify-center">
      {(preview || url) ? <video src={preview || url || undefined} controls playsInline preload="metadata" className="w-full h-full object-contain" /> : <Film className="w-10 h-10 text-muted-foreground" />}
    </div>
    <div className="p-4 space-y-3">
      <h3 className="font-semibold text-primary">Vídeo {video.slot}</h3>
      <div><Label htmlFor={`video-title-${video.slot}`}>Título</Label><Input id={`video-title-${video.slot}`} value={title} disabled={busy} maxLength={160} onChange={(event) => setTitle(event.target.value)} /></div>
      <input ref={input} aria-label={`Arquivo do vídeo ${video.slot}`} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(event) => {
        const selected = event.target.files?.[0];
        if (selected && !selected.type.startsWith("video/")) { toast.error("Escolha um arquivo de vídeo."); return; }
        setFile(selected ?? null);
      }} />
      <Button variant="outline" className="w-full" disabled={busy} onClick={() => input.current?.click()}><Upload className="w-4 h-4 mr-2" /> {video.path || file ? "Substituir vídeo" : "Escolher vídeo"}</Button>
      {file && <p className="text-xs text-muted-foreground break-words">{file.name}</p>}
      <div className="flex gap-2"><Button disabled={busy || (!file && !video.path)} className="flex-1" onClick={async () => { if (await onSave({ ...video, title: title.trim() }, file)) setFile(null); }}><Save className="w-4 h-4 mr-2" /> Salvar</Button>
        <Button variant="ghost" size="icon" aria-label={`Remover vídeo ${video.slot}`} title="Remover vídeo" disabled={busy || (!file && !video.path)} onClick={async () => {
          if (!video.path) { setFile(null); return; }
          if (window.confirm(`Remover o vídeo ${video.slot} do site?`)) await onSave({ ...video, title: "", path: null }, null);
        }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
      </div>
    </div>
  </article>;
}

const AdmServiceVideosEditor = () => {
  const [videos, setVideos] = useState<ServiceVideo[]>(() => normalizeServiceVideos([]));
  const [urls, setUrls] = useState<Record<number, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", SERVICE_VIDEO_KEY).maybeSingle();
      if (error) throw error;
      const list = normalizeServiceVideos(data?.value as unknown as ServiceVideo[] ?? []);
      const entries = await Promise.all(list.map(async (video) => [video.slot, await getSignedImageUrl(SERVICE_VIDEO_BUCKET, video.path)] as const));
      setVideos(list); setUrls(Object.fromEntries(entries)); setFailed(false);
    } catch { setFailed(true); toast.error("Não foi possível carregar os vídeos."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const save = async (video: ServiceVideo, file: File | null) => {
    setBusy(true); setProgress(0);
    let uploaded: string | null = null;
    let committed = false;
    try {
      if (file) {
        const path = `${crypto.randomUUID()}.${file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "mp4"}`;
        const { error } = await supabase.storage.from(SERVICE_VIDEO_BUCKET).upload(path, file, { contentType: file.type });
        if (error) throw error;
        uploaded = path; video = { ...video, path }; setProgress(1);
      }
      // Reload the saved slots to preserve other administrators' changes.
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", SERVICE_VIDEO_KEY).maybeSingle();
      if (error) throw error;
      const latest = normalizeServiceVideos(data?.value as unknown as ServiceVideo[] ?? []);
      await saveSettings(SERVICE_VIDEO_KEY, latest.map((item) => item.slot === video.slot ? video : item));
      committed = true;
      toast.success(video.path ? "Vídeo salvo!" : "Vídeo removido.");
      await load(); return true;
    } catch (error) {
      if (uploaded && !committed) await supabase.storage.from(SERVICE_VIDEO_BUCKET).remove([uploaded]);
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o vídeo."); return false;
    } finally { setBusy(false); }
  };
  return <section className="space-y-6">
    <h2 className="text-xl font-bold text-primary">Vídeos dos serviços</h2>
    {busy && <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" />{progress ? "Salvando vídeo…" : "Enviando e salvando…"}</p>}
    {loading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : failed ? <Button variant="outline" onClick={load}>Tentar novamente</Button> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">{videos.map((video) => <VideoEditor key={video.slot} video={video} url={urls[video.slot] ?? null} busy={busy} onSave={save} />)}</div>}
  </section>;
};
export default AdmServiceVideosEditor;