import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, Space } from 'antd';
import MainLayout from '../components/layout/MainLayout';
import { Toaster, toast } from 'sonner';
import {
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { fetchMaterialDecideList, fetchMaterialDecideCustomerList, createMaterialDecide, updateMaterialDecide, deleteMaterialDecide } from '../utils/decide-board';
import { useNavigate } from 'react-router-dom';

const DecideBoard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const navigate = useNavigate();

  // Lấy danh sách customer code cho gợi ý
  useEffect(() => {
    const fetchCustomers = async () => {
      console.log('Fetching customers...');
      try {
        const customers = await fetchMaterialDecideCustomerList();
        console.log('Raw customers received:', customers?.length || 0);

        const processedOptions = (Array.isArray(customers) ? customers : [])
          .map(item => {
            // Trim và normalize dữ liệu
            const trimmed = (item.customer_part_number || '').trim();
            return trimmed;
          })
          .filter(value => value.length > 0) // Loại bỏ empty strings
          .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
          .sort() // Sort alphabetically
          .map(value => ({
            value: value,
            label: value
          }));

        console.log('Processed customer options:', processedOptions.length);
        setCustomerOptions(processedOptions);

      } catch (err) {
        console.error('Error fetching customers:', err);
        setCustomerOptions([]);
      }
    };
    fetchCustomers();
  }, []);
  // Lấy toàn bộ dữ liệu bảng
  const fetchData = async () => {
    setLoading(true);
    try {
      const list = await fetchMaterialDecideList();
      setData(list);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "CUSTOMER_CODE",
      rowSpan: 2,
      align: "center",
      render: (value, record) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => navigate(`/decide-board/${record.id !== undefined ? record.id : record.ID}`)}
        >
          {value}
        </Button>
      )
    },
    {
      title: "Loại bo",
      dataIndex: "TYPE_BOARD",
      align: "center"
    },
    {
      title: "Bo Thường",
      children: [
        {
          title: "Kích thước Tối ưu",
          dataIndex: "SIZE_NORMAL",
          align: "center"
        },
        {
          title: "Tỷ lệ %",
          dataIndex: "RATE_NORMAL",
          align: "center"
        }
      ]
    },
    {
      title: "Bo To",
      children: [
        {
          title: "Kích thước bo to",
          dataIndex: "SIZE_BIG",
          align: "center"
        },
        {
          title: "Tỷ lệ %",
          dataIndex: "RATE_BIG",
          align: "center"
        }
      ]
    },
    {
      title: "Yêu cầu sử dụng bo to",
      dataIndex: "REQUEST",
      align: "center",
      render: (value) => value === 'TRUE' ? 'Có' : value === 'FALSE' ? 'Không' : ''
    },
    {
      title: "Trạng thái",
      dataIndex: "STATUS",
      align: "center",
      render: (_, record) => record.CONFIRM_BY ? <span style={{ color: '#52c41a' }}>Đã xác nhận</span> : <span style={{ color: '#faad14' }}>Chưa xác nhận</span>
    },
    {
      title: "Người Xác nhận",
      dataIndex: "CONFIRM_BY",
      align: "center"
    },
    {
      title: "Note",
      dataIndex: "NOTE",
      align: "center"
    },
    {
      title: "Hành động",
      key: "edit_action",
      align: "center",
      render: (_, record) => (
        <>
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              handleEdit(record);
            }}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa mã hàng này?"
            onConfirm={() => handleDelete(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          </Space>
        </>
      )
    }
  ];


  const handleEdit = (record) => {
    setEditingRecord(record);
    // Điền sẵn dữ liệu vào form sửa
    editForm.setFieldsValue({
      customer_part_number: record.CUSTOMER_CODE || '',
      type_board: record.TYPE_BOARD || '',
      size_normal: record.SIZE_NORMAL || '',
      rate_normal: record.RATE_NORMAL || '',
      size_big: record.SIZE_BIG || '',
      rate_big: record.RATE_BIG || '',
      note: record.NOTE || ''
    });
    setEditModalVisible(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      const rowId = editingRecord.id !== undefined ? editingRecord.id : editingRecord.ID;
      await updateMaterialDecide(rowId, {
        customer_code: (values.customer_part_number || '').trim(),
        type_board: (values.type_board || '').trim(),
        size_normal: (values.size_normal || '').trim(),
        rate_normal: (values.rate_normal || '').trim(),
        size_big: (values.size_big || '').trim(),
        rate_big: (values.rate_big || '').trim(),
        note: (values.note || '').trim()
      });
      toast.success('Cập nhật thành công!');
      setEditModalVisible(false);
      setEditingRecord(null);
      fetchData();
    } catch (err) {
      toast.error('Lỗi cập nhật!');
    }
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditingRecord(null);
  };

  const handleDelete = async (record) => {
    const rowId = record.id !== undefined ? record.id : record.ID;
    try {
      await deleteMaterialDecide(rowId);
      toast.success('Xóa thành công!');
      fetchData();
    } catch (err) {
      toast.error('Lỗi xóa!');
    }
  };

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h1>Board Large Size</h1>
          <Button
            type="primary"
            onClick={() => setModalVisible(true)}
          >
            Thêm mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          size="middle"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} bản ghi`
          }}
          rowClassName={(record) => {
            if (record.STATUS === 'Pending') return 'row-pending';
            if (record.STATUS === 'Cancel') return 'row-cancel';
            return '';
          }}
        />
        <Modal
          title="Tạo mới"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={() => {
            form
              .validateFields()
              .then(async (values) => {
                // Đảm bảo tất cả trường đều có giá trị, loại bỏ undefined
                const cleanValues = {
                  customer_part_number: (values.customer_part_number || '').trim(),
                  type_board: (values.type_board || '').trim(),
                  size_normal: (values.size_normal || '').trim(),
                  rate_normal: (values.rate_normal || '').trim(),
                  size_big: (values.size_big || '').trim(),
                  rate_big: (values.rate_big || '').trim(),
                  request: 'FALSE',
                  confirm_by: '',
                  note: (values.note || '').trim(),
                };
                await createMaterialDecide(cleanValues);
                toast.success('Tạo mới thành công');
                setModalVisible(false);
                form.resetFields();
                fetchData();
              })
              .catch(() => { });
          }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="customer_part_number"
              label="Mã sản phẩm"
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <Select
                showSearch
                options={customerOptions}
                placeholder="Chọn hoặc nhập mã sản phẩm"
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.value ?? '').toString().toLowerCase().includes((input ?? '').toString().toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item name="type_board" label="Loại bo" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="size_normal" label="Kích thước Tối ưu">
              <Input />
            </Form.Item>
            <Form.Item name="rate_normal" label="Tỷ lệ % (Bo thường)">
              <Input />
            </Form.Item>
            <Form.Item name="size_big" label="Kích thước bo to">
              <Input />
            </Form.Item>
            <Form.Item name="rate_big" label="Tỷ lệ % (Bo to)">
              <Input />
            </Form.Item>
            <Form.Item name="note" label="Note">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Sửa thông tin"
          open={editModalVisible}
          onOk={handleEditOk}
          onCancel={handleEditCancel}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Form form={editForm} layout="vertical">
            <Form.Item
              name="customer_part_number"
              label="Mã sản phẩm"
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <Select
                showSearch
                options={customerOptions}
                placeholder="Chọn hoặc nhập mã sản phẩm"
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.value ?? '').toString().toLowerCase().includes((input ?? '').toString().toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item name="type_board" label="Loại bo" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="size_normal" label="Kích thước Tối ưu">
              <Input />
            </Form.Item>
            <Form.Item name="rate_normal" label="Tỷ lệ % (Bo thường)">
              <Input />
            </Form.Item>
            <Form.Item name="size_big" label="Kích thước bo to">
              <Input />
            </Form.Item>
            <Form.Item name="rate_big" label="Tỷ lệ % (Bo to)">
              <Input />
            </Form.Item>
            <Form.Item name="note" label="Note">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};


export default DecideBoard;