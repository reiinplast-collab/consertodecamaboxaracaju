export const REPORT_TIMEZONE = "America/Sao_Paulo";

export function currentReportMonth(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: REPORT_TIMEZONE, year: "numeric", month: "2-digit",
  }).formatToParts(now);
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
}

export function reportMonthBounds(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Mês inválido");
  const [year, number] = month.split("-").map(Number);
  const next = number === 12 ? `${year + 1}-01` : `${year}-${String(number + 1).padStart(2, "0")}`;
  return {
    start: new Date(`${month}-01T00:00:00-03:00`).toISOString(),
    end: new Date(`${next}-01T00:00:00-03:00`).toISOString(),
  };
}

export function visitOrigin(referrer: string | null): string {
  if (!referrer) return "Direto / origem não informada";
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    const platforms = [
      ["Facebook", ["facebook.com", "fb.com"]],
      ["Instagram", ["instagram.com"]],
      ["YouTube", ["youtube.com", "youtu.be"]],
      ["WhatsApp", ["whatsapp.com", "wa.me"]],
    ] as const;
    for (const [name, domains] of platforms) {
      if (domains.some((domain) => host === domain || host.endsWith(`.${domain}`))) return name;
    }
    return host;
  } catch {
    return "Origem não informada";
  }
}