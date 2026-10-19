# Bổ sung trang đọc trước giai đoạn 6

Ngày kiểm tra: 19/10/2026. Phạm vi là sửa định dạng chữ và các tính năng người dùng bổ sung sau giai đoạn 5. Chưa triển khai giai đoạn 6 hoặc phát hành Production.

## Thay đổi

- Đưa DejaVu Serif vào layout toàn ứng dụng; các tiêu đề serif ở trang chủ, admin, trang không tìm thấy và đánh giá đều dùng font đóng gói. Tên truyện, tiêu đề chương và nội dung đọc dùng cùng font độc giả chọn: DejaVu Serif hoặc Times New Roman. Chữ 400, không tổng hợp đậm/nghiêng hoặc giãn ký tự gây lỗi dấu.
- Tên truyện trong trang đọc tăng lên 28–38 px, tiêu đề chương 23–30 px, tự xuống dòng.
- Thanh trên có Mục lục bên trái, Tuỳ chọn đọc bên phải và nút ↓ cuộn tới cuối nội dung chương. Chương trước/sau có cả dưới tiêu đề và cuối chương; vô hiệu hoá đúng nút ở đầu/cuối truyện.
- Panel tuỳ chọn: cỡ 18/20/22/24 px; hai font; sáng/tối; giãn dòng 1,5/1,7/1,9/2,1/2,3; rộng 600/720/900 px và khôi phục mặc định. Tự vừa màn hình nhỏ. Lưu tại `novel-reading-v1`, tương thích dữ liệu cũ và hoạt động trong trang khi storage bị từ chối.
- Mục lục dạng panel kéo ra/vào bên trái, chỉ chương đã đăng, đánh dấu chương hiện tại, tải thêm 30 chương/lượt. Panel hỗ trợ nút đóng, nền ngoài, Escape, giữ focus bàn phím, trả focus và cuộn riêng.
- Đánh giá chuyển khỏi trang chủ sang dưới mỗi chương, dùng chung theo truyện. Không thay schema hoặc tách đánh giá theo chương. Gửi/ẩn làm mới các trang đọc và số liệu chung. Reader có key theo chương để điều hướng Next nhận dữ liệu mới, tránh giữ review cũ sau admin ẩn.
- Admin có nút Tải ảnh bìa lên, xem trước ảnh tại chỗ, tên tệp và Huỷ ảnh đã chọn. Chỉ upload khi Lưu thông tin; giữ kiểm tra quyền/origin/MIME/kích thước/magic bytes ở server và kho Blob hiện có.
- Giữ hạn chế copy trong nội dung chương; form/admin vẫn chọn và copy bình thường.

## Kiểm tra local đã qua

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run lint`, `npm run typecheck` | Qua |
| `npm test` | 8/8 qua, gồm dữ liệu tuỳ chọn cũ và giới hạn trường mới |
| `npm run build` | Qua, Webpack, chạy Node trực tiếp |
| `python .local/verify-font.py` | Đủ glyph tiếng Việt, thiếu 0 |
| E2E admin | Qua 27,5 giây: mở bộ chọn ảnh bằng nút, xem trước/huỷ, upload Blob thật, xác nhận URL DB; ảnh giả bị từ chối, quyền admin và vòng đời chương đúng |
| E2E reader | Qua 24,6 giây: CDP xác nhận font thật trên nội dung/tên truyện/H1; cả hai font; tiếng Việt NFC/NFD; 600/900 px, giãn dòng, lưu/reload/chuyển chương, mobile/zoom; mục lục/đánh dấu/đóng Escape/trả focus; xuống cuối; hai vị trí điều hướng; nháp 404; copy đúng phạm vi; cập nhật/gỡ/xóa và phân trang |
| E2E review | Qua 16,3 giây: không có khối đánh giá ở home; gửi tại chương thứ nhất, sang chương thứ hai thấy cùng đánh giá/điểm; giữ form khi lỗi; 403/413/429, gửi đồng thời, ẩn, tính điểm, phân trang |

Đã xem ảnh chụp desktop, mobile sáng/tối, tuỳ chọn đọc và mục lục. Bằng chứng nằm trong `.local/reader-revision-*.png` (không commit/deploy). Các lỗi selector của test khi chuyển điều khiển vào dialog đã được sửa; lần cuối admin/reader đều qua. Sandbox Windows từng chặn Edge/build, đã chạy lại ngoài sandbox thành công. Không build Docker.

## Preview và dữ liệu

Preview: [Mở truyện](https://novel-platform-9jxrl4bc8-nguyenlionel.vercel.app) · [Admin](https://novel-platform-9jxrl4bc8-nguyenlionel.vercel.app/admin). Deployment `dpl_BK9z5XAsbZmbJAMmvqPCr4B2W2VB`, inspect xác nhận **preview / READY**, build 37 giây, Functions Singapore `sin1`; giữ Vercel Authentication.

Browser HTTPS trên bản cuối đã qua: font thực tế và kiểu 400 của H1 trang chủ, mục lục, 404, trang đăng nhập/admin; DejaVu ở tên truyện/tiêu đề/nội dung/đánh giá; Times thật ở tên truyện/tiêu đề/nội dung khi chọn. Đã thử lưu/reload font/nền/giãn dòng/khung 900 px, viewport 320/390 px không tràn, mục lục/current chapter, focus/Escape, chọn chương, mũi tên xuống cuối và nút tải bìa admin. Gửi một đánh giá thử từ trang đọc → reload còn → admin ẩn → HTML/API/điểm trở về dữ liệu ban đầu. Không có lỗi JavaScript hoặc hydration. Script `.local/verify-reader-revision.mjs` chỉ gửi token bảo vệ đến đúng origin Preview, không gửi sang Blob/website ngoài.

Local E2E dùng fixture có prefix/UUID riêng, khôi phục thông tin truyện trong `finally`, xoá đúng chương/ảnh thử. Review thử được ẩn rồi xoá qua quyền quản trị cloud bằng đúng UUID manifest; không cấp DELETE review cho role ứng dụng. Query cuối xác nhận Preview còn **1 chương / 1 đánh giá thật**, Production **0 chương / 0 đánh giá**. Giữ nội dung và đánh giá thật đã có trong Preview. Quét file Git: không tìm thấy giá trị secret; `git diff --check` qua.

## Giới hạn và bước tiếp theo

Times New Roman dùng font thiết bị, thiếu sẽ dự phòng DejaVu; không phân phối font Windows. Kiểm tra trình duyệt chạy Edge Windows với viewport điện thoại, chưa xác nhận trên iPhone/Android vật lý. Các biện pháp copy chỉ hạn chế thao tác thông thường, không chặn tuyệt đối trích xuất hoặc OCR. Giai đoạn 6 vẫn chưa bắt đầu.
