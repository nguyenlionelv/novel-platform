# Novel Platform

Website đọc một tiểu thuyết. Độc giả không cần tài khoản; trang admin dùng mật khẩu riêng.

## Trạng thái

Đã triển khai giai đoạn 1–4: nền tảng, admin, trang giới thiệu/mục lục và trang đọc chương. Độc giả đọc không cần tài khoản ứng dụng; form gửi đánh giá và điểm trung bình thuộc giai đoạn 5.

- [Kế hoạch và bàn giao](PLAN.md)
- [Bố cục giao diện](docs/UI_SPEC.md)
- [Kết quả kiểm tra giai đoạn 2](docs/STAGE_2_REPORT.md)
- [Kết quả kiểm tra giai đoạn 3](docs/STAGE_3_REPORT.md)
- [Kết quả kiểm tra giai đoạn 4](docs/STAGE_4_REPORT.md)
- [Quy tắc agent](AGENTS.md)

## Chạy local

Yêu cầu Node.js 22.13 trở lên trong nhánh 22.x và npm. Chạy trực tiếp bằng Node.js, không build Docker trên máy người dùng.

```powershell
npm ci
npx --yes vercel@latest login
npx --yes vercel@latest link --yes --scope nguyenlionel --project novel-platform
npx --yes vercel@latest env pull .env.local --yes --scope nguyenlionel
npm run env:check
npm run dev
```

Mặc định mở `http://localhost:3000`. Không tạo project/database mới nếu dự án đã liên kết. `env pull` chỉ dùng Development cho local; không kéo cấu hình Production để chạy thử.

Các lệnh dev/build dùng Webpack được Next.js hỗ trợ, vì Turbopack gặp lỗi tạo tiến trình trên máy Windows hiện tại. Không dùng Docker làm cách xử lý lỗi này.

## Biến môi trường

| Tên | Mục đích |
| --- | --- |
| `DATABASE_URL` | Kết nối Supabase transaction pooler bằng role của môi trường |
| `DATABASE_SCHEMA` | `novel_preview` hoặc `novel_production` |
| `ADMIN_PASSWORD_HASH` | Hash scrypt của mật khẩu admin; không lưu plaintext trong biến này |
| `SESSION_SECRET` | Khóa ngẫu nhiên ít nhất 32 ký tự để mã hóa/ký cookie |
| `RATE_LIMIT_SECRET` | Khóa riêng để băm định danh chống spam |
| `BLOB_READ_WRITE_TOKEN` | Quyền server tải ảnh lên Vercel Blob |

Xem `.env.example` để biết cấu trúc. Không đặt secret trong biến `NEXT_PUBLIC_*`, source, log hoặc commit. Các file `.env.local` và `.local/` đã được ignore ở cả Git và deployment.

Mật khẩu admin ban đầu cho preview và production được sinh ngẫu nhiên, khác nhau, chỉ lưu trên máy chủ dự án ở `.local/admin-access.txt`. File này không được commit/deploy/chia sẻ. Mở `/admin` và dùng mật khẩu đúng môi trường. Phiên tồn tại tối đa 8 giờ; đổi hash mật khẩu sẽ làm phiên cũ hết hiệu lực.

Trong admin: lưu thông tin truyện/bìa → thêm chương → Lưu nháp hoặc Đăng chương. Chương đã đăng có nút Lưu cập nhật và Gỡ về nháp; xóa cần xác nhận. Khi phiên hết hạn, đăng nhập lại trong hộp thoại rồi bấm lưu; nội dung đang nhập vẫn còn. Chỉ nội dung đã lưu mới tồn tại sau khi đóng trình duyệt.

## Dữ liệu và quyền truy cập

