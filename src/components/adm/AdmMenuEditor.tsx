import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";

type MenuItem = { id: string; label: string; target: string; is_external: boolean; sort_order: number };

const AdmMenuEditor = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("menu_items").select("*").order("sort_order");
    setItems((data as MenuItem[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = () => setItems((s) => [...s, { id: `new-${Date.now()}`, label: "Novo item", target: "/", is_external: false, sort_order: s.length + 1 }]);
  const update = (id: string, patch: Partial<MenuItem>) => setItems((s) => s.map((i) => i.id === id ? { ...i, ...patch } : i));
  const remove = async (id: string) => {
    if (!id.startsWith("new-")) await supabase.from("menu_items").delete().eq("id", id);
    setItems((s) => s.filter((i) => i.id !== id));
  };
  const move = (id: string, dir: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id);
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const copy = [...items]; [copy[idx], copy[j]] = [copy[j], copy[idx]];
    setItems(copy.map((i, k) => ({ ...i, sort_order: k + 1 })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const item of items) {
        if (item.id.startsWith("new-")) {
          const { id, ...rest } = item;
          await supabase.from("menu_items").insert(rest);
        } else {
          await supabase.from("menu_items").update({ label: item.label, target: item.target, is_external: item.is_external, sort_order: item.sort_order }).eq("id", item.id);
        }
      }
      toast.success("Menu salvo!");
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Menu do Site</CardTitle>
        <Button size="sm" onClick={add} className="gap-2"><Plus className="w-4 h-4" /> Novo item</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Use links internos com <code>#servicos</code>, <code>/</code> ou externos <code>https://...</code>.
        </p>
        {items.map((item, idx) => (
          <div key={item.id} className="grid md:grid-cols-[auto_2fr_3fr_auto_auto] gap-2 items-center p-3 border border-border rounded-md bg-muted/20">
            <div className="flex flex-col">
              <button onClick={() => move(item.id, -1)} disabled={idx === 0} className="text-muted-foreground disabled:opacity-30">▲</button>
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <button onClick={() => move(item.id, 1)} disabled={idx === items.length - 1} className="text-muted-foreground disabled:opacity-30">▼</button>
            </div>
            <div>
              <Label className="text-xs">Nome</Label>
              <Input value={item.label} onChange={(e) => update(item.id, { label: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Destino</Label>
              <Input value={item.target} onChange={(e) => update(item.id, { target: e.target.value })} />
            </div>
            <div className="flex flex-col items-center">
              <Label className="text-xs">Externo</Label>
              <Switch checked={item.is_external} onCheckedChange={(v) => update(item.id, { is_external: v })} />
            </div>
            <Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar menu
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdmMenuEditor;
