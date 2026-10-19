# Kế hoạch 1 ngày: website đọc một tiểu thuyết

Cập nhật: 19/10/2026. Kế hoạch này thay thế hoàn toàn phạm vi trước.

## 1. Phạm vi đã chốt

- Website có đúng một truyện; trang chủ chính là trang giới thiệu truyện đó.
- Có trang đọc từng chương và trang admin để chủ website đăng/sửa nội dung.
- Độc giả không cần tài khoản để đọc hoặc gửi đánh giá.
- Đánh giá: tên hiển thị, số sao 1–5 và lời nhận xét tùy chọn; hiển thị dưới mục lục ở trang truyện.
- Admin dùng một mật khẩu riêng; không có đăng ký hay hệ thống tài khoản người dùng.
- Khi có thêm truyện mới mới mở rộng giao diện và chức năng.
- Nội dung chương có biện pháp hạn chế sao chép thông thường; không cam kết chống sao chép tuyệt đối trên trình duyệt.

## 2. Màn hình cần làm

### Trang chủ `/`

- Ảnh bìa, tên truyện, tác giả, giới thiệu và trạng thái đang viết/hoàn thành.
- Nút Đọc từ đầu và danh sách chương đã đăng.
- Bên dưới là điểm trung bình, danh sách đánh giá và form gửi đánh giá.
- Giao diện gọn, ưu tiên điện thoại.

### Trang đọc `/chuong/[id]`

- Tên truyện, số chương, tiêu đề và nội dung chương.
- Nút chương trước, chương sau và trở lại mục lục.
- Điều chỉnh cỡ chữ và nền sáng/tối; lưu lựa chọn trên trình duyệt.
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
- Neon PostgreSQL để lưu truyện, chương và đánh giá.
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
| 2. Dựng nền tảng | 1 giờ | Tạo Next.js; liên kết Vercel; tạo Neon và Blob; cấu hình biến môi trường; tạo ba bảng và một bản ghi truyện | Preview chạy và kết nối dữ liệu thật |
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

1. [ ] Kiểm tra workspace và tài liệu; xác định tên truyện, tác giả, giới thiệu, bìa và nội dung đã có. Nếu thiếu, ghi rõ để nhập sau, không bịa nội dung thật.
2. [ ] Chọn một phong cách gọn: nền sáng, chữ dễ đọc, một màu nhấn; trang đọc có sáng/tối.
3. [ ] Chốt trang chủ: bìa/thông tin → nút đọc → mục lục → đánh giá.
4. [ ] Chốt trang đọc: tiêu đề → nội dung → chương trước/sau và mục lục.
5. [ ] Chốt admin: thông tin truyện, danh sách chương, form sửa chương, danh sách đánh giá; dùng các khu vực đơn giản trong cùng trang nếu phù hợp.

Đầu ra: bố cục và trường dữ liệu đủ rõ để code; không cần Figma hay nhiều vòng thiết kế.

Điều kiện chuyển giai đoạn: ba màn hình đã xác định, không thêm chức năng ngoài phạm vi.

### Giai đoạn 2 — Dựng ứng dụng và dữ liệu (00:30–01:30)

Thực hiện theo thứ tự:

