# Kế hoạch 1 ngày: website đọc một tiểu thuyết

Cập nhật: 19/10/2026. Kế hoạch này thay thế hoàn toàn phạm vi trước.

## 1. Phạm vi đã chốt

- Website có đúng một truyện; trang chủ chính là trang giới thiệu truyện đó.
- Có trang đọc từng chương và trang admin để chủ website đăng/sửa nội dung.
- Độc giả không cần tài khoản để đọc hoặc gửi đánh giá.
- Đánh giá: tên hiển thị, số sao 1–5 và lời nhận xét tùy chọn; hiển thị dưới nội dung ở mọi trang đọc, dùng chung theo truyện; không hiển thị tại trang chủ.
- Admin dùng một mật khẩu riêng; không có đăng ký hay hệ thống tài khoản người dùng.
- Khi có thêm truyện mới mới mở rộng giao diện và chức năng.
- Nội dung chương có biện pháp hạn chế sao chép thông thường; không cam kết chống sao chép tuyệt đối trên trình duyệt.

## 2. Màn hình cần làm

### Trang chủ `/`

- Ảnh bìa, tên truyện, tác giả, giới thiệu và trạng thái đang viết/hoàn thành.
- Nút Đọc từ đầu và danh sách chương đã đăng.
- Không hiển thị khối đánh giá tại trang chủ; độc giả đánh giá từ trang đọc.
- Giao diện gọn, ưu tiên điện thoại.

### Trang đọc `/chuong/[id]`

- Tên truyện, số chương, tiêu đề và nội dung chương.
- Nút chương trước/sau ở dưới tiêu đề và cuối chương; mục lục kéo ra/vào bên trái.
- Thanh trên có Tuỳ chọn đọc (bên phải: cỡ chữ, font, nền, giãn dòng, độ rộng khung) và mũi tên xuống cuối chương. Lưu lựa chọn trên trình duyệt.
- Mỗi lần Enter tạo một đoạn, dòng đầu thụt 2em; giãn đoạn riêng (mặc định 0,8em) cộng thêm ngoài giãn dòng. Không đổi dữ liệu nội dung gốc.
- Tên truyện lớn, tiêu đề chương cùng font nội dung. Đánh giá chung của truyện nằm dưới mỗi chương.
- Chỉ truy cập được chương đã đăng.
- Chặn chọn chữ, kéo thả văn bản, sự kiện copy/cut và menu chuột phải trong vùng nội dung chương.
- Chỉ áp dụng vào nội dung đọc; admin, form đánh giá và các ô nhập liệu vẫn chọn/copy/paste bình thường.
- Giữ cuộn trang, điều hướng bằng bàn phím, phóng to và khả năng đọc bằng trình đọc màn hình; không chặn phím tắt toàn trang hoặc công cụ trình duyệt.
- Giới hạn: nội dung đã gửi đến trình duyệt vẫn có thể được lấy bằng công cụ kỹ thuật, chụp màn hình hoặc OCR. Các biện pháp trên chỉ hạn chế thao tác sao chép thông thường.

### Trang admin `/admin`

- Nhập mật khẩu để vào; có nút đăng xuất.
- Sửa thông tin truyện và tải ảnh bìa.
- Danh sách chương; thêm/sửa tiêu đề, thứ tự và nội dung chương.
- Nhập nội dung bằng ô văn bản nhiều dòng, giữ xuống dòng và đoạn văn.
- Lưu nháp, Đăng chương và Gỡ về nháp.
- Sửa chương đã đăng: nút Lưu cập nhật ghi thay đổi ra công khai ngay, có nhãn giải thích rõ.
- Xóa chương có xác nhận; admin có thể ẩn đánh giá spam.
- Báo lưu thành công/thất bại; cảnh báo rời trang khi còn thay đổi chưa lưu.

## 3. Công nghệ tối thiểu

