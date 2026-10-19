# Giai đoạn 6 — Nghiệm thu và phát hành

Ngày: 19/10/2026. Đã được người dùng giao triển khai giai đoạn 6, kèm sửa định dạng đoạn văn. Không build Docker.

## Định dạng đọc đã sửa

- Mỗi lần Enter (`LF`, `CRLF` hoặc `CR`) tạo một đoạn `<p>`; các dòng trống chỉ phân cách, không thêm đoạn rỗng. Tách đoạn chỉ ở giao diện, không sửa dữ liệu nội dung đã lưu.
- Dòng đầu **mọi đoạn** thụt `2em` (40 px ở cỡ 20); các dòng tự xuống theo màn hình trong cùng đoạn vẫn thẳng lề.
- **Giãn dòng** là line-height bên trong đoạn, giữ lựa chọn 1,5–2,3.
- **Giãn đoạn** là khoảng cách thêm giữa hai đoạn: Hẹp 0,5em / Vừa 0,8em mặc định / Rộng 1,2em / Rất rộng 1,6em. Khoảng chuyển đoạn bằng giãn dòng cộng thêm khoảng này, nên lớn hơn khoảng giữa các dòng thường. Không dùng một thuộc tính thay cho cả hai.
- Có điều khiển Giãn đoạn riêng trong Tuỳ chọn đọc; lưu cùng các trường cũ tại `novel-reading-v1`, dữ liệu cũ tự dùng mặc định. Khi đổi cỡ chữ, giãn đoạn và thụt dòng co theo chữ.
- Admin có hướng dẫn mỗi Enter tạo đoạn, không cần tự chèn dấu cách. Giữ render text an toàn, tiếng Việt NFC/NFD, hai font và hạn chế copy chỉ trong nội dung chương.

## Luồng nghiệm thu

Admin → API có phiên/origin → Supabase và Blob → chương đã đăng công khai → độc giả đọc/chuyển chương → gửi đánh giá chung không tài khoản → Supabase → tải lại → admin ẩn → API/HTML/điểm cập nhật.

| Kiểm tra | Bằng chứng |
| --- | --- |
| Lint, TypeScript, build | `npm run lint`, `npm run typecheck`, `npm run build` đều qua; Webpack, Node 22 |
| Unit | 9/9 qua; thêm Enter/CRLF/CR, bỏ đoạn rỗng, giữ Unicode và kiểm tra tuỳ chọn giãn đoạn/cấu hình cũ |
| E2E admin local | Qua 28,6 giây; mật khẩu sai, guest bị từ chối, phiên ký hợp lệ nhưng hết hạn, phiên theo hash cũ và cookie hỏng đều bị từ chối; reauth giữ form; upload/xem trước/huỷ bìa, lưu/đăng/sửa/gỡ/xoá chương |
| E2E reader local | Qua 18,9 giây; đoạn đúng số lượng, DB giữ nguyên văn bản, font thật, khoảng đoạn/line-height độc lập; indent 40/48/36 px theo cỡ chữ; DOM Range xác nhận chỉ dòng đầu thụt, dòng tự xuống thẳng lề; lưu/reload/chuyển chương, TOC, copy, mobile/zoom |
| E2E review local | Qua 20,1 giây; input, CSRF, body quá lớn, honeypot, mất mạng, 429, đồng thời, shared reviews, ẩn/tính điểm, phân trang |
| Env và database | 6/6 biến cần thiết; role Preview/Production riêng và xác minh TLS; cả hai không có USAGE schema kia, không có DELETE reviews; migration cloud `20261019030822_foundation` trùng local; 8 bảng bật RLS; không cần migration mới |
| Bảo mật | Supabase security advisors không cảnh báo; `npm audit --omit=dev`: 0 vulnerability; quét file Git không có giá trị secret; browser quét 18 HTML/JS Production, 0 secret, 0 lỗi client |
| HTTPS Preview | Luồng thực tế bên dưới qua; inspect preview/READY |
| HTTPS Production | Luồng thực tế bên dưới qua; inspect production/READY và alias chính thức |

