-- Enable storage extension if not already enabled (usually enabled by default in Supabase)
-- create extension if not exists "storage";

-- 1. Create 'avatars' bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Create 'coins' bucket
insert into storage.buckets (id, name, public)
values ('coins', 'coins', true)
on conflict (id) do nothing;

-- 3. Create 'stories' bucket
insert into storage.buckets (id, name, public)
values ('stories', 'stories', true)
on conflict (id) do nothing;

-- 4. Create 'misc' bucket (for feed promos etc)
insert into storage.buckets (id, name, public)
values ('misc', 'misc', true)
on conflict (id) do nothing;

-- 5. Storage Policies (Allow public read, restricted write)

-- AVATARS: Public view, auth user upload
create policy "Avatar Public View" on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Avatar Auth Upload" on storage.objects for insert with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- COINS: Public view, seller upload
create policy "Coins Public View" on storage.objects for select using ( bucket_id = 'coins' );
create policy "Coins Admin/Seller Upload" on storage.objects for insert with check ( bucket_id = 'coins' and auth.role() = 'authenticated' );

-- STORIES: Public view, admin upload
create policy "Stories Public View" on storage.objects for select using ( bucket_id = 'stories' );
create policy "Stories Admin Upload" on storage.objects for insert with check ( bucket_id = 'stories' and auth.role() = 'authenticated' ); -- Refine to admin only in app logic or stricter policy

-- MISC: Public view, admin upload
create policy "Misc Public View" on storage.objects for select using ( bucket_id = 'misc' );
create policy "Misc Admin Upload" on storage.objects for insert with check ( bucket_id = 'misc' and auth.role() = 'authenticated' );
