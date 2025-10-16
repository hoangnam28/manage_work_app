import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { businessApi } from '../utils/business-api';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const { Title } = Typography;
const { TextArea } = Input;

const BussinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Load businesses
  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await businessApi.getBusinesses();
      setBusinesses(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách nghiệp vụ');
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  // Handle create/update business
  const handleSubmit = async (values) => {
    try {
      if (editingBusiness) {
        await businessApi.updateBusiness(editingBusiness.id, values);
        message.success('Cập nhật nghiệp vụ thành công');
      } else {
        await businessApi.createBusiness(values);
        message.success('Tạo nghiệp vụ thành công');
      }
      
      setModalVisible(false);
      setEditingBusiness(null);
      form.resetFields();
      loadBusinesses();
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu nghiệp vụ');
      console.error('Error saving business:', error);
    }
  };

  // Handle edit business
  const handleEdit = (business) => {
    setEditingBusiness(business);
    form.setFieldsValue({
      name: business.name,
      description: business.description
    });
    setModalVisible(true);
  };

  // Handle delete business
  const handleDelete = async (businessId) => {
    try {
      await businessApi.deleteBusiness(businessId);
      message.success('Xóa nghiệp vụ thành công');
      loadBusinesses();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa nghiệp vụ');
      console.error('Error deleting business:', error);
    }
  };

  // Handle view projects
  const handleViewProjects = (businessId) => {
    navigate(`/business/${businessId}/projects`);
  };

  // Table columns
  const columns = [
    {
      title: 'Tên nghiệp vụ',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Người tạo',
      dataIndex: 'creatorName',
      key: 'creatorName'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewProjects(record.id)}
          >
            Dự án
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa nghiệp vụ này?"
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
                  <ProjectOutlined style={{ marginRight: '8px' }} />
                  Quản lý Nghiệp vụ
                </Title>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingBusiness(null);
                    form.resetFields();
                    setModalVisible(true);
                  }}
                >
                  Tạo nghiệp vụ mới
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số nghiệp vụ"
              value={businesses.length}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Nghiệp vụ hoạt động"
              value={businesses.length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng dự án"
              value={0}
              suffix="dự án"
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={businesses}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nghiệp vụ`
          }}
        />
      </Card>

      <Modal
        title={editingBusiness ? 'Cập nhật nghiệp vụ' : 'Tạo nghiệp vụ mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingBusiness(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên nghiệp vụ"
            rules={[
              { required: true, message: 'Vui lòng nhập tên nghiệp vụ' },
              { min: 3, message: 'Tên nghiệp vụ phải có ít nhất 3 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên nghiệp vụ" />
          </Form.Item>

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
              placeholder="Nhập mô tả chi tiết về nghiệp vụ"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingBusiness ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </MainLayout>
  );
};

export default BussinessList;
