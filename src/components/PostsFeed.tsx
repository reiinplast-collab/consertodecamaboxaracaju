import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { getSignedImageUrl } from "@/lib/site-content";
import { ArrowRight } from "lucide-react";

type Post = { id: string; title: string; body: string; image_url: string | null; created_at: string };

const PostsFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        const list = (data as Post[]) ?? [];
        setPosts(list);
        const map: Record<string, string> = {};
        for (const p of list) {
          if (p.image_url) {
            const url = await getSignedImageUrl("site-images", p.image_url);
            if (url) map[p.id] = url;
          }
        }
        setUrls(map);
      });
  }, []);

  if (posts.length === 0) return null;
  const [latest, ...rest] = posts;

  return (
    <section className="py-12 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">Novidades</h2>

        <Link to={`/post/${latest.id}`} className="block group">
          <Card className="border-0 shadow-comfort overflow-hidden bg-card hover:shadow-2xl transition-shadow">
            <div className="grid md:grid-cols-2">
              {urls[latest.id] && (
                <img src={urls[latest.id]} alt={latest.title} className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
              <CardContent className={`p-8 ${!urls[latest.id] ? "md:col-span-2" : ""}`}>
                <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-2">
                  {new Date(latest.created_at).toLocaleDateString("pt-BR")}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-3">{latest.title}</h3>
                <p className="text-foreground line-clamp-4">{latest.body}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-primary font-semibold">
                  Ler mais <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>

        {rest.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {rest.slice(0, 6).map((p) => (
              <Link key={p.id} to={`/post/${p.id}`} className="block group">
                <Card className="border-0 shadow-soft overflow-hidden h-full hover:shadow-comfort transition-shadow">
                  {urls[p.id] && <img src={urls[p.id]} alt={p.title} className="w-full h-40 object-cover" />}
                  <CardContent className="p-5">
                    <div className="text-xs text-foreground mb-1">{new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
                    <h4 className="font-bold text-primary mb-1 group-hover:underline">{p.title}</h4>
                    <p className="text-sm text-foreground line-clamp-3">{p.body}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PostsFeed;
