import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ImagePlus, Loader2, MessageCircle, ShoppingBag, UserRound, ArrowLeft, RefreshCw } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { BUYER_SESSION_KEY, PRODUCT_SLOTS, formatPrice, loadProducts, purchaseUrl, readBuyer, validBuyer, type Buyer, type Product } from "@/lib/products";
import { toast } from "sonner";

const Products = () => {
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState<Buyer | null>(readBuyer);
  const [registering, setRegistering] = useState(() => !readBuyer());
  const [form, setForm] = useState<Buyer>(() => readBuyer() ?? { full_name: "", phone: "", neighborhood: "", city: "" });
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [urls, setUrls] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true); setError(false);
    try { const result = await loadProducts(); setProducts(result.products); setUrls(result.urls); }
    catch { setError(true); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    if (!buyer) return;
    void load();
    const timer = window.setInterval(() => { void load(); }, 50 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [buyer]);

  const saveBuyer = async (event: FormEvent) => {
    event.preventDefault();
    if (!validBuyer(form)) { toast.error("Preencha nome completo, telefone com DDD, bairro e cidade."); return; }
    setSaving(true);
    const contact = { full_name: form.full_name.trim(), phone: form.phone.replace(/\D/g, ""), neighborhood: form.neighborhood.trim(), city: form.city.trim() };
    try {
      const { error } = await supabase.from("purchase_registrations").insert(contact);
      if (error) throw error;
      sessionStorage.setItem(BUYER_SESSION_KEY, JSON.stringify(contact));
      setBuyer(contact); setRegistering(false); toast.success("Cadastro salvo!");
    } catch { toast.error("Não foi possível salvar o cadastro. Tente novamente."); }
    finally { setSaving(false); }
  };

  return <div className="min-h-screen bg-background">
    <SiteHeader />
    <main className="container mx-auto px-4 py-8 md:py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary mb-6"><ArrowLeft className="w-4 h-4" /> Voltar ao site</Link>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6 mb-8">
        <div><div className="flex items-center gap-3"><ShoppingBag className="w-7 h-7 text-primary" /><h1 className="text-3xl font-bold text-primary">Produtos</h1></div><p className="mt-2 text-foreground">RP SERVIÇOS</p></div>
        {buyer && <div className="flex flex-wrap items-center gap-3"><span className="text-sm text-foreground break-words">Olá, {buyer.full_name}</span><Button variant="outline" size="sm" onClick={() => setRegistering(true)}><UserRound className="w-4 h-4 mr-2" /> Meu cadastro</Button></div>}
      </div>
      {buyer && (loading ? <div className="py-20 flex justify-center" role="status"><Loader2 className="w-8 h-8 text-primary animate-spin" /><span className="sr-only">Carregando produtos</span></div> : error ? <div className="py-12 text-center"><p className="mb-4">Não foi possível carregar os produtos.</p><Button onClick={load} variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente</Button></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCT_SLOTS.map((slot) => {
          const product = products.find((item) => item.slot === slot);
          return <article key={slot} id={product ? `produto-${product.id}` : undefined} className="overflow-hidden rounded-lg border border-border bg-card flex flex-col">
            <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
              {product && urls[product.id] ? <img src={urls[product.id] ?? undefined} alt={product.title} className="w-full h-full object-contain" /> : <div className="flex flex-col items-center gap-3 text-muted-foreground"><ImagePlus className="w-9 h-9" /><span className="text-sm">{product ? "Imagem em breve" : `Espaço ${String(slot).padStart(2, "0")}`}</span></div>}
            </div>
            <div className="p-5 flex flex-col flex-1 gap-3">
              <h2 className="font-semibold text-lg text-primary break-words">{product?.title ?? "Produto em breve"}</h2>
              {product?.description && <p className="text-sm text-foreground whitespace-pre-wrap break-words">{product.description}</p>}
              <p className="text-xl font-bold text-foreground mt-auto">{product ? formatPrice(product.price) : "—"}</p>
              {product ? <Button asChild className="w-full"><a href={purchaseUrl(product, buyer, window.location.origin)} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4 mr-2" /> Comprar</a></Button> : <Button disabled className="w-full">Em breve</Button>}
            </div>
          </article>;
        })}
      </div>)}
    </main>
    <Dialog open={registering} onOpenChange={(open) => { if (!open && !buyer) navigate("/"); setRegistering(open); }}>
      <DialogContent className="max-w-lg w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto rounded-lg">
        <DialogHeader><DialogTitle className="text-primary leading-snug">CADASTRO DE COMPRA</DialogTitle><DialogDescription>Seus dados de contato para atendimento sobre produtos.</DialogDescription></DialogHeader>
        <form onSubmit={saveBuyer} className="space-y-4">
          <div><Label htmlFor="buyer-name">Nome completo</Label><Input id="buyer-name" autoComplete="name" required maxLength={120} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><Label htmlFor="buyer-phone">Telefone com DDD</Label><Input id="buyer-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(79) 98839-2252" required maxLength={16} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label htmlFor="buyer-neighborhood">Bairro</Label><Input id="buyer-neighborhood" required maxLength={120} value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} /></div>
          <div><Label htmlFor="buyer-city">Cidade</Label><Input id="buyer-city" autoComplete="address-level2" required maxLength={120} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <p className="text-xs text-muted-foreground">Ao comprar, esses dados serão incluídos na mensagem. O envio usa a conta do WhatsApp aberta no seu aparelho.</p>
          <Button type="submit" disabled={saving} className="w-full">{saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Salvar</Button>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
};
export default Products;