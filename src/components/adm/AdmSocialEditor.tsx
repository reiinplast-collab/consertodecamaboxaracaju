import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DEFAULTS, fetchSettings, saveSettings, type SocialSettings } from "@/lib/site-content";
import { Save, Loader2, MessageCircle, Youtube, Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";

const AdmSocialEditor = () => {
  const [data, setData] = useState<SocialSettings>(DEFAULTS.social);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings<SocialSettings>("social", DEFAULTS.social).then(setData); }, []);
  const upd = (p: Partial<SocialSettings>) => setData((d) => ({ ...d, ...p }));

  const handleSave = async () => {
    setSaving(true);
    try { await saveSettings("social", data); toast.success("Redes sociais salvas!"); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const fields = [
    { icon: MessageCircle, label: "WhatsApp (link completo)", ph: "https://wa.me/5579988392252", key: "whatsapp_url" as const },
    { icon: Youtube, label: "YouTube", ph: "https://youtube.com/@seucanal", key: "youtube_url" as const },
    { icon: Facebook, label: "Facebook", ph: "https://facebook.com/suapagina", key: "facebook_url" as const },
    { icon: Instagram, label: "Instagram", ph: "https://instagram.com/seuperfil", key: "instagram_url" as const },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Redes sociais (botões no cabeçalho)</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <Label className="flex items-center gap-2"><f.icon className="w-4 h-4 text-primary" /> {f.label}</Label>
            <Input value={data[f.key]} onChange={(e) => upd({ [f.key]: e.target.value } as any)} placeholder={f.ph} />
          </div>
        ))}
        <p className="text-sm text-foreground">Deixe em branco para ocultar o botão.</p>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdmSocialEditor;