1. [ ] Kiểm tra Node/package manager; tạo ứng dụng Next.js + TypeScript + Tailwind ngay trong repository, giữ nguyên `AGENTS.md`, `PLAN.md` và lịch sử Git.
2. [ ] Liên kết dự án Vercel, tạo/kết nối Neon và Blob bằng tích hợp thật. Xử lý quyền truy cập theo ủy quyền hiện có; không tự đăng ký gói trả phí.
3. [ ] Cấu hình biến môi trường local/preview/production phù hợp; chỉ commit `.env.example` chứa tên biến và giá trị mẫu không bí mật.
4. [ ] Tạo migration cho ba bảng nghiệp vụ. Chương và đánh giá tham chiếu truyện; thứ tự chương là duy nhất trong truyện; số sao giới hạn 1–5.
5. [ ] Bảo đảm ứng dụng chỉ quản lý một bản ghi truyện, dùng thao tác khởi tạo có thể chạy lại mà không tạo truyện trùng hoặc ghi đè nội dung đã nhập.
6. [ ] Tạo lớp truy cập database ở server và cơ chế phiên admin bằng thư viện/API phù hợp; không để secret hoặc database client vào mã trình duyệt.
7. [ ] Chuẩn bị lưu giới hạn tần suất thử mật khẩu/gửi đánh giá bằng database hiện tại. Nếu cần bảng kỹ thuật nhỏ thì ghi rõ; vẫn chỉ có ba bảng nghiệp vụ.
8. [ ] Chạy ứng dụng và kiểm tra đọc/ghi database; deploy preview để xác nhận môi trường Vercel kết nối được.

Đầu ra: ứng dụng khởi động được, database và lưu trữ thật đã sẵn sàng, có hướng dẫn thiết lập local.

Điều kiện chuyển giai đoạn: dữ liệu thử đọc/ghi được và không có secret trong file Git theo dõi. Nếu thiếu quyền dịch vụ, ghi rõ bước bị chặn; không tuyên bố đã tích hợp bằng dữ liệu giả.

### Giai đoạn 3 — Admin đăng truyện và chương (01:30–03:30)

Thực hiện theo thứ tự:

1. [ ] Làm màn hình nhập mật khẩu, tạo phiên và đăng xuất; kiểm tra phiên server cho toàn bộ đường ghi/quản lý, giới hạn thử sai và bảo vệ origin/CSRF.
2. [ ] Làm form tên truyện, tác giả, giới thiệu và trạng thái; thêm upload bìa có kiểm tra quyền, định dạng và kích thước.
3. [ ] Hiển thị danh sách chương theo thứ tự; có nút thêm chương và mở chương để sửa.
4. [ ] Làm form thứ tự, tiêu đề và nội dung nhiều dòng; giữ đoạn văn, kiểm tra thiếu nội dung và thứ tự trùng.
5. [ ] Nối thao tác Lưu nháp, Đăng chương, Lưu cập nhật và Gỡ về nháp với database. Không tạo hệ thống phiên bản riêng.
6. [ ] Thêm xóa chương có xác nhận; hiển thị trạng thái đang lưu, thành công/thất bại và cảnh báo khi rời trang chưa lưu.
7. [ ] Làm danh sách đánh giá và thao tác ẩn; ở bước này danh sách có thể chưa có dữ liệu, nối thử lại sau giai đoạn 5.
8. [ ] Kiểm tra khách gọi trực tiếp đường ghi không được phép; tạo hai chương thử để kiểm tra lưu, sửa, trạng thái và thứ tự.

Đầu ra: bạn có thể tự quản lý truyện, bìa và chương từ trình duyệt.

Điều kiện chuyển giai đoạn: thao tác admin lưu dữ liệu thật; đăng/gỡ có hiệu lực; người không có phiên không thể ghi hoặc upload.

### Giai đoạn 4 — Trang truyện và trang đọc (03:30–05:00)

Thực hiện theo thứ tự:

1. [ ] Dựng trang chủ từ bản ghi truyện; hiển thị bìa, thông tin, mục lục chỉ gồm chương đã đăng và nút Đọc từ đầu.
2. [ ] Làm trang chương bằng ID; truy vấn công khai chỉ lấy chương đã đăng. Chương nháp/không tồn tại trả về trang không tìm thấy, không gửi nội dung xuống trình duyệt.
3. [ ] Render văn bản an toàn, giữ đoạn và xuống dòng; thêm chương trước/sau theo thứ tự các chương đã đăng, xử lý đúng chương đầu/cuối.
4. [ ] Thêm cỡ chữ và sáng/tối; chỉ lưu lựa chọn giao diện trên trình duyệt.
5. [ ] Chặn chọn chữ, copy/cut, kéo văn bản và menu chuột phải trong vùng nội dung chương; giữ các ô nhập và admin hoạt động bình thường.
6. [ ] Nối cập nhật/xóa cache khi admin đăng, sửa, gỡ hoặc xóa; kiểm tra cả trang chủ, chương và điều hướng liên quan.
7. [ ] Thêm title/description cơ bản, trạng thái chưa có chương và kiểm tra bố cục mobile, bàn phím, phóng to.

