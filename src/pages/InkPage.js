import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Typography
} from 'antd';
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { fetchInkList, createInkRequest, approveInkRequest } from '../utils/ink-management-api';
import MainLayout from '../components/layout/MainLayout';

const { Title } = Typography;
const { Option } = Select;

const InkPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchInkList();
      setData(response.data || []);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveInkRequest(id);
      message.success('Phê duyệt yêu cầu thành công');
      fetchData();
    } catch (error) {
      message.error('Lỗi khi phê duyệt yêu cầu: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      await createInkRequest(values);
      message.success('Tạo yêu cầu thành công');
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Lỗi khi tạo yêu cầu: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Màu mực',
      dataIndex: 'COLOR',
      key: 'color',
    },
    {
      title: 'Phương pháp',
      dataIndex: 'METHOD',
      key: 'method',
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'VENDOR',
      key: 'vendor',
    },
    {
      title: 'Người tạo',
      dataIndex: 'CREATED_BY',
      key: 'created_by',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'CREATED_AT',
      key: 'created_at',
    },
    {
      title: 'Cập nhật bởi',
      dataIndex: 'UPDATED_BY',
      key: 'updated_by',
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'UPDATED_AT',
      key: 'updated_at',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record.ID)}
            style={{ backgroundColor: '#52c41a' }}
          >
            Approve
          </Button>
        </Space>
      )
    }
  ];

  return (
    <MainLayout>
    <div style={{ padding: '24px' }}>
      <Card>
        <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
          <Title level={3}>Quản lý yêu cầu màu mực</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Tạo yêu cầu mới
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="ID"
          scroll={{ x: 'max-content' }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
          }}
        />

        <Modal
          title="Tạo yêu cầu màu mực mới"
          open={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="color"
              label="Màu mực"
              rules={[{ required: true, message: 'Vui lòng nhập màu mực' }]}
            >
              <Input placeholder="Nhập màu mực" />
            </Form.Item>

            <Form.Item
              name="method"
              label="Phương pháp"
              rules={[{ required: true, message: 'Vui lòng chọn phương pháp' }]}
            >
              <Select placeholder="Chọn phương pháp">
                <Option value="Screen">Screen</Option>
                <Option value="Resin Plug">Resin Plug</Option>
                <Option value="Soldermask Plug">Soldermask Plug</Option>
                <Option value="Flat Press">Flat Press</Option>
                <Option value="Spray">Spray</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="vendor"
              label="Nhà cung cấp"
              rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
            >
              <Select placeholder="Chọn nhà cung cấp">
                <Option value="GOO_AMC">GOO_AMC</Option>
                <Option value="Onstatic">Onstatic</Option>
                <Option value="Taiyo">Taiyo</Option>
                <Option value="Huntsman">Huntsman</Option>
                <Option value="Sunchemical">Sunchemical</Option>
                <Option value="Taiwan">Taiwan</Option>
                <Option value="Sanei">Sanei</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
    </MainLayout>
  );
};

export default InkPage;
