-- Public (anon) reads must not call the admin-only security definer helper:
-- anon has no EXECUTE on public.has_role, so any policy that calls it fails with
-- "permission denied for function has_role" and the whole query returns nothing.
-- Admins keep their own policies (authenticated can execute has_role).

drop policy if exists "Anyone reads published posts" on public.posts;
create policy "Anyone reads published posts" on public.posts
  for select to anon, authenticated
  using (published = true);

drop policy if exists "Anyone can read public site settings" on public.site_settings;
create policy "Anyone can read public site settings" on public.site_settings
  for select to anon, authenticated
  using (key = any (array['hero','theme','services','about','contact','social','service_videos']));

drop policy if exists "Anyone can read published site-images" on storage.objects;
create policy "Anyone can read published site-images" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'site-images'
    and (
      exists (select 1 from public.products p where p.image_path = storage.objects.name)
      or exists (select 1 from public.posts p where p.published and p.image_url = storage.objects.name)
      or exists (select 1 from public.site_settings s where s.key = 'hero' and s.value ->> 'image_path' = storage.objects.name)
    )
  );

drop policy if exists "Anyone can read published service videos" on storage.objects;
create policy "Anyone can read published service videos" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'service-videos'
    and exists (
      select 1
      from public.site_settings s,
      lateral jsonb_array_elements(
        case when jsonb_typeof(s.value) = 'array' then s.value else '[]'::jsonb end
      ) v(value)
      where s.key = 'service_videos' and (v.value ->> 'path') = storage.objects.name
    )
  );

-- Admin previews of files that are not referenced yet (newly uploaded images/videos).
create policy "Admins read site-images" on storage.objects
  for select to authenticated
  using (bucket_id = 'site-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins read service videos" on storage.objects
  for select to authenticated
  using (bucket_id = 'service-videos' and public.has_role(auth.uid(), 'admin'));
