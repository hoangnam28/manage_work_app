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
  Tooltip,
  Alert,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { taskApi } from '../utils/task-api';
import { projectApi } from '../utils/project-api';
import { fetchUsersList } from '../utils/user-api';
import { settingApi } from '../utils/setting-api';

import moment from 'moment';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TaskList = () => {
  const { businessId, projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [taskTemplates, setTaskTemplates] = useState([]);
  const [selectedTaskTemplates, setSelectedTaskTemplates] = useState({});

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskApi.getTasksByProject(projectId);
      const formattedTasks = (data || []).map(task => ({
        id: task.ID,
        name: task.NAME,
        description: task.DESCRIPTION,
        status: task.STATUS,
        assignedTo: task.ASSIGNED_TO,
        supporterId: task.SUPPORTER_ID,
        checkerId: task.CHECKER_ID,
        deadline: task.DEADLINE,
        ...task
      }));

      setTasks(formattedTasks);
      setFilteredTasks(formattedTasks);
    } catch (error) {
      message.error('Lỗi khi tải danh sách task');
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === statusFilter));
    }
  }, [statusFilter, tasks]);

  const loadProject = useCallback(async () => {
    try {
      if (projectId) {
        const data = await projectApi.getProjectById(projectId);
        setProject(data);
      }
    } catch (error) {
      message.error('Lỗi khi tải thông tin dự án');
      console.error('Error loading project:', error);
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



  const loadTaskTemplates = useCallback(async () => {
    try {

      const projectResult = await projectApi.getProjectById(projectId);
      console.log('✅ projectResult:', projectResult);

      const projectTemplateId = projectResult?.projectTemplateId;

      if (!projectTemplateId) {
        console.warn('⚠️ Project chưa gắn project_template_id, không thể load task templates.');
        setTaskTemplates([]);
        return;
      }

      const taskResult = await settingApi.getTaskTemplates(projectTemplateId);
      console.log('✅ Loaded task templates:', taskResult.data);
      setTaskTemplates(taskResult.data || []);

    } catch (error) {
      console.error('❌ Error loading task templates:', error);
      setTaskTemplates([]);
    } 
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadTasks();
      loadUsers();
    }
  }, [projectId, loadProject, loadTasks, loadUsers]);

  useEffect(() => {
    if (modalVisible && !editingTask) {
      loadTaskTemplates();
      loadUsers(); // ✅ thêm lại dòng này
    }
  }, [modalVisible, editingTask, loadTaskTemplates, loadUsers]);


  // Handle task template selection - cho phép chọn nhiều templates
  const handleTemplateUserChange = (templateId, field, value) => {
    setSelectedTaskTemplates(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [field]: value
      }
    }));
  };

  // Tạo tasks từ selected templates
  const handleCreateTasksFromTemplates = async () => {
    try {
      const tasksToCreate = [];

      // Lấy deadline từ form nếu có
      const deadline = form.getFieldValue('deadline');
      const deadlineStr = deadline ? deadline.format('YYYY-MM-DD HH:mm:ss') : null;

      for (const [templateId, users] of Object.entries(selectedTaskTemplates)) {
        const template = taskTemplates.find(t => t.ID === parseInt(templateId));
        if (template && users.assignedTo) {
          // Tính deadline dựa trên estimated duration nếu không có deadline chung
          let taskDeadline = deadlineStr;
          if (!taskDeadline && template.ESTIMATED_DURATION) {
            taskDeadline = moment().add(template.ESTIMATED_DURATION, 'hours').format('YYYY-MM-DD HH:mm:ss');
          }

          tasksToCreate.push({
            name: template.NAME,
            description: template.DESCRIPTION || '',
            assigned_to: users.assignedTo,
            supporter_id: users.supporterId || null,
            checker_id: users.checkerId || null,
            deadline: taskDeadline,
            project_id: projectId
          });
        }
      }

      if (tasksToCreate.length === 0) {
        message.warning('Vui lòng chọn ít nhất một template và người thực hiện');
        return;
      }

      // Tạo tất cả tasks
      for (const taskData of tasksToCreate) {
        await taskApi.createTask(taskData);
      }

      message.success(`Đã tạo ${tasksToCreate.length} task thành công`);
      handleModalCancel();
      await loadTasks();
    } catch (error) {
      message.error('Có lỗi xảy ra khi tạo tasks');
      console.error('Error creating tasks:', error);
    }
  };

  // Handle manual task creation
  const handleManualSubmit = async (values) => {
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

      await taskApi.createTask(taskData);
      message.success('Tạo task thành công');
      handleModalCancel();
      await loadTasks();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo task');
      console.error('Error creating task:', error);
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const config = {
      'HIGH': { color: 'red', icon: <FireOutlined />, text: 'Cao' },
      'MEDIUM': { color: 'orange', icon: <ClockCircleOutlined />, text: 'Trung bình' },
      'LOW': { color: 'green', icon: <CheckCircleOutlined />, text: 'Thấp' }
    };
    return config[priority] || config['MEDIUM'];
  };

  // Handle update task (chỉ dùng khi edit)
  const handleUpdateTask = async (values) => {
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

      await taskApi.updateTask(editingTask.ID || editingTask.id, taskData);
      message.success('Cập nhật task thành công');

      handleModalCancel();
      await loadTasks();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật task');
      console.error('Error updating task:', error);
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

  // Handle modal cancel
  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingTask(null);
    setSelectedTaskTemplates({});
    form.resetFields();
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

  const isOverdue = (deadline, status) => {
    if (status === 'done' || status === 'checked') return false;
    return new Date(deadline) < new Date();
  };

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
      title: 'Kỳ Hạn',
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
                        setSelectedTaskTemplates({});
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
                value={tasks.filter(t => t.status === 'pending').length}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đang thực hiện"
                value={tasks.filter(t => t.status === 'in_progress').length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Hoàn thành"
                value={tasks.filter(t => t.status === 'done').length}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Card>
          <div style={{ marginBottom: 16 }}>
            <Space>
              <span>Lọc theo trạng thái:</span>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 200 }}
              >
                <Option value="all">Tất cả</Option>
                <Option value="pending">Chờ thực hiện</Option>
                <Option value="in_progress">Đang thực hiện</Option>
                <Option value="done">Hoàn thành</Option>
                <Option value="checked">Đã kiểm tra</Option>
              </Select>
              <span style={{ color: '#8c8c8c' }}>
                Hiển thị: {filteredTasks.length} / {tasks.length} tasks
              </span>
            </Space>
          </div>
          <Table
            columns={columns}
            dataSource={filteredTasks}
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
          title={
            <Space>
              {editingTask ? 'Cập nhật task' : 'Tạo task mới'}
              {!editingTask && taskTemplates.length > 0 && (
                <Tag color="purple" icon={<ThunderboltOutlined />}>
                  Có {taskTemplates.length} task template
                </Tag>
              )}
            </Space>
          }
          open={modalVisible}
          onCancel={handleModalCancel}
          footer={null}
          width={1000}
        >
          {editingTask ? (
            // Form edit task
            <Form form={form} layout="vertical" onFinish={handleUpdateTask}>
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
                    label="Kỳ Hạn"
                    rules={[{ required: true, message: 'Vui lòng chọn kỳ hạn' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="Chọn kỳ hạn"
                      showTime
                      format="DD/MM/YYYY HH:mm"
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
                <TextArea rows={4} placeholder="Nhập mô tả chi tiết về task" />
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
                    <Select
                      placeholder="Chọn người thực hiện"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
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
                    <Select
                      placeholder="Chọn người hỗ trợ"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
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
                    <Select
                      placeholder="Chọn người kiểm tra"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
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
                  <Button onClick={handleModalCancel}>Hủy</Button>
                  <Button type="primary" htmlType="submit">Cập nhật</Button>
                </Space>
              </Form.Item>
            </Form>
          ) : (
            <Tabs
              defaultActiveKey={taskTemplates.length > 0 ? "template" : "manual"}
              items={[
                {
                  key: 'template',
                  label: (
                    <Space>
                      <ThunderboltOutlined />
                      <span>Từ Template ({taskTemplates.length})</span>
                    </Space>
                  ),
                  disabled: taskTemplates.length === 0,
                  children: (
                    <div>
                      {taskTemplates.length > 0 ? (
                        <>
                          <Alert
                            message="Chọn Task Templates và gán người thực hiện"
                            description={`Chọn các task template có sẵn và gán người làm, người hỗ trợ, người kiểm tra cho mỗi template. Có thể tạo nhiều tasks cùng lúc.`}
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                          />

                          <Form.Item
                            label="Deadline chung (tùy chọn - sẽ dùng cho tất cả tasks)"
                            style={{ marginBottom: 16 }}
                          >
                            <DatePicker
                              style={{ width: '100%' }}
                              placeholder="Chọn deadline chung (hoặc để trống để tự tính)"
                              showTime
                              format="DD/MM/YYYY HH:mm"
                              onChange={(date) => form.setFieldValue('deadline', date)}
                            />
                          </Form.Item>

                          <Table
                            dataSource={taskTemplates}
                            rowKey="ID"
                            pagination={false}
                            size="small"
                            scroll={{ y: 400 }}
                            columns={[
                              {
                                title: 'Tên Task',
                                dataIndex: 'NAME',
                                key: 'name',
                                width: 200,
                                render: (text, record) => {
                                  const priorityInfo = getPriorityBadge(record.PRIORITY);
                                  return (
                                    <div>
                                      <div><strong>{text}</strong></div>
                                      {record.ESTIMATED_DURATION && (
                                        <Tag color="cyan" style={{ marginTop: 4 }}>
                                          <ClockCircleOutlined /> {record.ESTIMATED_DURATION}h
                                        </Tag>
                                      )}
                                      {record.PRIORITY && (
                                        <Tag color={priorityInfo.color} icon={priorityInfo.icon} style={{ marginTop: 4 }}>
                                          {priorityInfo.text}
                                        </Tag>
                                      )}
                                    </div>
                                  );
                                }
                              },
                              {
                                title: 'Mô tả',
                                dataIndex: 'DESCRIPTION',
                                key: 'description',
                                ellipsis: true,
                                width: 200
                              },
                              {
                                title: 'Người thực hiện *',
                                key: 'assignedTo',
                                width: 180,
                                render: (_, record) => (
                                  <Select
                                    placeholder="Chọn người làm"
                                    style={{ width: '100%' }}
                                    value={selectedTaskTemplates[record.ID]?.assignedTo}
                                    onChange={(value) => handleTemplateUserChange(record.ID, 'assignedTo', value)}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      option?.children?.toLowerCase().includes(input.toLowerCase())
                                    }
                                  >
                                    {users.map(user => (
                                      <Option key={user.USER_ID} value={user.USER_ID}>
                                        {user.USERNAME}
                                      </Option>
                                    ))}
                                  </Select>
                                )
                              },
                              {
                                title: 'Người hỗ trợ',
                                key: 'supporterId',
                                width: 180,
                                render: (_, record) => (
                                  <Select
                                    placeholder="Chọn người hỗ trợ"
                                    style={{ width: '100%' }}
                                    allowClear
                                    value={selectedTaskTemplates[record.ID]?.supporterId}
                                    onChange={(value) => handleTemplateUserChange(record.ID, 'supporterId', value)}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      option?.children?.toLowerCase().includes(input.toLowerCase())
                                    }
                                  >
                                    {users.map(user => (
                                      <Option key={user.USER_ID} value={user.USER_ID}>
                                        {user.USERNAME}
                                      </Option>
                                    ))}
                                  </Select>
                                )
                              },
                              {
                                title: 'Người kiểm tra',
                                key: 'checkerId',
                                width: 180,
                                render: (_, record) => (
                                  <Select
                                    placeholder="Chọn người kiểm tra"
                                    style={{ width: '100%' }}
                                    allowClear
                                    value={selectedTaskTemplates[record.ID]?.checkerId}
                                    onChange={(value) => handleTemplateUserChange(record.ID, 'checkerId', value)}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      option?.children?.toLowerCase().includes(input.toLowerCase())
                                    }
                                  >
                                    {users.map(user => (
                                      <Option key={user.USER_ID} value={user.USER_ID}>
                                        {user.USERNAME}
                                      </Option>
                                    ))}
                                  </Select>
                                )
                              }
                            ]}
                          />
                          <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <Space>
                              <Button onClick={handleModalCancel}>Hủy</Button>
                              <Button
                                type="primary"
                                onClick={handleCreateTasksFromTemplates}
                                icon={<PlusOutlined />}
                              >
                                Tạo Tasks
                              </Button>
                            </Space>
                          </div>
                        </>
                      ) : (
                        <Alert
                          message="Chưa có Task Template"
                          description="Vui lòng tạo task template trong Settings hoặc chuyển sang tab 'Tạo thủ công'."
                          type="warning"
                          showIcon
                        />
                      )}
                    </div>
                  )
                },
                {
                  key: 'manual',
                  label: (
                    <Space>
                      <EditOutlined />
                      <span>Tạo thủ công</span>
                    </Space>
                  ),
                  children: (
                    <Form form={form} layout="vertical" onFinish={handleManualSubmit}>
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
                            label="Kỳ Hạn"
                            rules={[{ required: true, message: 'Vui lòng chọn kỳ hạn' }]}
                          >
                            <DatePicker
                              style={{ width: '100%' }}
                              placeholder="Chọn kỳ hạn"
                              showTime
                              format="DD/MM/YYYY HH:mm"
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
                        <TextArea rows={4} placeholder="Nhập mô tả chi tiết về task" />
                      </Form.Item>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            name="assignedTo"
                            label="Người thực hiện"
                            rules={[{ required: true, message: 'Vui lòng chọn người thực hiện' }]}
                          >
                            <Select
                              placeholder="Chọn người thực hiện"
                              showSearch
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option?.children?.toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {users.map(user => (
                                <Option key={user.USER_ID} value={user.USER_ID}>
                                  {user.USERNAME}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="supporterId" label="Người hỗ trợ">
                            <Select
                              placeholder="Chọn người hỗ trợ"
                              allowClear
                              showSearch
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option?.children?.toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {users.map(user => (
                                <Option key={user.USER_ID} value={user.USER_ID}>
                                  {user.USERNAME}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="checkerId" label="Người kiểm tra">
                            <Select
                              placeholder="Chọn người kiểm tra"
                              allowClear
                              showSearch
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option?.children?.toLowerCase().includes(input.toLowerCase())
                              }
                            >
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
                          <Button onClick={handleModalCancel}>Hủy</Button>
                          <Button type="primary" htmlType="submit">Tạo mới</Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  )
                }
              ]}
            />
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default TaskList;