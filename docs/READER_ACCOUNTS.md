# Tài khoản độc giả

Phát hành Production ngày 25/10/2026 theo yêu cầu chủ web: https://novel-platform-alpha.vercel.app, deployment `dpl_2T3jdhyKruroETv3GTimjH2fZrau`. Google đã bật; nút trên Production đi qua Supabase tới accounts.google.com, PKCE cookie Secure/HttpOnly. Đã kiểm tra đọc công khai, menu, form, quyền khách/admin và nháp404; hash truyện/chương/đánh giá giữ nguyên trước-sau. Không coi kiểm tra tới trang Google là đã hoàn tất đăng nhập Google hay xác nhận email hộp thư thật. Không cần gửi mật khẩu hoặc Google Secret cho agent để kiểm tra thủ công bước cuối.

Khách vẫn đọc truyện miễn phí. Tài khoản dùng Supabase Auth, tách khỏi mật khẩu admin. Mã ứng dụng xác minh bằng `getUser()`; các truy vấn riêng chỉ dùng ID đã xác minh, không nhận quyền từ client. Cookie Supabase do server quản lý, HttpOnly, SameSite=Lax, Secure khi deploy; PKCE dùng cho Google và xác nhận email. Không cần service-role key trong ứng dụng.

## Cấu hình Google cho chủ website

