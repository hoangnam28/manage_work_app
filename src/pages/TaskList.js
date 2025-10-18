import React, { useState, useEffect, useCallback } from 'react';
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
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { taskApi } from '../utils/task-api';
import { projectApi } from '../utils/project-api';
import { fetchUsersList } from '../utils/user-api';
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
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskApi.getTasksByProject(projectId);
      
      // Format task data để phù hợp với hiển thị
      const formattedTasks = (data || []).map(task => ({
        id: task.ID,
        name: task.NAME,
        description: task.DESCRIPTION,
        status: task.STATUS,
        assignedTo: task.ASSIGNED_TO,
        supporterId: task.SUPPORTER_ID,
        checkerId: task.CHECKER_ID,
        deadline: task.DEADLINE,
        // Giữ lại dữ liệu gốc cho việc chỉnh sửa
        ...task
      }));
      
      setTasks(formattedTasks);
    } catch (error) {
      message.error('Lỗi khi tải danh sách task');
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchUsersList();
      setUsers(data || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách người dùng');
      console.error('Error loading users:', error);
    }
  }, []);

  // Load project info
  const loadProject = useCallback(async () => {
    try {
      const data = await projectApi.getProjectById(projectId);
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadTasks();
      loadUsers();
      loadProject();
    }
  }, [projectId, loadTasks, loadUsers, loadProject]);

  // Handle create/update task
  const handleSubmit = async (values) => {
    try {
      const taskData = {
        name: values.name,
        description: values.description,
        assigned_to: values.assignedTo,
        supporter_id: values.supporterId || null,
        checker_id: values.checkerId || null,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD HH:mm:ss') : null,
        project_id: projectId
      };

      if (editingTask) {
        await taskApi.updateTask(editingTask.ID || editingTask.id, taskData);
        message.success('Cập nhật task thành công');
      } else {
        await taskApi.createTask(taskData);
        message.success('Tạo task thành công');
      }
      
      setModalVisible(false);
      setEditingTask(null);
      form.resetFields();
      await loadTasks();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu task');
      console.error('Error saving task:', error);
    }
  };

  // Handle edit task
  const handleEdit = (task) => {
    setEditingTask(task);
    form.setFieldsValue({
      name: task.NAME || task.name,
      description: task.DESCRIPTION || task.description,
      assignedTo: task.ASSIGNED_TO || task.assignedTo,
      supporterId: task.SUPPORTER_ID || task.supporterId,
      checkerId: task.CHECKER_ID || task.checkerId,
      deadline: task.DEADLINE || task.deadline ? moment(task.DEADLINE || task.deadline) : null
    });
    setModalVisible(true);
  };

  // Handle delete task
  const handleDelete = async (taskId) => {
    try {
      await taskApi.deleteTask(taskId);
      message.success('Xóa task thành công');
      await loadTasks();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa task');
      console.error('Error deleting task:', error);
    }
  };

  // Handle start task
  const handleStartTask = async (taskId) => {
    try {
      await taskApi.startTask(taskId);
      message.success('Bắt đầu task thành công');
      await loadTasks();
    } catch (error) {
      message.error('Có lỗi xảy ra khi bắt đầu task');
      console.error('Error starting task:', error);
    }
  };

  // Handle end task
  const handleEndTask = async (taskId) => {
    try {
      await taskApi.endTask(taskId, 'Task completed');
      message.success('Kết thúc task thành công');
      await loadTasks();
    } catch (error) {
      message.error('Có lỗi xảy ra khi kết thúc task');
      console.error('Error ending task:', error);
    }
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
  switch (status) {
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

  // Check if task is overdue
  const isOverdue = (deadline, status) => {
    if (status === 'done' || status === 'checked') return false;
    return new Date(deadline) < new Date();
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u.USER_ID === userId || u.id === userId);
    return user ? user.USERNAME || user.fullName : 'N/A';
  };

  // Table columns
  const columns = [
    {
      title: 'Tên task',
      dataIndex: 'name',
      key: 'name',
      width: 150,
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
      ellipsis: true,
      width: 150
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
      title: 'Người thực hiện',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 120,
      render: (userId) => (
        <Space size={4}>
          <UserOutlined />
          {getUserName(userId)}
        </Space>
      )
    },
    {
      title: 'Người hỗ trợ',
      dataIndex: 'supporterId',
      key: 'supporterId',
      width: 120,
      render: (userId) => userId ? getUserName(userId) : '-'
    },
    {
      title: 'Người kiểm tra',
      dataIndex: 'checkerId',
      key: 'checkerId',
      width: 120,
      render: (userId) => userId ? getUserName(userId) : '-'
    },
    {
      title: 'Hạn chót',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
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
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
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
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng số tasks"
                value={tasks.length}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Chờ thực hiện"
                value={tasks.filter(t => t.status === 'PENDING').length}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đang thực hiện"
                value={tasks.filter(t => t.status === 'IN_PROGRESS').length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
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
            scroll={{ x: 1200 }}
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
                      <Option key={user.USER_ID} value={user.USER_ID}>
                        {user.USERNAME}
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
                      <Option key={user.USER_ID} value={user.USER_ID}>
                        {user.USERNAME}
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
                      <Option key={user.USER_ID} value={user.USER_ID}>
                        {user.USERNAME}
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