Browser HTTPS **cả Preview và Production** đã chạy: đăng nhập admin qua UI và cookie Secure/HttpOnly/SameSite; từ chối guest/origin sai/input sai; upload bìa PNG thật, đọc asset và render ảnh; tạo nháp → 404 → đăng, thêm chương thứ hai và nháp xen giữa; đọc qua liên kết Next; 4 đoạn từ Enter đơn/CRLF/dòng trống, SQL xác nhận nội dung gốc; CDP xác nhận DejaVu/Times và chữ NFD; thay giãn dòng/đoạn/khung/nền và reload; mobile 390 px, touch giữ chữ giả lập không chọn được, TOC/Escape/xuống cuối; copy trong form bình thường; khách không có cookie admin gửi đánh giá → đổi chương → reload còn → gửi lại 429 → admin ẩn → điểm về ban đầu, đổi chương không giữ review cũ; cập nhật chương thấy nội dung mới, gỡ về nháp trả 404 và biến mất khỏi mục lục.

Các lần đầu có lỗi trong phép đo test: một dòng có thể sinh nhiều rect chữ, đã nhóm theo trục Y để đo dòng thực tế. Kiểm tra rate limit cloud ban đầu trộn Node HTTP và browser có IP đi ra khác nhau; đã đổi sang gửi lặp trong cùng browser, xác nhận 429. Đây là sửa test, không nới giới hạn ứng dụng. Các fixture từ lần thử lỗi cũng được dọn đúng UUID.

## Deployment

- **Production**: [Website](https://novel-platform-alpha.vercel.app) · [Admin](https://novel-platform-alpha.vercel.app/admin).
- Deployment Production `dpl_5Tdx33srftCNAECa8LFdTnGVVmrf`, URL snapshot `https://novel-platform-rbihnqzlx-nguyenlionel.vercel.app`; inspect **production / READY**, build 52 giây, Functions `sin1`.
- Preview mới: [Website](https://novel-platform-qpr93li30-nguyenlionel.vercel.app) · [Admin](https://novel-platform-qpr93li30-nguyenlionel.vercel.app/admin); deployment `dpl_HZisLMQZuX8VhGT9DnzJJYRaDq1S`, inspect **preview / READY**, build 49 giây.
- Preview và URL snapshot giữ Vercel Authentication; alias Production công khai đã được kiểm tra không dùng token Vercel. Admin luôn cần mật khẩu riêng của môi trường.

Sau khi dọn fixture, browser Edge đối chiếu alias công khai: trang trống đúng, health HTTP 200 chỉ trả status, admin API 401, trang đăng nhập hoạt động, không lỗi JavaScript; quét 18 HTML/JavaScript không phát hiện secret. Công cụ Node HTTP từng timeout rồi treo ở kiểm tra cuối, đã dừng đúng PID; đối chiếu browser qua và runtime/error/5xx Vercel không có bản ghi lỗi trong cửa sổ kiểm tra. Không tái hiện lỗi ứng dụng qua browser; không sửa mã từ tín hiệu timeout này.

Mật khẩu nằm trong `.local/admin-access.txt`, dòng `production admin password` dành cho Production; khác Preview. Không ghi giá trị vào báo cáo/Git. Scripts và bằng chứng riêng ở `.local/stage6-*.mjs`, `.local/stage6-*.png`, bị ignore ở Git và deployment.

## Dữ liệu và giới hạn

Đã khôi phục thông tin truyện ban đầu, xoá đúng 3 chương và ảnh bìa thử cho mỗi lần cloud test, ẩn rồi xoá đúng UUID review bằng quyền quản trị cloud. Không cấp DELETE review cho role ứng dụng. Query cuối: **Preview 1 chương / 1 đánh giá thật, Production 0 chương / 0 đánh giá; không còn chương/review prefix E2E**. Không chuyển truyện hoặc đánh giá Preview sang Production. Production sẵn sàng nhập nội dung thật; bước này thuộc giai đoạn 7 hoặc yêu cầu tiếp theo.

Đã kiểm tra Edge Windows desktop và mobile/touch giả lập; chưa kiểm tra iPhone/Android vật lý. Times New Roman phụ thuộc font thiết bị, có dự phòng DejaVu. Chặn copy chỉ hạn chế thao tác thông thường. Full audit dependency phát triển chưa chạy lại; lần trước có advisory `braces`, chưa sửa ép phiên bản framework. Không có lỗi ứng dụng còn chặn phát hành trong các luồng đã nghiệm thu.
