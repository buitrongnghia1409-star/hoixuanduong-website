/* Cấu hình kết nối Supabase cho website + trang admin Hồi Xuân Đường.
   URL và anonKey là khóa CÔNG KHAI (publishable) — an toàn khi để trong mã
   nguồn client. Dữ liệu được bảo vệ bằng RLS phía Supabase, không phải bằng
   việc giấu khóa này.

   Cách lấy đúng giá trị: mở dự án hoixuanduong trên supabase.com → bấm nút
   "Connect" ở đầu trang → mục "App Frameworks" sẽ hiện Project URL và
   publishable/anon key. Dán vào đây rồi lưu file.

   Để trống (giữ nguyên placeholder bắt đầu bằng "DAN_") thì website tự động
   chạy bằng dữ liệu dự phòng trong assets/data/site-data.json — không bao giờ
   để trắng trang. */
window.HXD_SUPABASE = {
  url: 'https://epdjnjcfzxhllklusmet.supabase.co',
  anonKey: 'sb_publishable_pIjbFKuEUhUGxoMZvB6AsQ_dlpJUSO_',
  bucket: 'site-images',
  table: 'site_content'
};
