import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, MapPin, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentReportMonth, reportMonthBounds, REPORT_TIMEZONE, visitOrigin } from "@/lib/visit-report";

const HITSCOUNTER_URL = "https://hitscounter.dev/api/hit?url=https%3A%2F%2Fconsertodecamaboxaracaju.lovable.app%2F&label=&icon=github&color=%23198754&message=&style=flat&tz=America%2FSao_Paulo";

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
  const [counterError, setCounterError] = useState(false);
  const [counterAttempt, setCounterAttempt] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [reportError, setReportError] = useState(false);
  const month = selectedMonth || currentReportMonth(now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadMonth() {
      setLoading(true);
      setReportError(false);
      setVisits([]);
      const { start, end } = reportMonthBounds(month);
      const rows: Visit[] = [];
      try {
        for (let offset = 0; ; offset += 500) {
          const { data, error } = await supabase.from("visits").select("*")
            .gte("created_at", start).lt("created_at", end)
            .order("created_at", { ascending: false }).order("id", { ascending: false })
            .range(offset, offset + 499);
          if (!active) return;
          if (error) throw error;
          rows.push(...((data as Visit[]) ?? []));
          if (!data || data.length < 500) break;
        }
        if (active) setVisits(rows);
      } catch {
        if (active) setReportError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadMonth();
    return () => { active = false; };
  }, [month]);

  const stats = useMemo(() => {
    const timestamp = now.getTime();
    const day = 24 * 60 * 60 * 1000;
    const uniqueIps = new Set(visits.map((v) => v.ip).filter(Boolean)).size;
    const last24 = visits.filter((v) => timestamp - new Date(v.created_at).getTime() >= 0 && timestamp - new Date(v.created_at).getTime() < day).length;
    const last7 = visits.filter((v) => timestamp - new Date(v.created_at).getTime() >= 0 && timestamp - new Date(v.created_at).getTime() < 7 * day).length;
    const cityCount: Record<string, number> = {};
    for (const v of visits) {
      const key = [v.city, v.region].filter(Boolean).join(", ") || "Desconhecido";
      cityCount[key] = (cityCount[key] || 0) + 1;
    }
    const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { total: visits.length, uniqueIps, last24, last7, topCities };
  }, [visits, now]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <section aria-labelledby="hitscounter-title" className="space-y-3 border-b border-border pb-6">
        <h2 id="hitscounter-title" className="text-lg font-semibold text-primary">Contador de acessos — HitsCounter</h2>
        <p className="text-sm text-foreground break-all">consertodecamaboxaracaju.lovable.app</p>
        {counterError ? (
          <div role="alert" className="space-y-2">
            <p className="text-sm text-foreground">O contador externo está indisponível no momento.</p>
            <Button variant="outline" size="sm" onClick={() => {
              setCounterError(false);
              setCounterAttempt((attempt) => attempt + 1);
            }}>Tentar novamente</Button>
          </div>
        ) : (
          <img
            key={counterAttempt}
            src={counterAttempt ? `${HITSCOUNTER_URL}&refresh=${counterAttempt}` : HITSCOUNTER_URL}
            alt="HitsCounter: acessos de hoje e total de acessos"
            className="h-5 max-w-full"
            referrerPolicy="no-referrer"
            onError={() => setCounterError(true)}
          />
        )}
        <p className="text-sm text-muted-foreground">Hoje / total acumulado · Horário de Brasília · Contador externo sem reinício mensal</p>
        <p className="text-sm text-muted-foreground">O HitsCounter conta carregamentos do selo, inclusive no ADM, e não visitantes únicos. Os registros do site permanecem no relatório abaixo.</p>
      </section>
      <section className="space-y-3" aria-label="Período do relatório">
        <h2 className="text-lg font-semibold text-primary">Relatório mensal do site</h2>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="visit-month" className="text-sm font-medium">Mês</label>
          <Input id="visit-month" type="month" value={month} max={currentReportMonth(now)}
            className="w-44" onChange={(event) => {
              const value = event.target.value;
              if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) setSelectedMonth(value);
            }} />
          <Button variant="outline" size="sm" onClick={() => setSelectedMonth("")}>Mês atual</Button>
        </div>
        <p className="text-sm text-muted-foreground">Novo período no dia 1º, às 00h de Brasília. Histórico preservado; últimas 24h e 7 dias limitados ao mês selecionado.</p>
        <p className="text-sm text-muted-foreground">Telefone e perfil pessoal não são revelados por uma visita. A rede de origem aparece somente quando o navegador a informa.</p>
      </section>
      {reportError && <p role="alert" className="text-destructive">Não foi possível carregar as visitas deste mês. Tente abrir a aba novamente.</p>}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Visitas no mês", value: reportError ? "—" : stats.total },
          { icon: Globe, label: "IPs distintos no mês", value: reportError ? "—" : stats.uniqueIps },
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
                    <td className="py-2 pr-4 text-foreground whitespace-nowrap">{new Date(v.created_at).toLocaleString("pt-BR", { timeZone: REPORT_TIMEZONE })}</td>
                    <td className="py-2 pr-4 text-foreground">{[v.city, v.region, v.country].filter(Boolean).join(", ") || "—"}</td>
                    <td className="py-2 pr-4 text-foreground">{v.path || "/"}</td>
                    <td className="py-2 pr-4 text-foreground max-w-[200px]">{visitOrigin(v.referrer)}</td>
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
