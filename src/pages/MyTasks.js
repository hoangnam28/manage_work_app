import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Input,
  message,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  Badge,
  Drawer,
  Divider
} from 'antd';
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BarsOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import { taskApi } from '../utils/task-api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [endNote, setEndNote] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState(null);

  // Normalize status to lowercase for consistent comparison
  const normalizeStatus = (status) => {
    return status ? status.toLowerCase() : 'pending';
  };

  // Load my tasks
 const loadMyTasks = useCallback(async () => {
  setLoading(true);
  try {
    const data = await taskApi.getMyTasks();
    setTasks(data || []);
  } catch {
    message.error('Lỗi khi tải danh sách task của tôi');
  } finally {
    setLoading(false);
  }
}, []); // <-- Không phụ thuộc gì


  useEffect(() => {
  loadMyTasks();
  const interval = setInterval(() => {
    loadMyTasks();
  }, 30000);

  return () => clearInterval(interval);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // <-- Chỉ chạy 1 lần


  const handleStartTask = async (taskId) => {
    try {
      await taskApi.startTask(taskId);
      message.success('Bắt đầu task thành công');
      await loadMyTasks();
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(error.response.data.message || 'Có lỗi xảy ra khi bắt đầu task');
      } else {
        message.error('Có lỗi xảy ra khi bắt đầu task');
      }
      console.error('Error starting task:', error);
    }
  };

  // Handle end task - show note modal
  const showEndModal = (taskId) => {
    setCurrentTaskId(taskId);
    setEndNote('');
    setNoteModalVisible(true);
  };

  // Handle end task submission
  const handleEndTask = async () => {
    try {
      await taskApi.endTask(currentTaskId, endNote);
      message.success('Kết thúc task thành công');
      setNoteModalVisible(false);
      setEndNote('');
      setCurrentTaskId(null);
      await loadMyTasks();
    } catch (error) {
      message.error('Có lỗi xảy ra khi kết thúc task');
      console.error('Error ending task:', error);
    }
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'pending':  
        return { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ thực hiện' };
      case 'in_progress': 
        return { color: 'blue', icon: <PlayCircleOutlined />, text: 'Đang thực hiện' };
      case 'done':
        return { color: 'green', icon: <CheckCircleOutlined />, text: 'Hoàn thành' };
      case 'checked':  
        return { color: 'purple', icon: <CheckCircleOutlined />, text: 'Đã kiểm tra' };
      default:
        return { color: 'default', icon: null, text: status };
    }
  };

  const isOverdue = (deadline, status) => {
    const normalized = normalizeStatus(status);
    // Task is not overdue if it's completed or checked
    if (normalized === 'done' || normalized === 'checked') {
      return false;
    }
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  // Get deadline status
  const getDeadlineStatus = (deadline, status) => {
    if (!deadline) return null;
    
    // Don't show deadline status for completed tasks
    const normalized = normalizeStatus(status);
    if (normalized === 'done' || normalized === 'checked') {
      return null;
    }

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursLeft = (deadlineDate - now) / (1000 * 60 * 60);

    if (hoursLeft < 0) return { type: 'error', text: 'Quá hạn' };
    if (hoursLeft < 24) return { type: 'warning', text: `${Math.round(hoursLeft)} giờ còn lại` };
    return { type: 'success', text: `${Math.round(hoursLeft / 24)} ngày còn lại` };
  };

  // View task details
  const viewTaskDetails = (task) => {
    setSelectedTask(task);
    setDrawerVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'Tên Task',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <div>
          <div 
            style={{ fontWeight: 'bold', cursor: 'pointer', color: '#1890ff' }} 
            onClick={() => viewTaskDetails(record)}
          >
            {text}
          </div>
          <small style={{ color: '#666' }}>{record.projectName}</small>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusInfo = getStatusInfo(status);
        return (
          <Tag color={statusInfo.color} icon={statusInfo.icon}>
            {statusInfo.text}
          </Tag>
        );
      }
    },
    {
      title: 'Kỳ Hạn',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 150,
      render: (deadline, record) => {
        const deadlineStatus = getDeadlineStatus(deadline, record.status);
        const isOver = isOverdue(deadline, record.status);
        
        return (
          <div>
            <div style={{ color: isOver ? '#ff4d4f' : 'inherit' }}>
              {new Date(deadline).toLocaleDateString('vi-VN')}
            </div>
            {deadlineStatus && (
              <Tag color={deadlineStatus.type} style={{ marginTop: 4 }}>
                {deadlineStatus.text}
              </Tag>
            )}
          </div>
        );
      }
    },
    {
      title: 'Nghiệp vụ',
      dataIndex: 'businessName',
      key: 'businessName',
      width: 150
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration) => (
        <span>
          {duration ? `${Math.round(duration)} phút` : '-'}
        </span>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const normalized = normalizeStatus(record.status);
        return (
          <Space size="small" wrap>
            {normalized === 'pending' && (
              <Tooltip title="Bắt đầu thực hiện task">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  size="small"
                  onClick={() => handleStartTask(record.id)}
                >
                  Bắt đầu
                </Button>
              </Tooltip>
            )}
            {normalized === 'in_progress' && (
              <Tooltip title="Kết thúc task">
                <Button
                  type="primary"
                  danger
                  icon={<CheckCircleOutlined />}
                  size="small"
                  onClick={() => showEndModal(record.id)}
                >
                  Kết thúc
                </Button>
              </Tooltip>
            )}
            <Button
              type="default"
              icon={<FileTextOutlined />}
              size="small"
              onClick={() => viewTaskDetails(record)}
            >
              Chi tiết
            </Button>
          </Space>
        );
      }
    }
  ];

  const pendingCount = tasks.filter(t => normalizeStatus(t.status) === 'pending').length;
  const inProgressCount = tasks.filter(t => normalizeStatus(t.status) === 'in_progress').length;
  const completedCount = tasks.filter(t => {
    const normalized = normalizeStatus(t.status);
    return normalized === 'done' || normalized === 'checked';
  }).length;
  const overdueCount = tasks.filter(t => isOverdue(t.deadline, t.status)).length;

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={2} style={{ margin: 0 }}>
                    <BarsOutlined style={{ marginRight: '8px' }} />
                    Công Việc Của Tôi
                  </Title>
                </Col>
                <Col>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={loadMyTasks} 
                    loading={loading}
                  >
                    Làm mới
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Badge count={pendingCount} color="#faad14">
                <Statistic
                  title="Chờ thực hiện"
                  value={pendingCount}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Badge>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Badge count={inProgressCount} color="#1890ff">
                <Statistic
                  title="Đang thực hiện"
                  value={inProgressCount}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Badge>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Hoàn thành"
                value={completedCount}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Badge count={overdueCount} color="#f5222d">
                <Statistic
                  title="Quá hạn"
                  value={overdueCount}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Badge>
            </Card>
          </Col>
        </Row>

        <Card>
          <Table
            columns={columns}
            dataSource={tasks}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} tasks`
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Task Details Drawer */}
        <Drawer
          title="Chi tiết Công Việc"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={500}
        >
          {selectedTask && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <Text strong>Tên task:</Text>
                <div style={{ fontSize: 16, marginTop: 8 }}>{selectedTask.name}</div>
              </div>

              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <Text strong>Trạng thái:</Text>
                  <div style={{ marginTop: 8 }}>
                    {(() => {
                      const statusInfo = getStatusInfo(selectedTask.status);
                      return (
                        <Tag color={statusInfo.color} icon={statusInfo.icon}>
                          {statusInfo.text}
                        </Tag>
                      );
                    })()}
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Thời gian:</Text>
                  <div style={{ marginTop: 8 }}>
                    {selectedTask.duration ? `${Math.round(selectedTask.duration)} phút` : 'Chưa bắt đầu'}
                  </div>
                </Col>
              </Row>

              <Divider />

              <div style={{ marginBottom: 24 }}>
                <Text strong>Mô tả:</Text>
                <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {selectedTask.description}
                </div>
              </div>

              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <Text strong>Kỳ Hạn:</Text>
                  <div style={{ marginTop: 8 }}>
                    <CalendarOutlined /> {new Date(selectedTask.deadline).toLocaleDateString('vi-VN')}
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Dự án:</Text>
                  <div style={{ marginTop: 8 }}>{selectedTask.projectName}</div>
                </Col>
              </Row>

              <div style={{ marginBottom: 24 }}>
                <Text strong>Nghiệp vụ:</Text>
                <div style={{ marginTop: 8 }}>{selectedTask.businessName}</div>
              </div>

              <Divider />

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                {normalizeStatus(selectedTask.status) === 'pending' && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    onClick={() => {
                      handleStartTask(selectedTask.id);
                      setDrawerVisible(false);
                    }}
                  >
                    Bắt đầu thực hiện
                  </Button>
                )}
                {normalizeStatus(selectedTask.status) === 'in_progress' && (
                  <Button
                    type="primary"
                    danger
                    size="large"
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      showEndModal(selectedTask.id);
                      setDrawerVisible(false);
                    }}
                  >
                    Kết thúc task
                  </Button>
                )}
              </div>
            </div>
          )}
        </Drawer>

        {/* End Task Note Modal */}
        <Modal
          title="Kết thúc Công Việc"
          open={noteModalVisible}
          onOk={handleEndTask}
          onCancel={() => setNoteModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <div style={{ marginBottom: 16 }}>
            <Text strong>Ghi chú khi kết thúc (tùy chọn):</Text>
            <TextArea
              rows={4}
              placeholder="Mô tả kết quả hoặc ghi chú về công việc vừa hoàn thành..."
              value={endNote}
              onChange={(e) => setEndNote(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default MyTasks;