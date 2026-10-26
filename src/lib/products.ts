import { supabase } from "@/integrations/supabase/client";
import { getSignedImageUrl } from "@/lib/site-content";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type Buyer = { full_name: string; phone: string; neighborhood: string; city: string };
export const PRODUCT_SLOTS = Array.from({ length: 10 }, (_, index) => index + 1);
export const BUYER_SESSION_KEY = "rp-purchase-contact";
export const formatPrice = (price: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

export function validBuyer(buyer: Buyer) {
  return buyer.full_name.trim().split(/\s+/).length >= 2 && /^\d{10,11}$/.test(buyer.phone.replace(/\D/g, "")) && !!buyer.neighborhood.trim() && !!buyer.city.trim();
}

export function readBuyer(): Buyer | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(BUYER_SESSION_KEY) || "null");
    if (!parsed || ![parsed.full_name, parsed.phone, parsed.neighborhood, parsed.city].every((value) => typeof value === "string")) return null;
    return validBuyer(parsed) ? parsed : null;
  } catch { return null; }
}

export function purchaseUrl(product: Pick<Product, "title" | "price" | "id">, buyer: Buyer, origin: string) {
  const message = [
    "Quero saber mais sobre esse produto",
    `Produto: ${product.title}`,
    `Preço: ${formatPrice(product.price)}`,
    `Referência: ${product.id}`,
    `Link: ${origin}/produtos#produto-${product.id}`,
    "",
    `Nome: ${buyer.full_name}`,
    `Telefone cadastrado: ${buyer.phone}`,
    `Bairro: ${buyer.neighborhood}`,
    `Cidade: ${buyer.city}`,
  ].join("\n");
  return `https://wa.me/5579988392252?text=${encodeURIComponent(message)}`;
}

export async function loadProducts() {
  const { data, error } = await supabase.from("products").select("*").order("slot");
  if (error) throw error;
  const products = data ?? [];
  const entries = await Promise.all(products.map(async (product) => [product.id, await getSignedImageUrl("site-images", product.image_path)] as const));
  return { products, urls: Object.fromEntries(entries) as Record<string, string | null> };
}