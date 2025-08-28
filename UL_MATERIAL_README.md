# UL Material Management

## Tổng quan
Trang UL Material Management cung cấp giao diện để quản lý thông tin vật liệu UL theo format yêu cầu từ ảnh mẫu.

## Tính năng chính

### 1. Hiển thị dữ liệu
- Bảng hiển thị đầy đủ 26 cột thông tin vật liệu UL
- Mỗi cột có tiêu đề tiếng Việt và tiếng Nhật
- Phân trang với các tùy chọn: 20, 50, 100 bản ghi/trang
- Sắp xếp theo ID giảm dần

### 2. Tìm kiếm và lọc
- Tìm kiếm theo nhà cung cấp
- Tìm kiếm theo tên vật liệu
- Tìm kiếm theo tên khách hàng
- Bộ lọc dropdown cho cột nhà cung cấp

### 3. Thao tác CRUD
- **Thêm mới**: Modal form với đầy đủ các trường
- **Chỉnh sửa**: Modal form pre-filled với dữ liệu hiện tại
- **Xóa**: Soft delete với xác nhận
- **Xuất Excel**: Tải xuống file Excel với tất cả dữ liệu

### 4. Giao diện đặc biệt
- Header với gradient màu theo nhóm cột
- Vật liệu đặc biệt (車載スタックピア) hiển thị với nền đỏ
- Các cột ngày tháng có màu sắc theo trạng thái (đỏ, vàng, xanh)
- Responsive design cho mobile và tablet

## Cấu trúc cột

### Nhóm 1: Thông tin cơ bản (Màu cam)
- Nhà cung cấp (メーカー)
- Nhà máy sản xuất (製造工場 / 生産地)
- Tên vật liệu (材料名 / 型番)
- PP tương ứng
- Loại vật liệu (材料種類)
- Cấu trúc (層構成)
- Cấu tạo lớp
- Mức độ tin cậy (信頼性)

### Nhóm 2: Thông tin khách hàng (Màu xanh dương)
- Mã hàng (品番)
- Tên khách hàng (顧客)
- Bộ phận (部門)
- Người phụ trách (担当者)
- Ngày bắt đầu (開始日)

### Nhóm 3: Thông tin thời gian (Màu cam nhạt)
- Kì hạn dự kiến gửi báo cáo tới PD5
- Ngày bắt đầu tổng hợp báo cáo
- Ngày gửi tổng Thực tế
- Kì hạn (期間)

### Nhóm 4: Thông tin sản xuất (Màu xanh lá)
- Ngày hàng loạt (量産投入)
- Sản lượng hàng loạt (量産量)
- Chứng nhận ở nhà máy khác (他の工場で認証)
- Nhà máy đã chứng nhận
- Cấp độ ở nhà máy khác
- Yêu cầu báo cáo đánh giá
- Ngày CN (認定日)

### Nhóm 5: Ghi chú (Màu xanh lá)
- Ghi chú (備考)

## Cách sử dụng

### 1. Truy cập trang
- Đăng nhập vào hệ thống
- Chọn "Material" từ menu bên trái
- Chọn "UL Material"

### 2. Thêm mới vật liệu
- Click nút "Thêm mới"
- Điền đầy đủ thông tin trong form
- Click "Thêm mới" để lưu

### 3. Chỉnh sửa vật liệu
- Click nút "Chỉnh sửa" (biểu tượng bút) trong cột "Thao tác"
- Chỉnh sửa thông tin cần thiết
- Click "Cập nhật" để lưu

### 4. Xóa vật liệu
- Click nút "Xóa" (biểu tượng thùng rác) trong cột "Thao tác"
- Xác nhận xóa trong popup

### 5. Xuất Excel
- Click nút "Xuất Excel"
- File sẽ được tải xuống tự động

### 6. Tìm kiếm
- Sử dụng các ô tìm kiếm ở trên bảng
- Click "Làm mới tìm kiếm" để reset

## API Endpoints

### Backend
- `GET /api/ul/list-ul` - Lấy danh sách vật liệu UL
- `POST /api/ul/create-ul` - Tạo mới vật liệu UL
- `PUT /api/ul/update-ul/:id` - Cập nhật vật liệu UL
- `DELETE /api/ul/delete-ul/:id` - Xóa vật liệu UL
- `GET /api/ul/export-ul` - Xuất Excel

### Frontend
- `src/utils/ul-material-api.js` - Các function gọi API
- `src/pages/UlMaterial.js` - Trang chính
- `src/components/modal/CreateUlMaterialModal.js` - Modal form
- `src/pages/UlMaterial.css` - Styling

## Cấu trúc database

Bảng `ul_material` bao gồm các cột:
- `id`: Khóa chính
- `supplier`: Nhà cung cấp
- `manufaturing`: Nhà máy sản xuất
- `material_name`: Tên vật liệu
- `pp`: PP tương ứng
- `type`: Loại vật liệu
- `structure`: Cấu trúc
- `layer`: Cấu tạo lớp
- `level_no`: Mức độ tin cậy
- `product_code`: Mã hàng
- `customer_name`: Tên khách hàng
- `department`: Bộ phận
- `handler`: Người phụ trách
- `start_date`: Ngày bắt đầu
- `proposed_deadline`: Kì hạn dự kiến
- `summary_day`: Ngày tổng hợp báo cáo
- `real_date`: Ngày gửi thực tế
- `deadline`: Kì hạn
- `mass_day`: Ngày hàng loạt
- `mass_product`: Sản lượng hàng loạt
- `confirm`: Chứng nhận ở nhà máy khác
- `confirm_name`: Nhà máy đã chứng nhận
- `other_level`: Cấp độ ở nhà máy khác
- `request_report`: Yêu cầu báo cáo đánh giá
- `certification_date`: Ngày chứng nhận
- `note`: Ghi chú
- `created_at`: Ngày tạo
- `updated_at`: Ngày cập nhật
- `is_deleted`: Trạng thái xóa

## Lưu ý

1. **Xác thực**: Tất cả API đều yêu cầu JWT token
2. **Soft Delete**: Xóa vật liệu chỉ đánh dấu `is_deleted = 1`
3. **Validation**: Form có validation cho các trường bắt buộc
4. **Responsive**: Giao diện tương thích với mobile và tablet
5. **Performance**: Sử dụng phân trang để tối ưu hiệu suất

## Troubleshooting

### Lỗi thường gặp
1. **Không hiển thị dữ liệu**: Kiểm tra kết nối database và quyền truy cập
2. **Lỗi khi thêm/sửa**: Kiểm tra validation và định dạng dữ liệu
3. **Lỗi xuất Excel**: Kiểm tra quyền ghi file và dung lượng ổ cứng

### Hỗ trợ
- Kiểm tra console browser để xem lỗi JavaScript
- Kiểm tra log server để xem lỗi backend
- Đảm bảo tất cả dependencies đã được cài đặt
