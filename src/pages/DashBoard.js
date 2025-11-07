import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Building2, 
  FolderOpen, 
  CheckSquare, 
  Activity,
  TrendingUp,
  Clock,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import MainLayout from '../components/layout/MainLayout';
import './DashBoard.css';

const DashBoard = () => {
  const {
    stats,
    activities,
    loading,
    error,
    refreshData,
    totalTasks,
    completionRate,
    chartData
  } = useDashboard();

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'pause': 'bg-purple-100 text-blue-800',
      'done': 'bg-green-100 text-green-800',
      'checked': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ xử lý',
      'in_progress': 'Đang làm',
      'pause': 'Tạm dừng',
      'done': 'Hoàn thành',
      'checked': 'Đã kiểm tra'
    };
    return texts[status] || status;
  };

const getActionText = (action) => {
  const texts = {
    'start': 'đã bắt đầu',        
    'complete': 'đã hoàn thành',  
    'pause': 'đã tạm dừng',       
    'created': 'đã được giao', 
    'checked': 'đã kiểm tra',    
    'updated': 'đã cập nhật',
    'deleted': 'đã xóa',
    'reassigned': 'đã gán lại'
  };
  return texts[action] || action;
};

const getActionIcon = (action) => {
  const icons = {
    'start': '▶️',
    'complete': '✅',
    'pause': '⏸️',
    'created': '👤',
    'checked': '🔍',
    'updated': '✏️',
    'deleted': '🗑️',
    'reassigned': '🔄'
  };
  return icons[action] || '📝';
};

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };


  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshData} className="refresh-button">
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
  <MainLayout>
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Tổng quan Dashboard</h1>
          <p className="dashboard-subtitle">Thống kê và hoạt động gần đây</p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={loading}
          className="refresh-button"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Nghiệp Vụ</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalBusiness}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> từ tháng trước
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Dự Án</CardTitle>
            <FolderOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> từ tháng trước
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Công Việc</CardTitle>
            <CheckSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12</span> từ tuần trước
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-orange-600">
               {completionRate}%
             </div>
            <p className="text-xs text-muted-foreground">
              Tỷ lệ hoàn thành
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="dashboard-content">
        {/* Task Status Chart */}
        <Card className="chart-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Trạng thái công việc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              {chartData.map((item, index) => (
                <div key={item.status} className="chart-item">
                  <div className="chart-bar-container">
                    <div 
                      className="chart-bar"
                      style={{
                        height: totalTasks > 0 ? `${(item.count / totalTasks) * 100}%` : '0%',
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                  <div className="chart-info">
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusText(item.status)}
                    </Badge>
                    <span className="chart-count">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="activity-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="activity-feed">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có hoạt động nào</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <span className="activity-user">{activity.userName}</span>
                        <span className="activity-action">
                          {getActionText(activity.action)}
                        </span>
                        <span className="activity-task">{activity.taskName}</span>
                      </div>
                      <div className="activity-details">
                        <span className="activity-project">{activity.projectName}</span>
                        {activity.businessName && (
                          <span className="activity-business">• {activity.businessName}</span>
                        )}
                      </div>
                      {activity.note && (
                        <div className="activity-note">
                          "{activity.note}"
                        </div>
                      )}
                      <div className="activity-time">
                        <Clock className="h-3 w-3" />
                        <span>{getRelativeTime(activity.timeAt)}</span>
                        <span className="text-muted-foreground">
                          ({formatDateTime(activity.timeAt)})
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </MainLayout>
  );
};

export default DashBoard;