- Next.js + TypeScript + Tailwind CSS; giao diện và backend cùng một dự án.
- Vercel để triển khai ứng dụng.
- Không build Docker trên máy người dùng, kể cả qua script, WSL hay Docker Desktop. Chạy dev/kiểm tra trực tiếp bằng Node.js; dùng quy trình build/deploy của Vercel.
- Supabase PostgreSQL trong project mới `novel-platform` để lưu truyện, chương và đánh giá. Người dùng đã chọn Supabase thay Neon khi bắt đầu giai đoạn 2.
- Vercel Blob để lưu ảnh bìa tải lên từ admin.
- Không cần dịch vụ tài khoản độc giả, Redis, trình soạn thảo phức tạp hoặc backend riêng.
- Mật khẩu admin lưu dạng hash trong biến môi trường server. Phiên dùng cookie được ký, HttpOnly, Secure trên production và có hạn sử dụng.
- Mọi thao tác quản trị kiểm tra phiên tại server; kiểm tra origin/CSRF cho thao tác ghi dùng cookie.
- Văn bản được render an toàn, không nhận HTML từ độc giả.

### Dữ liệu: ba bảng

1. `novels`: một bản ghi cho truyện, gồm tên, tác giả, giới thiệu, bìa và trạng thái.
2. `chapters`: novel_id, thứ tự, tiêu đề, nội dung, nháp/đã đăng và thời điểm cập nhật. Thứ tự không trùng trong cùng truyện.
3. `reviews`: novel_id, tên hiển thị, số sao, nhận xét, thời điểm gửi và trạng thái hiển thị.

Để sẵn novel_id cho nâng cấp sau; giao diện và admin chỉ quản lý một truyện. Mục lục và đánh giá dùng tải thêm/phân trang khi danh sách dài. Giới hạn gửi đánh giá và thử mật khẩu bằng dữ liệu lưu bền vững, không dựa vào bộ nhớ của một Function.

## 4. Lộ trình một ngày: 8 giờ làm việc

| Giai đoạn | Thời lượng | Công việc theo thứ tự | Kết quả cần đạt |
| --- | --- | --- | --- |
| 1. Chốt bố cục | 30 phút | Chốt ba màn hình, màu/chữ mặc định, form đánh giá và thông tin truyện | Có bố cục đủ rõ để làm ngay |
| 2. Dựng nền tảng | 1 giờ | Tạo Next.js; liên kết Vercel; tạo project Supabase riêng và Blob; cấu hình biến môi trường; tạo ba bảng và một bản ghi truyện | Preview chạy và kết nối dữ liệu thật |
| 3. Làm admin | 2 giờ | Mật khẩu; sửa truyện/bìa; thêm/sửa chương; lưu nháp/đăng/gỡ/xóa; ẩn đánh giá | Chủ website tự đăng và cập nhật chương được |
| 4. Làm trang độc giả | 1 giờ 30 phút | Trang chủ một truyện; mục lục; đọc chương; điều hướng; cỡ chữ/sáng tối; responsive; hạn chế sao chép nội dung chương | Khách đọc liên tục được, có chặn copy thông thường |
| 5. Làm đánh giá | 1 giờ | Form tên + sao + nhận xét; lưu database; danh sách và điểm trung bình; chống spam cơ bản | Gửi đánh giá không cần đăng nhập |
| 6. Kiểm thử và deploy | 1 giờ | Thử đăng/đọc/đánh giá; quyền admin; chương nháp; mobile; build và deploy production | Có URL Vercel dùng được |
| 7. Dự phòng và bàn giao | 1 giờ | Dành tối đa 20 phút bổ sung/kiểm tra hạn chế sao chép nếu cần; sửa lỗi cuối; nhập chương do chủ website cung cấp; hướng dẫn đăng chương | Web dùng được và chủ website tự quản lý được |

Điều kiện giữ lịch: có nội dung và ảnh bìa, truy cập được dịch vụ, dùng giao diện gọn mặc định và không thêm import tệp hoặc nhiều vòng thiết kế. Đây là ước lượng, không bỏ qua lỗi để kịp giờ. Dùng URL .vercel.app trước; domain riêng cấu hình khi có, không lấy thời gian DNS làm điều kiện hoàn thành trong ngày.

Các mốc giờ dưới đây tính từ lúc bắt đầu triển khai ứng dụng, không phải giờ cố định trong ngày. Việc chuẩn bị Git và tài liệu đã làm trước. Checkbox chỉ đánh dấu sau khi thực hiện và kiểm tra thực tế.

