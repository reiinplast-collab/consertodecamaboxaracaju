import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULTS, fetchSettings, saveSettings, getSignedImageUrl, type HeroSettings } from "@/lib/site-content";
import { Save, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdmHeroEditor = () => {
  const [data, setData] = useState<HeroSettings>(DEFAULTS.hero);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings<HeroSettings>("hero", DEFAULTS.hero).then(async (h) => {
      setData(h);
      if (h.image_path) setImgUrl(await getSignedImageUrl("site-images", h.image_path));
    });
  }, []);

  const update = (patch: Partial<HeroSettings>) => setData((d) => ({ ...d, ...patch }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `hero-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-images").upload(path, file, { contentType: file.type });
      if (error) throw error;
      update({ image_path: path });
      setImgUrl(await getSignedImageUrl("site-images", path));
      toast.success("Imagem carregada. Clique em Salvar para aplicar.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings("hero", data);
      toast.success("Página inicial atualizada!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Página inicial (Hero)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Título</Label>
            <Input value={data.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div>
            <Label>Palavra em destaque (fica azul)</Label>
            <Input value={data.highlight} onChange={(e) => update({ highlight: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Subtítulo</Label>
          <Textarea value={data.subtitle} onChange={(e) => update({ subtitle: e.target.value })} rows={3} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <Label>Botão principal — texto</Label>
            <Input value={data.cta_primary_text} onChange={(e) => update({ cta_primary_text: e.target.value })} />
          </div>
          <div>
            <Label>Botão principal — link</Label>
            <Input value={data.cta_primary_link} onChange={(e) => update({ cta_primary_link: e.target.value })} placeholder="#agendar ou https://..." />
          </div>
          <div>
            <Label>Botão secundário — texto</Label>
            <Input value={data.cta_secondary_text} onChange={(e) => update({ cta_secondary_text: e.target.value })} />
          </div>
          <div>
            <Label>Botão secundário — link</Label>
            <Input value={data.cta_secondary_link} onChange={(e) => update({ cta_secondary_link: e.target.value })} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-2 border-t">
          <div>
            <Label>Selo (badge)</Label>
            <Input value={data.badge_text} onChange={(e) => update({ badge_text: e.target.value })} />
          </div>
          <div>
            <Label>Número em destaque</Label>
            <Input value={data.stat_number} onChange={(e) => update({ stat_number: e.target.value })} />
          </div>
          <div>
            <Label>Legenda do número</Label>
            <Input value={data.stat_label} onChange={(e) => update({ stat_label: e.target.value })} />
          </div>
        </div>

        <div className="pt-2 border-t space-y-2">
          <Label>Imagem principal</Label>
          {imgUrl && <img src={imgUrl} alt="Hero" className="max-h-48 rounded" />}
          <div>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent cursor-pointer text-sm">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Enviando..." : "Trocar imagem"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar alterações
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdmHeroEditor;
