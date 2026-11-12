DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read public site settings" ON public.site_settings FOR SELECT TO anon, authenticated
USING (key IN ('hero','theme','services','about','contact','social','service_videos') OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can create request" ON public.service_requests;
CREATE POLICY "Anyone can create valid request" ON public.service_requests FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 2 AND 100
  AND length(phone) BETWEEN 8 AND 30
  AND (address IS NULL OR length(address) <= 300)
  AND (comment IS NULL OR length(comment) <= 2000)
  AND status = 'novo'
  AND (photo_label_url IS NULL OR photo_label_url ~ '^[0-9]+-etiqueta-[a-z0-9]+\.[A-Za-z0-9]{1,5}$')
  AND (photo_problem_url IS NULL OR photo_problem_url ~ '^[0-9]+-problema-[a-z0-9]+\.[A-Za-z0-9]{1,5}$')
);

DROP POLICY IF EXISTS "Anyone can log a visit" ON public.visits;
CREATE POLICY "Anyone can log a valid visit" ON public.visits FOR INSERT TO anon, authenticated
WITH CHECK (
  (path IS NULL OR (path LIKE '/%' AND length(path) <= 300))
  AND (referrer IS NULL OR length(referrer) <= 1000)
  AND (user_agent IS NULL OR length(user_agent) <= 500)
  AND (ip IS NULL OR length(ip) <= 64)
  AND (city IS NULL OR length(city) <= 120)
  AND (region IS NULL OR length(region) <= 120)
  AND (country IS NULL OR length(country) <= 120)
  AND (timezone IS NULL OR length(timezone) <= 64)
  AND created_at > now() - interval '5 minutes'
);

DROP POLICY IF EXISTS "Anyone can read site-images" ON storage.objects;
CREATE POLICY "Anyone can read published site-images" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'site-images' AND (
  EXISTS (SELECT 1 FROM public.products p WHERE p.image_path = storage.objects.name)
  OR EXISTS (SELECT 1 FROM public.posts p WHERE p.published AND p.image_url = storage.objects.name)
  OR EXISTS (SELECT 1 FROM public.site_settings s WHERE s.key = 'hero' AND s.value->>'image_path' = storage.objects.name)
  OR public.has_role(auth.uid(), 'admin'::app_role)
));

DROP POLICY IF EXISTS "Public reads service videos" ON storage.objects;
CREATE POLICY "Anyone can read published service videos" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'service-videos' AND (
  EXISTS (SELECT 1 FROM public.site_settings s, jsonb_array_elements(CASE WHEN jsonb_typeof(s.value)='array' THEN s.value ELSE '[]'::jsonb END) v
          WHERE s.key = 'service_videos' AND v->>'path' = storage.objects.name)
  OR public.has_role(auth.uid(), 'admin'::app_role)
));

DROP POLICY IF EXISTS "Anyone can upload service-photos" ON storage.objects;
CREATE POLICY "Anyone can upload valid service-photos" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'service-photos'
  AND name ~ '^[0-9]+-(etiqueta|problema)-[a-z0-9]+\.[A-Za-z0-9]{1,5}$'
  AND NOT EXISTS (SELECT 1 FROM public.service_requests r WHERE r.photo_label_url = storage.objects.name OR r.photo_problem_url = storage.objects.name)
);