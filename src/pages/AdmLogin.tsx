import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ADMIN_EMAIL = "reibiel@bomsono.local";

const AdmLogin = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState("Reibiel");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    // Ensure admin account exists (idempotent)
    supabase.functions.invoke("bootstrap-admin").finally(() => setBootstrapping(false));

    // If already logged in, go to panel
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/adm", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (login.trim().toLowerCase() !== "reibiel") {
      toast.error("Usuário inválido");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    setLoading(false);
    if (error) {
      toast.error("Senha incorreta");
      return;
    }
    toast.success("Bem-vindo, Reibiel!");
    navigate("/adm", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-comfort">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Acesso Administrativo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="login">Login</Label>
              <Input id="login" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading || bootstrapping}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</> : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmLogin;
