import { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, Space, AutoComplete, Alert } from 'antd';
import axios from '../utils/axios';
import MainLayout from '../components/layout/MainLayout';
import { Toaster, toast } from 'sonner';
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  HistoryOutlined,
  UndoOutlined,
  EyeOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { fetchMaterialDecideList, fetchMaterialDecideCustomerList, createMaterialDecide, updateMaterialDecide, deleteMaterialDecide, restoreMaterialDecide, cancelRequestMaterialDecide } from '../utils/decide-board';
import { useNavigate } from 'react-router-dom';
import LargeSizeHistoryModal from '../components/modal/LargeSizeHistoryModal';

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
  const [canUpdateBo, setCanUpdateBo] = useState(false);
  const [onlyRequestEdit, setOnlyRequestEdit] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedRecordForHistory, setSelectedRecordForHistory] = useState(null);

  // Thêm state cho modal hủy yêu cầu
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancellingRecord, setCancellingRecord] = useState(null);
  const [cancelForm] = Form.useForm();

  const navigate = useNavigate();
  const tableRef = useRef();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!token || !userInfo) {
          setIsViewer(true);
          setCanUpdateBo(false);
          return;
        }
        const response = await axios.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        let userRoles = response.data.role;
        if (typeof userRoles === 'string') {
          userRoles = userRoles.split(',').map(r => r.trim());
        }
        const onlyViewer = Array.isArray(userRoles) && userRoles.length === 1 && userRoles[0].toLowerCase() === 'viewer';
        setIsViewer(onlyViewer);

        // Check company_id permission
        const allowedCompanyIds = ['000107', '003512', '024287', '026965', '014077', '001748', '030516'];
        // Ưu tiên lấy từ userInfo nếu có, nếu không lấy từ response.data
        let companyId = userInfo?.company_id || response.data?.company_id;
        if (typeof companyId === 'number') companyId = companyId.toString().padStart(6, '0');
        if (typeof companyId === 'string') companyId = companyId.padStart(6, '0');
        setCanUpdateBo(allowedCompanyIds.includes(companyId));
        // Các user chỉ được sửa trường request (không được sửa trường khác)
        const onlyRequestIds = ['000107', '003512', '024287', '026965', '014077', '001748', '030516'];
        setOnlyRequestEdit(onlyRequestIds.includes(companyId));
      } catch (error) {
        setIsViewer(true);
        setCanUpdateBo(false);
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
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
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
      width: 150,
      align: "center",
      fixed: 'left',
      ...getColumnSearchProps('CUSTOMER_CODE'),
      render: (value, record) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          disabled={record.IS_DELETED === 1}
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
          width: 150,
          ...getColumnSearchProps('SIZE_NORMAL'),
        },
        {
          title: "Tỷ lệ %",
          dataIndex: "RATE_NORMAL",
          align: "center",
          width: 150,
          ...getColumnSearchProps('RATE_NORMAL'),
        }
      ]
    },
    {
      title: (
        <div style={{ background: '#f6ffed', padding: '8px 0', borderRadius: 4 }}>
          Bo To
        </div>
      ),
      children: [
        {
          title: (
            <div style={{ background: '#f6ffed', padding: '8px 0', borderRadius: 4 }}>
              Kích thước bo to
            </div>
          ),
          dataIndex: "SIZE_BIG",
          align: "center",
          width: 150,
          ...getColumnSearchProps('SIZE_BIG'),
          render: (value) => (
            <div style={{ background: '#f6ffed', minWidth: 80 }}>{value}</div>
          )
        },
        {
          title: (
            <div style={{ background: '#f6ffed', padding: '8px 0', borderRadius: 4 }}>
              Tỷ lệ %
            </div>
          ),
          dataIndex: "RATE_BIG",
          align: "center",
          width: 150,
          ...getColumnSearchProps('RATE_BIG'),
          render: (value) => (
            <div style={{ background: '#f6ffed', minWidth: 80 }}>{value}</div>
          )
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
          width: 180,
          render: (value, record) => {
            // Nếu chưa xác nhận thì để trống
            if (!record.CONFIRM_BY) return '';
            return value === 'TRUE' ? 'Có' : value === 'FALSE' ? 'Không' : '';
          },
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
          width: 150,
          onFilter: (value, record) => (record.CONFIRM_BY ? 'Đã xác nhận' : 'Chưa xác nhận').toLowerCase().includes((value || '').toLowerCase()),
          render: (_, record) => record.CONFIRM_BY ? <span style={{ color: '#52c41a' }}>Đã xác nhận</span> : <span style={{ color: '#faad14' }}>Chưa xác nhận</span>
        },
        {
          title: "Người Xác nhận",
          dataIndex: "CONFIRM_BY",
          align: "center",
          width: 150,
          ...getColumnSearchProps('CONFIRM_BY'),
        },
      ],

    },
    // {
    //   title: "Trạng thái bản ghi",
    //   dataIndex: "IS_CANCELED",
    //   align: "center",
    //   width: 140,
    //   render: (value) => {
    //     if (value === 1) {
    //       return <Tag color="red">Đã hủy yêu cầu</Tag>;
    //     }
    //     return <Tag color="green">Hoạt động</Tag>;
    //   },
    //   filters: [
    //     { text: 'Hoạt động', value: 0 },
    //     { text: 'Đã hủy yêu cầu', value: 1 }
    //   ],
    //   onFilter: (value, record) => record.IS_CANCELED === value
    // },
    {
      title: "Note",
      dataIndex: "NOTE",
      align: "left",
      width: 300, // 👈 chỉnh độ rộng cột (px)
      render: (value) => {
        return (
          <div
            style={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              minWidth: "250px",   // 👈 để content không quá hẹp
              maxWidth: "100%",    // 👈 full trong cột
            }}
          >
            {value}
          </div>
        );
      }
    },
    {
      title: "Lịch sử",
      key: "history",
      align: "center",
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="default"
          icon={<HistoryOutlined />}
          disabled={record.IS_CANCELED === 1}
          onClick={() => {
            setSelectedRecordForHistory(record);
            setHistoryModalVisible(true);
          }}
          title="Xem lịch sử chỉnh sửa"
        >
          Lịch sử
        </Button>
      )
    },
    {
      title: "Hành động",
      key: "edit_action",
      align: "center",
      fixed: 'right',
      render: (_, record) => {
        const isDisabled = record.IS_DELETED === 1 || isViewer;
        if (record.IS_CANCELED === 1) {
          return (
            <Space size="middle">
              <Popconfirm
                title="Bạn có chắc chắn muốn khôi phục mã hàng này?"
                onConfirm={() => handleRestore(record)}
                okText="Có"
                cancelText="Không"
                disabled={isViewer}
              >
                <Button
                  type="primary"
                  icon={<UndoOutlined />}
                  disabled={isViewer}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Khôi phục
                </Button>
              </Popconfirm>
            </Space>
          );
        }

        return (
          <Space size="middle">
            <Button
              type="primary"
              icon={<EditOutlined />}
              disabled={isDisabled}
              onClick={() => {
                handleEdit(record);
              }}
            />
            <Button
              type='primary'
              danger
              icon={<CloseOutlined />}
              onClick={() => handleShowCancelModal(record)}
              disabled={isDisabled}
            />
            <Popconfirm
              title={record.CONFIRM_BY ? "Không thể xóa bản ghi đã xác nhận" : "Bạn có chắc chắn muốn xóa mã hàng này?"}
              onConfirm={() => handleDelete(record)}
              okText="Có"
              cancelText="Không"
              disabled={isDisabled || record.CONFIRM_BY}
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                disabled={isDisabled || record.CONFIRM_BY}
                title={record.CONFIRM_BY ? "Không thể xóa bản ghi đã xác nhận" : ""}
              />
            </Popconfirm>

          </Space>

        );
      }
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
      'Trạng thái bản ghi': row.IS_DELETED === 1 ? 'Đã hủy yêu cầu' : 'Hoạt động',
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
      rate_normal: record.RATE_NORMAL || '',
      note: record.NOTE || '',
      request: record.REQUEST === 'TRUE' ? 'TRUE' : 'FALSE'
    });
    setEditModalVisible(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      const rowId = editingRecord.id !== undefined ? editingRecord.id : editingRecord.ID;
      const size_normal = (editSizeNormalX && editSizeNormalY) ? `${editSizeNormalX} × ${editSizeNormalY}` : (editSizeNormalX || editSizeNormalY);
      const size_big = (editSizeBigX && editSizeBigY) ? `${editSizeBigX} × ${editSizeBigY}` : (editSizeBigX || editSizeBigY);

      // Chỉ gửi các trường cần thiết, KHÔNG gửi confirm_by
      let updatePayload = {
        type_board: (values.type_board || '').trim(),
        size_normal: size_normal.trim(),
        rate_normal: (values.rate_normal || '').trim(),
        size_big: size_big.trim(),
        rate_big: (values.rate_big || '').trim(),
        note: (values.note || '').trim(),
        request: values.request
      };

      await updateMaterialDecide(rowId, updatePayload);
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

    const originalRecord = { ...record };

    try {
      // ✅ Loại bỏ record khỏi danh sách ngay lập tức (Optimistic update)
      setData(prevData =>
        prevData.filter(item =>
          (item.id !== undefined ? item.id : item.ID) !== rowId
        )
      );
      const response = await deleteMaterialDecide(rowId);
      toast.success(response?.message || 'Xóa thành công!');
    } catch (err) {
      setData(prevData => {
        const newData = [...prevData];
        newData.unshift(originalRecord);

        return newData;
      });

      console.error('Delete error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi xóa!';
      toast.error(errorMsg);
    }
  };

  const handleShowCancelModal = (record) => {
    setCancellingRecord(record);
    cancelForm.setFieldsValue({
      oldNote: record.NOTE || '',
      cancelReason: ''
    });
    setCancelModalVisible(true);
  };

  const handleCancelRequestWithReason = async () => {
    try {
      await cancelForm.validateFields();
      const values = cancelForm.getFieldsValue();
      const rowId = cancellingRecord.id !== undefined ? cancellingRecord.id : cancellingRecord.ID;
      const reason = values.cancelReason?.trim() || ''; // Lấy lý do hủy
      if (!reason) {
        toast.error('Vui lòng nhập lý do hủy yêu cầu!');
        return;
      }

      const cancelInfo = {
        reason: reason,
      };


      const response = await cancelRequestMaterialDecide(rowId, cancelInfo);
      toast.success(response?.message || 'Hủy yêu cầu thành công!');
      setCancelModalVisible(false);
      setCancellingRecord(null);
      cancelForm.resetFields();

      // Refresh data
      await fetchData();

    } catch (err) {
      if (err.name === 'ValidationError' || err.errorFields) {
        console.log('Form validation errors:', err.errorFields);
        // Không hiển thị toast error cho validation errors vì Ant Design sẽ hiển thị
        return;
      }

      console.error('Cancel request error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi hủy yêu cầu!';
      toast.error(errorMsg);
    }
  };
  const handleRestore = async (record) => {
    const rowId = record.id !== undefined ? record.id : record.ID;
    try {
      await restoreMaterialDecide(rowId);
      toast.success('Khôi phục thành công!');
      fetchData();
    } catch (err) {
      toast.error('Lỗi khôi phục!');
    }
  };

  const handleRateInput = (setter) => (e) => {
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

  // Kiểm tra xem PC có thể sửa REQUEST hay không (chỉ khi đã được xác nhận)
  const canEditRequest = (record) => {
    return canUpdateBo && record && record.CONFIRM_BY && record.CONFIRM_BY.trim() !== '';
  };

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <style>
        {`
          .row-canceled {
            background-color: #c2c2c2ff !important;
            color: #999 !important;
          }
          .row-canceled td {
            color: #999 !important;
          }
          .row-canceled .ant-btn {
            opacity: 0.6;
          }
          .row-canceled .ant-tag {
            opacity: 0.8;
          }
          .row-canceled .ant-table-cell {
            background-color: #e9e8e8ff !important;
          }
          .row-canceled:hover .ant-table-cell {
            background-color: #e9e8e8ff!important;
          }
        `}
      </style>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h1>Large Size Board</h1>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => window.open('/user_guide_large_size.pdf', '_blank', 'noopener,noreferrer')}
            style={{ background: '#1890ff', borderColor: '#1890ff' }}
          >
            Hướng dẫn sử dụng
          </Button>
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
          columns={columns.map(col => col)}
          dataSource={data}
          loading={loading}
          rowKey="id"
          scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
          size="middle"
          sticky
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} bản ghi`
          }}
          rowClassName={(record) => {
            // Kiểm tra cả IS_CANCELED và IS_DELETED với nhiều kiểu dữ liệu
            if (record.IS_CANCELED === 1 || record.IS_CANCELED === '1' || record.IS_CANCELED === true) {
              console.log('Applying row-canceled class');
              return 'row-canceled';
            }
            if (record.STATUS === 'Pending') {
              return 'row-pending';
            }
            if (record.STATUS === 'Cancel') {
              return 'row-cancel';
            }
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
          width={800} // Tăng chiều rộng modal
          onOk={() => {
            form
              .validateFields()
              .then(async (values) => {
                const size_normal = (sizeNormalX && sizeNormalY) ? `${sizeNormalX} × ${sizeNormalY}` : (sizeNormalX || sizeNormalY);
                const size_big = (sizeBigX && sizeBigY) ? `${sizeBigX} × ${sizeBigY}` : (sizeBigX || sizeBigY);
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
                try {
                  await createMaterialDecide(cleanValues);
                  toast.success('Tạo mới thành công');
                  setModalVisible(false);
                  form.resetFields();
                  setSizeNormalX(''); setSizeNormalY('');
                  setSizeBigX(''); setSizeBigY('');
                  fetchData();
                } catch (err) {
                  // Ưu tiên lấy message từ BE nếu có
                  const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Lỗi tạo mới!';
                  toast.error(msg);
                }
              })
              .catch(() => { });
          }}
        >
          <Form form={form} layout="vertical">
            {/* Header fields - 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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
            </div>

            {/* Bo thường và Bo to - 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {/* Bo thường */}
              <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, background: '#fafbfc' }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: '#1890ff' }}>Bo thường</div>
                <Form.Item name="size_normal" label="Kích thước Tối ưu" rules={[{ required: true, message: 'Vui lòng nhập kích thước tối ưu(bo thường)' }]} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Input
                      style={{ width: 140, textAlign: 'left' }}
                      placeholder="Chiều dài X"
                      value={sizeNormalX}
                      onChange={e => setSizeNormalX(e.target.value)}
                      type="number"
                    />
                    <span style={{ fontWeight: 'bold', fontSize: 18, lineHeight: 1 }}>×</span>
                    <Input
                      style={{ width: 140, textAlign: 'left' }}
                      placeholder="Chiều ngắn Y"
                      value={sizeNormalY}
                      onChange={e => setSizeNormalY(e.target.value)}
                      type="number"
                    />
                  </div>
                </Form.Item>
                <Form.Item name="rate_normal" label="Tỷ lệ %" rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ %' }]}>
                  <Input
                    placeholder="Nhập tỷ lệ %"
                    onChange={handleRateInput((val) => form.setFieldsValue({ rate_normal: val }))}
                    value={form.getFieldValue('rate_normal')}
                  />
                </Form.Item>
              </div>

              {/* Bo to */}
              <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, background: '#f6ffed' }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: '#52c41a' }}>Bo to</div>
                <Form.Item name="size_big" label="Kích thước bo to" rules={[{ required: true, message: 'Vui lòng nhập kích thước bo to' }]} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Input
                      style={{ width: 140, textAlign: 'left' }}
                      placeholder="Chiều dài X"
                      value={sizeBigX}
                      onChange={e => setSizeBigX(e.target.value)}
                      type="number"
                    />
                    <span style={{ fontWeight: 'bold', fontSize: 18, lineHeight: 1 }}>×</span>
                    <Input
                      style={{ width: 140, textAlign: 'left' }}
                      placeholder="Chiều ngắn Y"
                      value={sizeBigY}
                      onChange={e => setSizeBigY(e.target.value)}
                      type="number"
                    />
                  </div>
                </Form.Item>
                <Form.Item name="rate_big" label="Tỷ lệ %" rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ %' }]}>
                  <Input
                    placeholder="Nhập tỷ lệ %"
                    onChange={handleRateInput((val) => form.setFieldsValue({ rate_big: val }))}
                    value={form.getFieldValue('rate_big')}
                  />
                </Form.Item>
              </div>
            </div>
            <Form.Item name="note" label="Note">
              <Input.TextArea
                placeholder="Nhập ghi chú (không bắt buộc)"
                autoSize={{ minRows: 2, maxRows: 6 }} // Tự động co giãn chiều cao
              />
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
          width={800}
        >
          <Form form={editForm} layout="vertical">
            {/* Header fields - 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <Form.Item
                name="customer_part_number"
                label="Mã sản phẩm"
              >
                <Input
                  disabled
                  style={{ background: '#f5f5f5', color: '#888' }}
                  placeholder="Không cho phép sửa mã sản phẩm"
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
                  disabled={onlyRequestEdit}
                />
              </Form.Item>
            </div>

            {/* Bo thường và Bo to - 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, background: '#fafbfc' }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: '#1890ff' }}>Bo thường</div>
                <Form.Item label="Kích thước Tối ưu" required style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Input
                      style={{ width: 140, textAlign: 'left' }}
                      placeholder="Chiều dài X"
                      value={editSizeNormalX}
                      onChange={e => setEditSizeNormalX(e.target.value)}
                      type="number"
                      disabled={onlyRequestEdit}
                    />
                    <span style={{ fontWeight: 'bold', fontSize: 18, lineHeight: 1 }}>×</span>
                    <Input
                      style={{ width: 140, textAlign: 'left' }}
                      placeholder="Chiều ngắn Y"
                      value={editSizeNormalY}
                      onChange={e => setEditSizeNormalY(e.target.value)}
                      type="number"
                      disabled={onlyRequestEdit}
                    />
                  </div>
                </Form.Item>
                <Form.Item name="rate_normal" label="Tỷ lệ %">
                  <Input
                    placeholder="Nhập tỷ lệ %"
                    onChange={handleEditRateInput((val) => editForm.setFieldsValue({ rate_normal: val }))}
                    value={editForm.getFieldValue('rate_normal')}
                    disabled={onlyRequestEdit}
                  />
                </Form.Item>
              </div>

              {/* Bo to */}
              <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, background: '#f6ffed' }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: '#52c41a' }}>Bo to</div>
                <Form.Item name="size_big" label="Kích thước bo to" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Input
                      style={{ width: 140, textAlign: 'left' }}
                      placeholder="Chiều dài X"
                      value={editSizeBigX}
                      onChange={e => setEditSizeBigX(e.target.value)}
                      type="number"
                      disabled={onlyRequestEdit}
                    />
                    <span style={{ fontWeight: 'bold', fontSize: 18, lineHeight: 1 }}>×</span>
                    <Input
                      style={{ width: 140, textAlign: 'left' }}
                      placeholder="Chiều ngắn Y"
                      value={editSizeBigY}
                      onChange={e => setEditSizeBigY(e.target.value)}
                      type="number"
                      disabled={onlyRequestEdit}
                    />
                  </div>
                </Form.Item>
                <Form.Item name="rate_big" label="Tỷ lệ %">
                  <Input
                    placeholder="Nhập tỷ lệ %"
                    onChange={handleEditRateInput((val) => editForm.setFieldsValue({ rate_big: val }))}
                    value={editForm.getFieldValue('rate_big')}
                    disabled={onlyRequestEdit}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Yêu cầu sử dụng bo to - full width */}
            <Form.Item name="request" label="Yêu cầu sử dụng bo to" rules={[{ required: true, message: 'Vui lòng chọn yêu cầu sử dụng bo to' }]}
              style={{ maxWidth: 300 }}>
              <Input.Group compact>
                <Form.Item name="request" noStyle>
                  <select
                    style={{ width: '100%', height: 32 }}
                    disabled={!canEditRequest(editingRecord)}
                  >
                    <option value="TRUE">Có</option>
                    <option value="FALSE">Không</option>
                  </select>
                </Form.Item>
              </Input.Group>
              {!canEditRequest(editingRecord) && (
                <div style={{ color: '#faad14', marginTop: 4, fontSize: 13 }}>
                  {!canUpdateBo
                    ? 'Chỉ PC mới có quyền sửa trường này.'
                    : 'Chỉ có thể sửa khi bản ghi đã được xác nhận bước đầu.'
                  }
                </div>
              )}
            </Form.Item>

            <Form.Item name="note" label="Note">
              <Input.TextArea
                placeholder="Nhập ghi chú (không bắt buộc)"
                autoSize={{ minRows: 2, maxRows: 6 }} // Tự động co giãn chiều cao
              />
            </Form.Item>
          </Form>
        </Modal>

        <LargeSizeHistoryModal
          visible={historyModalVisible}
          onCancel={() => setHistoryModalVisible(false)}
          recordId={selectedRecordForHistory?.id !== undefined ? selectedRecordForHistory.id : selectedRecordForHistory?.ID}
          recordData={selectedRecordForHistory}
        />

        {/* Modal Nhập lý do hủy */}
        <Modal
          title="Nhập lý do hủy yêu cầu"
          open={cancelModalVisible}
          onOk={handleCancelRequestWithReason}
          onCancel={() => {
            setCancelModalVisible(false);
            setCancellingRecord(null);
            cancelForm.resetFields();
          }}
          okText="Xác nhận"
          cancelText="Đóng"
        >
          <Form form={cancelForm} layout="vertical">
            <Form.Item
              name="oldNote"
              label="Note hiện tại"
            >
              <Input.TextArea
                rows={2}
                disabled
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </Form.Item>
            <Form.Item
              name="cancelReason"
              label="Lý do hủy"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập lý do hủy yêu cầu'
                },
                {
                  min: 10,
                  message: 'Lý do hủy phải có ít nhất 10 ký tự'
                }
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập lý do hủy yêu cầu (tối thiểu 10 ký tự)"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default DecideBoard;