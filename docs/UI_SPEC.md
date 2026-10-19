# Bố cục và đặc tả giao diện

Cập nhật theo yêu cầu bổ sung sau giai đoạn 5, trước giai đoạn 6. Đã có ứng dụng, dữ liệu truyện thực tế trong Preview; bảng đầu vào giai đoạn 1 bên dưới là ghi nhận lịch sử.

## 1. Dữ liệu hiện có

| Nội dung | Trạng thái | Cách xử lý |
| --- | --- | --- |
| Tên truyện, tác giả | Chưa được cung cấp | Chủ website nhập trong admin |
| Giới thiệu, trạng thái sáng tác | Chưa được cung cấp | Nhập trong admin; mặc định đang viết |
| Ảnh bìa | Chưa được cung cấp | Ô bìa trung tính, không bịa ảnh hoặc tiêu đề |
| Nội dung chương | Chưa được cung cấp | Đăng từ admin; trang công khai có trạng thái chưa có chương |
| Đánh giá | Chưa có | Hiển thị chưa có đánh giá, không tạo điểm hoặc nhận xét giả |

Không cần những dữ liệu này để bắt đầu dựng nền tảng. Không đưa nội dung ví dụ vào production như dữ liệu thật.

## 2. Phong cách và kích thước

| Thuộc tính | Quyết định |
| --- | --- |
| Nền trang sáng | `#FAF8F3`, sắc giấy ấm |
| Nền khối/form | `#FFFFFF` |
| Chữ chính / phụ | `#202923` / `#59635D` |
| Màu nhấn / chữ trên nút nhấn | `#245846` / `#FFFFFF` |
| Viền | `#DDDCD3` |
| Trang đọc tối | Nền `#17201C`, chữ `#E9ECE7`, chữ phụ `#B4BEB7` |
| Chữ giao diện | `system-ui, sans-serif`; cỡ cơ bản 16 px |
| Chữ nội dung truyện | Chọn DejaVu Serif (mặc định, tải cùng web) hoặc Times New Roman (font trên thiết bị, dự phòng DejaVu); mặc định 20 px, giãn dòng 1,9 |
| Chỉnh cỡ chữ | 18 / 20 / 22 / 24 px; giới hạn lựa chọn rõ ràng |
| Chiều rộng trang chủ/admin | Tối đa 1.040 px, căn giữa |
| Chiều rộng nội dung đọc | Hẹp 600 / vừa 720 (mặc định) / rộng 900 px, căn giữa, tự co theo màn hình |
| Giãn dòng | 1,5 / 1,7 / 1,9 (mặc định) / 2,1 / 2,3 |
| Tên truyện / tiêu đề chương | 28–38 px / 23–30 px, font đọc đã chọn, 400, không tổng hợp đậm/nghiêng |
| Khoảng cách | Theo bước 8 px; khối chính cách nhau 32–48 px |
| Bo góc | 12 px cho khối/form; 8 px cho nút/ô nhập |
| Vùng bấm | Tối thiểu 44 × 44 px cho điều khiển chính |

Font giao diện dùng hệ thống; DejaVu Serif được đóng gói cùng ứng dụng, không phụ thuộc CDN font ngoài. Thiết kế ít trang trí, không carousel; mục lục và tuỳ chọn đọc dùng panel dạng dialog, có nút đóng, Escape và focus bàn phím. Thanh trên sticky giữ trong luồng trang. Hiển thị viền focus khi dùng bàn phím, không dùng màu làm dấu hiệu duy nhất. Cập nhật font theo yêu cầu người dùng ở giai đoạn 5.

## 3. Trang chủ — `/`

### Bố cục desktop

```text
┌───────────────────────────────────────────────────────┐
│ Tên truyện                                           │
├───────────────┬───────────────────────────────────────┤
│               │ TÊN TRUYỆN                            │
│  Bìa tỉ lệ 2:3 │ Tác giả · Đang viết / Hoàn thành        │
│               │ Giới thiệu                            │
│               │ [Đọc từ đầu]  [Xem mục lục]            │
├───────────────┴───────────────────────────────────────┤
│ MỤC LỤC · số chương đã đăng                           │
│ Chương 1 — Tiêu đề                                    │
│ Chương 2 — Tiêu đề                                    │
│ ...                                      [Xem thêm]  │
└───────────────────────────────────────────────────────┘
```

- Bìa rộng khoảng 220 px trên desktop; phần thông tin chiếm khoảng trống còn lại.
- Mobile dưới 768 px: một cột, bìa rộng khoảng 160 px phía trên thông tin; lề trang 16 px, nút không tràn ngang.
- Tên truyện là H1 duy nhất; mục lục là H2. Trang chủ không hiển thị đánh giá. Tên dài tự xuống dòng.
- `Đọc từ đầu` mở chương đã đăng có thứ tự nhỏ nhất; `Xem mục lục` cuộn tới mục lục.
- Mục lục sắp tăng dần theo thứ tự; mỗi dòng là một liên kết có vùng bấm đủ rộng. Tải 30 chương mỗi lần, thêm nút Xem thêm nếu còn.
- Chưa có chương: thông báo `Truyện chưa có chương được đăng.`, vô hiệu hóa nút đọc, không tạo chương giả.
- Chưa cấu hình thông tin truyện: trang trống trung tính `Truyện đang được chuẩn bị.`; không lấy mật khẩu hoặc thông tin admin ra giao diện.

