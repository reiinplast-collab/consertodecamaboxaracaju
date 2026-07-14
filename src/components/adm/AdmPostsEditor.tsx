import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { getSignedImageUrl } from "@/lib/site-content";
import { Plus, Trash2, Save, Loader2, Upload, Edit } from "lucide-react";
import { toast } from "sonner";

type Post = { id: string; title: string; body: string; image_url: string | null; published: boolean; created_at: string };

const AdmPostsEditor = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Post | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    const list = (data as Post[]) ?? [];
    setPosts(list);
    const map: Record<string, string> = {};
    for (const p of list) if (p.image_url) {
      const u = await getSignedImageUrl("site-images", p.image_url);
      if (u) map[p.id] = u;
    }
    setUrls(map);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => setEditing({ id: "", title: "", body: "", image_url: null, published: true, created_at: new Date().toISOString() });

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      let imagePath = editing.image_url;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `post-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("site-images").upload(path, file, { contentType: file.type });
        if (error) throw error;
        imagePath = path;
      }
      if (editing.id) {
        await supabase.from("posts").update({ title: editing.title, body: editing.body, image_url: imagePath, published: editing.published }).eq("id", editing.id);
      } else {
        await supabase.from("posts").insert({ title: editing.title, body: editing.body, image_url: imagePath, published: editing.published });
      }
      toast.success("Postagem salva!");
      setEditing(null); setFile(null); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta postagem?")) return;
    await supabase.from("posts").delete().eq("id", id);
    toast.success("Postagem excluída");
    load();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Postagens da página inicial</CardTitle>
          {!editing && <Button onClick={startNew} size="sm" className="gap-2"><Plus className="w-4 h-4" /> Nova postagem</Button>}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div><Label>Título</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Texto</Label><Textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={6} /></div>
              <div>
                <Label>Imagem (opcional)</Label>
                {(file || editing.image_url) && (
                  <img src={file ? URL.createObjectURL(file) : urls[editing.id]} alt="preview" className="max-h-40 rounded mb-2" />
                )}
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm bg-background hover:bg-accent">
                  <Upload className="w-4 h-4" /> Escolher imagem
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.published} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
                <Label>Publicada</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
                </Button>
                <Button variant="ghost" onClick={() => { setEditing(null); setFile(null); }}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.length === 0 && <p className="text-muted-foreground">Nenhuma postagem ainda.</p>}
              {posts.map((p) => (
                <div key={p.id} className="flex gap-4 items-start p-3 border rounded-md">
                  {urls[p.id] && <img src={urls[p.id]} alt={p.title} className="w-20 h-20 object-cover rounded" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{p.title}</h4>
                      {!p.published && <span className="text-xs bg-muted px-2 py-0.5 rounded">rascunho</span>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(p.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(p)}><Edit className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmPostsEditor;
