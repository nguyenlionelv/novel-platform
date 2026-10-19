# Giai đoạn 5 — Đánh giá không tài khoản và sửa font đọc

Ngày kiểm tra: 19/10/2026. Hoàn thành local và Preview; chưa phát hành Production. Không Docker, không thêm dependency, dịch vụ hoặc migration.

## Đánh giá

- Form dưới mục lục: tên 1–50 ký tự sau trim, radio 1–5 sao không chọn sẵn, nhận xét tuỳ chọn tối đa 1.000 ký tự. Không hỏi email, không tài khoản. Các ô vẫn chọn/copy/paste bình thường.
- API validate tại server, body tối đa 16 KB, kiểm tra origin và honeypot. Bảng rate limit có sẵn giới hạn một lần/phút theo HMAC định danh; không lưu IP thô. Chỉ tin X-Forwarded-For do Vercel ghi đè khi chạy trên Vercel; local dùng chung bucket. Kiểm tra hai request đồng thời cho đúng một 201 và một 429, giả header IP local không vượt được giới hạn.
- Gửi lỗi giữ form; thành công cập nhật danh sách/điểm. Nếu đã lưu nhưng tải lại danh sách lỗi, thông báo rõ đã gửi, tránh báo gửi thất bại. Reload vẫn thấy bản ghi. Text được React escape, `<script>` không thực thi.
- API/HTML chỉ lấy `is_hidden = false`. Điểm trung bình và số lượng chỉ tính review hiển thị; không có review thì ghi Chưa có đánh giá, không dựng điểm 0/5. Admin ẩn có hiệu lực lên danh sách và điểm ở lượt tải kế tiếp.
- Tải 10 mỗi lượt, mới nhất trước; cursor gồm thời gian đầy đủ microsecond và UUID. Đã sửa lỗi driver Postgres.js tự chuyển tham số timestamptz qua Date (chỉ còn millisecond): bind qua `text::timestamptz` để không bỏ sót các review cùng thời điểm. Query vẫn tham số hóa và qua `withDb`.

Mã chính: `src/components/reviews/reviews.tsx`, `src/app/api/reviews/route.ts`, `src/lib/db/reviews.ts`, `src/lib/reviews/`, `src/lib/security/request-identifier.ts`. Trang chủ lấy dữ liệu thật; admin tiếp tục dùng thao tác ẩn có sẵn.

## Font đọc

- Thay Georgia mặc định bằng **DejaVu Serif**, thêm select **DejaVu Serif / Times New Roman**, chữ thường 400 và không tự tổng hợp đậm/nghiêng. Lựa chọn lưu cùng cỡ chữ/nền trong `novel-reading-v1`, tương thích dữ liệu cũ thiếu trường font.
- DejaVu Serif Book 2.37 là TTF gốc từ [release chính thức](https://github.com/dejavu-fonts/dejavu-fonts/releases/tag/version_2_37), tải bằng `next/font/local`. Đã đối chiếu SHA256 archive, kiểm tra cmap không thiếu các ký tự tiếng Việt. Giấy phép trong repo và `/fonts/DejaVu-LICENSE.txt`; chi tiết ở `src/assets/fonts/README.md`.
- Times New Roman dùng font cài trên thiết bị; thiếu sẽ dự phòng DejaVu, giao diện có thông báo. Không lấy tệp Windows để phát lại trên web; [hướng dẫn Microsoft](https://learn.microsoft.com/en-us/typography/fonts/font-faq) phân biệt sử dụng font trên máy với phân phối webfont.
- Kiểm thử CDP lấy font thực sự render trong article, xác nhận DejaVu Serif và Times New Roman trên Edge/Windows. Mẫu tiếng Việt gồm cả dấu tổ hợp NFD và kiểm tra DejaVu không phải fallback giả. Đã xem ảnh hai font desktop/local và mobile/Preview; chọn font giữ sau reload/chuyển chương, không thay nội dung gốc. Admin và hạn chế copy vẫn đúng phạm vi.

## Kiểm tra

| Kiểm tra | Kết quả |
| --- | --- |
| Lint, typecheck, build | Qua bằng Next.js/Webpack/Node.js |
| Unit | 8/8 qua, gồm dữ liệu review, cursor, tuỳ chọn font mới và dữ liệu cũ |
| E2E admin | Qua, 24,8 giây |
| E2E reader/font | Qua; lần cuối có dấu tổ hợp NFD 30,2 giây tổng lệnh |
| E2E đánh giá | Qua sau sửa cursor, 13,3 giây tổng lệnh |
| Supabase security advisors | Không cảnh báo |
| Mobile | Đã xem form review và hai font trên viewport 390 px, không tràn ngang hoặc lỗi JS |

E2E đánh giá thử origin sai/thiếu, body quá lớn, tên rỗng/dài, sai kiểu/số sao, nhận xét dài, honeypot, lỗi kết nối giữ form, gửi thật/reload, HTML an toàn, 429 giữ form, request đồng thời, không tin IP giả ở local, admin ẩn và tính lại điểm, phân trang các dòng cùng thời điểm, không lặp UUID. Lượt chạy đầu có 2 kịch bản admin/reader qua và review bắt được lỗi cursor; đã sửa rồi chạy lại review qua. Không ghi lượt chạy lỗi đó thành một lượt 3/3 qua.

Đánh giá fixture được ghi UUID vào `.local/stage5-review-fixtures.json`; `finally` ẩn các bản ghi thử, khôi phục rate limit local, rồi dọn đúng UUID bằng quyền quản trị cloud vì role ứng dụng không có DELETE reviews. Đã xóa cả fixture của lượt lỗi và lượt qua. Preview hiện giữ nguyên 1 chương có sẵn, 0 đánh giá; Production 0 chương/0 đánh giá. Không sửa chương hoặc đánh giá thật. Ảnh và manifest ở `.local/`, không commit/deploy; không bật trace chứa mật khẩu.

## Preview HTTPS

[Mở truyện](https://novel-platform-ja3d0tuto-nguyenlionel.vercel.app) · [Admin](https://novel-platform-ja3d0tuto-nguyenlionel.vercel.app/admin).

Deployment `dpl_2jtKGJsokApSizM6H9zCCjUZEMAE`: inspect xác nhận target `preview`, `READY`, build 38 giây, Functions `sin1`. Giữ Vercel Authentication.

Đã kiểm tra trên Edge mobile HTTPS: gửi đánh giá khi không có phiên admin → hiển thị/tải lại → gửi tiếp 429 → admin ẩn → số lượng/điểm về giá trị trước thử, review không còn trong HTML/API. Font DejaVu tải từ deployment, Times New Roman render đúng font hệ thống, lựa chọn giữ qua reload; không tràn hoặc lỗi JS. Token OIDC tạm chỉ gửi tới đúng origin của deployment, không in token/cookie/mật khẩu. Review cloud tạm đã được ẩn rồi xóa đúng UUID; bucket giới hạn gửi cloud tự hết cửa sổ một phút theo cơ chế ứng dụng.

## Tiếp theo

Giai đoạn 6: nghiệm thu tổng thể và phát hành theo ủy quyền. Chưa tự deploy Production. Các giới hạn cũ về advisory dependency lint và sao chép nội dung giữ như báo cáo trước; không chạy lại audit hoặc tự ép nâng/hạ framework trong giai đoạn này.