- Supabase project riêng: `novel-platform`, ref `fbtpriygrhtalsblzbhh`, Singapore. Không dùng project Writing.
- Hai schema riêng: Development/Preview dùng `novel_preview`; Production dùng `novel_production`.
- Mỗi schema có ba bảng nghiệp vụ `novels`, `chapters`, `reviews` và một bảng kỹ thuật `rate_limits`.
- Mỗi role ứng dụng chỉ có quyền thao tác dữ liệu trong schema của mình, không có quyền tạo database/role hoặc quyền quản trị toàn project.
- Các schema không được expose qua Data API; đã bật RLS và chặn quyền của `anon`/`authenticated`. Browser không kết nối database trực tiếp.
- Mỗi schema có đúng một bản ghi truyện ID 1, ban đầu rỗng. Khởi tạo dùng `ON CONFLICT DO NOTHING`, không ghi đè truyện đã nhập.
- Kết nối server dùng transaction pooler, `prepare: false`, giới hạn pool và xác minh certificate TLS. CA công khai Supabase được đóng gói tại `src/lib/db/supabase-ca.json`, tải từ [nguồn Supabase](https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt).
- Mỗi thao tác dùng `withDb` để giữ riêng kết nối rồi trả về pool; các câu lệnh trong cùng callback chạy tuần tự. Điều này tránh [pipelining không tương thích transaction pooler](https://supabase.com/docs/guides/database/postgres-js), đã gây treo API khi kiểm thử.

Migration nằm trong `supabase/migrations/`. File được tạo bằng `supabase migration new`; đã áp dụng lên cloud bằng Supabase MCP. Không chạy `supabase start`, database local, `db reset` hoặc các lệnh cần Docker. Với thay đổi tiếp theo, kiểm tra project ref, review migration và dùng công cụ cloud theo quyền đã được giao.

## Kiểm tra

```powershell
npm run env:check
npm run lint
npm run typecheck
npm test
npm run db:verify
npm run blob:verify
npm run build
```

`db:verify` dùng cấu hình local: kiểm tra một truyện, cách ly schema và thử ghi chương/đánh giá trong transaction được rollback. Không lưu nội dung truyện thử. Không chạy lệnh này vào cấu hình Production để thử phát triển.

`blob:verify` tải một ảnh kiểm tra nhỏ lên kho ảnh, đọc metadata và xóa đúng ảnh thử trong `finally`; không xóa ảnh bìa của truyện.

Kiểm thử admin bằng Edge đã cài trên Windows:

```powershell
npm run dev -- --port 3100
# Trong terminal thứ hai
npm run test:e2e
```

E2E chỉ chấp nhận schema `novel_preview`, dùng mật khẩu local mà không ghi vào log/trace, thử thay đổi dữ liệu rồi khôi phục trong `finally`. Chạy khi không có người khác sửa dữ liệu Preview. Test không dành cho Production. Kiểm tra ẩn đánh giá dùng fixture riêng tùy chọn trong `.local/e2e-review.json`; báo cáo giai đoạn 3 ghi nhận lần đã thử và dọn fixture đó.

`/api/health` trả `{"status":"ok"}` khi đọc được đúng một bản ghi truyện, hoặc HTTP 503 với thông báo chung khi chưa sẵn sàng. Endpoint không trả chi tiết database, cấu hình hoặc secret.

## Đọc truyện

`/` hiển thị bìa, tên/tác giả, giới thiệu, trạng thái và mục lục chỉ gồm chương đã đăng. Nút Đọc từ đầu mở chương có thứ tự nhỏ nhất; mục lục tải thêm 30 chương mỗi lần.

`/chuong/[id]` giữ xuống dòng, có chương trước/sau theo thứ tự các chương đã đăng và về mục lục. Cỡ chữ 18/20/22/24 px và nền sáng/tối được lưu tại `localStorage` với khóa `novel-reading-v1`; nếu không lưu được, điều khiển vẫn dùng được trong trang hiện tại. Chương nháp/không tồn tại trả 404, không gửi tiêu đề/nội dung nháp vào HTML hoặc metadata.

Vùng nội dung chương chặn chọn chữ, copy/cut, kéo văn bản và menu chuột phải. Admin và ô nhập hoạt động bình thường; không chặn phím tắt toàn trang, cuộn, phóng to hoặc trình đọc màn hình. Đây là hạn chế sao chép thông thường, không thể chặn tuyệt đối trích xuất nội dung, chụp màn hình hoặc OCR.

Trang công khai render theo request; `/api/chapters` dùng `no-store`, chỉ trả ID/thứ tự/tiêu đề published. React `cache()` chỉ khử truy vấn trùng trong lượt render, không lưu dữ liệu giữa request. Các thao tác admin vẫn gọi `revalidatePath` cho trang chủ và pattern trang đọc; sửa metadata truyện cũng làm mới metadata trang đọc.

## Preview

[Mở truyện Preview giai đoạn 4](https://novel-platform-b3g0haf1c-nguyenlionel.vercel.app) · [Admin](https://novel-platform-b3g0haf1c-nguyenlionel.vercel.app/admin) — giữ Vercel Authentication; đăng nhập tài khoản Vercel có quyền để xem. Chỉ `/admin` cần thêm mật khẩu admin Preview.

```powershell
npx --yes vercel@latest curl https://novel-platform-b3g0haf1c-nguyenlionel.vercel.app/api/health --scope nguyenlionel
```

Deploy tiếp theo mặc định là Preview:

```powershell
npx --yes vercel@latest deploy --yes --scope nguyenlionel --project novel-platform
```

`vercel.json` cố định framework Next.js và vùng Functions Singapore. Không thêm `--prod` khi chỉ làm Preview. Luôn inspect kết quả để xác nhận môi trường; chỉ phát hành Production trong phạm vi người dùng giao.

## Giới hạn đã ghi nhận

- Admin và trang đọc hoạt động với dữ liệu thật. Form đánh giá công khai sẽ tiếp tục ở giai đoạn 5.
- `npm audit --omit=dev` không có vulnerability tại thời điểm kiểm tra. Full audit có advisory chưa có bản vá cho `braces` trong chuỗi dependency của ESLint/Next lint config, chỉ dùng lúc phát triển. Không chạy `npm audit fix --force` để hạ phiên bản framework; kiểm tra bản vá upstream khi cập nhật dependency.
- Hạn chế copy đã áp dụng trong nội dung chương; không thể chặn tuyệt đối việc trích xuất nội dung đã gửi đến trình duyệt.
