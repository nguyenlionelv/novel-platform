# Kết quả giai đoạn 2 — Nền tảng ứng dụng

Ngày kiểm tra: 19/10/2026. Trạng thái: hoàn thành nền tảng, chưa triển khai tính năng giai đoạn 3–5.

## Những phần đã thực hiện

- Next.js 16.4.2, React 19.3.1, TypeScript, Tailwind; package versions và lockfile đã cố định.
- Giữ nguyên repository, kế hoạch, quy tắc agent và đặc tả giao diện. Không build Docker.
- Tạo/liên kết Vercel `nguyenlionel/novel-platform`, project ID `prj_Txr8P3l4uFrtYQYpPgz4QWq7ERHZ`, Node.js 22, Functions tại `sin1`.
- Người dùng từ chối Neon và chọn Supabase; không có database Neon được tạo.
- Theo lựa chọn người dùng, tạo Supabase project mới `novel-platform` trong `nguyenlionelv's Org`, ref `fbtpriygrhtalsblzbhh`, Singapore. Không đổi dữ liệu project Writing.
- Tạo schema `novel_preview` và `novel_production`; mỗi schema có ba bảng nghiệp vụ và bảng kỹ thuật chống spam, role riêng và RLS.
- Tạo kho Blob public `novel-platform-covers`, ID `store_0PMaj5zOBaCnIpQR`, Singapore. Kho ảnh bìa dùng chung cho project; dữ liệu truyện/chương/đánh giá tách theo schema.
- Cấu hình riêng database role, hash mật khẩu admin, secret phiên và secret chống spam theo môi trường; đồng bộ lên Development/Preview/Production, kéo Development về local.
- Chuẩn bị module server: database, truy vấn truyện/chương công khai, hash mật khẩu, phiên admin mã hóa/ký, kiểm tra origin và rate limit dùng database.
- Migration `20261019030822_foundation.sql` đã áp dụng trên cloud; version file khớp lịch sử Supabase. Khởi tạo một truyện rỗng mỗi schema bằng thao tác không ghi đè khi chạy lại.

## Bằng chứng kiểm tra

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run env:check` | Có đủ sáu biến bắt buộc; chỉ in tên/trạng thái, không in giá trị |
| `npm run lint` | Qua, không lỗi/cảnh báo sau khi sửa export cấu hình PostCSS |
| `npm run typecheck` | Qua |
| `npm test` | 2/2 test qua: mật khẩu sai/hash lỗi và origin không hợp lệ |
| `npm run db:verify` | Qua sau khi kéo lại cấu hình Vercel: đúng một truyện, role không được vào schema khác, thử ghi/đọc chương và đánh giá, rating sai bị constraint chặn |
| Dữ liệu thử database | Transaction rollback, không để lại chương/đánh giá mẫu |
| `npm run blob:verify` | Upload và đọc metadata qua Blob thật thành công; ảnh thử đã được xóa |
| Supabase security advisors | Không có cảnh báo tại thời điểm kiểm tra |
| RLS | Bật ở toàn bộ tám bảng của hai schema |
| `npm run build` | Qua bằng Webpack; không tải font ngoài |
| Dev server local | Khởi động bằng Node.js; đã kiểm tra tại `127.0.0.1:3100` |
| Local `/api/health` | HTTP 200, `{"status":"ok"}` |
| Local `/` | HTTP 200, có trạng thái Truyện đang được chuẩn bị |
| Vercel Preview | READY, deployment `dpl_3AgUapsQFHnERhmZho3MZ3cRc8jw` |
| Preview `/api/health` | `{"status":"ok"}` qua Vercel CLI với quyền truy cập hợp lệ |
| Preview `/` | Render trạng thái chưa có nội dung thật, thuộc tính ngôn ngữ `vi` |
| Git/deployment ignore | `.env.local` và `.local/` bị loại; `.env.example` được phép theo dõi |
| Runtime dependency audit | `npm audit --omit=dev`: 0 vulnerability |

## Deployment và truy cập

- [Preview nền tảng](https://novel-platform-hirbix45q-nguyenlionel.vercel.app)
- [Chi tiết build](https://vercel.com/nguyenlionel/novel-platform/3AgUapsQFHnERhmZho3MZ3cRc8jw)
- Giữ Vercel Authentication. Dùng tài khoản Vercel có quyền hoặc `vercel curl` để kiểm tra; không tắt Deployment Protection.
- Bản deploy đầu của project bị Vercel tự gán Production dù lệnh yêu cầu Preview. Đã tạo Preview riêng, xác nhận môi trường và gỡ hai alias mới `novel-platform-alpha.vercel.app`, `novel-platform-nguyenlionel.vercel.app`. Bản deployment đầu còn trong lịch sử Vercel; chưa coi là phát hành sản phẩm.

## Giới hạn và lưu ý cho giai đoạn sau

- Chỉ có trang nền tảng/trạng thái trống và health API; chưa có trang admin hoạt động, trang đọc chương hoặc form đánh giá.
- Chưa có tên truyện, tác giả, bìa và chương thật. Chủ website nhập sau trong admin.
- Chưa kiểm thử giao diện sản phẩm trên browser/mobile hoặc luồng đăng/đọc/đánh giá, vì các màn hình đó chưa triển khai. Kiểm tra HTTP hiện tại không thay thế kiểm thử UI ở giai đoạn 3–6.
- Turbopack lỗi tạo tiến trình trên Windows cả trong và ngoài sandbox; đã chọn Webpack cho dev/build theo tài liệu Next.js.
- Supabase pooler cần CA certificate công khai của Supabase. Đã bổ sung CA và giữ `rejectUnauthorized: true`, không tắt kiểm tra TLS.
- Full audit có advisory high chưa có bản vá của `braces` qua công cụ lint; không nằm trong runtime dependency. Không dùng `audit fix --force` để đổi/hạ framework.
- Mật khẩu admin plaintext chỉ lưu ở `.local/admin-access.txt`; không đưa vào báo cáo hoặc chat. Role passwords và các file chuẩn bị môi trường trong `.local/` cũng phải giữ private.
- Dev server được khởi động ở cổng 3100 trong phiên này; kiểm tra listener trước khi chạy thêm server ở chat sau.

## Bước tiếp theo

Thực hiện giai đoạn 3: form mật khẩu admin và đăng xuất, bảo vệ các thao tác server bằng module đã có, form thông tin truyện/bìa, danh sách và form chương, lưu nháp/đăng/gỡ/xóa, ẩn đánh giá. Giữ `docs/UI_SPEC.md` làm chuẩn.