Đầu ra: khách có thể mở truyện và đọc liên tục mà không đăng nhập.

Điều kiện chuyển giai đoạn: đọc được hai chương, điều hướng đúng; URL trực tiếp không lộ nháp; hạn chế copy không làm hỏng việc đọc hoặc nhập liệu.

### Giai đoạn 5 — Đánh giá không tài khoản (05:00–06:00)

Thực hiện theo thứ tự:

1. [ ] Đặt form dưới mục lục: tên bắt buộc, số sao 1–5 bắt buộc, nhận xét tùy chọn; không hỏi email hoặc yêu cầu đăng nhập.
2. [ ] Kiểm tra tại server: tên sau khi bỏ khoảng trắng 1–50 ký tự, nhận xét tối đa 1.000 ký tự, sao là số nguyên 1–5.
3. [ ] Thêm chống gửi dồn dập ở server, ví dụ giới hạn một lần/phút theo định danh chống spam đã băm, cùng trường honeypot; không thêm CAPTCHA ngoài khi chưa có nhu cầu.
4. [ ] Lưu đánh giá vào database; hiển thị tên, sao, nhận xét và ngày gửi; văn bản không được thực thi HTML/script.
5. [ ] Hiển thị điểm trung bình và số đánh giá đang hiển thị; khi chưa có đánh giá thì hiển thị trạng thái trống. Dùng tải thêm/phân trang khi danh sách dài.
6. [ ] Nối thao tác admin ẩn đánh giá; cập nhật danh sách, số lượng và điểm trung bình sau gửi/ẩn.
7. [ ] Thử gửi hợp lệ, tên rỗng, sao sai, nhận xét quá dài và gửi liên tục; tải lại để xác nhận dữ liệu còn.

Đầu ra: độc giả gửi đánh giá bằng tên, không cần tài khoản; admin xử lý được spam cơ bản.

Điều kiện chuyển giai đoạn: form, danh sách và điểm trung bình đúng; đánh giá đã ẩn không còn xuất hiện hoặc được tính điểm.

### Giai đoạn 6 — Kiểm tra toàn luồng và phát hành (06:00–07:00)

Thực hiện theo thứ tự:

1. [ ] Chạy lint/typecheck/build theo các script thực tế; sửa lỗi ảnh hưởng bản phát hành.
2. [ ] Kiểm tra trên local/preview: admin đăng hai chương → khách đọc/chuyển chương → gửi đánh giá → admin ẩn đánh giá.
3. [ ] Thử phiên hết hạn/sai mật khẩu, URL ghi không có quyền, chương nháp, upload sai định dạng, input không hợp lệ và cache sau khi gỡ chương.
4. [ ] Kiểm tra điện thoại: mục lục, chữ, nút chuyển chương, nhấn giữ/copy; xác nhận copy/paste trong form vẫn bình thường.
5. [ ] Kiểm tra biến môi trường production và migration; không ghi đè/xóa dữ liệu đã nhập. Dữ liệu test phải tách biệt hoặc dọn đúng các bản ghi test.
6. [ ] Deploy production theo ủy quyền của người dùng; kiểm tra lại URL `.vercel.app` thực tế, tài nguyên ảnh, lưu dữ liệu và bảo vệ admin.
7. [ ] Ghi lại kết quả, lỗi còn lại và URL deployment. Nếu chưa được triển khai production hoặc còn thiếu quyền, báo chính xác trạng thái.

