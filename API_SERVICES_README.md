# API Services - Frontend

## Tổng quan
Bộ API services được tạo để quản lý tất cả các API calls từ frontend đến backend một cách có tổ chức và dễ sử dụng.

## Cấu trúc API Services

### 1. Dashboard API (`src/utils/dashboard-api.js`)
Quản lý các API calls liên quan đến dashboard:

```javascript
import { dashboardApi } from '../utils/dashboard-api';

// Lấy thống kê dashboard
const stats = await dashboardApi.getStats();

// Lấy hoạt động gần đây
const activities = await dashboardApi.getActivities();

// Lấy dữ liệu dashboard đầy đủ
const { stats, activities } = await dashboardApi.getDashboardData();
```

**Endpoints:**
- `GET /api/dashboard/stats` - Thống kê tổng quan
- `GET /api/dashboard/activity` - Hoạt động gần đây

### 2. Business API (`src/utils/business-api.js`)
Quản lý các API calls cho Business:

```javascript
import { businessApi } from '../utils/business-api';

// Lấy danh sách business
const businesses = await businessApi.getBusinesses();

// Tạo business mới
const newBusiness = await businessApi.createBusiness(data);

// Lấy projects theo business
const projects = await businessApi.getProjectsByBusiness(businessId);
```

**Endpoints:**
- `GET /api/businesses` - Danh sách business
- `POST /api/businesses` - Tạo business mới
- `PUT /api/businesses/:id` - Cập nhật business
- `DELETE /api/businesses/:id` - Xóa business
- `GET /api/businesses/:id/projects` - Projects theo business

### 3. Project API (`src/utils/project-api.js`)
Quản lý các API calls cho Project:

```javascript
import { projectApi } from '../utils/project-api';

// Tạo project mới
const newProject = await projectApi.createProject(data);

// Lấy tasks theo project
const tasks = await projectApi.getTasksByProject(projectId);
```

**Endpoints:**
- `POST /api/projects` - Tạo project mới
- `PUT /api/projects/:id` - Cập nhật project
- `DELETE /api/projects/:id` - Xóa project
- `GET /api/projects/:id/tasks` - Tasks theo project

### 4. Task API (`src/utils/task-api.js`)
Quản lý các API calls cho Task:

```javascript
import { taskApi } from '../utils/task-api';

// Tạo task mới
const newTask = await taskApi.createTask(data);

// Bắt đầu task
await taskApi.startTask(taskId);

// Kết thúc task
await taskApi.endTask(taskId, note);

// Lấy tasks của tôi
const myTasks = await taskApi.getMyTasks();
```

**Endpoints:**
- `POST /api/tasks` - Tạo task mới
- `PUT /api/tasks/:id` - Cập nhật task
- `POST /api/tasks/:id/start` - Bắt đầu task
- `POST /api/tasks/:id/end` - Kết thúc task
- `GET /api/my-tasks` - Tasks của tôi
- `GET /api/check-tasks` - Tasks cần kiểm tra

### 5. User API (`src/utils/user-api.js`)
Quản lý các API calls cho User:

```javascript
import { userApi } from '../utils/user-api';

// Lấy danh sách users
const users = await userApi.getUsers();

// Tạo user mới
const newUser = await userApi.createUser(data);
```

**Endpoints:**
- `GET /api/users` - Danh sách users
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

## React Hooks

### useDashboard Hook (`src/hooks/useDashboard.js`)
Hook để quản lý state và logic của dashboard:

```javascript
import { useDashboard } from '../hooks/useDashboard';

const DashboardComponent = () => {
  const {
    stats,           // Thống kê dashboard
    activities,      // Hoạt động gần đây
    loading,         // Trạng thái loading
    error,           // Lỗi nếu có
    refreshData,     // Function để refresh dữ liệu
    totalTasks,      // Tổng số tasks
    completionRate,  // Tỷ lệ hoàn thành
    chartData        // Dữ liệu cho biểu đồ
  } = useDashboard();

  // Component logic...
};
```

**Tính năng:**
- Tự động fetch dữ liệu khi component mount
- Quản lý loading state
- Error handling
- Refresh function
- Derived data (totalTasks, completionRate, chartData)

## Cách sử dụng

### 1. Import API service cần thiết:
```javascript
import { dashboardApi } from '../utils/dashboard-api';
import { businessApi } from '../utils/business-api';
```

### 2. Sử dụng trong component:
```javascript
const MyComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getStats();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Component JSX...
};
```

### 3. Sử dụng với React Hook:
```javascript
import { useDashboard } from '../hooks/useDashboard';

const Dashboard = () => {
  const { stats, activities, loading, error, refreshData } = useDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refreshData} />;

  return (
    <div>
      {/* Dashboard content */}
      <button onClick={refreshData}>Refresh</button>
    </div>
  );
};
```

## Error Handling
Tất cả API services đều có error handling tích hợp:
- Log lỗi ra console
- Throw error để component có thể handle
- Có thể customize error message

## Centralized Export
Sử dụng `src/utils/api-services.js` để import tất cả services:

```javascript
import { dashboardApi, businessApi, taskApi } from '../utils/api-services';
```

## Best Practices

1. **Sử dụng React Hooks** khi có thể để tái sử dụng logic
2. **Error handling** trong component, không chỉ trong API service
3. **Loading states** để cải thiện UX
4. **TypeScript** (nếu dự án sử dụng) để type safety
5. **Caching** cho các API calls không thay đổi thường xuyên

## Dependencies
- `axios` - HTTP client
- `react` - React hooks
- Custom axios config từ `src/utils/axios.js`

## Mở rộng
Để thêm API service mới:
1. Tạo file mới trong `src/utils/`
2. Export functions theo pattern hiện có
3. Thêm vào `src/utils/api-services.js`
4. Tạo React hook nếu cần thiết
5. Update documentation
