
-- Restrict SECURITY DEFINER internal functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role must remain callable by authenticated users (used in RLS via auth.uid())
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;

-- Storage policies: site-images (admins upload/delete; anyone signed or not can be authorized to read via signed URLs, but we allow anon SELECT on this bucket so public site can load with getPublicUrl-like signed patterns)
CREATE POLICY "Anyone can read site-images" ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');
CREATE POLICY "Admins upload site-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update site-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete site-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(),'admin'));

-- service-photos: anyone can upload (customer submitting form); only admins can read/manage
CREATE POLICY "Anyone can upload service-photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'service-photos');
CREATE POLICY "Admins read service-photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'service-photos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete service-photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'service-photos' AND public.has_role(auth.uid(),'admin'));