Đầu ra: bản production có thể sử dụng, hoặc thông tin rõ ràng về bước phát hành còn bị chặn.

Điều kiện chuyển giai đoạn: các luồng cốt lõi chạy đúng, không lộ nháp/quyền admin/secret; chỉ ghi đã phát hành khi deployment thành công và đã mở kiểm tra.

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

- [ ] Đúng mật khẩu mới được quản trị; URL/API ghi đều kiểm tra quyền.
- [ ] Sửa thông tin truyện, tải bìa và đăng ít nhất hai chương để thử điều hướng.
- [ ] Chương nháp không xuất hiện và không đọc được qua URL trực tiếp.
- [ ] Đăng/sửa/gỡ chương cập nhật đúng trang chủ và trang đọc, không còn cache cũ sau thao tác thành công.
- [ ] Khách đọc trên điện thoại, chuyển chương và về mục lục được.
- [ ] Thử chọn chữ, copy/cut, kéo văn bản và chuột phải trong nội dung chương trên trình duyệt mục tiêu; thao tác copy/paste trong admin và form đánh giá vẫn hoạt động. Kiểm tra thêm nhấn giữ trên điện thoại; ghi nhận giới hạn theo trình duyệt, không hứa chặn mọi cách trích xuất.
- [ ] Gửi đánh giá với tên và số sao, thêm nhận xét nếu muốn; tải lại vẫn còn dữ liệu.
- [ ] Tên/nhận xét quá dài, sao không hợp lệ và gửi dồn dập được xử lý; ẩn đánh giá cập nhật lại điểm trung bình.
- [ ] Nội dung truyện, chương, bìa và đánh giá tồn tại sau deploy lại.
- [ ] Production chạy trên URL Vercel; có hướng dẫn ngắn cho admin.

## 6. Để sau khi có nhu cầu

- Nhiều truyện, tìm kiếm, thể loại và bảng xếp hạng.
- Tài khoản độc giả/tác giả, theo dõi, tủ truyện và đồng bộ tiến độ.
- Tự lưu nâng cao, lịch sử phiên bản, nhiều người cùng sửa.
- Import DOCX/EPUB, hẹn giờ đăng, email, thanh toán, VIP và AI.

## 7. Tài liệu triển khai

- [Next.js trên Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Neon qua Vercel Marketplace](https://vercel.com/marketplace/neon)
- [Vercel Blob](https://vercel.com/docs/vercel-blob)

## 8. Bàn giao giữa các chat

- Trạng thái: đã khởi tạo Git nhánh `main`, có quy tắc agent và kế hoạch chi tiết; chưa triển khai ứng dụng.
- Đã có: phạm vi một truyện, admin mật khẩu riêng, đọc công khai, đánh giá không tài khoản, hạn chế sao chép thông thường; giai đoạn 0 chuẩn bị và bảy giai đoạn triển khai có bước làm, đầu ra, điều kiện hoàn thành.
- File hiện tại: `PLAN.md`, `AGENTS.md` và `.gitignore`. Repository local, chưa có remote.
- Kiểm tra: đã xác nhận Git khởi tạo tại đúng thư mục; đối chiếu lịch triển khai tổng 8 giờ. Chưa có ứng dụng nên chưa có build hoặc kiểm thử chạy ứng dụng.
- Vướng mắc: chưa phát sinh; nội dung truyện, bìa và quyền truy cập dịch vụ cần được xác định khi triển khai.
- Bước tiếp theo: khi người dùng yêu cầu triển khai, đọc `AGENTS.md`, kiểm tra Git và bắt đầu giai đoạn 1, sau đó giai đoạn 2. Yêu cầu hiện tại là khởi tạo Git và chi tiết hóa kế hoạch, chưa phải lệnh triển khai ứng dụng.
