import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, MapPin, Clock, Globe } from "lucide-react";

type Visit = {
  id: string;
  path: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  timezone: string | null;
  created_at: string;
};

const AdmVisits = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("visits").select("*").order("created_at", { ascending: false }).limit(500).then(({ data }) => {
      setVisits((data as Visit[]) ?? []);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const uniqueIps = new Set(visits.map((v) => v.ip).filter(Boolean)).size;
    const last24 = visits.filter((v) => now - new Date(v.created_at).getTime() < day).length;
    const last7 = visits.filter((v) => now - new Date(v.created_at).getTime() < 7 * day).length;
    const cityCount: Record<string, number> = {};
    for (const v of visits) {
      const key = [v.city, v.region].filter(Boolean).join(", ") || "Desconhecido";
      cityCount[key] = (cityCount[key] || 0) + 1;
    }
    const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { total: visits.length, uniqueIps, last24, last7, topCities };
  }, [visits]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total de visitas", value: stats.total },
          { icon: Globe, label: "Visitantes únicos (IP)", value: stats.uniqueIps },
          { icon: Clock, label: "Últimas 24h", value: stats.last24 },
          { icon: Clock, label: "Últimos 7 dias", value: stats.last7 },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <s.icon className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-primary">{s.value}</div>
                  <div className="text-sm text-foreground">{s.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Localidades mais frequentes</CardTitle></CardHeader>
        <CardContent>
          {stats.topCities.length === 0 ? <p className="text-foreground">Nenhum dado ainda.</p> : (
            <ul className="space-y-2">
              {stats.topCities.map(([city, n]) => (
                <li key={city} className="flex justify-between border-b border-border pb-1">
                  <span className="text-foreground">{city}</span>
                  <span className="font-semibold text-primary">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Últimas visitas</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-foreground">
                  <th className="py-2 pr-4">Data/Hora</th>
                  <th className="py-2 pr-4">Local</th>
                  <th className="py-2 pr-4">Página</th>
                  <th className="py-2 pr-4">Origem</th>
                  <th className="py-2 pr-4">IP</th>
                </tr>
              </thead>
              <tbody>
                {visits.slice(0, 100).map((v) => (
                  <tr key={v.id} className="border-b border-border/50">
                    <td className="py-2 pr-4 text-foreground whitespace-nowrap">{new Date(v.created_at).toLocaleString("pt-BR")}</td>
                    <td className="py-2 pr-4 text-foreground">{[v.city, v.region, v.country].filter(Boolean).join(", ") || "—"}</td>
                    <td className="py-2 pr-4 text-foreground">{v.path || "/"}</td>
                    <td className="py-2 pr-4 text-foreground truncate max-w-[200px]">{v.referrer || "direto"}</td>
                    <td className="py-2 pr-4 text-foreground">{v.ip || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visits.length === 0 && <p className="text-foreground py-4">Nenhuma visita registrada ainda.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmVisits;
