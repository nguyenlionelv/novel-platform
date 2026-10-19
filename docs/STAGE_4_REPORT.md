# Giai đoạn 4 — Trang truyện và trang đọc

Ngày kiểm tra: 19/10/2026. Đã hoàn thành triển khai và kiểm thử local/Preview. Không phát hành Production, không build Docker.

## Chức năng

- `/`: bìa hoặc ô bìa trung tính, tên truyện/tác giả, giới thiệu giữ xuống dòng, trạng thái và số chương đã đăng. Đọc từ đầu mở chương có thứ tự nhỏ nhất. Mục lục tăng dần, tải 30 chương mỗi lượt bằng cursor thứ tự; giữ danh sách và cho thử lại khi tải lỗi.
- `/chuong/[id]`: chỉ truy vấn `novel_id = 1 AND status = 'published'`; ID sai, chương nháp và chương đã xóa trả 404 cùng liên kết về mục lục. Metadata nháp dùng nội dung chung, không có tiêu đề/nội dung nháp. API công khai chỉ trả ID, thứ tự, tiêu đề published.
- Trang đọc giữ văn bản và dòng trống bằng `white-space: pre-wrap`, escape HTML bằng React. Chương trước/sau tính từ published, bỏ qua khoảng trống và nháp, không vòng đầu/cuối. Mỗi trang có title/description riêng.
- 4 cỡ chữ 18/20/22/24 px, mặc định 20; nền sáng/tối, lưu lựa chọn tại trình duyệt, giữ khi chuyển chương/tải lại. Dữ liệu lưu lỗi trở về mặc định; nếu trình duyệt chặn ghi, các nút vẫn hoạt động trong trang. Nút chỉ mở khi client đã sẵn sàng tương tác để tránh nhấn quá sớm trước hydration.
- Chặn chọn chữ, copy/cut, kéo văn bản và menu chuột phải trong `article.chapter-content`. Không chặn toàn bộ bàn phím, cuộn hay zoom; nội dung vẫn là text cho trình đọc màn hình. Admin và vùng ngoài chương chọn/copy bình thường. Không thể ngăn tuyệt đối lấy nội dung đã tải, ảnh chụp hoặc OCR.
- Trang chủ/đọc dùng `force-dynamic`; API mục lục `no-store`. React `cache()` dùng trong lượt render để metadata/page không truy vấn trùng, không persist dữ liệu qua request. Admin revalidate trang chủ và pattern đọc khi thay chương; cập nhật thông tin truyện cũng revalidate pattern đọc.
- Giữ stack/dependency hiện có; không đổi schema, không thêm dịch vụ. Query mới dùng `withDb` theo quy tắc tránh pipelining Supavisor.

## Kiểm tra đã qua

| Kiểm tra | Bằng chứng |
| --- | --- |
| Lint, typecheck | Qua; chạy lại sau các thay đổi cuối |
| Unit test | 6/6 qua, thêm trường hợp tuỳ chọn đọc sai/không hợp lệ |
| Build local | Qua bằng Next.js/Webpack; có `/api/chapters` và `/chuong/[id]` |
| E2E toàn bộ | Admin + đọc: 2/2 qua, 41,1 giây |
| E2E đọc sau bổ sung | Qua, lần cuối 17,6 giây; thêm retry mục lục, chặn storage và Đọc từ đầu/biên chương đầu |
| Responsive | Đã xem ảnh home desktop/mobile 390 px, đọc mobile nền sáng/tối; không tràn ngang |
| Bàn phím và phóng to | Tab từ article sang điều hướng được; không chặn Ctrl+C toàn trang; reflow qua ở CSS zoom 200% trên viewport 390 px |

