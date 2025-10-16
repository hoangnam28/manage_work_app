import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select, 
  Space,
  Typography,
  Tag,
  Popconfirm,
  Tooltip
} from 'antd';
import { PlusOutlined, CheckCircleOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { fetchInkList, createInkRequest, approveInkRequest, updateInkRequest, deleteInkRequest } from '../utils/ink-management-api';
import MainLayout from '../components/layout/MainLayout';
import { toast, Toaster } from 'sonner';
import ExcelJS from 'exceljs';

const { Title } = Typography;
const { Option } = Select;

const InkPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      type: record.TYPE,
      color: record.COLOR,
      color_name: record.COLOR_NAME,
      method: record.METHOD,
      vendor: record.VENDOR
    });
    setModalVisible(true);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchInkList();
      console.log('Response from API:', response.data);
      setData(response.data || []);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu: ' + error.message);
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
      toast.success('Cập nhật thành công');
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi phê duyệt yêu cầu: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await updateInkRequest(editingRecord.ID, values);
        toast.success('Cập nhật yêu cầu thành công');
      } else {
        await createInkRequest(values);
        toast.success('Tạo yêu cầu thành công');
      }
      setModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      toast.error(editingRecord ? 'Lỗi khi cập nhật yêu cầu: ' : 'Lỗi khi tạo yêu cầu: ' + error.message);
    }
  };
  const handleDelete = async (id) => {
    try {
      await deleteInkRequest(id);
      toast.success('Xóa yêu cầu thành công');
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi xóa yêu cầu: ' + error.message);
    }
  };

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Ink Requests');

      // Định nghĩa cột
      worksheet.columns = [
        { header: 'STT', key: 'index', width: 5 },
        { header: 'Loại mực', key: 'type', width: 20 },
        { header: 'Màu mực', key: 'color', width: 20 },
        { header: 'Tên mực', key: 'color_name', width: 20 },
        { header: 'Method', key: 'method', width: 15 },
        { header: 'Vendor', key: 'vendor', width: 15 },
        { header: 'Người tạo', key: 'created_by', width: 20 },
        { header: 'Ngày tạo', key: 'created_at', width: 20 },
        { header: 'Trạng thái', key: 'status', width: 15 }
      ];

      // Format header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // Thêm dữ liệu
      const rows = data.map((item, index) => ({
        index: index + 1,
        type: item.TYPE === 'SOLDERMASK_INK' ? 'SOLDERMASK_INK' : 
              item.TYPE === 'SILKSCREEN_INK' ? 'SILKSCREEN_INK' : 
              item.TYPE === 'SR_PLUG_INK' ? 'SR_PLUG_INKs' : item.TYPE,
        color: item.COLOR,
        color_name: item.COLOR_NAME,
        method: item.METHOD,
        vendor: item.VENDOR,
        created_by: item.CREATED_BY,
        created_at: item.CREATED_AT,
        status: item.STATUS === 'PENDING' ? 'Đang xử lý' : 'Đã cập nhật'
      }));

      worksheet.addRows(rows);

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.alignment = { vertical: 'middle', horizontal: 'left' };
      });

      // Tạo file Excel và download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Danh sách mực ${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      toast.error('Lỗi khi xuất file Excel: ' + error.message);
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
      title: 'Loại mực',
      dataIndex: 'TYPE',
      key: 'type',
      render: (type) => {
        switch (type) {
          case 'SOLDERMASK_INK':
            return 'SOLDERMASK_INK';
          case 'SILKSCREEN_INK':
            return 'SILKSCREEN_INK';
          case 'SR_PLUG_INK':
            return 'SR_PLUG_INK';
          default:
            return type;
        }
      }
    },
    {
      title: 'Màu mực',
      dataIndex: 'COLOR',
      key: 'color',
    },
    {
      title: 'Tên mực',
      dataIndex: 'COLOR_NAME',
      key: 'color_name',
    },
    {
      title: 'METHOD',
      dataIndex: 'METHOD',
      key: 'method',
    },
    {
      title: 'VENDOR',
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
      title: 'Trạng thái',
      dataIndex: 'STATUS',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          PENDING: { color: '#faad14', text: 'Đang xử lý' },
          APPROVED: { color: '#52c41a', text: 'Đã cập nhật' }
        };
        return (
          <Tag color={statusConfig[status]?.color || 'default'}>
            {statusConfig[status]?.text || status}
          </Tag>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.STATUS === 'PENDING' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record.ID)}
              style={{ backgroundColor: '#52c41a' }}
            >
              Approve
            </Button>
          )}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(record.ID)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <MainLayout>
    <div style={{ padding: '24px' }}>
        <Toaster position="top-right" richColors />
      <Card>
        <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
          <Title level={2} style={{ color: '#7593c0ff' }}>Quản lý màu mực</Title>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => window.open('/material_ink.pdf', '_blank', 'noopener,noreferrer')}
            style={{ background: '#1890ff', borderColor: '#1890ff' }}
          >
            Hướng dẫn sử dụng
          </Button>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              Tạo yêu cầu mới
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportExcel}
            >
              Xuất Excel
            </Button>
          </Space>
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
          title={editingRecord ? "Cập nhật yêu cầu màu mực" : "Tạo yêu cầu màu mực mới"}
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
              name="type"
              label="Loại mực"
              rules={[{ required: true, message: 'Vui lòng chọn loại mực' }]}
            >
              <Select placeholder="Chọn loại mực">
                <Option value="SOLDERMASK_INK">SOLDERMASK_INK_</Option>
                <Option value="SILKSCREEN_INK">SILKSCREEN_INK_</Option>
                <Option value="SR_PLUG_INK">SR_PLUG_INK_</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="color"
              label="Màu mực"
              rules={[{ required: true, message: 'Vui lòng chọn màu mực' }]}
            >
               <Select placeholder="Chọn màu mực">
                <Option value="Green">Green</Option>
                <Option value="Red">Red</Option>
                <Option value="Blue">Blue</Option>
                <Option value="Black">Black</Option>
                <Option value="Reseda">Reseda</Option>
                <Option value="White">White</Option>
                <Option value="Red">Red</Option>
                <Option value="Gray">Gray</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="color_name"
              label="Tên mực"
              rules={[{ required: true, message: 'Vui lòng nhập tên mực' }]}
            >
              <Input placeholder="Nhập tên mực" />
            </Form.Item>

            <Form.Item
              name="method"
              label="Method"
              rules={[{ required: true, message: 'Vui lòng chọn Method' }]}
            >
              <Select placeholder="Chọn Method">
                <Option value="Screen">Screen</Option>
                <Option value="Resin Plug">Resin Plug</Option>
                <Option value="Soldermask Plug">Soldermask Plug</Option>
                <Option value="Flat Press">Flat Press</Option>
                <Option value="Spray">Spray</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="vendor"
              label="Vendor"
              rules={[{ required: true, message: 'Vui lòng chọn Vendor' }]}
            >
              <Select placeholder="Chọn Vendor">
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
          <Toaster/>
    </div>

    </MainLayout>
  );
};

export default InkPage;