## 4. Trang đọc — `/chuong/[id]`

```text
[☷ Mục lục]                         [⚙ Tuỳ chọn đọc] [↓]
                 TÊN TRUYỆN NỔI BẬT
                         Chương N
                     Tiêu đề chương
     [← Chương trước] [Mục lục] [Chương sau →]

             Nội dung giữ xuống dòng, đoạn văn.

     [← Chương trước] [Mục lục] [Chương sau →]
                 ĐÁNH GIÁ CHUNG CỦA TRUYỆN
```

- Mục lục mở panel bên trái, đóng/mở bằng nút trên thanh hoặc giữa hai nút chuyển chương. Chỉ liệt kê chương đã đăng; đánh dấu chương hiện tại và tải thêm 30 chương/lượt. Đóng qua nút ×, Escape, click nền ngoài hoặc chọn chương; trả focus về nút mở.
- Tuỳ chọn đọc mở panel bên phải: cỡ chữ, DejaVu Serif/Times New Roman, giãn dòng, độ rộng khung, sáng/tối và khôi phục mặc định. Panel cuộn riêng trên màn hình thấp; không tràn ngang, thao tác bàn phím nằm trong dialog.
- Mũi tên ↓ trên thanh cuộn đến cuối nội dung/chỗ chuyển chương; hỗ trợ giảm chuyển động của thiết bị. Không cần kéo chuột qua toàn bộ nội dung.
- Tên truyện, tiêu đề chương và nội dung dùng cùng font được chọn, chữ thường 400, không đậm/nghiêng tổng hợp. Tên truyện lớn hơn tiêu đề chương và liên kết về trang truyện. DejaVu được đóng gói toàn ứng dụng để tiêu đề trang chủ/admin/404 cũng đúng font.
- Tất cả tuỳ chọn lưu trong trình duyệt; mặc định 20 px, DejaVu, nền sáng, giãn dòng 1,9, rộng 720 px. Dữ liệu cũ thiếu trường dùng mặc định mà giữ các lựa chọn hợp lệ khác. Times New Roman thiếu trên thiết bị sẽ dự phòng DejaVu; không phân phối font Windows.
- Nội dung giữ xuống dòng và dòng trống bằng cách render text an toàn, không thực thi HTML người nhập.
- Chương trước/sau tính theo các chương đã đăng. Không có chương liền kề thì vô hiệu hóa nút tương ứng; không vòng từ chương cuối về chương đầu.
- Chương nháp/không tồn tại: trang không tìm thấy với liên kết về mục lục, không gửi nội dung nháp xuống client.
- Chặn chọn chữ, copy/cut, kéo thả và menu chuột phải chỉ trên phần nội dung chương. Không đặt lớp phủ, không chặn toàn bộ phím tắt hoặc công cụ trình duyệt.
- Vẫn dùng được cuộn, phóng to, liên kết, bàn phím và trình đọc màn hình. Đây là hạn chế sao chép thông thường, không phải bảo vệ tuyệt đối.

### Đánh giá chung dưới mỗi chương

Mọi chương cùng hiển thị một tập đánh giá của truyện (novel_id 1). Không thêm chapter_id hay thống kê riêng cho chương.

- Tên bắt buộc, 1–50 ký tự sau trim; sao là lựa chọn 1–5 bắt buộc, không chọn sẵn; nhận xét tùy chọn, tối đa 1.000 ký tự.
- Chọn sao bằng nhóm radio có nhãn `1 sao` đến `5 sao`, dùng được bằng bàn phím; không chỉ dựa vào icon.
- Tên và nhận xét vẫn chọn, copy và paste bình thường. Không có email, tài khoản hoặc link đăng nhập.
- Đang gửi: khóa nút gửi, giữ dữ liệu. Lỗi: báo ngay tại trường hoặc form và giữ dữ liệu để sửa. Thành công: báo `Đã gửi đánh giá.`, làm mới danh sách và điểm.
- Chưa có đánh giá: hiển thị `Chưa có đánh giá.`, không hiển thị điểm 0/5 như một đánh giá thật.
- Danh sách mới nhất trước; 10 đánh giá mỗi lần, nút Xem thêm nếu còn. Đánh giá đã ẩn không xuất hiện hoặc được tính vào điểm trung bình.

## 5. Trang admin — `/admin`

### Trước khi vào

- Form nhỏ căn giữa: tiêu đề `Quản trị truyện`, ô mật khẩu có label, nút `Vào quản trị`.
- Enter gửi form; sai mật khẩu báo lỗi chung, không tiết lộ thông tin cấu hình. Có trạng thái đang kiểm tra và giới hạn thử sai.
- Không có đăng ký, quên mật khẩu, tài khoản độc giả hoặc lựa chọn vai trò.

