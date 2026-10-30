# Kế hoạch phát triển website đọc tiểu thuyết

Cập nhật: 30/10/2026.

## 1. Mục tiêu

Xây dựng và hoàn thiện website đăng, quản lý và đọc một tiểu thuyết. Hệ thống phải đáp ứng ba quy trình chính: quản trị xuất bản chương, độc giả đọc truyện và tài khoản độc giả gửi đánh giá.

## 2. Phạm vi

| Hạng mục | Nội dung |
| --- | --- |
| Trang giới thiệu | Thông tin truyện, ảnh bìa, trạng thái sáng tác và mục lục |
| Trang đọc | Nội dung chương, điều hướng, mục lục, tùy chọn hiển thị và hạn chế sao chép trong vùng nội dung |
| Quản trị | Đăng nhập riêng; cập nhật truyện/bìa; thêm, sửa, xóa, lưu nháp, đăng và gỡ chương |
| Tài khoản độc giả | Đăng ký, đăng nhập bằng email/mật khẩu hoặc Google; hồ sơ, tiến độ, dấu đọc tiếp và thông báo chương mới |
| Đánh giá | Điểm sao và nhận xét chung theo truyện; gửi mới cần đăng nhập; quản trị được ẩn đánh giá |
| Triển khai | Next.js trên Vercel, Supabase PostgreSQL/Auth và Vercel Blob; tách dữ liệu Preview và Production |

Khách được đọc miễn phí mà không cần tài khoản. Mỗi tài khoản lưu một dấu đọc tiếp; phải bỏ dấu cũ trước khi đặt dấu mới. Đánh giá hiển thị dưới chương, không đặt tại trang giới thiệu.

Phạm vi không bao gồm nhiều truyện, tài khoản tác giả, thanh toán, VIP, audio, AI, import tệp hoặc cộng tác biên tập.

Chi tiết giao diện tại [UI_SPEC](docs/UI_SPEC.md); cấu hình và vận hành tại [README](README.md). Giữ nguyên nội dung Production đã nhập trong mọi đợt cập nhật.

## 3. Các giai đoạn thực hiện

| Giai đoạn | Công việc | Điều kiện hoàn thành | Trạng thái |
| --- | --- | --- | --- |
| 1. Xác định yêu cầu | Chốt phạm vi, bố cục và hành vi giao diện | Có đặc tả trang giới thiệu, trang đọc và quản trị | Hoàn thành |
| 2. Thiết lập nền tảng | Cấu hình ứng dụng, database, lưu trữ ảnh và môi trường | Preview kết nối được database và lưu trữ thực tế | Hoàn thành |
| 3. Quản trị nội dung | Xây dựng xác thực, quản lý truyện/bìa và vòng đời chương | Đăng được chương; thao tác quản trị được kiểm tra quyền tại server | Hoàn thành |
| 4. Đọc truyện | Xây dựng trang giới thiệu, mục lục, điều hướng và tùy chọn đọc | Đọc được các chương đã đăng; không truy cập được chương nháp | Hoàn thành |
| 5. Đánh giá | Lưu, hiển thị, phân trang, giới hạn gửi và ẩn đánh giá | Dữ liệu và điểm trung bình cập nhật sau gửi/ẩn | Hoàn thành |
| 6. Kiểm thử và phát hành | Kiểm tra chức năng, quyền truy cập, giao diện và triển khai | Các quy trình chính hoạt động trên Production | Hoàn thành bản cơ sở |
| Bổ sung tài khoản | Tích hợp xác thực, hồ sơ, tiến độ, dấu đọc và thông báo | Đăng ký/đăng nhập và dữ liệu cá nhân hoạt động đầy đủ | Đã phát hành; còn nghiệm thu Google và email |
| 7. Hoàn tất nghiệm thu | Xử lý các hạng mục còn lại và xác nhận bàn giao | Đáp ứng toàn bộ tiêu chí tại mục 5 | Chưa hoàn thành |

Kết quả các giai đoạn 2–6 được lưu trong [báo cáo nền tảng](docs/STAGE_2_REPORT.md), [quản trị](docs/STAGE_3_REPORT.md), [trang đọc](docs/STAGE_4_REPORT.md), [đánh giá](docs/STAGE_5_REPORT.md) và [phát hành](docs/STAGE_6_REPORT.md).

## 4. Kế hoạch hoàn thiện

Thực hiện theo thứ tự dưới đây. Các hạng mục kiểm thử tài khoản phụ thuộc việc hoàn tất cấu hình xác thực.

