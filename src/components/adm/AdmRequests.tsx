import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getSignedImageUrl } from "@/lib/site-content";
import { MessageCircle, Trash2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

type Req = {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  comment: string | null;
  photo_label_url: string | null;
  photo_problem_url: string | null;
  status: string;
  created_at: string;
};

const AdmRequests = () => {
  const [items, setItems] = useState<Req[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false });
    const list = (data as Req[]) ?? [];
    setItems(list);
    const map: Record<string, string> = {};
    for (const r of list) {
      if (r.photo_label_url) {
        const u = await getSignedImageUrl("service-photos", r.photo_label_url);
        if (u) map[`${r.id}-l`] = u;
      }
      if (r.photo_problem_url) {
        const u = await getSignedImageUrl("service-photos", r.photo_problem_url);
        if (u) map[`${r.id}-p`] = u;
      }
    }
    setUrls(map);
  };

  useEffect(() => { load(); }, []);

  const openWhatsApp = (r: Req) => {
    const digits = r.phone.replace(/\D/g, "");
    const msg = `Olá ${r.name}, tudo bem? Recebi seu pedido de agendamento pelo site.`;
    window.open(`https://wa.me/55${digits}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este pedido?")) return;
    await supabase.from("service_requests").delete().eq("id", id);
    toast.success("Pedido excluído");
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos de Agendamento ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 && <p className="text-muted-foreground">Nenhum pedido ainda.</p>}
        {items.map((r) => (
          <div key={r.id} className="p-4 border border-border rounded-lg bg-muted/20 space-y-3">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-lg">{r.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(r.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openWhatsApp(r)} className="gap-2">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </Button>
                <a href={`mailto:reibonsono@gmail.com?subject=Pedido de ${r.name}&body=Nome: ${r.name}%0ATelefone: ${r.phone}%0AEndereço: ${r.address || "-"}%0AComentário: ${r.comment || "-"}`}>
                  <Button size="sm" variant="outline" className="gap-2"><Mail className="w-4 h-4" /> E-mail</Button>
                </a>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> {r.phone}</p>
              {r.address && <p>📍 {r.address}</p>}
              {r.comment && <p className="md:col-span-2 italic">"{r.comment}"</p>}
            </div>

            {(urls[`${r.id}-l`] || urls[`${r.id}-p`]) && (
              <div className="grid grid-cols-2 gap-2">
                {urls[`${r.id}-l`] && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Etiqueta/Modelo</p>
                    <a href={urls[`${r.id}-l`]} target="_blank" rel="noreferrer">
                      <img src={urls[`${r.id}-l`]} alt="Etiqueta" className="w-full max-h-48 object-cover rounded border" />
                    </a>
                  </div>
                )}
                {urls[`${r.id}-p`] && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Problema</p>
                    <a href={urls[`${r.id}-p`]} target="_blank" rel="noreferrer">
                      <img src={urls[`${r.id}-p`]} alt="Problema" className="w-full max-h-48 object-cover rounded border" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AdmRequests;
