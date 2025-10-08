import React, { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Popconfirm, Input, Dropdown, Menu, Tag, Tooltip } from 'antd';
import Highlighter from 'react-highlight-words';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ExportOutlined,
  ReloadOutlined,
  EyeOutlined,
  DownOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import {
  fetchMaterialCertificationList,
  createMaterialCertification,
  updateMaterialCertification,
  deleteMaterialCertification,
  exportMaterialCertification,
  fetchMaterialCertificationOptions
} from '../utils/material-certification-api';
import CreateUlCertificationModal from '../components/modal/CreateUlCertificationModal';
import { toast, Toaster } from 'sonner';
import './UlCertification.css';

const MaterialCertification = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [searchFilters, setSearchFilters] = useState({});
  const [options, setOptions] = useState({});
  const searchInput = useRef(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
    pageSizeOptions: ['20', '50', '100'],
  });

  const handleViewCertificationForm = (record) => {
    navigate(`/certification-form/${record.ID}`, { 
      state: { certificationData: record } 
    });
  };
  
  const fetchData = async (page = null, pageSize = null, filters = null) => {
    setLoading(true);
    try {
      const currentPage = page || pagination.current;
      const currentPageSize = pageSize || pagination.pageSize;
      const currentFilters = filters !== null ? filters : searchFilters;

      const response = await fetchMaterialCertificationList({
        page: currentPage,
        pageSize: currentPageSize,
        ...currentFilters
      });

      setData(response.data || []);
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        pageSize: currentPageSize,
        total: response.totalRecords || 0
      }));

    } catch (error) {
      console.error('Error fetching UL certification data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch options for dropdowns
  const fetchOptions = async () => {
    try {
      const response = await fetchMaterialCertificationOptions();
      setOptions(response.data || {});
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchOptions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle create
  const handleCreate = async (values) => {
    try {
      const result = await createMaterialCertification(values);
      if (result && result.success === false) {
        throw new Error(result.message || 'Tạo mới thất bại');
      }

      fetchData(1, pagination.pageSize);
      setModalVisible(false);
      setEditingRecord(null);
      setModalMode('create');

      return { success: true, message: 'Tạo mới thành công' };

    } catch (error) {
      console.error('Error creating UL certification:', error);
      throw new Error('Lỗi khi tạo mới: ' + (error.message || 'Đã có lỗi xảy ra'));
    }
  };

  // Handle update
  const handleUpdate = async (values) => {
    try {
      const recordId = editingRecord.ID || editingRecord.id;
      if (!recordId) {
        throw new Error('ID không hợp lệ');
      }

      const result = await updateMaterialCertification(recordId, values);
      if (result && result.success === false) {
        throw new Error(result.message || 'Cập nhật thất bại');
      }

      fetchData(pagination.current, pagination.pageSize);
      setModalVisible(false);
      setEditingRecord(null);

      return { success: true, message: 'Cập nhật thành công' };

    } catch (error) {
      console.error('Error updating UL certification:', error);
      throw new Error('Lỗi khi cập nhật: ' + (error.message || 'Đã có lỗi xảy ra'));
    }
  };

  // Handle delete
  const handleDelete = async (recordId) => {
    try {
      const id = Number(recordId?.id ?? recordId?.ID ?? recordId);
      if (!id || isNaN(id)) {
        toast.error('ID không hợp lệ, không thể xóa!');
        return;
      }
      await deleteMaterialCertification(id);
      toast.success('Xóa thành công');
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error deleting UL certification:', error);
      toast.error('Lỗi khi xóa');
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const loadingToast = toast.loading('Đang xuất dữ liệu...');
      const response = await exportMaterialCertification();

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ULCertificationExport_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss(loadingToast);
      toast.success('Xuất file thành công!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất file: ' + (error.message || 'Đã có lỗi xảy ra'));
    }
  };

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => { handleSearch(selectedKeys, dataIndex); close(); }}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => { handleSearch(selectedKeys, dataIndex); close(); }}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => close()}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{ color: filtered ? '#1890ff' : undefined }}
      />
    ),
    filteredValue: searchFilters[dataIndex] ? [searchFilters[dataIndex]] : null,
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) => {
      const searchValue = searchFilters[dataIndex];
      return searchValue ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchValue]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      );
    }
  });

  const handleSearch = (selectedKeys, dataIndex) => {
    const searchValue = selectedKeys[0];
    const newFilters = { ...searchFilters };
    if (searchValue) {
      newFilters[dataIndex] = searchValue;
    } else {
      delete newFilters[dataIndex];
    }
    setSearchFilters(newFilters);
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
    fetchData(1, pagination.pageSize, newFilters);
  };

  const handleReset = (clearFilters, dataIndex) => {
    const newFilters = { ...searchFilters };
    delete newFilters[dataIndex];
    setSearchFilters(newFilters);
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
    fetchData(1, pagination.pageSize, newFilters);
    clearFilters();
  };

  const handleTableChange = (paginationConfig, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }));
    fetchData(paginationConfig.current, paginationConfig.pageSize, searchFilters);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'orange';
      case 'Approved': return 'green';
      case 'Rejected': return 'red';
      default: return 'default';
    }
  };

  // Columns definition
  const columns = [
    {
      title: 'ID',
      dataIndex: 'ID',
      key: 'id',
      width: 80,
      fixed: 'left',
      align: 'center',
    },
    {
      title: 'Tên vật liệu',
      dataIndex: 'MATERIAL_NAME',
      key: 'material_name',
      width: 150,
      ...getColumnSearchProps('MATERIAL_NAME'),
      render: (text, record) => (
        <button 
          onClick={() => handleViewCertificationForm(record)}
          style={{ 
            color: '#1890ff', 
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            padding: 0,
            textDecoration: 'underline',
            font: 'inherit'
          }}
        >
          {text}
        </button>
      )
    },
    {
      title: 'Loại vật liệu',
      dataIndex: 'MATERIAL_CLASS',
      key: 'material_class',
      width: 150,
      ...getColumnSearchProps('MATERIAL_CLASS')
    },
    {
      title: 'Cấu trúc',
      dataIndex: 'UL_CERT_STATUS',
      key: 'ul_cert_status',
      width: 120,
      align: 'center',
      render: (status) => status ? (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ) : '-'
    },
     {
      title: 'Mức độ tin cậy',
      dataIndex: 'RELIABILITY_LEVEL',
      key: 'reliability_level',
      width: 150,
      ...getColumnSearchProps('RELIABILITY_LEVEL')
    },
    {
      title: 'Bộ phận phụ trách',
      dataIndex: 'DEPARTMENT_CODE',
      key: 'department_code',
      width: 150,
      render: v => v || '-',
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'PERSON_IN_CHARGE',
      key: 'person_in_charge',
      width: 150,
      render: v => v || '-',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'START_DATE',
      key: 'start_date',
      width: 120,
      render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Kỳ hạn gửi báo cáo tới PD5',
      dataIndex: 'PD5_REPORT_DEADLINE',
      key: 'pd5_report_deadline',
      width: 200,
      render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Kỳ hạn hoàn thành',
      dataIndex: 'COMPLETION_DEADLINE',
      key: 'completion_deadline',
      width: 150,
      render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Ngày gửi báo cáo tới PD5 thực tế',
      dataIndex: 'PD5_REPORT_ACTUAL_DATE',
      key: 'pd5_report_actual_date',
      width: 250,
      render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Ngày hoàn thành thực tế',
      dataIndex: 'ACTUAL_COMPLETION_DATE',
      key: 'actual_completion_date',
      width: 190,
      render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Tiến độ',
      dataIndex: 'PROGRESS',
      key: 'progress',
      width: 120,
      render: v => v || '-',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'NOTES_1',
      key: 'notes_1',
      width: 200,
    },
    {
      title: 'Người làm',
      dataIndex: 'PERSON_DO',
      key: 'person_do',
      width: 120,
      render: v => v || '-',
    },
    {
      title: 'Người check',
      dataIndex: 'PERSON_CHECK',
      key: 'person_check',
      width: 120,
      render: v => v || '-',
    },
    {
      title: 'Thời gian làm (phút)',
      dataIndex: 'TIME_DO',
      key: 'time_do',
      width: 150,
      render: v => v || '-',
    },
    {
      title: 'Thời gian check (phút)',
      dataIndex: 'TIME_CHECK',
      key: 'time_check',
      width: 170,
      render: v => v || '-',
    },
    {
      title: 'Tổng thời gian (phút)',
      dataIndex: 'TOTAL_TIME',
      key: 'total_time',
      width: 190,
      render: v => v || '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(record)}
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
      ),
    },  
  ];

  // Event handlers
  const handleViewDetails = (record) => {
    setModalMode('view');
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleCreateNew = () => {
    setModalMode('create');
    setEditingRecord(null);
    setModalVisible(true);
  };

  const handleModalSuccess = () => {
    fetchData(pagination.current, pagination.pageSize, searchFilters);
  };

  const handleResetFilters = () => {
    setSearchFilters({});
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, {});
  };

  const exportMenu = (
    <Menu>
      <Menu.Item
        key="export-excel"
        icon={<FileExcelOutlined />}
        onClick={handleExport}
      >
        Export Excel (.xlsx)
      </Menu.Item>
    </Menu>
  );

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div className="ul-certification-container">
        <div className="ul-certification-header">
          <h1 style={{ color: '#e29a51ff' }}>Material Certification</h1>
          <div className="header-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
              style={{ marginRight: 8 }}
            >
              Thêm mới
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              style={{ marginRight: 8 }}
            >
              Bỏ lọc
            </Button>
            <Dropdown overlay={exportMenu} trigger={['click']}>
              <Button>
                <ExportOutlined /> Export <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        </div>

        <div className="table-container">
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey={(record) => record.ID || record.id}
            scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
            size="middle"
            sticky
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => {
                fetchData(page, pageSize, searchFilters);
              },
              onShowSizeChange: (current, size) => {
                fetchData(1, size, searchFilters);
              }
            }}
            onChange={handleTableChange}
          />
        </div>

        <CreateUlCertificationModal
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingRecord(null);
            setModalMode('create');
          }}
          onSubmit={modalMode === 'edit' ? handleUpdate : handleCreate}
          editingRecord={editingRecord}
          mode={modalMode}
          options={options}
          onSuccess={handleModalSuccess}
        />
      </div>
    </MainLayout>
  );
};

export default MaterialCertification;