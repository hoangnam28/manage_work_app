# Dashboard - Tổng quan quản lý công việc

## Tổng quan
Dashboard cung cấp cái nhìn tổng quan nhanh về hệ thống quản lý công việc với các thông tin quan trọng:

## Tính năng chính

### 1. Thống kê tổng quan
- **Tổng số Business**: Hiển thị số lượng nghiệp vụ đang hoạt động
- **Tổng số Projects**: Hiển thị số lượng dự án trong hệ thống  
- **Tổng số Tasks**: Hiển thị tổng số công việc
- **Tỷ lệ hoàn thành**: Phần trăm công việc đã hoàn thành

### 2. Biểu đồ trạng thái Task
Hiển thị phân bố trạng thái của các công việc:
- **PENDING** (Chờ xử lý): Màu vàng
- **IN_PROGRESS** (Đang làm): Màu xanh dương
- **COMPLETED** (Hoàn thành): Màu xanh lá
- **CHECKED** (Đã kiểm tra): Màu tím

### 3. Activity Feed
Hiển thị 20 hoạt động gần nhất từ bảng `task_logs`:
- Người thực hiện hành động
- Loại hành động (START, END, ASSIGN, CHECK)
- Tên công việc được thực hiện
- Dự án và nghiệp vụ liên quan
- Thời gian thực hiện (cả thời gian tương đối và tuyệt đối)
- Ghi chú (nếu có)

## API Endpoints

### GET /api/dashboard/stats
Lấy thống kê tổng quan:
```json
{
  "totalBusiness": 10,
  "totalProjects": 25,
  "totalTasks": 150,
  "taskStatusDistribution": {
    "PENDING": 20,
    "IN_PROGRESS": 30,
    "COMPLETED": 80,
    "CHECKED": 20
  }
}
```

### GET /api/dashboard/activity
Lấy hoạt động gần đây:
```json
[
  {
    "id": 1,
    "taskId": 123,
    "userId": 456,
    "action": "START",
    "timeAt": "2024-01-15T10:30:00Z",
    "note": "Bắt đầu xử lý",
    "taskName": "Tạo báo cáo",
    "userName": "john_doe",
    "projectName": "Project Alpha",
    "businessName": "Business Operations"
  }
]
```

## Cách sử dụng

1. **Truy cập Dashboard**: 
   - Từ trang chủ, click vào card "Dashboard"
   - Hoặc truy cập trực tiếp `/dashboard`

2. **Xem thống kê**: 
   - Các card ở trên hiển thị số liệu tổng quan
   - Biểu đồ cột hiển thị phân bố trạng thái task

3. **Theo dõi hoạt động**:
   - Scroll xuống để xem activity feed
   - Hiển thị 20 hoạt động gần nhất
   - Thời gian hiển thị cả tương đối và tuyệt đối

## Responsive Design
Dashboard được thiết kế responsive:
- **Desktop**: Layout 2 cột (biểu đồ + activity feed)
- **Tablet**: Layout 1 cột, các card xếp chồng
- **Mobile**: Tối ưu cho màn hình nhỏ

## Cập nhật dữ liệu
- Dữ liệu được tải khi vào trang
- Có thể refresh trang để cập nhật dữ liệu mới nhất
- Loading state khi đang tải dữ liệu

## Yêu cầu hệ thống
- React 18+
- Node.js 16+
- Oracle Database với các bảng:
  - `INPLAN.BUSINESS_OPERATIONS`
  - `INPLAN.PROJECTS` 
  - `INPLAN.TASKS`
  - `INPLAN.TASK_LOGS`
  - `INPLAN.USERS`

## Troubleshooting

### Lỗi "Lỗi khi lấy thống kê dashboard"
- Kiểm tra kết nối database
- Đảm bảo user có quyền truy cập các bảng

### Không hiển thị activity
- Kiểm tra bảng `TASK_LOGS` có dữ liệu không
- Đảm bảo các JOIN với bảng `TASKS`, `PROJECTS`, `BUSINESS_OPERATIONS` hoạt động

### Biểu đồ không hiển thị
- Kiểm tra dữ liệu `taskStatusDistribution` từ API
- Đảm bảo có ít nhất 1 task trong hệ thống
