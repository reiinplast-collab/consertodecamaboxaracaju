
CREATE TABLE public.visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  timezone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.visits TO anon, authenticated;
GRANT ALL ON public.visits TO service_role;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log a visit" ON public.visits FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read visits" ON public.visits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX visits_created_at_idx ON public.visits (created_at DESC);
