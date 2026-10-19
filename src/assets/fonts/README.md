# Font đọc truyện

`DejaVuSerif.ttf` là DejaVu Serif Book 2.37, bản gốc không chỉnh sửa từ [release chính thức](https://github.com/dejavu-fonts/dejavu-fonts/releases/tag/version_2_37). Dùng `next/font/local`, chỉ tải khi mở trang đọc; không phụ thuộc font cài trên máy hoặc CDN font ngoài.

- SHA256 archive chính thức: `7576310b219e04159d35ff61dd4a4ec4cdba4f35c00e002a136f00e96a908b0a`.
- SHA256 tệp TTF: `42d1edeb7952f31b1f96d767ed7030b08a39e0c372b0071641518864e2bffb51`.
- Kích thước TTF: 380.132 byte; đã kiểm tra cmap có đủ ký tự tiếng Việt.
- Giấy phép gốc ở `LICENSE`, bản công khai tại `/fonts/DejaVu-LICENSE.txt`. [Điều khoản DejaVu](https://dejavu-fonts.github.io/License.html) cho phép phân phối với thông báo bản quyền đi kèm.

Times New Roman dùng font cài trên thiết bị qua CSS; không đóng gói tệp font Windows vào web. [Microsoft](https://learn.microsoft.com/en-us/typography/fonts/font-faq) phân biệt dùng font hệ thống với phân phối font cho website. Thiết bị thiếu Times New Roman sẽ dùng DejaVu Serif; giao diện nói rõ điều này. Không gắn nhãn Times New Roman cho một font thay thế được tải từ nguồn không rõ.
