
import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select } from 'antd';
import MainLayout from '../components/layout/MainLayout';
import { Toaster, toast } from 'sonner';
import { fetchMaterialDecideList, fetchMaterialDecideCustomerList, createMaterialDecide } from '../utils/decide-board';

const DecideBoard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Lấy danh sách customer code cho gợi ý
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customers = await fetchMaterialDecideCustomerList();
        setCustomerOptions(customers.map(item => ({
          value: item.customer_part_number,
          label: item.customer_part_number
        })));
      } catch (err) {
        setCustomerOptions([]);
      }
    };
    fetchCustomers();
  }, []);

  // Lấy toàn bộ dữ liệu bảng
  useEffect(() => {
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
    fetchData();
  }, []);

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "customer_code",
      rowSpan: 2,
      align: "center"
    },
    {
      title: "Loại bo",
      dataIndex: "type_board",
      align: "center"
    },
    {
      title: "Bo Thường",
      children: [
        {
          title: "Kích thước Tối ưu",
          dataIndex: "size_normal",
          align: "center"
        },
        {
          title: "Tỷ lệ %",
          dataIndex: "rate_normal",
          align: "center"
        }
      ]
    },
    {
      title: "Bo To",
      children: [
        {
          title: "Kích thước bo to",
          dataIndex: "size_big",
          align: "center"
        },
        {
          title: "Tỷ lệ %",
          dataIndex: "rate_big",
          align: "center"
        }
      ]
    },
    {
      title: "Bộ phận PC",
      children: [
        {
          title: "Yêu cầu sử dụng bo to",
          dataIndex: "request",
          align: "center"
        },
        {
          title: "Xác nhận",
          dataIndex: "confirm_by",
          align: "center"
        }
      ]
    },
    {
      title: "Note",
      dataIndex: "note",
      align: "center"
    }
  ];
  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h1>Decide Using Board</h1>
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
                await fetch(createMaterialDecide, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(values)
                });
                toast.success('Tạo mới thành công');
                setModalVisible(false);
                form.resetFields();
                // reload data
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
            <Form.Item name="request" label="Yêu cầu sử dụng bo to">
              <Select>
                <Select.Option value="Có">Có</Select.Option>
                <Select.Option value="Không">Không</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="confirm_by" label="Xác nhận">
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