Luồng đọc kiểm thử: tạo hai chương published qua API admin theo thứ tự đảo và một nháp ở giữa → mục lục sắp đúng → Đọc từ đầu đúng chương nhỏ nhất → mở chương, giữ xuống dòng và hiển thị `<script>` như text → chương sau bỏ nháp → chương cuối không có đường đi tiếp → về mục lục. Kiểm tra 4 mức chữ, sáng/tối, lưu qua reload/chuyển chương, storage JSON hỏng và từ chối ghi. Kiểm tra các sự kiện copy/cut/contextmenu/dragstart bị chặn trong article và không bị chặn ở H1, CSS chỉ article có `user-select: none`; admin E2E tiếp tục qua thao tác chọn textarea.

Trạng thái chương nháp được kiểm tra trên route thật: HTTP 404; HTML/metadata và API mục lục không chứa marker nháp. Sau cập nhật, đọc thấy nội dung mới; gỡ về nháp rút khỏi trang chủ/API/điều hướng và route trả 404; đăng lại khôi phục điều hướng; xóa trả 404. Phân trang kiểm tra 30 bản ghi đầu rồi thêm đúng phần còn lại, request cursor sai trả 400, cursor cuối trả danh sách rỗng; lỗi tải không làm mất các chương đã hiển thị.

Đã có một chương người dùng đăng sẵn khi bắt đầu thử; không gỡ/xóa hoặc sửa chương đó để giả lập database rỗng. Trạng thái chưa có chương/nút đọc vô hiệu hóa đã có trong mã và được rà soát, nhánh E2E dành cho database rỗng không chạy trong lượt này. Toàn bộ fixture được gắn prefix ngẫu nhiên và xóa trong `finally`; metadata/bìa/thời điểm cập nhật truyện, rate limit được khôi phục. Sau kiểm tra, Preview còn 1 chương sẵn có, Production 0; không còn chương thử của giai đoạn 4. Ảnh chụp ở `.local/`, không commit/deploy; không ghi mật khẩu/token/cookie vào log hoặc trace.

## Preview

- [Mở truyện](https://novel-platform-b3g0haf1c-nguyenlionel.vercel.app) · [Admin](https://novel-platform-b3g0haf1c-nguyenlionel.vercel.app/admin).
- Deployment cuối `dpl_8ouoBA2zyCHEihZU61wmPFnA2tuk`; inspect xác nhận target `preview`, `READY`, build 44 giây, Functions `sin1`. Giữ Vercel Authentication; không thêm `--prod`.
- Kiểm thử HTTPS bằng chương tạm: trang chủ/API chỉ hiển thị published, đọc giữ text an toàn, nháp trả 404 không lộ HTML/metadata, update/gỡ/đăng lại/xóa có hiệu lực trên request kế tiếp, điều hướng đổi theo trạng thái. Đã xóa đúng các chương tạm sau thử; không thay metadata hoặc chương người dùng trong lần thử cloud này.
- Dùng token OIDC tạm qua CLI hiện có; không tắt Deployment Protection hoặc in secret. Trên browser chỉ gửi header tới đúng origin của deployment.
- Kiểm thử HTTP ghi/đọc nói trên chạy trên bản giai đoạn 4 đầu `dpl_7e4KPuKWT5J7rdZbCbfwqFhJYd96` trước bổ sung trạng thái chờ hydration. Bản cuối giữ nguyên query/API; đã kiểm tra lại bằng browser Edge mobile trên HTTPS: mở chương sẵn có, dùng cỡ chữ/nền tối, giữ qua reload, không tràn ngang hoặc lỗi JS. Các nút đọc khóa tới lúc client sẵn sàng để tránh click tự động quá sớm; kiểm thử chờ trạng thái thực tế thay vì thời gian chờ cố định.

## Bước tiếp theo

Giai đoạn 5: form tên/sao/nhận xét không tài khoản, chống gửi dồn dập, danh sách/điểm trung bình và phản ánh việc admin ẩn đánh giá. Chưa có form đánh giá công khai ở giai đoạn này. Chưa chạy lại audit dependency; cảnh báo lint dependency đã ghi trong báo cáo giai đoạn 2 vẫn là giới hạn được biết.
