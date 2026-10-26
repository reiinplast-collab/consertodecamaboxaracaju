CREATE TABLE public.products (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slot integer NOT NULL UNIQUE CHECK (slot BETWEEN 1 AND 10),
 title text NOT NULL,
 description text NOT NULL DEFAULT '',
 price numeric(12,2) NOT NULL CHECK (price >= 0),
 image_path text,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TABLE public.purchase_registrations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name text NOT NULL,
 phone text NOT NULL,
 neighborhood text NOT NULL,
 city text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.purchase_registrations TO anon;
GRANT SELECT, INSERT ON public.purchase_registrations TO authenticated;
GRANT ALL ON public.purchase_registrations TO service_role;
ALTER TABLE public.purchase_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submits purchase registration" ON public.purchase_registrations FOR INSERT TO anon, authenticated WITH CHECK (length(trim(full_name)) >= 3 AND phone ~ '^[0-9]{10,11}$' AND length(trim(neighborhood)) > 0 AND length(trim(city)) > 0);
CREATE POLICY "Admins read purchase registrations" ON public.purchase_registrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));