| Thứ tự | Hạng mục | Công việc cần thực hiện | Kết quả nghiệm thu |
| --- | --- | --- | --- |
| 1 | Đăng nhập Google | Xác nhận cấu hình chuyển hướng Supabase; kiểm tra đăng nhập, đăng xuất, hủy xác thực và liên kết cùng email | Quay về đúng website, tạo phiên hợp lệ, không chuyển về localhost |
| 2 | Đăng ký email | Xác minh SMTP, đăng ký và mở email xác nhận trong hộp thư thật | Nhận được thư, xác nhận và đăng nhập thành công |
| 3 | Rà soát bảo mật | Xử lý các cảnh báo dependency đã ghi nhận; đánh giá cấu hình bảo vệ mật khẩu Supabase Auth | Có kết quả rà soát và phương án xử lý; bản sửa tương thích với hệ thống |
| 4 | Kiểm thử tổng thể | Cấp hai tài khoản thử riêng; kiểm tra quyền, dữ liệu cá nhân, xuất bản, đọc và đánh giá trên Preview | Hai tài khoản độc lập; khách không có quyền ghi; không lộ nháp hoặc mất dữ liệu |
| 5 | Kiểm tra thiết bị | Thử trang đọc, menu, tùy chọn và form trên iPhone/Android vật lý | Không tràn bố cục; đọc, điều hướng và nhập liệu hoạt động |
| 6 | Xác nhận bản phát hành | Khi có bản cập nhật được phép triển khai, đối chiếu nội dung và kiểm tra lại các quy trình chính | Truyện, chương, bìa và đánh giá được giữ nguyên sau triển khai |
| 7 | Bàn giao | Đối chiếu checklist, xác nhận hướng dẫn quản trị và ghi nhận phần chưa đạt | Chủ website tự quản lý nội dung; trạng thái nghiệm thu đầy đủ |

Cấu hình Google đang chờ chủ website xác nhận sau khi chọn tự thực hiện theo [hướng dẫn tài khoản](docs/READER_ACCOUNTS.md). SMTP và việc nhận email xác nhận thực tế chưa được nghiệm thu. Bộ tài khoản thử trước đã xóa; cần cấp lại trước khi chạy kiểm thử tài khoản.

## 5. Tiêu chí nghiệm thu

Các mục đã đánh dấu căn cứ trên kết quả kiểm tra trước đây. Kiểm thử tài khoản đầy đủ đã thực hiện trên local/Preview; trên Production mới xác nhận các chức năng công khai, quyền truy cập và chuyển hướng tới Google.

- [x] Quản trị có xác thực tại server; yêu cầu ghi được kiểm tra quyền và origin.
- [x] Quản lý truyện/bìa và vòng đời chương hoạt động; thay đổi được cập nhật trên trang công khai.
- [x] Chương nháp không xuất hiện trong trang đọc, API, HTML hoặc metadata.
- [x] Điều hướng, font, định dạng đoạn và tùy chọn đọc hoạt động trên máy tính và điện thoại giả lập.
- [x] Hạn chế sao chép chỉ áp dụng trong nội dung chương; form vẫn chọn và sao chép văn bản bình thường.
- [x] Đánh giá được lưu, phân trang, giới hạn gửi và ẩn; điểm trung bình được tính đúng.
- [x] Hai tài khoản tách biệt tiến độ, dấu đọc và đánh giá; thông báo chương mới và làm mới phiên hoạt động.
- [x] Google đăng nhập hoàn chỉnh, xử lý đúng trường hợp hủy và liên kết cùng email.
- [x] Đăng ký email, nhận thư xác nhận và đăng nhập bằng tài khoản đã xác nhận.
- [ ] Hoàn tất rà soát các cảnh báo bảo mật còn mở.
- [x] Giao diện hoạt động trên iPhone và Android vật lý.
- [x] Dữ liệu truyện, chương, bìa và đánh giá được bảo toàn qua lần triển khai cập nhật.
- [x] Hoàn tất hướng dẫn và xác nhận bàn giao.

## 6. Bàn giao giữa các chat

Giai đoạn hiện tại: hoàn tất nghiệm thu. Chức năng cơ sở và bản tài khoản đã phát hành; phần còn lại thực hiện theo mục 4, bắt đầu từ xác nhận cấu hình Google.

Lần cập nhật này chỉ chỉnh cấu trúc `PLAN.md`; kiểm tra Markdown, liên kết và `git diff --check`. Không chạy kiểm thử ứng dụng vì không thay đổi mã nguồn.
