import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Badge,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import moment from 'moment';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TaskList = () => {
  const { businessId, projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();

  // Load tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      // const data = await taskApi.getTasksByProject(projectId);
      // setTasks(data);
      
      // Mock data for now
      setTasks([
        {
          id: 1,
          name: 'Task 1',
          description: 'Mô tả task 1',
          status: 'PENDING',
          assignedTo: 1,
          supporterId: 2,
          checkerId: 3,
          assignedName: 'User 1',
          supporterName: 'User 2',
          checkerName: 'User 3',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      message.error('Lỗi khi tải danh sách task');
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      // TODO: Implement API call
      // const data = await userApi.getUsers();
      // setUsers(data);
      
      // Mock data for now
      setUsers([
        { id: 1, username: 'admin', fullName: 'Administrator' },
        { id: 2, username: 'user1', fullName: 'User 1' },
        { id: 3, username: 'user2', fullName: 'User 2' },
        { id: 4, username: 'user3', fullName: 'User 3' }
      ]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, [projectId]);

  // Handle create/update task
  const handleSubmit = async (values) => {
    try {
      if (editingTask) {
        // TODO: Implement update API
        // await taskApi.updateTask(editingTask.id, values);
        message.success('Cập nhật task thành công');
      } else {
        // TODO: Implement create API
        // await taskApi.createTask({ ...values, projectId });
        message.success('Tạo task thành công');
      }
      
      setModalVisible(false);
      setEditingTask(null);
      form.resetFields();
      loadTasks();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu task');
      console.error('Error saving task:', error);
    }
  };

  // Handle edit task
  const handleEdit = (task) => {
    setEditingTask(task);
    form.setFieldsValue({
      name: task.name,
      description: task.description,
      assignedTo: task.assignedTo,
      supporterId: task.supporterId,
      checkerId: task.checkerId,
      deadline: task.deadline ? moment(task.deadline) : null
    });
    setModalVisible(true);
  };

  // Handle delete task
  const handleDelete = async (taskId) => {
    try {
      // TODO: Implement delete API
      // await taskApi.deleteTask(taskId);
      message.success('Xóa task thành công');
      loadTasks();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa task');
      console.error('Error deleting task:', error);
    }
  };

  // Handle start task
  const handleStartTask = async (taskId) => {
    try {
      // TODO: Implement start API
      // await taskApi.startTask(taskId);
      message.success('Bắt đầu task thành công');
      loadTasks();
    } catch (error) {
      message.error('Có lỗi xảy ra khi bắt đầu task');
      console.error('Error starting task:', error);
    }
  };

  // Handle end task
  const handleEndTask = async (taskId) => {
    try {
      // TODO: Implement end API
      // await taskApi.endTask(taskId);
      message.success('Kết thúc task thành công');
      loadTasks();
    } catch (error) {
      message.error('Có lỗi xảy ra khi kết thúc task');
      console.error('Error ending task:', error);
    }
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING':
        return { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ thực hiện' };
      case 'IN_PROGRESS':
        return { color: 'blue', icon: <PlayCircleOutlined />, text: 'Đang thực hiện' };
      case 'COMPLETED':
        return { color: 'green', icon: <CheckCircleOutlined />, text: 'Hoàn thành' };
      case 'CHECKED':
        return { color: 'purple', icon: <ExclamationCircleOutlined />, text: 'Đã kiểm tra' };
      default:
        return { color: 'default', icon: null, text: status };
    }
  };

  // Check if task is overdue
  const isOverdue = (deadline, status) => {
    if (status === 'COMPLETED' || status === 'CHECKED') return false;
    return new Date(deadline) < new Date();
  };

  // Table columns
  const columns = [
    {
      title: 'Tên task',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          {isOverdue(record.deadline, record.status) && (
            <Tag color="red" style={{ marginLeft: 8 }}>
              Quá hạn
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
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
      title: 'Người thực hiện',
      dataIndex: 'assignedName',
      key: 'assignedName',
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      )
    },
    {
      title: 'Người hỗ trợ',
      dataIndex: 'supporterName',
      key: 'supporterName',
      render: (text) => text || '-'
    },
    {
      title: 'Người kiểm tra',
      dataIndex: 'checkerName',
      key: 'checkerName',
      render: (text) => text || '-'
    },
    {
      title: 'Hạn chót',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline) => (
        <span style={{ 
          color: isOverdue(deadline, 'PENDING') ? '#ff4d4f' : 'inherit' 
        }}>
          {new Date(deadline).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'PENDING' && (
            <Tooltip title="Bắt đầu task">
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
          {record.status === 'IN_PROGRESS' && (
            <Tooltip title="Kết thúc task">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => handleEndTask(record.id)}
              >
                Kết thúc
              </Button>
            </Tooltip>
          )}
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa task này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={2} style={{ margin: 0 }}>
                    <CheckCircleOutlined style={{ marginRight: '8px' }} />
                    Quản lý Tasks
                  </Title>
                  <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                    Dự án: {project?.name || 'Loading...'}
                  </p>
                </Col>
                <Col>
                  <Space>
                    <Button onClick={() => navigate(`/business/${businessId}/projects`)}>
                      Quay lại
                    </Button>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingTask(null);
                        form.resetFields();
                        setModalVisible(true);
                      }}
                    >
                      Tạo task mới
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số tasks"
                value={tasks.length}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Chờ thực hiện"
                value={tasks.filter(t => t.status === 'PENDING').length}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đang thực hiện"
                value={tasks.filter(t => t.status === 'IN_PROGRESS').length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Hoàn thành"
                value={tasks.filter(t => t.status === 'COMPLETED').length}
                valueStyle={{ color: '#52c41a' }}
              />
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
          />
        </Card>

        <Modal
          title={editingTask ? 'Cập nhật task' : 'Tạo task mới'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingTask(null);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Tên task"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên task' },
                    { min: 3, message: 'Tên task phải có ít nhất 3 ký tự' }
                  ]}
                >
                  <Input placeholder="Nhập tên task" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="deadline"
                  label="Hạn chót"
                  rules={[
                    { required: true, message: 'Vui lòng chọn hạn chót' }
                  ]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    placeholder="Chọn hạn chót"
                    showTime
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả' },
                { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập mô tả chi tiết về task"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="assignedTo"
                  label="Người thực hiện"
                  rules={[
                    { required: true, message: 'Vui lòng chọn người thực hiện' }
                  ]}
                >
                  <Select placeholder="Chọn người thực hiện">
                    {users.map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.fullName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="supporterId"
                  label="Người hỗ trợ"
                >
                  <Select placeholder="Chọn người hỗ trợ" allowClear>
                    {users.map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.fullName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="checkerId"
                  label="Người kiểm tra"
                >
                  <Select placeholder="Chọn người kiểm tra" allowClear>
                    {users.map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.fullName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingTask ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default TaskList;
