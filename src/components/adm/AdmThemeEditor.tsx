import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULTS, fetchSettings, saveSettings, type ThemeSettings } from "@/lib/site-content";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

// helper: hex -> HSL string ("H S% L%")
function hexToHslString(hex: string): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.substring(0, 2), 16) / 255;
  const g = parseInt(m.substring(2, 4), 16) / 255;
  const b = parseInt(m.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hslStringToHex(hsl: string): string {
  const [h, s, l] = hsl.split(" ").map((v, i) => (i === 0 ? parseFloat(v) : parseFloat(v)));
  const sN = (s as number) / 100, lN = (l as number) / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs((((h as number) / 60) % 2) - 1));
  const m = lN - c / 2;
  let r = 0, g = 0, b = 0;
  const hh = h as number;
  if (hh < 60) { r = c; g = x; b = 0; }
  else if (hh < 120) { r = x; g = c; b = 0; }
  else if (hh < 180) { r = 0; g = c; b = x; }
  else if (hh < 240) { r = 0; g = x; b = c; }
  else if (hh < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const AdmThemeEditor = () => {
  const [data, setData] = useState<ThemeSettings>(DEFAULTS.theme);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings<ThemeSettings>("theme", DEFAULTS.theme).then(setData); }, []);

  const update = (patch: Partial<ThemeSettings>) => setData((d) => ({ ...d, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings("theme", data);
      toast.success("Tema salvo! Recarregando site...");
      setTimeout(() => window.location.reload(), 400);
    } catch (err: any) {
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Cores e Botões</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Cor principal</Label>
            <Input type="color" value={hslStringToHex(data.primary || DEFAULTS.theme.primary)}
              onChange={(e) => update({ primary: hexToHslString(e.target.value) })} className="h-12" />
          </div>
          <div>
            <Label>Cor de destaque</Label>
            <Input type="color" value={hslStringToHex(data.accent || DEFAULTS.theme.accent)}
              onChange={(e) => update({ accent: hexToHslString(e.target.value) })} className="h-12" />
          </div>
        </div>

        <div className="pt-3 border-t space-y-3">
          <p className="font-medium">Botão "Solicitar Orçamento" e outros CTA</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Cor de fundo do botão (opcional)</Label>
              <Input type="color" value={data.cta_bg || "#0466c8"}
                onChange={(e) => update({ cta_bg: e.target.value })} className="h-12" />
              {data.cta_bg && (
                <Button variant="ghost" size="sm" onClick={() => update({ cta_bg: "" })}>Usar padrão</Button>
              )}
            </div>
            <div>
              <Label>Cor do texto do botão</Label>
              <Input type="color" value={data.cta_text || "#ffffff"}
                onChange={(e) => update({ cta_text: e.target.value })} className="h-12" />
              {data.cta_text && (
                <Button variant="ghost" size="sm" onClick={() => update({ cta_text: "" })}>Usar padrão</Button>
              )}
            </div>
            <div>
              <Label>Tamanho da fonte (px): {data.cta_font_size}</Label>
              <Input type="range" min="12" max="28" value={data.cta_font_size}
                onChange={(e) => update({ cta_font_size: e.target.value })} />
            </div>
            <div>
              <Label>Animação</Label>
              <Select value={data.cta_animation} onValueChange={(v: any) => update({ cta_animation: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="pulse">Pulsar</SelectItem>
                  <SelectItem value="bounce">Quicar</SelectItem>
                  <SelectItem value="shake">Tremer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdmThemeEditor;
