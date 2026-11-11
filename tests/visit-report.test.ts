import { describe, expect, test } from "bun:test";
import { currentReportMonth, reportMonthBounds, visitOrigin } from "../src/lib/visit-report";

describe("Relatório mensal de visitas", () => {
  test("zera na virada do mês no horário de Brasília, sem incluir o mês anterior", () => {
    expect(currentReportMonth(new Date("2026-12-01T02:59:59Z"))).toBe("2026-11");
    expect(currentReportMonth(new Date("2026-12-01T03:00:00Z"))).toBe("2026-12");
    const { start, end } = reportMonthBounds("2026-12");
    expect(start).toBe("2026-12-01T03:00:00.000Z");
    expect(end).toBe("2027-01-01T03:00:00.000Z");
    const records = ["2026-12-01T02:59:59.000Z", start, "2026-12-31T23:00:00.000Z", end];
    expect(records.filter((date) => date >= start && date < end)).toEqual([start, "2026-12-31T23:00:00.000Z"]);
  });
  test("identifica somente a rede de origem, nunca o perfil pessoal", () => {
    expect(visitOrigin("https://l.instagram.com/perfil-pessoal")).toBe("Instagram");
    expect(visitOrigin("https://www.facebook.com/pessoa")).toBe("Facebook");
    expect(visitOrigin("https://wa.me/79912345678")).toBe("WhatsApp");
    expect(visitOrigin(null)).toBe("Direto / origem não informada");
    expect(visitOrigin("https://fakeinstagram.com/")).toBe("fakeinstagram.com");
  });
});