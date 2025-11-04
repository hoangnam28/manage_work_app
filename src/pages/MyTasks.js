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
  Divider,
  Timeline,
  Empty
} from 'antd';
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BarsOutlined,
  ReloadOutlined,
  PauseCircleOutlined,
  HistoryOutlined,
  CheckOutlined
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
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [sessionsModalVisible, setSessionsModalVisible] = useState(false);
  const [note, setNote] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Normalize status
  const normalizeStatus = (status) => {
    return status ? status.toLowerCase() : 'pending';
  };

  // Load tasks
  const loadMyTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await taskApi.getMyTasks();
      setTasks(data || []);
    } catch {
      message.error('Lỗi khi tải danh sách task');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyTasks();
    const interval = setInterval(loadMyTasks, 30000);
    return () => clearInterval(interval);
  }, [loadMyTasks]);

  // Start task/session
  const handleStartTask = async (taskId) => {
    try {
      await taskApi.startTask(taskId);
      message.success('Bắt đầu làm việc thành công');
      await loadMyTasks();
    } catch (error) {
      message.error(error?.message || 'Có lỗi xảy ra');
    }
  };

  // Show pause modal
  const showPauseModal = (taskId) => {
    setCurrentTaskId(taskId);
    setNote('');
    setPauseModalVisible(true);
  };

  // Handle pause
  const handlePauseTask = async () => {
    try {
      await taskApi.pauseTask(currentTaskId, note);
      message.success('Tạm dừng thành công');
      setPauseModalVisible(false);
      setNote('');
      setCurrentTaskId(null);
      await loadMyTasks();
    } catch (error) {
      message.error(error?.message || 'Có lỗi xảy ra');
    }
  };

  // Show complete modal
  const showCompleteModal = (taskId) => {
    setCurrentTaskId(taskId);
    setNote('');
    setCompleteModalVisible(true);
  };

  // Handle complete
  const handleCompleteTask = async () => {
    try {
      await taskApi.completeTask(currentTaskId, note);
      message.success('Hoàn thành task thành công');
      setCompleteModalVisible(false);
      setNote('');
      setCurrentTaskId(null);
      await loadMyTasks();
    } catch (error) {
      message.error(error?.message || 'Có lỗi xảy ra');
    }
  };

  // Show sessions history
  const showSessionsHistory = async (taskId) => {
    setCurrentTaskId(taskId);
    setSessionsModalVisible(true);
    setLoadingSessions(true);
    try {
      const data = await taskApi.getTaskSessions(taskId);
      setSessions(data || []);
    } catch (error) {
      message.error('Không thể tải lịch sử làm việc');
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Get status info
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
    if (normalized === 'done' || normalized === 'checked') return false;
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getDeadlineStatus = (deadline, status) => {
    if (!deadline) return null;
    const normalized = normalizeStatus(status);
    if (normalized === 'done' || normalized === 'checked') return null;

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursLeft = (deadlineDate - now) / (1000 * 60 * 60);

    if (hoursLeft < 0) return { type: 'error', text: 'Quá hạn' };
    if (hoursLeft < 24) return { type: 'warning', text: `${Math.round(hoursLeft)} giờ còn lại` };
    return { type: 'success', text: `${Math.round(hoursLeft / 24)} ngày còn lại` };
  };

  const viewTaskDetails = (task) => {
    setSelectedTask(task);
    setDrawerVisible(true);
  };

  const columns = [
    {
      title: 'Nghiệp vụ',
      dataIndex: 'businessName',
      key: 'businessName',
      width: 120
    },
    {
      title: 'Dự án',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150
    },
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
            {record.isRunning && (
              <Badge status="processing" style={{ marginLeft: 8 }} />
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Kỳ Hạn',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 140,
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
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration, record) => (
        <Tooltip title="Xem lịch sử làm việc">
          <span 
            style={{ cursor: 'pointer', color: duration > 0 ? '#1890ff' : 'inherit' }} 
            onClick={() => duration > 0 && showSessionsHistory(record.id)}
          >
            {duration ? `${Math.round(duration)} phút` : '0 phút'}
            {duration > 0 && <HistoryOutlined style={{ marginLeft: 4 }} />}
          </span>
        </Tooltip>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 280,
      fixed: 'right',
      render: (_, record) => {
        const normalized = normalizeStatus(record.status);
        const isRunning = record.isRunning;
        
        return (
          <Space size="small" wrap>
            {normalized === 'pending' && !isRunning && (
              <Tooltip title={record.duration > 0 ? "Tiếp tục làm việc" : "Bắt đầu làm việc"}>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  size="small"
                  onClick={() => handleStartTask(record.id)}
                >
                  {record.duration > 0 ? 'Tiếp tục' : 'Bắt đầu'}
                </Button>
              </Tooltip>
            )}
            
            {normalized === 'in_progress' && isRunning && (
              <Tooltip title="Tạm dừng">
                <Button
                  type="default"
                  icon={<PauseCircleOutlined />}
                  size="small"
                  onClick={() => showPauseModal(record.id)}
                >
                  Tạm dừng
                </Button>
              </Tooltip>
            )}
            
            {(normalized === 'pending' || normalized === 'in_progress') && !isRunning && (
              <Tooltip title="Đánh dấu hoàn thành">
                <Button
                  type="primary"
                  danger
                  icon={<CheckOutlined />}
                  size="small"
                  onClick={() => showCompleteModal(record.id)}
                >
                  Hoàn thành
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
                <div style={{ fontSize: 16, marginTop: 8 }}>
                  {selectedTask.name}
                  {selectedTask.isRunning && (
                    <Badge status="processing" text="Đang chạy" style={{ marginLeft: 8 }} />
                  )}
                </div>
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
                  <Text strong>Tổng thời gian:</Text>
                  <div 
                    style={{ 
                      marginTop: 8, 
                      cursor: selectedTask.duration > 0 ? 'pointer' : 'default', 
                      color: selectedTask.duration > 0 ? '#1890ff' : 'inherit' 
                    }} 
                    onClick={() => selectedTask.duration > 0 && showSessionsHistory(selectedTask.id)}
                  >
                    {selectedTask.duration ? `${Math.round(selectedTask.duration)} phút` : '0 phút'}
                    {selectedTask.duration > 0 && <HistoryOutlined style={{ marginLeft: 4 }} />}
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
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {normalizeStatus(selectedTask.status) === 'pending' && !selectedTask.isRunning && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlayCircleOutlined />}
                      onClick={() => {
                        handleStartTask(selectedTask.id);
                        setDrawerVisible(false);
                      }}
                      block
                    >
                      {selectedTask.duration > 0 ? 'Tiếp tục làm việc' : 'Bắt đầu làm việc'}
                    </Button>
                  )}
                  
                  {normalizeStatus(selectedTask.status) === 'in_progress' && selectedTask.isRunning && (
                    <Button
                      type="default"
                      size="large"
                      icon={<PauseCircleOutlined />}
                      onClick={() => {
                        showPauseModal(selectedTask.id);
                        setDrawerVisible(false);
                      }}
                      block
                    >
                      Tạm dừng
                    </Button>
                  )}
                  
                  {(normalizeStatus(selectedTask.status) === 'pending' || 
                    normalizeStatus(selectedTask.status) === 'in_progress') && 
                    !selectedTask.isRunning && (
                    <Button
                      type="primary"
                      danger
                      size="large"
                      icon={<CheckOutlined />}
                      onClick={() => {
                        showCompleteModal(selectedTask.id);
                        setDrawerVisible(false);
                      }}
                      block
                    >
                      Hoàn thành task
                    </Button>
                  )}
                </Space>
              </div>
            </div>
          )}
        </Drawer>

        {/* Pause Modal */}
        <Modal
          title="Tạm dừng làm việc"
          open={pauseModalVisible}
          onOk={handlePauseTask}
          onCancel={() => setPauseModalVisible(false)}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <div style={{ marginBottom: 16 }}>
            <Text strong>Ghi chú (tùy chọn):</Text>
            <TextArea
              rows={4}
              placeholder="Mô tả công việc đã làm trong session này..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>
        </Modal>

        {/* Complete Task Modal */}
        <Modal
          title="Hoàn thành Công Việc"
          open={completeModalVisible}
          onOk={handleCompleteTask}
          onCancel={() => setCompleteModalVisible(false)}
          okText="Xác nhận hoàn thành"
          cancelText="Hủy"
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="warning" strong>
              Bạn có chắc chắn muốn đánh dấu task này là hoàn thành?
            </Text>
            <div style={{ marginTop: 16 }}>
              <Text strong>Ghi chú kết thúc (tùy chọn):</Text>
              <TextArea
                rows={4}
                placeholder="Tóm tắt kết quả công việc..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        </Modal>

        {/* Sessions History Modal */}
        <Modal
          title="Lịch sử làm việc"
          open={sessionsModalVisible}
          onCancel={() => setSessionsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setSessionsModalVisible(false)}>
              Đóng
            </Button>
          ]}
          width={600}
        >
          {loadingSessions ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text>Đang tải...</Text>
            </div>
          ) : sessions.length === 0 ? (
            <Empty description="Chưa có lịch sử làm việc" />
          ) : (
            <Timeline>
              {sessions.map((session) => (
                <Timeline.Item
                  key={session.id}
                  color={session.isRunning ? 'blue' : 'green'}
                  dot={session.isRunning ? <ClockCircleOutlined /> : <CheckCircleOutlined />}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {session.userName || 'Unknown User'}
                      {session.isRunning && (
                        <Tag color="blue" style={{ marginLeft: 8 }}>Đang chạy</Tag>
                      )}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      Bắt đầu: {new Date(session.startTime).toLocaleString('vi-VN')}
                      {session.endTime && (
                        <>
                          <br />
                          Kết thúc: {new Date(session.endTime).toLocaleString('vi-VN')}
                        </>
                      )}
                    </div>
                    {session.duration && (
                      <div style={{ color: '#1890ff', marginTop: 4 }}>
                        Thời gian: {Math.round(session.duration)} phút
                      </div>
                    )}
                    {session.note && (
                      <div style={{ 
                        marginTop: 8, 
                        padding: '8px 12px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: 4,
                        fontSize: '13px'
                      }}>
                        {session.note}
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default MyTasks;