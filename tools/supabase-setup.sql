-- ============================================================
-- Thiết lập Supabase cho website Hồi Xuân Đường
-- Chạy 1 lần trong dự án hoixuanduong:
--   supabase.com  →  dự án hoixuanduong  →  SQL Editor  →  dán toàn bộ  →  Run
-- An toàn khi chạy lại nhiều lần (dùng IF NOT EXISTS / DROP...IF EXISTS).
-- ============================================================

-- 1) Bảng chứa toàn bộ nội dung website (một dòng duy nhất, id = 1)
create table if not exists public.site_content (
  id         integer primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Ai cũng ĐỌC được (nội dung website là công khai)
drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read"
  on public.site_content for select
  to anon, authenticated
  using (true);

-- Chỉ người đã ĐĂNG NHẬP mới được sửa/thêm
drop policy if exists "site_content_auth_write" on public.site_content;
create policy "site_content_auth_write"
  on public.site_content for insert
  to authenticated
  with check (true);

drop policy if exists "site_content_auth_update" on public.site_content;
create policy "site_content_auth_update"
  on public.site_content for update
  to authenticated
  using (true) with check (true);

-- 2) Kho ảnh (Storage bucket) — đọc công khai, ghi cần đăng nhập
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

drop policy if exists "site_images_public_read" on storage.objects;
create policy "site_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-images');

drop policy if exists "site_images_auth_write" on storage.objects;
create policy "site_images_auth_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-images');

drop policy if exists "site_images_auth_update" on storage.objects;
create policy "site_images_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images') with check (bucket_id = 'site-images');

-- Xong. Bước cuối làm trên giao diện, không phải SQL:
--   Authentication → Users → Add user → nhập email + mật khẩu của chủ tiệm.
--   Đó là tài khoản đăng nhập trang admin.
