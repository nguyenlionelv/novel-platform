# Giai đoạn 3 — Admin đăng truyện và chương

Ngày kiểm tra: 19/10/2026. Đã triển khai, kiểm thử local và xác minh đăng nhập/API trên Preview.

## Preview

- [Mở admin Preview](https://novel-platform-apgirpu8k-nguyenlionel.vercel.app/admin).
- Deployment `dpl_4ZNDanDZdY2BSaK9RbCSbshzrYiG`, inspect xác nhận target `preview`, trạng thái `READY`, build 49 giây, Functions ở `sin1`; giữ Vercel Authentication. Không phát hành Production.
- Kiểm tra HTTPS thật: health 200, trang đăng nhập 200, tổng quan ẩn danh 401, origin sai 403, đăng nhập đúng 200, cookie Secure/HttpOnly, tổng quan có phiên 200, đăng xuất 200 và tổng quan không cookie 401. Không thay đổi nội dung truyện trên cloud khi kiểm tra này.
- Nạp OIDC tạm bằng `vercel env run`; không in token/cookie/mật khẩu hoặc tắt Deployment Protection. Cache CLI npm cũ thiếu module; dùng cache riêng `.local/npm-cache` để tải CLI 64.5.0, không đổi dependency ứng dụng.

## Chức năng

- `/admin`: đăng nhập bằng mật khẩu riêng, đăng xuất, phiên tối đa 8 giờ. Các API quản trị kiểm tra phiên ở server; thao tác ghi kiểm tra cùng origin, cookie HttpOnly/SameSite=Lax/Secure trên HTTPS production runtime.
- Giới hạn 5 lần thử đăng nhập trong 15 phút bằng bảng database; lưu định danh đã băm. Đăng nhập thành công xóa lượt thử của định danh đó.
- Sửa tên, tác giả, giới thiệu, trạng thái và upload bìa JPEG/PNG/WebP tối đa 2 MB; kiểm tra MIME cùng chữ ký tệp. Ảnh thật lưu Vercel Blob theo đường dẫn riêng của schema.
- Chương có thứ tự, tiêu đề và nội dung nhiều dòng tối đa 200.000 ký tự; giữ xuống dòng. Thêm/sửa, lưu nháp, đăng, lưu cập nhật, gỡ về nháp và xóa có xác nhận. Thứ tự trùng trả 409; cập nhật trạng thái bằng câu SQL có điều kiện nguyên tử.
- Cảnh báo khi chuyển chương, rời trang hoặc đăng xuất khi chưa lưu. Khi phiên hết hạn, hộp thoại đăng nhập lại giữ nguyên nội dung trong trang, người dùng chủ động bấm lưu lại.
- Danh sách chương và đánh giá tải từng 30 bản ghi; có nút tải thêm. Admin ẩn được đánh giá. Đánh giá công khai thuộc giai đoạn 5.
- API giới hạn kích thước body, validate trường ở server, truy vấn tham số hóa, phản hồi riêng tư `no-store`; không trả secret hay thông báo lỗi database chi tiết.

## Kiểm tra đã qua

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run lint` | Qua |
| `npm run typecheck` | Qua |
| `npm test` | 5/5 qua: mật khẩu, origin, dữ liệu chương/truyện, phân trang và chữ ký ảnh |
| `npm run build` | Qua bằng Webpack/Node.js, không Docker |
| `npm run test:e2e` | 1 kịch bản toàn luồng qua, 31,4 giây trên Microsoft Edge |
| Desktop và mobile 390 px | Đã xem ảnh chụp; không tràn ngang |

Kịch bản trình duyệt kiểm tra: API không phiên trả 401; origin sai/thiếu trả 403; body đăng nhập quá lớn trả 413; mật khẩu sai, đăng nhập đúng và thuộc tính cookie; 6 request đồng thời trả 200; sửa truyện/tải bìa thật và đọc lại database/trang chủ; ảnh giả bị từ chối; tạo hai chương và giữ xuống dòng; nháp không xuất hiện trong HTML admin ẩn danh, URL đọc trả 404; đăng/sửa/gỡ; trùng thứ tự trả 409 và giữ nội dung; hết phiên → đăng nhập lại → lưu tiếp; chọn chữ trong textarea hoạt động; hủy cảnh báo bỏ thay đổi và hủy/xác nhận xóa; ẩn đánh giá thật; đăng xuất; lần đăng nhập sai thứ 6 trả 429.

Lưu ý: route đọc chưa được tạo nên 404 của nháp hiện chỉ là kiểm tra không lộ dữ liệu trong trạng thái giai đoạn 3. Cần kiểm tra lại sau khi có route đọc ở giai đoạn 4, bao gồm đọc chương đã đăng và cache sau đăng/gỡ/xóa.

Sau thử đã khôi phục metadata/bìa/thời điểm cập nhật truyện và rate limit trước thử; xóa chương cùng ảnh Blob do test tạo. Đánh giá fixture được xóa bằng công cụ quản trị đúng UUID vì role ứng dụng không có quyền DELETE reviews. Xác nhận cả Preview và Production còn 0 chương, 0 đánh giá, metadata truyện ban đầu; không dùng dữ liệu thử làm nội dung thật. Ảnh kiểm tra nằm trong `.local/`, không đưa vào Git/deploy. Không bật trace/video/screenshot tự động chứa thao tác nhập mật khẩu.

## Sửa lỗi kết nối được phát hiện trong kiểm thử

Postgres.js gửi nhiều query chồng trên một kết nối, làm API tổng quan treo hoặc phản hồi rất chậm khi dùng Supavisor transaction pooler. Đây là [giới hạn được Supabase ghi nhận](https://supabase.com/docs/guides/database/postgres-js); `max_pipeline: 0` còn gặp lỗi upstream với transaction.

Ứng dụng hiện dùng `withDb`: lấy kết nối riêng bằng `reserve()`, chờ từng câu lệnh rồi `release()` trong `finally`. Các thao tác độc lập có thể chạy song song qua các lease riêng, tối đa 2 kết nối mỗi client. API tổng quan trong lần kiểm tra sau sửa phản hồi khoảng 0,1–0,5 giây; 6 request đồng thời hoàn tất, không treo. Các query công khai, health và rate limit cũng dùng cùng cách này để tránh lỗi quay lại ở giai đoạn 4–5.

Kiểm thử dùng thống nhất `localhost:3100` để Next dev không chặn tài nguyên khác origin. Đã chuyển cache dev lỗi sang `.local/` trước khi thử lại. Không thay dịch vụ database hoặc hạ bảo mật TLS.

## Phần còn lại

- Giai đoạn 4: trang giới thiệu/mục lục và đọc chương, điều hướng, cỡ chữ, sáng/tối, hạn chế sao chép trong vùng nội dung chương; xác minh dữ liệu nháp và cache trên route thật.
- Giai đoạn 5: gửi đánh giá công khai và điểm trung bình sau gửi/ẩn.
- Chưa phát hành Production; chưa có nội dung truyện thật. Bìa cũ sau khi thay được giữ trong Blob, chưa có tác vụ dọn tự động. Upload mới được xóa nếu lưu metadata thất bại.
- Advisory của dependency lint đã nêu ở giai đoạn 2; không chạy sửa ép phiên bản.