1. Mở [Google Auth Platform](https://console.cloud.google.com/auth/overview), chọn hoặc tạo một project cho web truyện.
2. Tại Branding, nhập tên ứng dụng, email hỗ trợ và email liên hệ. Tại Audience chọn External. Khi ở Testing, thêm email Google của bạn vào Test users.
3. Tại Clients chọn Create client → Web application. Tên ví dụ: `Novel Platform`. Web dùng luồng chuyển hướng qua Supabase, không cần Google JavaScript SDK hoặc thêm origin của Google vào mã ứng dụng.
4. Tại Authorized redirect URIs, thêm chính xác:

   ```text
   https://fbtpriygrhtalsblzbhh.supabase.co/auth/v1/callback
   ```

5. Sao chép Client ID và Client Secret. Mở [Supabase → Authentication → Sign In / Providers → Google](https://supabase.com/dashboard/project/fbtpriygrhtalsblzbhh/auth/providers), bật Google, nhập hai giá trị trực tiếp rồi Save. Không gửi Client Secret vào chat, `.env` hay Git.
6. Mở [Supabase → URL Configuration](https://supabase.com/dashboard/project/fbtpriygrhtalsblzbhh/auth/url-configuration). Site URL đặt `https://novel-platform-alpha.vercel.app`; Redirect URLs thêm:

   ```text
   https://novel-platform-alpha.vercel.app/auth/callback**
   http://localhost:3100/auth/callback**
   ```

   Ứng dụng gửi callback kèm `?next=...`; hậu tố `**` chỉ sau đường dẫn callback của đúng origin này để nhận cả query đó. Không dùng wildcard cho mọi domain hoặc toàn bộ `vercel.app`. Khi có Preview mới, thêm `https://<preview-host>/auth/callback**` cho đúng deployment cần thử. Không thêm URL `/admin`; giữ các redirect hợp lệ khác nếu đã có.
7. Thử “Tiếp tục với Google” ở `/dang-nhap`, chọn tài khoản Test user, xác nhận quay về web và xuất hiện tài khoản. Thử đăng xuất và đăng nhập lại. Preview có Vercel Authentication, cần quyền Vercel cho trình duyệt thử.
8. Trước khi mở cho mọi người, chuyển Audience từ Testing sang In production. Thực hiện yêu cầu xác minh/branding của Google nếu Console đưa ra. Chỉ yêu cầu thông tin đăng nhập cơ bản; không xin quyền Drive/Gmail.

Callback của Google ở bước 4 là của Supabase, còn callback ứng dụng ở bước 6 là của Next.js; cần đúng cả hai.

### Nếu đăng nhập xong bị chuyển về localhost:3000

Đây là dấu hiệu Supabase đang dùng Site URL mặc định hoặc không chấp nhận redirectTo trong allowlist. Kiểm tra Site URL là `https://novel-platform-alpha.vercel.app` và Redirect URLs có dòng Production `/auth/callback**` ở trên, bấm Save tại các mục đã sửa. Không cần đổi Google Client ID/Secret hoặc callback của Google Console nếu đã tới được bước xác thực Google. Sau khi lưu, đóng trang localhost và bắt đầu một lượt đăng nhập mới từ Production; không dùng lại code ở URL cũ. Cấu hình này nằm ở Supabase, không cần deploy lại Next.js.

Tham khảo: [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

## Email và mật khẩu

- Bật Email provider và Confirm email. Form đăng ký nhận tên, email và mật khẩu 8–128 ký tự. Mật khẩu do Supabase lưu hash; ứng dụng không lưu mật khẩu độc giả trong database nghiệp vụ.
- Cần cấu hình [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) và địa chỉ gửi được xác minh để xác nhận email cho độc giả công khai. Dịch vụ SMTP mặc định của Supabase chỉ dành cho thử nghiệm với giới hạn người nhận; chưa coi email công khai sẵn sàng khi chưa thử hộp thư thực. Không tự tắt xác nhận email để bỏ qua cấu hình.
- Liên kết xác nhận mặc định sử dụng PKCE nên cần mở trên cùng trình duyệt đã đăng ký. Nếu muốn xác nhận ở thiết bị khác, triển khai luồng token_hash theo hướng dẫn Supabase trước khi đổi mẫu email. Không thay mẫu một phần khi callback ứng dụng chưa hỗ trợ.
- Không tự đăng ký SMTP trả phí; chủ website cung cấp cấu hình trực tiếp trong Supabase. Không gửi mật khẩu SMTP vào chat.

## Hành vi dữ liệu

- Schema Preview/Production có hồ sơ và dữ liệu cá nhân riêng. Auth identity nằm trong cùng project Supabase; chưa tạo project Auth thứ hai.
- Đánh giá khách cũ giữ nguyên `user_id=null`. Đánh giá mới yêu cầu đăng nhập, lấy tên hồ sơ tại lúc gửi, giữ ngày và tài khoản. Admin ẩn thì tài khoản vẫn thấy lịch sử với trạng thái ẩn; công khai không thấy.
- Tiến độ chỉ tăng, 90% nội dung chương là Đã đọc; xem phần đánh giá không làm sai mẫu số. Chưa có bản ghi là Chưa đọc. Tài khoản gửi tiến độ từ tab đang hiển thị; trạng thái chỉ là tiện ích theo dõi, không chứng minh đã đọc từng chữ.
- Mỗi tài khoản có một dấu, lưu chỉ số đoạn và tỉ lệ trong đoạn để thích nghi cỡ chữ. Quay lại chương có dấu mở dialog, phải “Bỏ dấu và đọc tiếp”. Chỉ xoá đúng ID dấu hiện tại; dấu mới ở cửa sổ khác không bị xoá bởi yêu cầu cũ. Đặt dấu mới khi còn dấu trả 409. Sửa nội dung chương có thể làm vị trí thay đổi; chỉ số được chặn về đoạn cuối khi khôi phục.
- Chương đăng lần đầu tạo một sự kiện thông báo trong cùng thao tác ghi database; sửa/gỡ/đăng lại không tạo trùng. Hồ sơ chỉ thấy sự kiện từ ngày tạo hồ sơ, chương nháp không lộ tiêu đề. Thông báo cập nhật khi chuyển trang hoặc mỗi 60 giây khi tab đang hiện.
- Không có email chương mới, Web Push hoặc đăng nhập admin bằng Google.

## Cấu hình và kiểm tra

- Thêm `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable, không dùng service_role) vào Development/Preview/Production trước khi deploy. Xem `.env.example`. Google Secret chỉ ở Supabase.
- Migration `20261025110643_reader_accounts.sql` bổ sung bảng/RLS/FK/index/trigger ở hai schema; không ghi đè nội dung. File tạo bằng CLI rồi đồng bộ tên với version cloud sau khi áp dụng qua MCP ngày 25/10/2026. Security advisors sau migration không cảnh báo.
- E2E cần hai Auth user thử riêng đã xác nhận, không dùng tài khoản thật của chủ website. Tạo qua Supabase Auth Admin/UI, lưu danh sách `{id,email,password,displayName}` trong `.local/reader-test-accounts.json` (bị ignore). Test dùng đăng nhập Supabase thật, không giả session. Lượt triển khai đầu dùng fixture Auth tạo bởi quản trị database với email `@example.invalid`; vì không gửi thư, lượt này không nghiệm thu luồng đăng ký/xác nhận email.
- `npm run test:e2e` chỉ chạy với `DATABASE_SCHEMA=novel_preview`; ảnh/trace không chứa mật khẩu. Test tạo chương/đánh giá có prefix riêng; chương được dọn, đánh giá được ẩn và lưu UUID trong `.local/reader-review-fixtures.json` để quản trị xoá chính xác, không cấp DELETE reviews cho app.

Trạng thái triển khai và kết quả kiểm tra mới nhất ở `PLAN.md`. Không phát hành bản tài khoản khi Google/email còn chưa nghiệm thu mà gọi là đã hoàn tất.
