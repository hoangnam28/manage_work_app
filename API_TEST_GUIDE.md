# API Test Guide - Project và Task Management

## Tổng quan
Hướng dẫn test các API đã được tạo cho quản lý Project và Task.

## Backend APIs đã tạo

### 1. Project APIs

#### Tạo Project
```http
POST /api/bussiness/projects
Content-Type: application/json
Authorization: Bearer {token}

{
  "businessId": 1,
  "name": "Dự án test",
  "code": "TEST001",
  "description": "Mô tả dự án test"
}
```

#### Lấy danh sách Projects theo Business
```http
GET /api/bussiness/{businessId}/projects
Authorization: Bearer {token}
```

#### Cập nhật Project
```http
PUT /api/bussiness/projects/{projectId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Dự án test updated",
  "code": "TEST001",
  "description": "Mô tả dự án test updated"
}
```

#### Xóa Project (soft delete)
```http
DELETE /api/bussiness/projects/{projectId}
Authorization: Bearer {token}
```

#### Lấy thông tin Project theo ID
```http
GET /api/bussiness/projects/{projectId}
Authorization: Bearer {token}
```

### 2. Task APIs

#### Tạo Task
```http
POST /api/bussiness/tasks
Content-Type: application/json
Authorization: Bearer {token}

{
  "projectId": 1,
  "name": "Task test",
  "description": "Mô tả task test",
  "assignedTo": 1,
  "supporterId": 2,
  "checkerId": 3,
  "deadline": "2024-12-31T23:59:59Z"
}
```

#### Lấy danh sách Tasks theo Project
```http
GET /api/bussiness/projects/{projectId}/tasks
Authorization: Bearer {token}
```

#### Cập nhật Task
```http
PUT /api/bussiness/tasks/{taskId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Task test updated",
  "description": "Mô tả task test updated",
  "assignedTo": 1,
  "supporterId": 2,
  "checkerId": 3,
  "deadline": "2024-12-31T23:59:59Z"
}
```

#### Xóa Task (soft delete)
```http
DELETE /api/bussiness/tasks/{taskId}
Authorization: Bearer {token}
```

#### Bắt đầu Task
```http
POST /api/bussiness/tasks/{taskId}/start
Authorization: Bearer {token}
```

#### Kết thúc Task
```http
POST /api/bussiness/tasks/{taskId}/end
Content-Type: application/json
Authorization: Bearer {token}

{
  "note": "Task completed successfully"
}
```

#### Lấy Tasks của tôi
```http
GET /api/bussiness/my-tasks
Authorization: Bearer {token}
```

#### Lấy Tasks cần kiểm tra
```http
GET /api/bussiness/check-tasks
Authorization: Bearer {token}
```

## Frontend Components đã cập nhật

### 1. ProjectList.js
- ✅ Import các API services (projectApi, businessApi, userApi)
- ✅ Cập nhật loadProjects() để gọi API thực tế
- ✅ Cập nhật loadUsers() để gọi API thực tế
- ✅ Thêm loadBusiness() để lấy thông tin business
- ✅ Cập nhật handleSubmit() để tạo/cập nhật project
- ✅ Cập nhật handleDelete() để xóa project

### 2. TaskList.js
- ✅ Import các API services (taskApi, projectApi, userApi)
- ✅ Cập nhật loadTasks() để gọi API thực tế
- ✅ Cập nhật loadUsers() để gọi API thực tế
- ✅ Thêm loadProject() để lấy thông tin project
- ✅ Cập nhật handleSubmit() để tạo/cập nhật task
- ✅ Cập nhật handleDelete() để xóa task
- ✅ Cập nhật handleStartTask() để bắt đầu task
- ✅ Cập nhật handleEndTask() để kết thúc task

### 3. TaskForm.js
- ✅ Import userApi
- ✅ Cập nhật fetchUsers() để sử dụng userApi

## Cách test

### 1. Test Backend APIs
Sử dụng Postman hoặc curl để test các endpoints:

```bash
# Test tạo project
curl -X POST http://localhost:5000/api/bussiness/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "businessId": 1,
    "name": "Dự án test",
    "code": "TEST001",
    "description": "Mô tả dự án test"
  }'

# Test tạo task
curl -X POST http://localhost:5000/api/bussiness/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "projectId": 1,
    "name": "Task test",
    "description": "Mô tả task test",
    "assignedTo": 1,
    "deadline": "2024-12-31T23:59:59Z"
  }'
```

### 2. Test Frontend
1. Khởi động backend server
2. Khởi động frontend development server
3. Đăng nhập vào hệ thống
4. Truy cập trang quản lý dự án: `/business/{businessId}/projects`
5. Test các chức năng:
   - Tạo dự án mới
   - Chỉnh sửa dự án
   - Xóa dự án
   - Xem danh sách tasks của dự án
   - Tạo task mới
   - Chỉnh sửa task
   - Xóa task
   - Bắt đầu/kết thúc task

## Lưu ý

1. **Authentication**: Tất cả API đều yêu cầu token authentication
2. **Error Handling**: Các API đều có error handling và trả về message phù hợp
3. **Soft Delete**: Các API delete đều thực hiện soft delete (IS_DELETED = 1)
4. **Data Validation**: Cần validate dữ liệu trước khi gửi request
5. **Loading States**: Frontend đã implement loading states cho UX tốt hơn

## Troubleshooting

### Lỗi thường gặp:
1. **401 Unauthorized**: Kiểm tra token authentication
2. **500 Internal Server Error**: Kiểm tra database connection và SQL syntax
3. **404 Not Found**: Kiểm tra route và parameters
4. **400 Bad Request**: Kiểm tra dữ liệu request body

### Debug:
1. Kiểm tra console logs trong browser
2. Kiểm tra server logs
3. Sử dụng Network tab trong DevTools để xem request/response
