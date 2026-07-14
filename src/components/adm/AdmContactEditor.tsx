import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DEFAULTS, fetchSettings, saveSettings, type ContactSettings } from "@/lib/site-content";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdmContactEditor = () => {
  const [data, setData] = useState<ContactSettings>(DEFAULTS.contact);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings<ContactSettings>("contact", DEFAULTS.contact).then(setData); }, []);
  const update = (p: Partial<ContactSettings>) => setData((d) => ({ ...d, ...p }));

  const handleSave = async () => {
    setSaving(true);
    try { await saveSettings("contact", data); toast.success("Contato salvo!"); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Informações de Contato</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Telefone (exibido)</Label><Input value={data.phone} onChange={(e) => update({ phone: e.target.value })} /></div>
          <div><Label>WhatsApp (só números, com DDI)</Label><Input value={data.whatsapp} onChange={(e) => update({ whatsapp: e.target.value })} placeholder="5579988392252" /></div>
          <div><Label>E-mail</Label><Input value={data.email} onChange={(e) => update({ email: e.target.value })} /></div>
          <div><Label>Horário</Label><Input value={data.hours} onChange={(e) => update({ hours: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Área de atendimento</Label><Input value={data.area} onChange={(e) => update({ area: e.target.value })} /></div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdmContactEditor;
