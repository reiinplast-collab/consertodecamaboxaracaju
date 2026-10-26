import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Loader2 } from "lucide-react";
import AdmHeroEditor from "@/components/adm/AdmHeroEditor";
import AdmThemeEditor from "@/components/adm/AdmThemeEditor";
import AdmContactEditor from "@/components/adm/AdmContactEditor";
import AdmSocialEditor from "@/components/adm/AdmSocialEditor";
import AdmMenuEditor from "@/components/adm/AdmMenuEditor";
import AdmPostsEditor from "@/components/adm/AdmPostsEditor";
import AdmRequests from "@/components/adm/AdmRequests";
import AdmVisits from "@/components/adm/AdmVisits";
import AdmProductsEditor from "@/components/adm/AdmProductsEditor";

const AdmPanel = () => {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAdmin();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate("/adm/login", { replace: true });
      return;
    }
    setChecked(true);
  }, [session, loading, navigate]);

  if (loading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg mb-4">Sua conta não tem permissão de administrador.</p>
          <Button onClick={async () => { await supabase.auth.signOut(); navigate("/adm/login"); }}>Sair</Button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/adm/login");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg text-primary">Painel ADM — RP Serviços</h1>
            <p className="text-xs text-foreground">Reibiel</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")}>Ver site</Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="hero">Página inicial</TabsTrigger>
            <TabsTrigger value="theme">Cores / Botões</TabsTrigger>
            <TabsTrigger value="contact">Contato</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="social">Redes sociais</TabsTrigger>
            <TabsTrigger value="posts">Postagens</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="requests">Pedidos</TabsTrigger>
            <TabsTrigger value="visits">Visitas</TabsTrigger>
          </TabsList>

          <TabsContent value="hero"><AdmHeroEditor /></TabsContent>
          <TabsContent value="theme"><AdmThemeEditor /></TabsContent>
          <TabsContent value="contact"><AdmContactEditor /></TabsContent>
          <TabsContent value="menu"><AdmMenuEditor /></TabsContent>
          <TabsContent value="social"><AdmSocialEditor /></TabsContent>
          <TabsContent value="posts"><AdmPostsEditor /></TabsContent>
          <TabsContent value="products"><AdmProductsEditor /></TabsContent>
          <TabsContent value="requests"><AdmRequests /></TabsContent>
          <TabsContent value="visits"><AdmVisits /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdmPanel;
