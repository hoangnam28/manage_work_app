import { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, Space, AutoComplete } from 'antd';
import MainLayout from '../components/layout/MainLayout';
import { Toaster, toast } from 'sonner';
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined
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
  const [tableFilters, setTableFilters] = useState({});
  const navigate = useNavigate();
  const tableRef = useRef();
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
      // Sắp xếp bản ghi mới nhất lên đầu (ưu tiên id lớn nhất)
      const sorted = Array.isArray(list)
        ? [...list].sort((a, b) => {
          // Ưu tiên trường created_at nếu có, nếu không thì dùng id/ID
          if (a.created_at && b.created_at) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          const ida = a.id !== undefined ? a.id : a.ID;
          const idb = b.id !== undefined ? b.id : b.ID;
          return (idb || 0) - (ida || 0);
        })
        : list;
      setData(sorted);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tạo input filter cho từng cột
  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      return (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Tìm kiếm...`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ marginBottom: 0, display: 'block' }}
            autoFocus
          />
        </div>
      );
    },
    filterIcon: filtered => <span style={{ color: filtered ? '#1890ff' : undefined }}>🔍</span>,
    onFilter: (value, record) =>
      (record[dataIndex] || '').toString().toLowerCase().includes((value || '').toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => { },
    filteredValue: tableFilters[dataIndex] || null,
  });

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "CUSTOMER_CODE",
      rowSpan: 2,
      align: "center",
      ...getColumnSearchProps('CUSTOMER_CODE'),
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
      align: "center",
      ...getColumnSearchProps('TYPE_BOARD'),
    },
    {
      title: "Bo Thường",
      children: [
        {
          title: "Kích thước Tối ưu",
          dataIndex: "SIZE_NORMAL",
          align: "center",
          ...getColumnSearchProps('SIZE_NORMAL'),
        },
        {
          title: "Tỷ lệ %",
          dataIndex: "RATE_NORMAL",
          align: "center",
          ...getColumnSearchProps('RATE_NORMAL'),
        }
      ]
    },
    {
      title: "Bo To",
      children: [
        {
          title: "Kích thước bo to",
          dataIndex: "SIZE_BIG",
          align: "center",
          ...getColumnSearchProps('SIZE_BIG'),
        },
        {
          title: "Tỷ lệ %",
          dataIndex: "RATE_BIG",
          align: "center",
          ...getColumnSearchProps('RATE_BIG'),
        }
      ]
    },
    {
      title: "Bộ phận PC",
      children: [
        {
          title: "Yêu cầu sử dụng bo to",
          dataIndex: "REQUEST",
          align: "center",
          render: (value) => value === 'TRUE' ? 'Có' : value === 'FALSE' ? 'Không' : '',
          ...getColumnSearchProps('REQUEST'),
          onFilter: (value, record) => {
            const v = (value || '').toString().trim().toLowerCase();
            if (["có", "co", "yes", "true", "1"].includes(v)) return (record.REQUEST || '').toUpperCase() === 'TRUE';
            if (["không", "khong", "no", "false", "0"].includes(v)) return (record.REQUEST || '').toUpperCase() === 'FALSE';
            // fallback: so sánh chuỗi hiển thị
            return (record.REQUEST === 'TRUE' ? 'có' : record.REQUEST === 'FALSE' ? 'không' : '').includes(v);
          }
        },
        {
          title: "Trạng thái",
          dataIndex: "STATUS",
          align: "center",
          ...getColumnSearchProps('STATUS'),
          onFilter: (value, record) => (record.CONFIRM_BY ? 'Đã xác nhận' : 'Chưa xác nhận').toLowerCase().includes((value || '').toLowerCase()),
          render: (_, record) => record.CONFIRM_BY ? <span style={{ color: '#52c41a' }}>Đã xác nhận</span> : <span style={{ color: '#faad14' }}>Chưa xác nhận</span>
        },
        {
          title: "Người Xác nhận",
          dataIndex: "CONFIRM_BY",
          align: "center",
          ...getColumnSearchProps('CONFIRM_BY'),
        },
      ],

    },

    {
      title: "Note",
      dataIndex: "NOTE",
      align: "center",
    },
    {
      title: "Hành động",
      key: "edit_action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            disabled={!!record.CONFIRM_BY}
            onClick={() => {
              handleEdit(record);
            }}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa mã hàng này?"
            onConfirm={() => handleDelete(record)}
            okText="Có"
            cancelText="Không"
            disabled={!!record.CONFIRM_BY}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} disabled={!!record.CONFIRM_BY} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Xuất Excel tất cả dữ liệu đang lọc
  const handleExportExcel = () => {
    const exportData = data.map(row => ({
      'Mã sản phẩm': row.CUSTOMER_CODE,
      'Loại bo': row.TYPE_BOARD,
      'Kích thước Tối ưu': row.SIZE_NORMAL,
      'Tỷ lệ % (Bo thường)': row.RATE_NORMAL,
      'Kích thước bo to': row.SIZE_BIG,
      'Tỷ lệ % (Bo to)': row.RATE_BIG,
      'Yêu cầu sử dụng bo to': row.REQUEST === 'TRUE' ? 'Có' : row.REQUEST === 'FALSE' ? 'Không' : '',
      'Trạng thái': row.CONFIRM_BY ? 'Đã xác nhận' : 'Chưa xác nhận',
      'Người xác nhận': row.CONFIRM_BY,
      'Note': row.NOTE
    }));
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'DecideBoard');
      XLSX.writeFile(wb, 'DecideBoardExport.xlsx');
    });
  };

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
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              onClick={() => setModalVisible(true)}
            >
              Thêm mới
            </Button>
            <Button
              type="default"
              onClick={handleExportExcel}
            >
              Xuất Excel
            </Button>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={() => {
                setTableFilters({});
                fetchData();
              }}
            >
              Bỏ lọc
            </Button>
          </div>
        </div>

        <Table
          ref={tableRef}
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
          onChange={(pagination, filters) => {
            setTableFilters(filters);
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
              rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
            >
              <AutoComplete
                options={customerOptions}
                placeholder="Chọn từ danh sách hoặc nhập mã sản phẩm mới"
                filterOption={(inputValue, option) =>
                  option?.label?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                allowClear
                backfill={true}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <div style={{
                      padding: '8px',
                      borderTop: '1px solid #f0f0f0',
                      fontSize: '12px',
                      color: '#666',
                      textAlign: 'center'
                    }}>
                      Bạn có thể chọn từ danh sách hoặc nhập mã mới
                    </div>
                  </div>
                )}
                notFoundContent={
                  <div style={{
                    padding: '8px',
                    textAlign: 'center',
                    color: '#666'
                  }}>
                    Không tìm thấy. Bạn có thể nhập mã sản phẩm mới
                  </div>
                }
              />
            </Form.Item>
            <Form.Item name="type_board" label="Loại bo" rules={[{ required: true, message: 'Vui lòng nhập loại bo' }]}>
              <Input placeholder="Nhập loại bo" />
            </Form.Item>
            <Form.Item name="size_normal" label="Kích thước Tối ưu" rules={[{ required: true, message: 'Vui lòng nhập kích thước tối ưu' }]}>
              <Input placeholder="Nhập kích thước tối ưu" />
            </Form.Item>
            <Form.Item name="rate_normal" label="Tỷ lệ % (Bo thường)" rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ %' }]}>
              <Input placeholder="Nhập tỷ lệ %" />
            </Form.Item>
            <Form.Item name="size_big" label="Kích thước bo to" rules={[{ required: true, message: 'Vui lòng nhập kích thước bo to' }]}>
              <Input placeholder="Nhập kích thước bo to" />
            </Form.Item>
            <Form.Item name="rate_big" label="Tỷ lệ % (Bo to)" rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ %' }]}>
              <Input placeholder="Nhập tỷ lệ %" />
            </Form.Item>
            <Form.Item name="note" label="Note">
              <Input placeholder="Nhập ghi chú (không bắt buộc)" />
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
              rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
            >
              <AutoComplete
                options={customerOptions}
                placeholder="Chọn từ danh sách hoặc nhập mã sản phẩm mới"
                filterOption={(inputValue, option) =>
                  option?.label?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                allowClear
                backfill={true}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <div style={{
                      padding: '8px',
                      borderTop: '1px solid #f0f0f0',
                      fontSize: '12px',
                      color: '#666',
                      textAlign: 'center'
                    }}>
                      Bạn có thể chọn từ danh sách hoặc nhập mã mới
                    </div>
                  </div>
                )}
                notFoundContent={
                  <div style={{
                    padding: '8px',
                    textAlign: 'center',
                    color: '#666'
                  }}>
                    Không tìm thấy. Bạn có thể nhập mã sản phẩm mới
                  </div>
                }
              />
            </Form.Item>
            <Form.Item name="type_board" label="Loại bo" rules={[{ required: true, message: 'Vui lòng nhập loại bo' }]}>
              <Input placeholder="Nhập loại bo" />
            </Form.Item>
            <Form.Item name="size_normal" label="Kích thước Tối ưu">
              <Input placeholder="Nhập kích thước tối ưu" />
            </Form.Item>
            <Form.Item name="rate_normal" label="Tỷ lệ % (Bo thường)">
              <Input placeholder="Nhập tỷ lệ %" />
            </Form.Item>
            <Form.Item name="size_big" label="Kích thước bo to">
              <Input placeholder="Nhập kích thước bo to" />
            </Form.Item>
            <Form.Item name="rate_big" label="Tỷ lệ % (Bo to)">
              <Input placeholder="Nhập tỷ lệ %" />
            </Form.Item>
            <Form.Item name="note" label="Note">
              <Input placeholder="Nhập ghi chú (không bắt buộc)" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default DecideBoard;