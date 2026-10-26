import { describe, expect, test } from "bun:test";
import { PRODUCT_SLOTS, purchaseUrl, validBuyer } from "./products";

const buyer = { full_name: "Cliente Teste", phone: "79912345678", neighborhood: "Centro", city: "Aracaju" };
describe("Produtos", () => {
  test("inicia com dez espaços numerados", () => {
    expect(PRODUCT_SLOTS).toEqual([1,2,3,4,5,6,7,8,9,10]);
  });
  test("envia compra para o WhatsApp solicitado", () => {
    const url = new URL(purchaseUrl({ id: "produto-teste", title: "Colchão de mola", price: 250 }, buyer, "https://rp.example"));
    expect(url.pathname).toBe("/5579988392252");
    expect(url.searchParams.get("text")?.split("\n")[0]).toBe("Quero saber mais sobre esse produto");
  });
  test("identifica produto e contato sem trocar a conta remetente", () => {
    const url = new URL(purchaseUrl({ id: "123", title: "Cama box", price: 100 }, buyer, "https://rp.example"));
    const text = url.searchParams.get("text");
    expect(text).toContain("Produto: Cama box");
    expect(text).toContain("Telefone cadastrado: 79912345678");
    expect(text).toContain("Nome: Cliente Teste");
  });
  test("exige nome completo telefone bairro e cidade", () => {
    expect(validBuyer(buyer)).toBe(true);
    expect(validBuyer({ ...buyer, full_name: "Cliente" })).toBe(false);
    expect(validBuyer({ ...buyer, phone: "123" })).toBe(false);
    expect(validBuyer({ ...buyer, neighborhood: "" })).toBe(false);
    expect(validBuyer({ ...buyer, city: "" })).toBe(false);
  });
});