### Giai đoạn 0 — Chuẩn bị theo dõi dự án (trước giờ triển khai)

- [x] Tạo `AGENTS.md` để agent mới tiếp tục đúng yêu cầu.
- [x] Chốt phạm vi một truyện và kế hoạch từng giai đoạn trong `PLAN.md`.
- [x] Khởi tạo Git ở thư mục dự án, nhánh `main`.
- [x] Thêm `.gitignore` để loại biến môi trường, dependency, build và log khỏi Git.

Kết quả: repository sẵn sàng lưu lịch sử. Mốc Git ban đầu lưu các tài liệu và cấu hình ignore; chưa có mã ứng dụng hay remote.

### Giai đoạn 1 — Chốt bố cục (00:00–00:30)

Thực hiện theo thứ tự:

1. [x] Kiểm tra workspace và tài liệu; xác định tên truyện, tác giả, giới thiệu, bìa và nội dung đã có. Nếu thiếu, ghi rõ để nhập sau, không bịa nội dung thật.
2. [x] Chọn một phong cách gọn: nền sáng, chữ dễ đọc, một màu nhấn; trang đọc có sáng/tối.
3. [x] Chốt trang chủ: bìa/thông tin → nút đọc → mục lục → đánh giá.
4. [x] Chốt trang đọc: tiêu đề → nội dung → chương trước/sau và mục lục.
5. [x] Chốt admin: thông tin truyện, danh sách chương, form sửa chương, danh sách đánh giá; dùng các khu vực đơn giản trong cùng trang nếu phù hợp.

Đầu ra: bố cục và trường dữ liệu đủ rõ để code; không cần Figma hay nhiều vòng thiết kế.

Đã hoàn thành bằng `docs/UI_SPEC.md`: wireframe văn bản cho ba màn hình, màu/chữ/kích thước, responsive, trường form, trạng thái và hành vi. Tên truyện, tác giả, giới thiệu, bìa và chương chưa được cung cấp; có thể nhập từ admin sau, không chặn giai đoạn 2.

Điều kiện chuyển giai đoạn: ba màn hình đã xác định, không thêm chức năng ngoài phạm vi.

### Giai đoạn 2 — Dựng ứng dụng và dữ liệu (00:30–01:30)

Thực hiện theo thứ tự:

1. [x] Kiểm tra Node/package manager; tạo ứng dụng Next.js + TypeScript + Tailwind ngay trong repository, giữ nguyên `AGENTS.md`, `PLAN.md` và lịch sử Git.
2. [x] Liên kết dự án Vercel; theo lựa chọn mới của người dùng, tạo project Supabase riêng trong organization của họ và Blob thật. Không tạo Neon hoặc đăng ký gói trả phí.
3. [x] Cấu hình biến môi trường local/preview/production phù hợp; chỉ theo dõi `.env.example` chứa tên biến và giá trị mẫu không bí mật.
4. [x] Tạo migration cho ba bảng nghiệp vụ. Chương và đánh giá tham chiếu truyện; thứ tự chương là duy nhất trong truyện; số sao giới hạn 1–5.
5. [x] Bảo đảm ứng dụng chỉ quản lý một bản ghi truyện, dùng thao tác khởi tạo có thể chạy lại mà không tạo truyện trùng hoặc ghi đè nội dung đã nhập.
6. [x] Tạo lớp truy cập database ở server và cơ chế phiên admin bằng thư viện/API phù hợp; không để secret hoặc database client vào mã trình duyệt.
7. [x] Chuẩn bị lưu giới hạn tần suất thử mật khẩu/gửi đánh giá bằng bảng kỹ thuật `rate_limits` trong từng schema; vẫn chỉ có ba bảng nghiệp vụ.
8. [x] Chạy ứng dụng và kiểm tra đọc/ghi database; deploy preview để xác nhận môi trường Vercel kết nối được.

Đầu ra: ứng dụng khởi động được, database và lưu trữ thật đã sẵn sàng, có hướng dẫn thiết lập local.

