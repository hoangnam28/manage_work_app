import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Popconfirm, Input, Select, DatePicker, Tag, Tooltip } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import { fetchUlMaterialList, deleteUlMaterial, exportUlMaterial } from '../utils/ul-material-api';
import { toast } from 'sonner';
import './UlMaterial.css';
import CreateUlMaterialModal from '../components/modal/CreateUlMaterialModal';

const { Search } = Input;
const { Option } = Select;

const UlMaterial = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
    pageSizeOptions: ['20', '50', '100']
  });
  const [searchParams, setSearchParams] = useState({
    supplier: '',
    material_name: '',
    customer_name: ''
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [modalMode, setModalMode] = useState('create');


  const fetchData = async (page = 1, pageSize = 20, search = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        ...search
      };
      const response = await fetchUlMaterialList(params);
      setData(response.data || []);
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize,
        total: response.totalRecords || 0
      }));
    } catch (error) {
      console.error('Error fetching UL material data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize, searchParams);
  }, []);

  const handleTableChange = (paginationInfo, filters, sorter) => {
    fetchData(paginationInfo.current, paginationInfo.pageSize, searchParams);
  };

  const handleSearch = (value, field) => {
    const newSearchParams = { ...searchParams, [field]: value };
    setSearchParams(newSearchParams);
    fetchData(1, pagination.pageSize, newSearchParams);
  };

  const handleReset = () => {
    const resetParams = { supplier: '', material_name: '', customer_name: '' };
    setSearchParams(resetParams);
    fetchData(1, pagination.pageSize, resetParams);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUlMaterial(id);
      toast.success('Xóa thành công');
      fetchData(pagination.current, pagination.pageSize, searchParams);
    } catch (error) {
      toast.error('Lỗi khi xóa');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportUlMaterial();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ul_material_export.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Xuất file thành công');
    } catch (error) {
      toast.error('Lỗi khi xuất file');
    }
  };

  const getStatusColor = (date, deadline) => {
    if (!date || !deadline) return 'default';
    const dateObj = new Date(date);
    const deadlineObj = new Date(deadline);
    const today = new Date();
    
    if (dateObj > deadlineObj) return 'red';
    if (dateObj < deadlineObj && dateObj > today) return 'yellow';
    return 'green';
  };

  const columns = [
    {
      title: 'Nhà cung cấp',
      dataIndex: 'SUPPLIER',
      key: 'supplier',
      width: 120,
      filters: [
        { text: 'Shengyi', value: 'Shengyi' },
        { text: 'EMC', value: 'EMC' },
        { text: 'Panasonic', value: 'Panasonic' },
        { text: 'EMC ELITE', value: 'EMC ELITE' }
      ],
      filterMode: 'tree',
      filterSearch: true,
      onFilter: (value, record) => record.supplier === value,
    },
    {
      title: 'Nhà máy sản xuất',
      dataIndex: 'MANUFACTURING',
      key: 'manufaturing',
      width: 120,
    },
    {
      title: 'Tên vật liệu',
      dataIndex: 'MATERIAL_NAME',
      key: 'material_name',
      width: 150,
    },
    {
      title: 'PP tương ứng',
      dataIndex: 'pp',
      key: 'pp',
      width: 120,
    },
    {
      title: 'Loại vật liệu',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: 'Cấu trúc',
      dataIndex: 'structure',
      key: 'structure',
      width: 150,
    },
    {
      title: 'Cấu tạo lớp',
      dataIndex: 'layer',
      key: 'layer',
      width: 100,
    },
    {
      title: 'Mức độ tin cậy',
      dataIndex: 'level_no',
      key: 'level_no',
      width: 120, 
    },
    {
      title: 'Mã hàng',
      dataIndex: 'product_code',
      key: 'product_code',
      width: 120,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 120,
    },
    {
      title: 'Bộ phận',
      dataIndex: 'department',
      key: 'department',
      width: 80,
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'handler',
      key: 'handler',
      width: 150,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 120,
    },
    {
      title: 'Kì hạn dự kiến gửi báo cáo tới PD5',
      dataIndex: 'proposed_deadline',
      key: 'proposed_deadline',
      width: 180,

    },
    {
      title: 'Ngày bắt đầu tổng hợp báo cáo',
      dataIndex: 'summary_day',
      key: 'summary_day',
      width: 180,
    },
    {
      title: 'Ngày gửi tổng Thực tế',
      dataIndex: 'real_date',
      key: 'real_date',
      width: 180,
    },
    {
      title: 'Kì hạn',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
    },
    {
      title: 'Ngày hàng loạt',
      dataIndex: 'mass_day',
      key: 'mass_day',
      width: 150,
    },
    {
      title: 'Sản lượng hàng loạt',
      dataIndex: 'mass_product',
      key: 'mass_product',
      width: 150,
    },
    {
      title: 'Chứng nhận ở nhà máy khác',
      dataIndex: 'confirm',
      key: 'confirm',
      width: 180,
    },
    {
      title: 'Nhà máy đã chứng nhận',
      dataIndex: 'confirm_name',
      key: 'confirm_name',
      width: 150,
    },
    {
      title: 'Cấp độ ở nhà máy khác',
      dataIndex: 'other_level',
      key: 'other_level',
      width: 150,
    },
    {
      title: 'Yêu cầu báo cáo đánh giá',
      dataIndex: 'request_report',
      key: 'request_report',
      width: 180,
    },
    {
      title: 'Ngày CN',
      dataIndex: 'certification_date',
      key: 'certification_date',
      width: 120,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 200,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    setEditingRecord(record);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setModalMode('create');
    setModalVisible(true);
  };

  const handleModalSuccess = () => {
    fetchData(pagination.current, pagination.pageSize, searchParams);
  };

  return (
    <MainLayout>
      <div className="ul-material-container">
        <div className="ul-material-header">
          <h1>UL Material Management</h1>
          <div className="header-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Thêm mới
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              Xuất Excel
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchData(pagination.current, pagination.pageSize, searchParams)}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* <div className="search-section">
          <Space size="middle" wrap>
            <Search
              placeholder="Tìm kiếm nhà cung cấp"
              allowClear
              onSearch={(value) => handleSearch(value, 'supplier')}
              style={{ width: 200 }}
            />
            <Search
              placeholder="Tìm kiếm tên vật liệu"
              allowClear
              onSearch={(value) => handleSearch(value, 'material_name')}
              style={{ width: 200 }}
            />
            <Search
              placeholder="Tìm kiếm tên khách hàng"
              allowClear
              onSearch={(value) => handleSearch(value, 'customer_name')}
              style={{ width: 200 }}
            />
            <Button onClick={handleReset}>Làm mới tìm kiếm</Button>
          </Space>
        </div> */}

        <div className="table-container">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 3000 }}
            size="small"
            bordered
            className="ul-material-table"
          />
        </div>

        <CreateUlMaterialModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSuccess={handleModalSuccess}
          editingRecord={editingRecord}
          mode={modalMode}
        />
      </div>
    </MainLayout>
  );
};

export default UlMaterial;
