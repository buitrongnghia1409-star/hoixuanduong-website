# Cách nén mô hình 3D kinh lạc

`meridian.glb` (2.8 MB) được nén từ bản gốc Hi3D 72.3 MB nằm trong
`ảnh 3D kinh Lạc/3D Kinh Lạc-1.glb`. Giữ bản gốc lại, đừng xoá.

## Vì sao phải nén

Bản gốc gồm 53.8 MB hình học (1.01 triệu đỉnh, 2 triệu tam giác) và 18.5 MB ảnh
PNG 4096×4096. Khách dùng 4G không tải nổi, và mỗi lần mở trang quản trị cũng
phải chờ tải lại.

## Các bước

Cần Node.js. Chạy trong thư mục tạm bất kỳ:

```bash
npm i @gltf-transform/cli
cp "ảnh 3D kinh Lạc/3D Kinh Lạc-1.glb" src.glb
```

**1. Giảm số tam giác còn 40%**

```bash
npx gltf-transform weld src.glb b1.glb
npx gltf-transform simplify b1.glb b2.glb --ratio 0.4 --error 0.0008
```

**2. Thu nhỏ ảnh xuống 2K và chuyển sang JPEG**

Lệnh `webp`/`jpeg` của gltf-transform **báo lỗi** với ảnh này
(`colourspace: parameter space not set` — libvips không đọc được không gian màu
của PNG do Hi3D xuất ra). Phải xử lý ảnh riêng bằng Pillow:

```python
from PIL import Image
im = Image.open('tex.png')          # trích từ GLB, xem swaptex.mjs
im.convert('RGB').resize((2048, 2048), Image.LANCZOS) \
  .save('tex2k.jpg', 'JPEG', quality=88, optimize=True, subsampling=1)
```

Rồi ghép ảnh mới vào bằng `@gltf-transform/core`:

```js
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read('b2.glb');
const tex = doc.getRoot().listTextures()[0];
tex.setImage(new Uint8Array(fs.readFileSync('tex2k.jpg')));
tex.setMimeType('image/jpeg');       // KHÔNG gọi setURI(null) — sẽ lỗi
await io.write('b3.glb', doc);
```

**3. Nén Draco**

```bash
npx gltf-transform draco b3.glb meridian.glb
```

## Kết quả đã kiểm chứng

| Mức | Dung lượng | Tam giác | Lệch ảnh so với bản gốc |
|---|---|---|---|
| Giữ nguyên lưới | 4.7 MB | 2.000.000 | 0 |
| **Đang dùng** | **2.8 MB** | 800.000 | 0.2–0.3 / 255 |
| Nén mạnh | 1.4 MB | 460.000 | 0.4–1.3 / 255 |

Lệch ảnh đo bằng cách render cùng góc rồi so từng điểm ảnh; dưới 2/255 là mắt
thường không phân biệt được. Bản nén mạnh làm gan bàn chân mất chi tiết khiến
huyệt Dũng Tuyền lệch khỏi da 1.4 cm nên không dùng.

## Lưu ý quan trọng khi đổi model

Toạ độ huyệt lưu theo **tỉ lệ hộp bao** chứ không theo mét, nên model mới phải
giữ đúng tỉ lệ thân người thì 12 toạ độ trong Supabase mới còn khớp. Hộp bao
hiện tại: **0.765 × 1.700 × 0.291 m**. Cả ba mức nén trên đều giữ nguyên hộp bao
(lệch 0.4 mm) nên không phải hiệu chỉnh lại.

Nếu thay bằng model có dáng người khác hẳn, phải vào tab **🧭 Huyệt Đạo 3D**
trong trang quản trị và đặt lại vị trí từng huyệt.

## Trình duyệt cần bộ giải mã Draco

`meridian-3d-viewer.js` đã tự nạp từ
`https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/`.
Nếu muốn chạy hoàn toàn offline thì tải thư mục `draco/` đó về đặt cạnh model
rồi sửa `setDecoderPath` trong viewer.