Đã hoàn thành: xem `README.md` và `docs/STAGE_2_REPORT.md`. Preview: https://novel-platform-hirbix45q-nguyenlionel.vercel.app. Development/Preview dùng `novel_preview`, Production dùng `novel_production`, role và secret riêng; không dùng project Supabase Writing. Giai đoạn 2 chỉ có trang nền tảng và health API, chưa có tính năng admin/đọc/đánh giá.

Điều kiện chuyển giai đoạn: dữ liệu thử đọc/ghi được và không có secret trong file Git theo dõi. Nếu thiếu quyền dịch vụ, ghi rõ bước bị chặn; không tuyên bố đã tích hợp bằng dữ liệu giả.

### Giai đoạn 3 — Admin đăng truyện và chương (01:30–03:30)

Thực hiện theo thứ tự:

1. [x] Làm màn hình nhập mật khẩu, tạo phiên và đăng xuất; kiểm tra phiên server cho toàn bộ đường ghi/quản lý, giới hạn thử sai và bảo vệ origin/CSRF.
2. [x] Làm form tên truyện, tác giả, giới thiệu và trạng thái; thêm upload bìa có kiểm tra quyền, định dạng và kích thước.
3. [x] Hiển thị danh sách chương theo thứ tự; có nút thêm chương và mở chương để sửa.
4. [x] Làm form thứ tự, tiêu đề và nội dung nhiều dòng; giữ đoạn văn, kiểm tra thiếu nội dung và thứ tự trùng.
5. [x] Nối thao tác Lưu nháp, Đăng chương, Lưu cập nhật và Gỡ về nháp với database. Không tạo hệ thống phiên bản riêng.
6. [x] Thêm xóa chương có xác nhận; hiển thị trạng thái đang lưu, thành công/thất bại và cảnh báo khi rời trang chưa lưu.
7. [x] Làm danh sách đánh giá và thao tác ẩn; đã kiểm thử bằng đánh giá tạm và xóa đúng fixture sau thử, nối phần công khai ở giai đoạn 5.
8. [x] Kiểm tra khách gọi trực tiếp đường ghi không được phép; tạo hai chương thử để kiểm tra lưu, sửa, trạng thái và thứ tự.

Đầu ra: bạn có thể tự quản lý truyện, bìa và chương từ trình duyệt.

Đã hoàn thành luồng local bằng database/Blob thật, xem `docs/STAGE_3_REPORT.md`. Trang đọc và mục lục công khai chưa triển khai; kiểm tra cache/đọc hai chương được thực hiện tiếp ở giai đoạn 4.

Điều kiện chuyển giai đoạn: thao tác admin lưu dữ liệu thật; đăng/gỡ có hiệu lực; người không có phiên không thể ghi hoặc upload.

### Giai đoạn 4 — Trang truyện và trang đọc (03:30–05:00)

Thực hiện theo thứ tự:

1. [x] Dựng trang chủ từ bản ghi truyện; hiển thị bìa, thông tin, mục lục chỉ gồm chương đã đăng và nút Đọc từ đầu.
2. [x] Làm trang chương bằng ID; truy vấn công khai chỉ lấy chương đã đăng. Chương nháp/không tồn tại trả về trang không tìm thấy, không gửi nội dung xuống trình duyệt.
3. [x] Render văn bản an toàn, giữ đoạn và xuống dòng; thêm chương trước/sau theo thứ tự các chương đã đăng, xử lý đúng chương đầu/cuối.
4. [x] Thêm cỡ chữ và sáng/tối; chỉ lưu lựa chọn giao diện trên trình duyệt.
5. [x] Chặn chọn chữ, copy/cut, kéo văn bản và menu chuột phải trong vùng nội dung chương; giữ các ô nhập và admin hoạt động bình thường.
6. [x] Nối cập nhật/xóa cache khi admin đăng, sửa, gỡ hoặc xóa; kiểm tra cả trang chủ, chương và điều hướng liên quan.
7. [x] Thêm title/description cơ bản, trạng thái chưa có chương và kiểm tra bố cục mobile, bàn phím, phóng to.

Đầu ra: khách có thể mở truyện và đọc liên tục mà không đăng nhập.

