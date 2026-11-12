import { Share2, Instagram, Facebook, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

type Props = { postId: string; title: string };

const ShareButton = ({ postId, title }: Props) => {
  const url = `${window.location.origin}/post/${postId}`;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const open = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

  const instagram = async () => {
    try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
    toast.success("Link copiado! Cole no Instagram (story ou direct).");
    open("https://www.instagram.com/");
  };

  const options = [
    { label: "Instagram", icon: <Instagram className="w-4 h-4" />, action: instagram },
    { label: "Facebook", icon: <Facebook className="w-4 h-4" />, action: () => open(`https://www.facebook.com/sharer/sharer.php?u=${u}`) },
    { label: "Telegram", icon: <Send className="w-4 h-4" />, action: () => open(`https://t.me/share/url?url=${u}&text=${t}`) },
    { label: "X", icon: <span className="w-4 h-4 font-bold leading-4 text-center">𝕏</span>, action: () => open(`https://twitter.com/intent/tweet?url=${u}&text=${t}`) },
    { label: "WhatsApp", icon: <MessageCircle className="w-4 h-4" />, action: () => open(`https://wa.me/?text=${t}%20${u}`) },
  ];

  return (
    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" className="gap-2 font-bold"><Share2 className="w-4 h-4" /> COMPARTILHA</Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-1">
            {options.map((o) => (
              <Button key={o.label} variant="ghost" className="justify-start gap-3" onClick={o.action}>
                {o.icon} {o.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ShareButton;
