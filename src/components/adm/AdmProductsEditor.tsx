import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, Loader2, Pencil, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_SLOTS, formatPrice, loadProducts, type Product } from "@/lib/products";
import { toast } from "sonner";

type Draft = { slot: number; title: string; description: string; price: string; image_path: string | null };
const AdmProductsEditor = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [urls, setUrls] = useState<Record<string, string | null>>({});
  const [draft, setDraft] = useState<Draft | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true); setFailed(false);
    try { const result = await loadProducts(); setProducts(result.products); setUrls(result.urls); }
    catch { setFailed(true); toast.error("Não foi possível carregar os produtos."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const edit = (slot: number, product?: Product) => {
    setFile(null);
    setDraft({ slot, title: product?.title ?? "", description: product?.description ?? "", price: product ? String(product.price).replace(".", ",") : "", image_path: product?.image_path ?? null });
  };
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (!draft) return;
    const price = Number(draft.price.replace(",", "."));
    if (!draft.title.trim() || !draft.price.trim() || !Number.isFinite(price) || price < 0) { toast.error("Informe o nome e um preço válido."); return; }
    setSaving(true);
    let uploaded: string | null = null;
    try {
      let imagePath = draft.image_path;
      if (file) {
        if (!file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
        const path = `products/${crypto.randomUUID()}.${file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg"}`;
        const { error } = await supabase.storage.from("site-images").upload(path, file, { contentType: file.type });
        if (error) throw error;
        uploaded = path; imagePath = path;
      }
      const existing = products.find((product) => product.slot === draft.slot);
      const { error } = await supabase.from("products").upsert({ ...(existing ? { id: existing.id } : {}), slot: draft.slot, title: draft.title.trim(), description: draft.description.trim(), price, image_path: imagePath }, { onConflict: "slot" });
      if (error) throw error;
      setDraft(null); setFile(null); toast.success("Produto salvo!"); await load();
    } catch (error) {
      if (uploaded) await supabase.storage.from("site-images").remove([uploaded]);
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o produto.");
    } finally { setSaving(false); }
  };
  const remove = async (product: Product) => {
    if (!window.confirm(`Excluir “${product.title}”? O espaço ficará disponível novamente.`)) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
      toast.success("Produto excluído."); await load();
    } catch { toast.error("Não foi possível excluir o produto."); }
    finally { setSaving(false); }
  };

  return <section className="space-y-6">
    <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-xl font-bold text-primary">Loja de produtos</h2><span className="text-sm text-muted-foreground">{products.length} de 10 espaços preenchidos</span></div>
    {loading ? <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" /> : failed ? <Button onClick={load} variant="outline">Tentar novamente</Button> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {PRODUCT_SLOTS.map((slot) => {
        const product = products.find((item) => item.slot === slot);
        return <article key={slot} className="border border-border rounded-lg overflow-hidden bg-card flex flex-col">
          <div className="aspect-[4/3] bg-muted flex items-center justify-center">{product && urls[product.id] ? <img src={urls[product.id] ?? undefined} alt={product.title} className="w-full h-full object-contain" /> : <ImagePlus className="w-9 h-9 text-muted-foreground" />}</div>
          <div className="p-4 flex flex-col flex-1 gap-3">
            <span className="text-xs text-muted-foreground">Espaço {String(slot).padStart(2, "0")}</span>
            <h3 className="font-semibold break-words">{product?.title ?? "Disponível"}</h3>
            <p className="font-bold mt-auto">{product ? formatPrice(product.price) : "—"}</p>
            <div className="flex gap-2"><Button variant="outline" size="sm" className="flex-1" disabled={saving} onClick={() => edit(slot, product)}>{product ? <Pencil className="w-4 h-4 mr-2" /> : <ImagePlus className="w-4 h-4 mr-2" />}{product ? "Editar" : "Adicionar"}</Button>{product && <Button variant="ghost" size="icon" aria-label={`Excluir ${product.title}`} title="Excluir produto" disabled={saving} onClick={() => remove(product)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}</div>
          </div>
        </article>;
      })}
    </div>}
    <Dialog open={!!draft} onOpenChange={(open) => { if (!open && !saving) { setDraft(null); setFile(null); } }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-xl max-h-[90dvh] overflow-y-auto rounded-lg" onInteractOutside={(event) => { if (saving) event.preventDefault(); }}>
        <DialogHeader><DialogTitle className="text-primary">Produto — espaço {draft?.slot}</DialogTitle><DialogDescription>Imagem, informações e preço do produto.</DialogDescription></DialogHeader>
        {draft && <form onSubmit={save} className="space-y-4">
          {(preview || (draft.image_path && urls[products.find((product) => product.slot === draft.slot)?.id ?? ""])) && <img src={preview ?? urls[products.find((product) => product.slot === draft.slot)?.id ?? ""] ?? undefined} alt="Imagem do produto" className="w-full h-44 object-contain bg-muted rounded-md" />}
          <input ref={input} type="file" accept="image/*" aria-label="Imagem do produto" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <div className="flex gap-2 flex-wrap"><Button type="button" variant="outline" onClick={() => input.current?.click()} disabled={saving}><Upload className="w-4 h-4 mr-2" /> Escolher imagem</Button>{(file || draft.image_path) && <Button type="button" variant="ghost" onClick={() => { setFile(null); setDraft({ ...draft, image_path: null }); }}>Remover imagem</Button>}</div>
          <div><Label htmlFor="product-title">Nome do produto</Label><Input id="product-title" required maxLength={160} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></div>
          <div><Label htmlFor="product-description">Informações do produto</Label><Textarea id="product-description" rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></div>
          <div><Label htmlFor="product-price">Preço (R$)</Label><Input id="product-price" inputMode="decimal" placeholder="0,00" required value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} /></div>
          <div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Salvar produto</Button><Button type="button" variant="ghost" disabled={saving} onClick={() => { setDraft(null); setFile(null); }}>Cancelar</Button></div>
        </form>}
      </DialogContent>
    </Dialog>
  </section>;
};
export default AdmProductsEditor;