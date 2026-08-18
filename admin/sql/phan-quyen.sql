-- =====================================================================
--  PHÂN QUYỀN TRANG QUẢN TRỊ — HỒI XUÂN ĐƯỜNG
--  Chạy trong Supabase → SQL Editor. Chạy lại nhiều lần vẫn an toàn.
--
--  Ba vai trò:
--    mo_phong_3d  → chỉ sửa được huyệt đạo (trang mô phỏng 3D)
--    trang_chinh  → chỉ sửa được nội dung trang chính
--    toan_quyen   → sửa được tất cả (chủ phòng khám)
--
--  TÌNH TRẠNG TRƯỚC KHI CHẠY (đã kiểm chứng ngày 18/08/2026):
--  cả 8 bảng đều cho phép BẤT KỲ AI ghi, chỉ cần khoá công khai vốn
--  nằm sẵn trong mã nguồn trang. Script này bịt lại.
-- =====================================================================


-- ---------- 1. Bảng hồ sơ quản trị viên ----------
create table if not exists admin_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  ho_ten     text,
  role       text not null default 'trang_chinh'
             check (role in ('mo_phong_3d', 'trang_chinh', 'toan_quyen')),
  is_active  boolean not null default true,
  created_at timestamptz default now()
);

alter table admin_profiles enable row level security;

drop policy if exists "doc ho so cua minh" on admin_profiles;
create policy "doc ho so cua minh" on admin_profiles
  for select to authenticated using (id = auth.uid());
-- Không tạo chính sách ghi: chỉ đổi vai trò được từ SQL Editor,
-- người dùng thường không tự nâng quyền cho mình được.


-- ---------- 2. Hàm tra vai trò ----------
-- security definer để hàm tự đọc bảng mà không kích hoạt lại chính sách
-- (nếu không sẽ đệ quy vô tận).
create or replace function vai_tro()
returns text
language sql stable security definer set search_path = public as $$
  select role from admin_profiles where id = auth.uid() and is_active
$$;


-- ---------- 3. Tự tạo hồ sơ khi có tài khoản mới ----------
create or replace function tao_ho_so_admin()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into admin_profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists tao_ho_so_admin_trigger on auth.users;
create trigger tao_ho_so_admin_trigger
after insert on auth.users
for each row execute function tao_ho_so_admin();

-- Hồ sơ cho các tài khoản đã tạo từ trước
insert into admin_profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;


-- ---------- 4. Siết quyền ghi toàn bộ 8 bảng ----------
-- Xoá sạch chính sách cũ rồi dựng lại theo đúng một khuôn:
--   • ai cũng ĐỌC được  → website hiển thị bình thường cho khách
--   • chỉ đúng vai trò mới GHI được
do $$
declare
  b     text;
  p     record;
  vai   text;
  ds    text[] := array['clinic_info','services','products','branches',
                        'team','contact_links','hero_section','acupoints'];
begin
  foreach b in array ds loop
    -- bỏ qua nếu bảng không tồn tại
    if not exists (select 1 from pg_tables
                   where schemaname = 'public' and tablename = b) then
      raise notice 'Bỏ qua % (không có bảng này)', b;
      continue;
    end if;

    -- BẮT BUỘC: không bật RLS thì mọi chính sách đều vô nghĩa
    execute format('alter table public.%I enable row level security', b);

    -- xoá hết chính sách cũ
    for p in select policyname from pg_policies
             where schemaname = 'public' and tablename = b loop
      execute format('drop policy %I on public.%I', p.policyname, b);
    end loop;

    -- ai cũng đọc được
    execute format(
      'create policy "ai cung doc duoc" on public.%I for select using (true)', b);

    -- quyền ghi theo vai trò
    vai := case when b = 'acupoints'
                then '''mo_phong_3d'', ''toan_quyen'''
                else '''trang_chinh'', ''toan_quyen''' end;

    execute format(
      'create policy "chi dung vai tro moi duoc ghi" on public.%I
         for all to authenticated
         using (vai_tro() in (%s)) with check (vai_tro() in (%s))', b, vai, vai);

    raise notice 'Đã siết bảng %', b;
  end loop;
end $$;


-- ---------- 5. Gán vai trò ----------
-- SỬA EMAIL CHO ĐÚNG rồi chạy 2 dòng dưới:
--
--   update admin_profiles set role = 'toan_quyen'  where email = 'email-cua-ban@...';
--   update admin_profiles set role = 'mo_phong_3d' where email = 'email-nguoi-lo-3d@...';
--
-- Xem lại ai đang có quyền gì:
--
--   select email, ho_ten, role, is_active from admin_profiles order by role;


-- ---------- 6. Kiểm tra kết quả ----------
-- Chạy để xem chính sách đã đúng chưa:
--
--   select tablename, policyname, cmd, roles
--   from pg_policies where schemaname = 'public' order by tablename, policyname;
--
-- Mỗi bảng phải có đúng 2 dòng: "ai cung doc duoc" (SELECT, public)
-- và "chi dung vai tro moi duoc ghi" (ALL, authenticated).