Đã hoàn thành: xem `docs/STAGE_4_REPORT.md`. Preview giai đoạn 4: https://novel-platform-b3g0haf1c-nguyenlionel.vercel.app. Giữ Vercel Authentication của môi trường thử; ứng dụng không yêu cầu tài khoản độc giả. Đã kiểm tra hai chương tạm, nháp và cập nhật/gỡ/đăng lại/xóa trên local và HTTPS Preview, rồi dọn đúng dữ liệu thử.

Điều kiện chuyển giai đoạn: đọc được hai chương, điều hướng đúng; URL trực tiếp không lộ nháp; hạn chế copy không làm hỏng việc đọc hoặc nhập liệu.

### Giai đoạn 5 — Đánh giá không tài khoản (05:00–06:00)

Thực hiện theo thứ tự:

1. [x] Đặt form dưới nội dung mỗi chương, dùng chung theo truyện (yêu cầu bổ sung trước giai đoạn 6): tên bắt buộc, số sao 1–5 bắt buộc, nhận xét tùy chọn; không hỏi email hoặc yêu cầu đăng nhập.
2. [x] Kiểm tra tại server: tên sau khi bỏ khoảng trắng 1–50 ký tự, nhận xét tối đa 1.000 ký tự, sao là số nguyên 1–5.
3. [x] Thêm chống gửi dồn dập ở server, giới hạn một lần/phút theo định danh chống spam đã băm, cùng trường honeypot; không thêm CAPTCHA ngoài.
4. [x] Lưu đánh giá vào database; hiển thị tên, sao, nhận xét và ngày gửi; văn bản không được thực thi HTML/script.
5. [x] Hiển thị điểm trung bình và số đánh giá đang hiển thị; khi chưa có đánh giá thì hiển thị trạng thái trống. Tải thêm 10 đánh giá mỗi lượt bằng cursor có microsecond và UUID.
6. [x] Nối thao tác admin ẩn đánh giá; cập nhật danh sách, số lượng và điểm trung bình sau gửi/ẩn.
7. [x] Thử gửi hợp lệ, tên rỗng, sao sai, nhận xét quá dài và gửi liên tục; tải lại để xác nhận dữ liệu còn.
8. [x] Theo yêu cầu bổ sung: sửa font đọc, cho chọn DejaVu Serif/Times New Roman, lưu tuỳ chọn, giữ tiếng Việt và xuống dòng; DejaVu đóng gói cùng web, Times dùng font hệ thống có dự phòng.

Đầu ra: độc giả gửi đánh giá bằng tên, không cần tài khoản; admin xử lý được spam cơ bản.

Đã hoàn thành trên local và HTTPS Preview: https://novel-platform-ja3d0tuto-nguyenlionel.vercel.app. Xem `docs/STAGE_5_REPORT.md`; đã kiểm tra gửi/lưu lại/chặn gửi liên tục/ẩn và điểm, hai font thật trên Edge. Fixture đã dọn theo UUID; không sửa truyện/chương sẵn có.

Điều kiện chuyển giai đoạn: form, danh sách và điểm trung bình đúng; đánh giá đã ẩn không còn xuất hiện hoặc được tính điểm.

### Bổ sung sau giai đoạn 5 — Theo yêu cầu trước giai đoạn 6

- [x] Rà soát font toàn ứng dụng; sửa font tiêu đề chương, đồng bộ hai font ở tên truyện/tiêu đề/nội dung và tăng kích thước tên truyện.
- [x] Gom cỡ chữ/kiểu chữ/nền vào Tuỳ chọn đọc bên phải, thêm giãn dòng và độ rộng khung; lưu lựa chọn tương thích dữ liệu cũ.
- [x] Thêm chuyển chương dưới tiêu đề, giữ điều hướng cuối chương.
- [x] Mục lục kéo ra/vào bên trái, đánh dấu chương hiện tại; mũi tên cuộn xuống cuối nội dung.
- [x] Chuyển đánh giá khỏi home sang mỗi chương, vẫn dùng chung theo truyện; chuyển chương nhận dữ liệu mới sau admin ẩn.
- [x] Admin có nút upload bìa, xem trước/huỷ; kiểm tra upload thật và khôi phục dữ liệu thử.
- [x] Kiểm tra local và HTTPS Preview, mobile/desktop, font thật, thao tác bàn phím; cập nhật AGENTS/UI_SPEC/README và báo cáo.

