import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getSignedImageUrl } from "@/lib/site-content";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";

type Post = { id: string; title: string; body: string; image_url: string | null; created_at: string };

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from("posts").select("*").eq("id", id).maybeSingle().then(async ({ data }) => {
      const p = data as Post | null;
      setPost(p);
      if (p?.image_url) setUrl(await getSignedImageUrl("site-images", p.image_url));
      setLoading(false);
    });
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-6"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        </Link>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : !post ? (
          <p className="text-foreground">Postagem não encontrada.</p>
        ) : (
          <article className="space-y-6">
            <div className="text-xs uppercase tracking-wide text-primary font-semibold">
              {new Date(post.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-primary leading-tight">{post.title}</h1>
            {url && <img src={url} alt={post.title} className="w-full rounded-2xl shadow-comfort" />}
            <div className="prose prose-lg max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
              {post.body}
            </div>
          </article>
        )}
      </main>
    </div>
  );
};

export default PostDetail;
