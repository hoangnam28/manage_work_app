import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Popconfirm, Input } from 'antd';
import Highlighter from 'react-highlight-words';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import {
  fetchMaterialNewList,
  createMaterialNew,
  updateMaterialNew,
  deleteMaterialNew,
  fetchMaterialNewHistory
} from '../utils/material-new-api';
import CreateMaterialNewModal from '../components/modal/CreateMaterialNewModal';
import HistoryNewModal from '../components/modal/MaterialNewHistoryModal';
import { toast, Toaster } from 'sonner';
import './MaterialCore.css';
import ImportMaterialNewModal from '../components/modal/ImportMaterialNewModal';
import * as XLSX from 'xlsx';
import { hasPermission, PermissionGuard } from '../utils/permissions';

const MaterialProperties = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchFilters, setSearchFilters] = useState({});
  const searchInput = useRef(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [importReviewModalVisible, setImportReviewModalVisible] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`
  });

  // ✅ SỬA: Cải thiện hàm fetchData để xử lý search filters đúng cách
  const fetchData = async (page = null, pageSize = null, filters = null) => {
    setLoading(true);
    try {
      const currentPage = page || pagination.current;
      const currentPageSize = pageSize || pagination.pageSize;
      const currentFilters = filters !== null ? filters : searchFilters;

      console.log('Fetching data with params:', {
        page: currentPage,
        pageSize: currentPageSize,
        filters: currentFilters
      });

      const response = await fetchMaterialNewList({
        page: currentPage,
        pageSize: currentPageSize,
        ...currentFilters // ✅ Trực tiếp truyền filters thay vì wrap trong search object
      });

      // Kiểm tra và điều chỉnh trang hiện tại nếu vượt quá tổng số trang
      const totalPages = Math.ceil((response.pagination?.totalRecords || 0) / currentPageSize);
      const adjustedCurrent = Math.min(currentPage, totalPages || 1);

      if (adjustedCurrent !== currentPage && totalPages > 0) {
        // Nếu trang hiện tại đã bị điều chỉnh, gọi lại API với trang đúng
        return fetchData(adjustedCurrent, currentPageSize, currentFilters);
      }

      // Convert all keys to uppercase for consistency
      const formattedData = (response.data || []).map(item => {
        const newItem = {};
        Object.keys(item).forEach(key => {
          newItem[key.toUpperCase()] = item[key];
        });
        return newItem;
      });

      setData(formattedData);
      setPagination(prev => ({
        ...prev,
        current: adjustedCurrent,
        pageSize: currentPageSize,
        total: response.pagination?.totalRecords || 0
      }));

    } catch (error) {
      console.error('Error fetching material core data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (values) => {
    try {
      await createMaterialNew(values);
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error creating material core:', error);
      toast.error('Lỗi khi thêm mới');
    }
  };

  const handleUpdate = async (values) => {
    try {
      const recordId = editingRecord.ID || editingRecord.id;
      if (!recordId) {
        throw new Error('ID không hợp lệ');
      }

      await updateMaterialNew(recordId, values);
      toast.success('Cập nhật thành công');
      setModalVisible(false);
      setEditingRecord(null);
      fetchData();
    } catch (error) {
      console.error('Error updating material core:', error);
      toast.error('Lỗi khi cập nhật: ' + (error.message || 'Đã có lỗi xảy ra'));
    }
  };

  const handleDelete = async (recordId) => {
    try {
      const id = Number(recordId?.id ?? recordId?.ID ?? recordId);
      if (!id || isNaN(id)) {
        toast.error('ID không hợp lệ, không thể xóa!');
        return;
      }
      await deleteMaterialNew(id);
      toast.success('Xóa thành công');
      fetchData();
    } catch (error) {
      console.error('Error deleting material core:', error);
      toast.error('Lỗi khi xóa');
    }
  };

  const handleStatusChange = async (record, status) => {
    if (!hasPermission('approve')) {
          toast.error('Bạn không có quyền thay đổi trạng thái!');
          return;
        }
    try {
      const id = record.ID || record.id;
      if (!id) {
        toast.error('ID không hợp lệ, không thể cập nhật trạng thái!');
        return;
      }

      const loadingToast = toast.loading('Đang cập nhật...');

      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const handler = userInfo.username || 'Unknown';

        const updateData = {
          status,
          handler,
          ...(status === 'Approve' || 'Cancel' ? { complete_date: new Date().toISOString() } : {}),
        };

        const result = await updateMaterialNew(id, updateData);
        toast.dismiss(loadingToast);
        
        if (result && result.success === false) {
          throw new Error(result.message || 'Cập nhật trạng thái thất bại');
        }

        toast.success(`Đã cập nhật trạng thái thành công: ${status}`);
        fetchData();

      } catch (error) {
        toast.dismiss(loadingToast);
        console.error('Error updating status:', error);
        toast.error('Lỗi khi cập nhật trạng thái: ' + (error.message || 'Đã có lỗi xảy ra'));
      }

    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Lỗi khi cập nhật trạng thái: ' + (error.message || 'Đã có lỗi xảy ra'));
    }
  };

  const handleExport = () => {
    try {
      const exportData = data.map(item => ({
        VENDOR: item.VENDOR,
        FAMILY_CORE: item.FAMILY_CORE,
        FAMILY_PP: item.FAMILY_PP,
        IS_HF: item.IS_HF,
        MATERIAL_TYPE: item.MATERIAL_TYPE,
        ERP: item.ERP,
        ERP_PP: item.ERP_PP,
        ERP_VENDOR: item.ERP_VENDOR,
        IS_CAF: item.IS_CAF,
        TG: item.TG,
        BORD_TYPE: item.BORD_TYPE,
        PLASTIC: item.PLASTIC,
        FILE_NAME: item.FILE_NAME,
        DATA: item.DATA,
        REQUESTER_NAME: item.REQUESTER_NAME,
        REQUEST_DATE: item.REQUEST_DATE ? new Date(item.REQUEST_DATE).toLocaleDateString() : '',
        STATUS: item.STATUS
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "Material New");
      XLSX.writeFile(wb, "MaterialNew.xlsx");

      toast.success('Xuất file Excel thành công');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Lỗi khi xuất file Excel');
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
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
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

  // ✅ SỬA: Đơn giản hóa handleSearch
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    const searchValue = selectedKeys[0];
    
    // Cập nhật search filters
    const newFilters = { ...searchFilters };
    if (searchValue) {
      newFilters[dataIndex] = searchValue;
    } else {
      delete newFilters[dataIndex];
    }
    setSearchFilters(newFilters);
    // Reset về trang 1 và fetch data với search filters mới
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
    
    confirm();
    fetchData(1, pagination.pageSize, newFilters);
    
  };

  // ✅ SỬA: Đơn giản hóa handleReset
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

  // ✅ SỬA: Sửa handleTableChange để xử lý pagination với search filters
  const handleTableChange = (paginationConfig, filters, sorter) => {
    console.log('Table change:', paginationConfig, 'Current filters:', searchFilters);
    
    // Cập nhật pagination state
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }));

    // Fetch data với current search filters
    fetchData(paginationConfig.current, paginationConfig.pageSize, searchFilters);
  };

  const columns = [
    {
      title: 'VENDOR',
      dataIndex: 'VENDOR',
      key: 'VENDOR',
      width: 150,
      align: 'center',
      ...getColumnSearchProps('VENDOR')
    },
    {
      title: 'FAMILY_CORE',
      dataIndex: 'FAMILY_CORE',
      key: 'FAMILY_CORE',
      width: 150,
      align: 'center',
      ...getColumnSearchProps('FAMILY_CORE')
    },
    {
      title: 'FAMILY_PP',
      dataIndex: 'FAMILY_PP',
      key: 'FAMILY_PP',
      width: 120,
      align: 'center',
      ...getColumnSearchProps('FAMILY_PP')
    },
    {
      title: 'IS_HF',
      dataIndex: 'IS_HF',
      key: 'IS_HF',
      width: 150,
      align: 'center',
      ...getColumnSearchProps('IS_HF')
    },
    {
      title: 'MATERIAL_TYPE',
      dataIndex: 'MATERIAL_TYPE',
      key: 'MATERIAL_TYPE',
      width: 120,
      align: 'center'
    },
    {
      title: 'ERP',
      dataIndex: 'ERP',
      key: 'ERP',
      width: 150,
      align: 'center'
    },
    {
      title: 'ERP_PP',
      dataIndex: 'ERP_PP',
      key: 'ERP_PP',
      width: 150,
      align: 'center'
    },
    {
      title: 'ERP_VENDOR',
      dataIndex: 'ERP_VENDOR',
      key: 'ERP_VENDOR',
      width: 100,
      align: 'center'
    },
    {
      title: 'IS_CAF',
      dataIndex: 'IS_CAF',
      key: 'IS_CAF',
      width: 100,
      align: 'center'
    },
    {
      title: 'TG',
      dataIndex: 'TG',
      key: 'TG',
      width: 100,
      align: 'center'
    },
    {
      title: 'BORD_TYPE',
      dataIndex: 'BORD_TYPE',
      key: 'BORD_TYPE',
      width: 150,
      align: 'center'
    },
    {
      title: 'PLASTIC',
      dataIndex: 'PLASTIC',
      key: 'PLASTIC',
      width: 120,
      align: 'center'
    },
    {
      title: 'FILE_NAME',
      dataIndex: 'FILE_NAME',
      key: 'FILE_NAME',
      width: 120,
      align: 'center'
    },
    {
      title: 'DATA',
      dataIndex: 'DATA',
      key: 'DATA',
      width: 120,
      align: 'center'
    },
    {
      title: 'Người yêu cầu',
      dataIndex: 'REQUESTER_NAME',
      key: 'REQUESTER_NAME',
      width: 150,
      fixed: 'left',
      align: 'center'
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'REQUEST_DATE',
      key: 'REQUEST_DATE',
      width: 120,
      align: 'center',
      render: (date) => date ? new Date(date).toLocaleDateString() : ''
    },
    {
      title: 'Người xử lý',
      dataIndex: 'HANDLER',
      key: 'HANDLER',
      width: 150,
      align: 'center',
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'COMPLETE_DATE',
      key: 'COMPLETE_DATE',
      width: 150,
      align: 'center',
      render: (date) => date ? new Date(date).toLocaleDateString() : ''
    },
    {
      title: 'Trạng thái',
      dataIndex: 'STATUS',
      key: 'STATUS',
      width: 120,
      align: 'center',
      fixed: 'right'
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <PermissionGuard requiredPermissions={['edit']}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingRecord(record);
              setModalVisible(true);
            }}
          />
          </PermissionGuard>
          <Button
            type="primary"
            icon={<HistoryOutlined />}
            onClick={async () => {
              try {
                const response = await fetchMaterialNewHistory(record.ID);
                setHistoryData(response.data);
                setHistoryModalVisible(true);
              } catch (error) {
                toast.error('Lỗi khi lấy lịch sử');
              }
            }}
          />
          <PermissionGuard requiredPermissions={['approve']}>
          <Popconfirm
            title="Chọn trạng thái"
            okText="Approve"
            cancelText="Cancel"
            okButtonProps={{
              icon: <CheckCircleOutlined />,
              style: { backgroundColor: '#52c41a', borderColor: '#52c41a' }
            }}
            cancelButtonProps={{
              icon: <CloseCircleOutlined />,
              style: { backgroundColor: '#8c8c8c', borderColor: '#8c8c8c', color: 'white' }
            }}
            onConfirm={() => handleStatusChange(record, 'Approve')}
            onCancel={() => handleStatusChange(record, 'Cancel')}
          >
            <Button
              type={record.STATUS === 'Approve' ? 'primary' : 'default'}
              style={{
                backgroundColor: record.STATUS === 'Approve' ? '#52c41a' :
                  record.STATUS === 'Cancel' ? '#8c8c8c' : '',
                borderColor: record.STATUS === 'Approve' ? '#52c41a' :
                  record.STATUS === 'Cancel' ? '#8c8c8c' : '',
                color: record.STATUS === 'Cancel' ? 'white' : ''
              }}
            >
              {record.STATUS || 'Pending'}
            </Button>
          </Popconfirm>
          </PermissionGuard>
          <PermissionGuard requiredPermissions={['delete']}>
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h1>New</h1>
          <div>
            <PermissionGuard requiredPermissions={['create']}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingRecord(null);
                setModalVisible(true);
              }}
              style={{ marginRight: 8 }}
            >
              Thêm mới
            </Button>
            </PermissionGuard>
            <Button
              type="default"
              onClick={handleExport}
              style={{ marginRight: 8 }}
            >
              Xuất Excel
            </Button>
            <PermissionGuard requiredPermissions={['create']}>
            <Button
              type="default"
              onClick={() => setImportReviewModalVisible(true)}
              style={{ marginRight: 8 }}
            >
              Import Excel
            </Button>
            </PermissionGuard>
             <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearchFilters({}); 
                  setPagination(prev => ({ ...prev, current: 1 })); 
                  setTimeout(() => {
                    fetchData(1, pagination.pageSize, {}); 
                  }, 100);
                }}
                style={{ marginRight: 8 }}
              >
                Bỏ lọc
              </Button>
          </div>
        </div>

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
            // ✅ SỬA: Đơn giản hóa pagination handlers
            onChange: (page, pageSize) => {
              console.log('Pagination onChange:', page, pageSize);
              fetchData(page, pageSize, searchFilters);
            },
            onShowSizeChange: (current, size) => {
              console.log('Page size changed:', current, size);
              fetchData(1, size, searchFilters);
            }
          }}
          onChange={handleTableChange}
          rowClassName={(record) => {
            if (record.STATUS === 'Pending') return 'row-pending';
            if (record.STATUS === 'Cancel') return 'row-cancel';
            return '';
          }}
        />

        <CreateMaterialNewModal
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingRecord(null);
          }}
          onSubmit={editingRecord ? handleUpdate : handleCreate}
          editingRecord={editingRecord}
        />
        <HistoryNewModal
          open={historyModalVisible}
          onCancel={() => setHistoryModalVisible(false)}
          data={historyData}
        />
        <ImportMaterialNewModal
          open={importReviewModalVisible}
          onCancel={() => setImportReviewModalVisible(false)}
          onSuccess={fetchData}
          loadData={fetchData}
        />
      </div>
    </MainLayout>
  );
};

export default MaterialProperties;