Xem `docs/READER_REVISION_REPORT.md`. Đây là phần bổ sung được giao, chưa đánh dấu bắt đầu/hoàn thành giai đoạn 6.

### Giai đoạn 6 — Kiểm tra toàn luồng và phát hành (06:00–07:00)

Thực hiện theo thứ tự:

1. [x] Chạy lint/typecheck/build theo các script thực tế; sửa lỗi ảnh hưởng bản phát hành.
2. [x] Kiểm tra trên local/preview: admin đăng hai chương → khách đọc/chuyển chương → gửi đánh giá → admin ẩn đánh giá.
3. [x] Thử phiên hết hạn/sai mật khẩu, URL ghi không có quyền, chương nháp, upload sai định dạng, input không hợp lệ và cache sau khi gỡ chương.
4. [x] Kiểm tra điện thoại bằng Edge viewport/touch giả lập (chưa có thiết bị vật lý): mục lục, chữ, nút chuyển chương, nhấn giữ/copy; xác nhận copy/paste trong form vẫn bình thường.
5. [x] Kiểm tra biến môi trường production và migration; không ghi đè/xóa dữ liệu đã nhập. Dữ liệu test phải tách biệt hoặc dọn đúng các bản ghi test.
6. [x] Deploy production theo ủy quyền của người dùng; kiểm tra lại URL `.vercel.app` thực tế, tài nguyên ảnh, lưu dữ liệu và bảo vệ admin.
7. [x] Ghi lại kết quả, lỗi còn lại và URL deployment. Nếu chưa được triển khai production hoặc còn thiếu quyền, báo chính xác trạng thái.

Đầu ra: bản production có thể sử dụng, hoặc thông tin rõ ràng về bước phát hành còn bị chặn.

Điều kiện chuyển giai đoạn: các luồng cốt lõi chạy đúng, không lộ nháp/quyền admin/secret; chỉ ghi đã phát hành khi deployment thành công và đã mở kiểm tra.