### Sau khi vào

```text
Quản trị truyện                          [Xem trang đọc] [Đăng xuất]
[Thông tin truyện]       [Chương]       [Đánh giá]

THÔNG TIN TRUYỆN
Tên truyện / Tác giả / Giới thiệu / Trạng thái
Ảnh bìa [Tải ảnh bìa lên] [Xem trước] [Huỷ ảnh đã chọn]
[Lưu thông tin]

CHƯƠNG                                         [Thêm chương]
Thứ tự | Tiêu đề | Nháp / Đã đăng | Sửa
Form sửa chương ngay trong khu vực này
[Lưu nháp] [Đăng chương] hoặc [Lưu cập nhật] [Gỡ về nháp]
[Xóa chương]

ĐÁNH GIÁ
Tên | Sao | Nhận xét | Ngày | [Ẩn đánh giá]
```

- Ba nút khu vực là liên kết tới section trong cùng trang; không cần dashboard số liệu hoặc sidebar phức tạp.
- Danh sách chương có nút mở form để thêm/sửa ngay trong khu vực Chương; mobile chuyển dòng bảng thành các hàng thẻ gọn.
- Xem trang đọc mở trang chủ công khai, không tự xuất bản nháp.

### Trường và hành vi form

| Form | Trường | Quy tắc |
| --- | --- | --- |
| Thông tin truyện | Tên, tác giả | Bắt buộc khi lưu; tối đa 200 / 100 ký tự |
| Thông tin truyện | Giới thiệu | Văn bản nhiều dòng, tối đa 5.000 ký tự |
| Thông tin truyện | Trạng thái | Đang viết hoặc Hoàn thành |
| Bìa | Tệp ảnh | JPEG/PNG/WebP, tối đa 2 MB; gợi ý tỉ lệ 2:3; bìa không bắt buộc |
| Chương | Thứ tự | Số nguyên dương, không trùng trong truyện |
| Chương | Tiêu đề | Bắt buộc, tối đa 200 ký tự |
| Chương | Nội dung | Bắt buộc khi lưu/đăng, ô nhiều dòng lớn, tối đa 200.000 ký tự |

- Bìa: nút Tải ảnh bìa lên mở bộ chọn tệp; chọn ảnh sẽ xem trước tại chỗ, có Huỷ ảnh đã chọn. Chỉ upload khi bấm Lưu thông tin. Kiểm tra MIME/kích thước phía client và MIME/magic bytes/kích thước tại server; không ảnh hưởng bìa đã lưu khi huỷ hoặc lỗi.
- Trạng thái chương chỉ có Nháp và Đã đăng. Không tạo bản sửa tách biệt hoặc lịch sử phiên bản.
- Chương nháp: có Lưu nháp và Đăng chương. Chương đã đăng: có Lưu cập nhật và Gỡ về nháp.
- Gần nút Lưu cập nhật ghi rõ `Thay đổi sẽ hiển thị ngay cho độc giả.`
- Xóa chương: xác nhận trước khi xóa, mặc định không xác nhận. Gỡ về nháp giữ nội dung nhưng rút khỏi trang công khai.
- Giữ dữ liệu khi lưu lỗi; báo đang lưu/đã lưu/lỗi lưu và cảnh báo rời trang nếu chưa lưu. Không hứa tự lưu.
- Ẩn đánh giá: rút khỏi danh sách công khai và phép tính điểm; không xóa vĩnh viễn. Hàng admin hiển thị trạng thái Đã ẩn, nút ẩn không khả dụng nữa.
- Khi phiên hết hạn, thao tác bị từ chối và yêu cầu vào lại; không tự xóa nội dung đang nhập trong trang hiện tại trước khi người dùng có thể giữ bản sao.

## 6. Kiểm tra thiết kế trước khi code

- [x] Đã kiểm tra repository: chỉ có tài liệu và cấu hình Git, chưa có ứng dụng hoặc dữ liệu truyện.
- [x] Đã ghi rõ nội dung, bìa còn thiếu và cách hiển thị khi chưa được cung cấp.
- [x] Đã chốt ba màn hình, bố cục mobile/desktop, màu, chữ và điều hướng.
- [x] Đã chốt trường dữ liệu, nút hành động và trạng thái trống/lỗi/đang lưu.
- [x] Đã giữ phạm vi một truyện, không tài khoản độc giả, không build Docker trên máy người dùng.

Kiểm tra ở giai đoạn này là đối chiếu đặc tả với yêu cầu. Chưa có kiểm thử giao diện, backend hoặc deployment; thực hiện ở các giai đoạn xây dựng tương ứng.

## 7. Bàn giao sang giai đoạn 2

Triển khai theo `PLAN.md`, dùng tài liệu này làm chuẩn giao diện. Chưa cần đợi tên truyện/ảnh bìa để khởi tạo ứng dụng; chủ website nhập dữ liệu thật trong admin sau. Không tự tạo thêm thiết kế, dịch vụ hoặc tính năng ngoài phạm vi đã chốt.
