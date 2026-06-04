-- Setup instructions for Memory Jar image storage in Supabase

-- 1. In Supabase Dashboard, go to Storage
-- 2. Create a new bucket called "memories" (public or private, your choice)
-- 3. Run this SQL to enable RLS policies:

-- Allow authenticated users to upload to their couple's folder
create policy "memories_upload" on storage.objects for insert
  with check (
    bucket_id = 'memories' 
    and auth.role() = 'authenticated'
  );

-- Allow authenticated users to read memories
create policy "memories_read" on storage.objects for select
  using (bucket_id = 'memories');

-- Allow users to delete their own memories
create policy "memories_delete" on storage.objects for delete
  using (
    bucket_id = 'memories'
    and auth.role() = 'authenticated'
  );