Đã hoàn thành giai đoạn 6: [Production](https://novel-platform-alpha.vercel.app) · [Admin](https://novel-platform-alpha.vercel.app/admin). Có giãn dòng/giãn đoạn riêng và thụt dòng đầu mỗi đoạn theo yêu cầu bổ sung. Xem `docs/STAGE_6_REPORT.md`. Production chưa nhập nội dung thật; không tự sao chép dữ liệu Preview.

### Giai đoạn 7 — Dự phòng và hướng dẫn sử dụng (07:00–08:00)

Thực hiện theo thứ tự:

1. [ ] Ưu tiên sửa lỗi cản trở đăng, đọc, đánh giá; dành tối đa 20 phút kiểm tra bổ sung hạn chế sao chép nếu cần.
2. [ ] Nhập truyện, bìa và chương đầu do chủ website cung cấp; không tự sáng tác nội dung để thay thế bản thật.
3. [ ] Viết hướng dẫn ngắn: vào admin → sửa thông tin → thêm chương → lưu nháp/đăng → sửa/gỡ chương → ẩn đánh giá.
4. [ ] Ghi lệnh chạy local, tên biến môi trường và cách cập nhật/deploy vào README; không ghi giá trị bí mật.
5. [ ] Đánh dấu checklist đã kiểm tra, cập nhật bàn giao và trạng thái Git. Tạo commit theo mốc đã được ủy quyền; không tự push khi chưa có yêu cầu.

Đầu ra: chủ website tự đăng chương được và agent chat sau biết chính xác trạng thái dự án.

Điều kiện hoàn thành: checklist cốt lõi đạt; nếu có phần chưa xong thì ghi cụ thể, không đánh dấu xong chỉ vì đã hết 8 giờ.

## 5. Tiêu chí hoàn thành cuối ngày

- [x] Đúng mật khẩu mới được quản trị; URL/API ghi đều kiểm tra quyền.
- [x] Sửa thông tin truyện, tải bìa và đăng ít nhất hai chương để thử điều hướng.
- [x] Chương nháp không xuất hiện và không đọc được qua URL trực tiếp.
- [x] Đăng/sửa/gỡ chương cập nhật đúng trang chủ và trang đọc, không còn cache cũ sau thao tác thành công.
- [x] Khách đọc trên viewport điện thoại giả lập, chuyển chương và về mục lục được.
- [x] Thử chọn chữ, copy/cut, kéo văn bản và chuột phải trong nội dung chương trên trình duyệt mục tiêu; thao tác copy/paste trong admin và form đánh giá vẫn hoạt động. Đã thử touch giữ bằng CDP; chưa kiểm tra thiết bị vật lý; ghi nhận giới hạn theo trình duyệt, không hứa chặn mọi cách trích xuất.
- [x] Gửi đánh giá với tên và số sao, thêm nhận xét nếu muốn; tải lại vẫn còn dữ liệu.
- [x] Tên/nhận xét quá dài, sao không hợp lệ và gửi dồn dập được xử lý; ẩn đánh giá cập nhật lại điểm trung bình.
- [ ] Nội dung truyện, chương, bìa và đánh giá tồn tại sau deploy lại.
- [x] Production chạy trên URL Vercel; có hướng dẫn ngắn cho admin.

## 6. Để sau khi có nhu cầu

- Nhiều truyện, tìm kiếm, thể loại và bảng xếp hạng.
- Tài khoản độc giả/tác giả, theo dõi, tủ truyện và đồng bộ tiến độ.
- Tự lưu nâng cao, lịch sử phiên bản, nhiều người cùng sửa.
- Import DOCX/EPUB, hẹn giờ đăng, email, thanh toán, VIP và AI.

## 7. Tài liệu triển khai

- [Next.js trên Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Kết nối PostgreSQL Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Vercel Blob](https://vercel.com/docs/vercel-blob)

## 8. Bàn giao giữa các chat

- Hiện tại: **hoàn thành giai đoạn 1–6**, gồm sửa đoạn văn theo yêu cầu mới. Giai đoạn 7 chưa triển khai. Không coi toàn dự án hoàn tất khi chưa nhập nội dung và nghiệm thu các điểm còn trống.
- Production: https://novel-platform-alpha.vercel.app; admin `/admin`. Deployment `dpl_5Tdx33srftCNAECa8LFdTnGVVmrf`, snapshot https://novel-platform-rbihnqzlx-nguyenlionel.vercel.app, inspect production/READY, build 52 giây, Functions sin1. Alias chính thức công khai không cần Vercel login; URL snapshot/Preview vẫn bảo vệ Vercel. Admin cần mật khẩu Production riêng, không dùng mật khẩu Preview.
- Preview mới: https://novel-platform-qpr93li30-nguyenlionel.vercel.app, deployment `dpl_HZisLMQZuX8VhGT9DnzJJYRaDq1S`, preview/READY, build 49 giây. Các URL Preview cũ giữ mã cũ; dùng URL này để kiểm tra đoạn văn mới.
- Định dạng mới: `src/lib/reader/paragraphs.ts` tách LF/CRLF/CR thành đoạn p; bỏ đoạn rỗng, trim dấu cách đầu/cuối để tránh thụt hai lần; giữ nguyên nội dung database. Dòng đầu mỗi đoạn 2em, dòng tự xuống không thụt. Giãn dòng và giãn đoạn riêng (0,5/0,8/1,2/1,6em thêm giữa đoạn), mặc định 0,8. Field mới `paragraphGap` tại `novel-reading-v1`; dữ liệu cũ dùng mặc định mà giữ lựa chọn khác. Admin đã có hướng dẫn Enter.
- Giữ toàn bộ phần trước: font DejaVu toàn app, Times hệ thống có fallback; tên truyện lớn, H1 cùng font nội dung; mục lục panel trái, tuỳ chọn phải, xuống cuối, chuyển chương đầu/cuối; đánh giá chung theo truyện dưới từng chương, home không có; upload/xem trước/huỷ bìa. Reader key theo chapter.id để chuyển chương nhận dữ liệu mới. Xem `docs/UI_SPEC.md`, `docs/READER_REVISION_REPORT.md` và báo cáo giai đoạn 2–5 để biết lịch sử.
- Kiểm tra giai đoạn 6: lint/typecheck/build qua, 9/9 unit; admin E2E 28,6 giây, reader 18,9 giây, review 20,1 giây. Qua phép đo đoạn/thụt dòng trên nhiều dòng tự xuống, giãn dòng/đoạn độc lập, storage/reload/chuyển chương, signed session hết hạn/hash cũ/hỏng, reauth, draft404, CSRF, upload giả, XSS, 429, phân trang và cache sau gỡ chương. React checklist đã rà soát.
- HTTPS **cả Preview và Production** đã qua luồng thật: admin UI → upload PNG/asset → đăng hai chương và nháp xen giữa → đọc/chuyển chương → font thật/NFD/đoạn/indent/mobile/touch/TOC/copy → khách gửi review → reload/chuyển chương → 429 → admin ẩn/điểm → sửa/gỡ chương. Fixture dọn và metadata khôi phục. Browser cuối sau dọn: Production trống hiển thị đúng, health200, admin API401, quét 18 HTML/JS không có secret/lỗi client. Một lượt Node HTTP timeout/treo đã dừng đúng PID; browser Edge đối chiếu qua, Vercel runtime/error và requests5xx không có bản ghi lỗi. Xem `docs/STAGE_6_REPORT.md`.
- Dữ liệu cuối đã kiểm tra: Preview **1 chương / 1 đánh giá thật**, Production **0 chương / 0 đánh giá** và chưa có tên truyện; không còn fixture E2E ở hai schema. **Không sao chép Preview sang Production** khi chưa được giao. Nội dung thật nhập ở giai đoạn 7 hoặc yêu cầu tiếp theo. Không dùng số liệu rỗng từ báo cáo cũ để xoá dữ liệu hiện có.
- Hạ tầng: Supabase project riêng `novel-platform`, ref `fbtpriygrhtalsblzbhh`, org `nguyenlionelv's Org`, Singapore; không chạm Writing. Development/Preview schema `novel_preview`, Production `novel_production`; role riêng, TLS CA verified, 8 bảng RLS, cả hai không có quyền schema kia và DELETE reviews. Migration foundation đã đồng bộ, không có DDL mới. Security advisors không cảnh báo, npm audit --omit=dev 0 vulnerabilities; full dev audit chưa chạy lại.
- Quy tắc DB: chỉ dùng `withDb`, giữ kết nối và await tuần tự trong mỗi callback, không pipeline trên cùng handle; không `max_pipeline:0`. API no-store, home/reader dynamic, React cache chỉ theo request. Cursor review giữ microsecond+UUID và bind timestamp qua text::timestamptz. Không cấp DELETE reviews cho app: test ẩn fixture, quản trị cloud xoá đúng UUID manifest.
- Secrets: `.env.local` và `.local/` bị ignore ở Git/deployment; mật khẩu tại `.local/admin-access.txt`, hai môi trường khác nhau; không in giá trị. CA là certificate công khai. Các manifest stage6 đã dọn review theo UUID; file gốc còn URL/ID để tra cứu, không có dữ liệu test còn trong DB.
- Local: dev cổng 3100 đã dùng; kiểm tra listener trước khi khởi động mới. Dev/build Webpack trực tiếp bằng Node 22, **không build Docker**. CLI 64.5.0 dùng cache `.local/npm-cache`. Git local main, chưa có remote; tạo commit mốc giai đoạn 6, không tự push.
- Bước tiếp: khi được giao giai đoạn 7, ưu tiên hướng dẫn/chèn nội dung và bìa do chủ web cung cấp; vẫn giữ phạm vi một truyện, không thêm tài khoản/dịch vụ. Chưa thử iPhone/Android vật lý; Times thiếu thì fallback; hạn chế copy không tuyệt đối. Checklist độ bền dữ liệu qua deploy lại còn mở cho nghiệm thu cuối, không bịa là đã thử toàn bộ loại dữ liệu qua redeploy Production.
