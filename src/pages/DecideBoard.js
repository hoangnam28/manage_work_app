import { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, Space, AutoComplete, Alert } from 'antd';
import axios from 'axios';
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
  const [sizeNormalX, setSizeNormalX] = useState('');
  const [sizeNormalY, setSizeNormalY] = useState('');
  const [sizeBigX, setSizeBigX] = useState('');
  const [sizeBigY, setSizeBigY] = useState('');
  const [editSizeNormalX, setEditSizeNormalX] = useState('');
  const [editSizeNormalY, setEditSizeNormalY] = useState('');
  const [editSizeBigX, setEditSizeBigX] = useState('');
  const [editSizeBigY, setEditSizeBigY] = useState('');
  const [tableFilters, setTableFilters] = useState({});
  const [isViewer, setIsViewer] = useState(false);
  const navigate = useNavigate();
  const tableRef = useRef();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!token || !userInfo) {
          setIsViewer(true);
          return;
        }
        const response = await axios.get('http://192.84.105.173:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        let userRoles = response.data.role;
        if (typeof userRoles === 'string') {
          userRoles = userRoles.split(',').map(r => r.trim());
        }
        const onlyViewer = Array.isArray(userRoles) && userRoles.length === 1 && userRoles[0].toLowerCase() === 'viewer';
        setIsViewer(onlyViewer);
      } catch (error) {
        setIsViewer(true);
      }
    };
    fetchUserInfo();
  }, []);
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
    // Tách x/y cho size_normal và rate_normal
    let sizeX = '', sizeY = '';
    let sizeBigX = '', sizeBigY = '';
    if (record.SIZE_NORMAL) {
      const parts = record.SIZE_NORMAL.split('×').map(s => s.trim());
      sizeX = parts[0] || '';
      sizeY = parts[1] || '';
    }
    if (record.SIZE_BIG) {
      const parts = record.SIZE_BIG.split('×').map(s => s.trim());
      sizeBigX = parts[0] || '';
      sizeBigY = parts[1] || '';
    }
    setEditSizeNormalX(sizeX);
    setEditSizeNormalY(sizeY);
    setEditSizeBigX(sizeBigX);
    setEditSizeBigY(sizeBigY);
    // Điền sẵn dữ liệu vào form sửa
    editForm.setFieldsValue({
      customer_part_number: record.CUSTOMER_CODE || '',
      type_board: record.TYPE_BOARD || '',
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
      // Ghép lại chuỗi x × y cho size_normal và size_big
      const size_normal = (editSizeNormalX && editSizeNormalY) ? `${editSizeNormalX} × ${editSizeNormalY}` : (editSizeNormalX || editSizeNormalY);
      const size_big = (editSizeBigX && editSizeBigY) ? `${editSizeBigX} × ${editSizeBigY}` : (editSizeBigX || editSizeBigY);
      await updateMaterialDecide(rowId, {
        customer_code: (values.customer_part_number || '').trim(),
        type_board: (values.type_board || '').trim(),
        size_normal: size_normal.trim(),
        rate_normal: (values.rate_normal || '').trim(),
        size_big: size_big.trim(),
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

  // Làm tròn số và thêm dấu % cho tỷ lệ, cho phép nhập dấu , và .
  const handleRateInput = (setter) => (e) => {
    let raw = e.target.value;
    // Giữ lại số, dấu , và .
    let value = raw.replace(/[^0-9.,]/g, '');
    // Đổi , thành . để parseFloat
    let num = parseFloat(value.replace(',', '.'));
    if (!isNaN(num)) {
      setter(Math.round(num) + '%');
    } else if (value === '') {
      setter('');
    } else {
      setter(value); // Cho phép nhập tiếp
    }
  };

  // Tương tự cho form sửa
  const handleEditRateInput = (setter) => (e) => {
    let raw = e.target.value;
    let value = raw.replace(/[^0-9.,]/g, '');
    let num = parseFloat(value.replace(',', '.'));
    if (!isNaN(num)) {
      setter(Math.round(num) + '%');
    } else if (value === '') {
      setter('');
    } else {
      setter(value);
    }
  };

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h1>Large Size Board</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              onClick={() => setModalVisible(true)}
              disabled={isViewer}
            >
              Thêm mới
            </Button>
            <Button
              type="primary"
              onClick={handleExportExcel}
            >
              Xuất Excel
            </Button>
            <Button
              type="primary"
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

        {isViewer && (
          <Alert
            message="Bạn đang ở chế độ chỉ xem. Chỉ người dùng được ủy quyền mới có thể chỉnh sửa dữ liệu."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Table
          ref={tableRef}
          columns={columns.map(col => {
            // Disable action buttons nếu là viewer
            if (col.key === 'edit_action') {
              return {
                ...col,
                render: (text, record) => (
                  <Space size="middle">
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      disabled={!!record.CONFIRM_BY || isViewer}
                      onClick={() => {
                        handleEdit(record);
                      }}
                    />
                    <Popconfirm
                      title="Bạn có chắc chắn muốn xóa mã hàng này?"
                      onConfirm={() => handleDelete(record)}
                      okText="Có"
                      cancelText="Không"
                      disabled={!!record.CONFIRM_BY || isViewer}
                    >
                      <Button type="primary" danger icon={<DeleteOutlined />} disabled={!!record.CONFIRM_BY || isViewer} />
                    </Popconfirm>
                  </Space>
                )
              };
            }
            return col;
          })}
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
                // Ghép lại chuỗi x × y cho size_normal và size_big
                const size_normal = (sizeNormalX && sizeNormalY) ? `${sizeNormalX} × ${sizeNormalY}` : (sizeNormalX || sizeNormalY);
                const size_big = (sizeBigX && sizeBigY) ? `${sizeBigX} × ${sizeBigY}` : (sizeBigX || sizeBigY);
                // Làm tròn tỷ lệ và thêm %
                const rate_normal = values.rate_normal ? Math.round(Number(values.rate_normal.replace(',', '.').replace('%', ''))) + '%' : '';
                const rate_big = values.rate_big ? Math.round(Number(values.rate_big.replace(',', '.').replace('%', ''))) + '%' : '';
                const cleanValues = {
                  customer_part_number: (values.customer_part_number || '').trim(),
                  type_board: (values.type_board || '').trim(),
                  size_normal: size_normal.trim(),
                  rate_normal: rate_normal,
                  size_big: size_big.trim(),
                  rate_big: rate_big,
                  request: 'FALSE',
                  confirm_by: '',
                  note: (values.note || '').trim(),
                };
                await createMaterialDecide(cleanValues);
                toast.success('Tạo mới thành công');
                setModalVisible(false);
                form.resetFields();
                setSizeNormalX(''); setSizeNormalY('');
                setSizeBigX(''); setSizeBigY('');
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
              <AutoComplete
                options={[
                  { value: 'MLB', label: 'MLB' },
                  { value: 'HDI', label: 'HDI' },
                  { value: 'ANY', label: 'ANY' }
                ]}
                placeholder="Chọn loại bo"
                filterOption={(inputValue, option) =>
                  option?.value?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, marginBottom: 20, background: '#fafbfc' }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: '#1890ff' }}>Bo thường</div>
              <Form.Item name="size_normal" label="Kích thước Tối ưu (Bo thường)" rules={[{ required: true, message: 'Vui lòng nhập kích thước tối ưu(bo thường)' }]} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Input
                    style={{ width: 110, textAlign: 'left' }}
                    placeholder="Chiều dài X"
                    value={sizeNormalX}
                    onChange={e => setSizeNormalX(e.target.value)}
                    type="number"
                  />
                  <span style={{ fontWeight: 'bold', fontSize: 18, lineHeight: 1 }}>×</span>
                  <Input
                    style={{ width: 120, textAlign: 'left' }}
                    placeholder="Chiều ngắn Y"
                    value={sizeNormalY}
                    onChange={e => setSizeNormalY(e.target.value)}
                    type="number"
                  />
                </div>
              </Form.Item>
              <Form.Item name="rate_normal" label="Tỷ lệ % (Bo thường)" rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ %' }]}> 
                <Input
                  placeholder="Nhập tỷ lệ %"
                  onChange={handleRateInput((val) => form.setFieldsValue({ rate_normal: val }))}
                  value={form.getFieldValue('rate_normal')}
                />
              </Form.Item>
            </div>
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, marginBottom: 20, background: '#f6ffed' }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: '#52c41a' }}>Bo to</div>
              <Form.Item name="size_big" label="Kích thước bo to" rules={[{ required: true, message: 'Vui lòng nhập kích thước bo to' }]} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Input
                    style={{ width: 110, textAlign: 'left' }}
                    placeholder="Chiều dài X"
                    value={sizeBigX}
                    onChange={e => setSizeBigX(e.target.value)}
                    type="number"
                  />
                  <span style={{ fontWeight: 'bold', fontSize: 18, lineHeight: 1 }}>×</span>
                  <Input
                    style={{ width: 120, textAlign: 'left' }}
                    placeholder="Chiều ngắn Y"
                    value={sizeBigY}
                    onChange={e => setSizeBigY(e.target.value)}
                    type="number"
                  />
                </div>
              </Form.Item>
              <Form.Item name="rate_big" label="Tỷ lệ % (Bo to)" rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ %' }]}> 
                <Input
                  placeholder="Nhập tỷ lệ %"
                  onChange={handleRateInput((val) => form.setFieldsValue({ rate_big: val }))}
                  value={form.getFieldValue('rate_big')}
                />
              </Form.Item>
            </div>
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
              <AutoComplete
                options={[
                  { value: 'MLB', label: 'MLB' },
                  { value: 'HDI', label: 'HDI' },
                  { value: 'ANY', label: 'ANY' }
                ]}
                placeholder="Chọn loại bo"
                filterOption={(inputValue, option) =>
                  option?.value?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item label="Kích thước Tối ưu (Bo thường)" required style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Input
                  style={{ width: 120, textAlign: 'left' }}
                  placeholder="Chiều dài X"
                  value={editSizeNormalX}
                  onChange={e => setEditSizeNormalX(e.target.value)}
                  type="number"
                />
                <span style={{ fontWeight: 'bold', fontSize: 18, lineHeight: 1 }}>×</span>
                <Input
                  style={{ width: 120, textAlign: 'left' }}
                  placeholder="Chiều ngắn Y"
                  value={editSizeNormalY}
                  onChange={e => setEditSizeNormalY(e.target.value)}
                  type="number"
                />
              </div>
            </Form.Item>
            <Form.Item name="rate_normal" label="Tỷ lệ % (Bo thường)">
              <Input
                placeholder="Nhập tỷ lệ %"
                onChange={handleEditRateInput((val) => editForm.setFieldsValue({ rate_normal: val }))}
                value={editForm.getFieldValue('rate_normal')}
              />
            </Form.Item>
            <Form.Item name="size_big" label="Kích thước bo to" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Input
                  style={{ width: 120, textAlign: 'left' }}
                  placeholder="Chiều dài X"
                  value={editSizeBigX}
                  onChange={e => setEditSizeBigX(e.target.value)}
                  type="number"
                />
                <span style={{ fontWeight: 'bold', fontSize: 18, lineHeight: 1 }}>×</span>
                <Input
                  style={{ width: 120, textAlign: 'left' }}
                  placeholder="Chiều ngắn Y"
                  value={editSizeBigY}
                  onChange={e => setEditSizeBigY(e.target.value)}
                  type="number"
                />
              </div>
            </Form.Item>
            <Form.Item name="rate_big" label="Tỷ lệ % (Bo to)">
              <Input
                placeholder="Nhập tỷ lệ %"
                onChange={handleEditRateInput((val) => editForm.setFieldsValue({ rate_big: val }))}
                value={editForm.getFieldValue('rate_big')}
              />
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