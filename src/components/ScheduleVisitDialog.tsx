import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  phone: z.string().trim().min(10, "Telefone inválido").max(20),
  address: z.string().trim().max(300).optional(),
  comment: z.string().trim().max(1000).optional(),
});

const WHATSAPP_NUMBER = "5579988392252";

type Props = { open: boolean; onOpenChange: (o: boolean) => void };

const PhotoPicker = ({
  label,
  file,
  onChange,
  id,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  id: string;
}) => (
  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center bg-muted/30">
    <p className="text-sm text-muted-foreground mb-3">{label}</p>
    {file ? (
      <div className="space-y-2">
        <img src={URL.createObjectURL(file)} alt="preview" className="max-h-40 mx-auto rounded" />
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
          Remover
        </Button>
      </div>
    ) : (
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <label htmlFor={`${id}-file`} className="cursor-pointer">
          <input
            id={`${id}-file`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-accent">
            <Upload className="w-4 h-4" /> Escolher arquivo
          </span>
        </label>
        <label htmlFor={`${id}-camera`} className="cursor-pointer">
          <input
            id={`${id}-camera`}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
            <Camera className="w-4 h-4" /> Tirar foto
          </span>
        </label>
      </div>
    )}
  </div>
);

const ScheduleVisitDialog = ({ open, onOpenChange }: Props) => {
  const [name, setName] = useState("");
  const [ddd, setDdd] = useState("79");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [photoLabel, setPhotoLabel] = useState<File | null>(null);
  const [photoProblem, setPhotoProblem] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setName(""); setDdd("79"); setPhone(""); setAddress(""); setComment("");
    setPhotoLabel(null); setPhotoProblem(null); setDone(false);
  };

  const uploadPhoto = async (f: File | null, prefix: string) => {
    if (!f) return null;
    const ext = f.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${prefix}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("service-photos").upload(path, f, { contentType: f.type });
    if (error) throw error;
    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = `(${ddd}) ${phone}`;
    const parsed = schema.safeParse({ name, phone: fullPhone, address, comment });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const [labelPath, problemPath] = await Promise.all([
        uploadPhoto(photoLabel, "etiqueta"),
        uploadPhoto(photoProblem, "problema"),
      ]);

      const { error } = await supabase.from("service_requests").insert({
        name: parsed.data.name,
        phone: fullPhone,
        address: parsed.data.address || null,
        comment: parsed.data.comment || null,
        photo_label_url: labelPath,
        photo_problem_url: problemPath,
      });
      if (error) throw error;

      // Also open WhatsApp with the info so the owner receives it immediately
      const msg = [
        "*Novo agendamento pelo site*",
        `Nome: ${parsed.data.name}`,
        `Telefone: ${fullPhone}`,
        parsed.data.address ? `Endereço: ${parsed.data.address}` : null,
        parsed.data.comment ? `Comentário: ${parsed.data.comment}` : null,
        labelPath ? "Foto da etiqueta: (anexada no painel)" : null,
        problemPath ? "Foto do problema: (anexada no painel)" : null,
      ].filter(Boolean).join("\n");
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");

      setDone(true);
      toast.success("Pedido enviado! Entraremos em contato.");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar: " + (err.message || "tente novamente"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Agendar visita</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo. Só nome e telefone são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
            <h3 className="text-xl font-bold">Pedido enviado!</h3>
            <p className="text-muted-foreground">
              Recebemos suas informações. O WhatsApp foi aberto com o resumo — envie a mensagem para agilizar o atendimento.
            </p>
            <Button onClick={() => { reset(); onOpenChange(false); }}>Fechar</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
            </div>

            <div>
              <Label>Telefone / WhatsApp *</Label>
              <div className="flex gap-2">
                <Input value={ddd} onChange={(e) => setDdd(e.target.value.replace(/\D/g, "").slice(0, 3))} className="w-20" placeholder="DDD" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="99999-9999" className="flex-1" required />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <PhotoPicker id="p1" label="Foto da etiqueta com o Modelo" file={photoLabel} onChange={setPhotoLabel} />
              <PhotoPicker id="p2" label="Foto da parte onde está o problema" file={photoProblem} onChange={setPhotoProblem} />
            </div>

            <div>
              <Label htmlFor="comment">Comentário</Label>
              <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={1000} placeholder="Descreva o problema (opcional)" />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</> : "Enviar"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleVisitDialog;
