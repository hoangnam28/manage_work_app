import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Calendar, Play, Square } from 'lucide-react';

const TaskCard = ({ task, onStart, onEnd, onView, showActions = true }) => {
  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-gray-500',
      'IN_PROGRESS': 'bg-blue-500',
      'COMPLETED': 'bg-green-500',
      'OVERDUE': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const texts = {
      'PENDING': 'Chờ xử lý',
      'IN_PROGRESS': 'Đang làm',
      'COMPLETED': 'Hoàn thành',
      'OVERDUE': 'Quá hạn'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isOverdue ? 'border-red-300' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{task.name}</CardTitle>
          <Badge className={getStatusColor(task.status)}>
            {getStatusText(task.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{task.description}</p>
        
        <div className="space-y-2 text-sm">
          {task.projectName && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Dự án:</span>
              <span>{task.projectName} ({task.projectCode})</span>
            </div>
          )}
          
          {task.businessName && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Nghiệp vụ:</span>
              <span>{task.businessName}</span>
            </div>
          )}

          {task.assignedName && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Người làm: {task.assignedName}</span>
            </div>
          )}

          {task.deadline && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                Hạn: {formatDate(task.deadline)}
              </span>
            </div>
          )}

          {task.duration && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Thời gian: {task.duration} phút</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 mt-4">
            {task.status === 'PENDING' && (
              <Button 
                onClick={() => onStart(task.id)} 
                className="flex-1"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Bắt đầu
              </Button>
            )}
            
            {task.status === 'IN_PROGRESS' && (
              <Button 
                onClick={() => onEnd(task.id)} 
                variant="destructive"
                className="flex-1"
                size="sm"
              >
                <Square className="w-4 h-4 mr-2" />
                Kết thúc
              </Button>
            )}
            
            <Button 
              onClick={() => onView(task.id)} 
              variant="outline"
              size="sm"
            >
              Chi tiết
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;