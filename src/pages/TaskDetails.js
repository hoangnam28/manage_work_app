import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Spin, Typography, Tag, Modal, Input, Divider } from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined, 
  PlayCircleOutlined,
} from '@ant-design/icons';
import { taskApi } from '../utils/task-api';
import MainLayout from '../components/layout/MainLayout';
import { toast } from 'sonner';

// Helper function to format task data
const formatTaskData = (taskData) => {
  if (!taskData) return null;
  return {
    id: taskData.TASK_ID,
    name: taskData.NAME,
    status: taskData.STATUS,
    description: taskData.DESCRIPTION,
    deadline: taskData.DEADLINE,
    businessName: taskData.BUSINESS_NAME,
    projectName: taskData.PROJECT_NAME,
    duration: taskData.DURATION,
    createdAt: taskData.CREATED_AT,
    createdBy: taskData.CREATOR_NAME,
    assignedTo: taskData.ASSIGNEE_NAME,
    startTime: taskData.START_TIME,
    endTime: taskData.END_TIME,
    endNote: taskData.END_NOTE,
    checkerName: taskData.CHECKER_NAME
  };
};

const { TextArea } = Input;
const { Title, Text } = Typography;

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [endModalVisible, setEndModalVisible] = useState(false);
  const [endNote, setEndNote] = useState('');

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const data = await taskApi.getTaskById(taskId);
      setTask(formatTaskData(data));
    } catch (error) {
      console.error('Error loading task details:', error);
      toast.error('Không thể tải thông tin task');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    try {
      await taskApi.startTask(taskId);
      toast.success('Bắt đầu task thành công');
      loadTaskDetails();
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Không thể bắt đầu task');
    }
  };

  const handleEndTask = async () => {
    try {
      await taskApi.endTask(taskId, endNote);
      setEndModalVisible(false);
      toast.success('Kết thúc task thành công');
      loadTaskDetails();
    } catch (error) {
      console.error('Error ending task:', error);
      toast.error('Không thể kết thúc task');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      PENDING: { color: 'default', text: 'Chờ thực hiện' },
      IN_PROGRESS: { color: 'processing', text: 'Đang thực hiện' },
      COMPLETED: { color: 'success', text: 'Hoàn thành' },
      CHECKED: { color: 'success', text: 'Đã kiểm tra' }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Space style={{ marginBottom: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/my-tasks')}
          >
            Quay lại
          </Button>
        </Space>

        <Card>
          <div style={{ marginBottom: 24 }}>
            <Title level={3}>{task?.name}</Title>
            <Space>
              {getStatusTag(task?.status)}
              {task?.projectName && (
                <Tag color="blue">{task.projectName}</Tag>
              )}
            </Space>
          </div>

          <Descriptions bordered column={2}>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(task?.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Nghiệp vụ">
              {task?.businessName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {task?.createdBy || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Người thực hiện">
              {task?.assignedTo || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian tạo">
              {formatDateTime(task?.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Kỳ Hạn">
              {formatDateTime(task?.deadline)}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian bắt đầu">
              {formatDateTime(task?.startTime) || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian kết thúc">
              {formatDateTime(task?.endTime) || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian thực hiện" span={2}>
              {task?.duration ? `${Math.round(task.duration)} phút` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              {task?.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú kết thúc" span={2}>
              {task?.endNote || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Space>
            {task?.status === 'PENDING' && (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleStartTask}
              >
                Bắt đầu Task
              </Button>
            )}
            {task?.status === 'IN_PROGRESS' && (
              <Button
                type="primary"
                danger
                icon={<CheckCircleOutlined />}
                onClick={() => setEndModalVisible(true)}
              >
                Kết thúc Task
              </Button>
            )}
          </Space>
        </Card>

        <Modal
          title="Kết thúc task"
          open={endModalVisible}
          onOk={handleEndTask}
          onCancel={() => setEndModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <div style={{ marginBottom: 16 }}>
            <Text>Ghi chú kết thúc:</Text>
            <TextArea
              rows={4}
              value={endNote}
              onChange={(e) => setEndNote(e.target.value)}
              placeholder="Nhập ghi chú kết thúc task (không bắt buộc)"
            />
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default TaskDetails;
