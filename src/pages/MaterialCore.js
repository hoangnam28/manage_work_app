import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Popconfirm, Input, Dropdown, Menu } from 'antd';
import Highlighter from 'react-highlight-words';
import ReasonModal from '../components/modal/ReasonModal';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  HistoryOutlined,
  ImportOutlined,
  DownOutlined,
  FileExcelOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import {
  fetchMaterialCoreList,
  createMaterialCore,
  updateMaterialCore,
  deleteMaterialCore,
  exportMaterialCore,
  fetchMaterialCoreHistory,
  exportMaterialCoreXml,
  downloadFile
} from '../utils/material-core-api';
import CreateMaterialCoreModal from '../components/modal/CreateMaterialCoreModal';
import MaterialCoreHistoryModal from '../components/modal/MaterialCoreHistoryModal';
import { toast, Toaster } from 'sonner';
import './MaterialCore.css';
import ImportMaterialCoreReviewModal from '../components/modal/ImportMaterialCoreReviewModal';
import { hasPermission, PermissionGuard } from '../utils/permissions';

const MaterialCore = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const searchInput = useRef(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [cloneRecord, setCloneRecord] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'clone'
  const [searchFilters, setSearchFilters] = useState({});
  const [reasonModal, setReasonModal] = useState({
  open: false,
  type: '', // 'update' hoặc 'delete'
  record: null,
  values: null,
  loading: false
});


  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
    pageSizeOptions: ['20', '50', '100', '200', '500'],
  });

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

      const response = await fetchMaterialCoreList({
        page: currentPage,
        pageSize: currentPageSize,
        ...currentFilters // ✅ Trực tiếp truyền filters thay vì wrap trong search object
      });

      // Kiểm tra và điều chỉnh trang hiện tại nếu vượt quá tổng số trang
      const totalPages = Math.ceil((response.pagination?.totalRecords || 0) / currentPageSize);
      const adjustedCurrent = Math.min(currentPage, totalPages || 1);

      if (adjustedCurrent !== currentPage && totalPages > 0) {
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
      console.error('Error fetching material pp data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (values, mode = 'create') => {
    try {
      let requesterName = 'Unknown';
      try {
        const userStr = localStorage.getItem('userInfo');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          requesterName = userObj.username || 'Unknown';
        }
      } catch (e) {
        requesterName = localStorage.getItem('username') || 'Unknown';
      }

      const today = new Date();
      const topArr = Array.isArray(values.top_foil_cu_weight) ? values.top_foil_cu_weight : [values.top_foil_cu_weight];
      const botArr = Array.isArray(values.bot_foil_cu_weight) ? values.bot_foil_cu_weight : [values.bot_foil_cu_weight];

      const result = await createMaterialCore({
        ...values,
        requester_name: requesterName,
        request_date: today,
        status: 'Pending',
        top_foil_cu_weight: topArr,
        bot_foil_cu_weight: botArr
      });

      if (result && result.success === false) {
        throw new Error(result.message || 'Tạo mới thất bại');
      }

      // Refresh với current pagination hoặc về trang đầu
      fetchData(1, pagination.pageSize); // Reset về trang 1 để thấy record mới

      setModalVisible(false);
      setCloneRecord(null);
      setModalMode('create');

      const successMessage = mode === 'clone'
        ? `Đã tạo bản sao thành công ${topArr.length} bản ghi`
        : `Đã thêm thành công ${topArr.length} bản ghi`;

      return { success: true, message: successMessage };

    } catch (error) {
      console.error('Error creating material core:', error);
      throw new Error('Lỗi khi thêm mới: ' + (error.message || 'Đã có lỗi xảy ra'));
    }
  };

  const handleUpdate = async (values) => {
  try {
    const recordId = editingRecord.ID || editingRecord.id;

    if (!recordId) {
      throw new Error('ID không hợp lệ');
    }

    // Thực hiện update ngay nếu là status update
    const result = await updateMaterialCore(recordId, values);
    if (result && result.success === false) {
      throw new Error(result.message || 'Cập nhật thất bại');
    }

    fetchData(pagination.current, pagination.pageSize);
    setModalVisible(false);
    setEditingRecord(null);

    return { success: true, message: 'Cập nhật thành công' };

  } catch (error) {
    console.error('Error updating material core:', error);
    throw new Error('Lỗi khi cập nhật: ' + (error.message || 'Đã có lỗi xảy ra'));
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

      const loadingToast = toast.loading('Đang cập nhật trạng thái...');

      try {
        // Get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const handler = userInfo.username || 'Unknown';
        // Prepare update data with proper status change
        const updateData = {
          status,
          handler,
          // Only update complete_date when status is Approve
          ...(status === 'Approve' || 'Cancel' ? { complete_date: new Date().toISOString() } : {}),
        };

        console.log('Sending update data:', updateData);

        const result = await updateMaterialCore(id, updateData);

        toast.dismiss(loadingToast);

        if (result && result.success === false) {
          throw new Error(result.message || 'Cập nhật trạng thái thất bại');
        }

        toast.success(`Đã cập nhật trạng thái thành công: ${status}`);
        console.log('✅ Status update successful, email should be sent');

        // Refresh data after successful update
        setTimeout(() => {
          fetchData(pagination.current, pagination.pageSize);
        }, 500);

      } catch (error) {
        toast.dismiss(loadingToast);
        console.error('Error updating status:', error);
        toast.error('Lỗi khi cập nhật trạng thái: ' + (error.message || 'Đã có lỗi xảy ra'));
      }

    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      toast.error('Lỗi khi cập nhật trạng thái: ' + (error.message || 'Đã có lỗi xảy ra'));
    }
  };
  const handleDelete = async (record) => {
  try {
    const id = Number(record?.id ?? record?.ID ?? record);
    if (!id || isNaN(id)) {
      toast.error('ID không hợp lệ, không thể xóa!');
      return;
    }
    
    // Mở modal nhập lý do thay vì gọi API trực tiếp
    setReasonModal({
      open: true,
      type: 'delete',
      record: record, // Truyền toàn bộ record thay vì chỉ recordId
      values: null,
      loading: false
    });
  } catch (error) {
    console.error('Error in handleDelete:', error);
    toast.error('Lỗi khi chuẩn bị xóa');
  }
};
  // Frontend: MaterialCore.js - Optimized handleStatusChange

const handleReasonConfirm = async (reason) => {
  setReasonModal(prev => ({ ...prev, loading: true }));

  try {
    if (reasonModal.type === 'update') {
      const recordId = reasonModal.record.ID || reasonModal.record.id;
      const updateData = { ...reasonModal.values, reason };
      
      const result = await updateMaterialCore(recordId, updateData);
      if (result && result.success === false) {
        throw new Error(result.message || 'Cập nhật thất bại');
      }

      fetchData(pagination.current, pagination.pageSize);
      setModalVisible(false);
      setEditingRecord(null);
      toast.success('Cập nhật thành công');

    } else if (reasonModal.type === 'delete') {
      const id = Number(reasonModal.record?.id ?? reasonModal.record?.ID ?? reasonModal.record);
      if (!id || isNaN(id)) {
        toast.error('ID không hợp lệ, không thể xóa!');
        return;
      }

      // Gọi API với reason trong body
      await deleteMaterialCore(id, { reason });
      toast.success('Xóa thành công');
      fetchData(pagination.current, pagination.pageSize);
    }

  } catch (error) {
    console.error('Error:', error);
    toast.error('Có lỗi xảy ra: ' + error.message);
  } finally {
    setReasonModal({ open: false, type: '', record: null, values: null, loading: false });
  }
};

const handleReasonCancel = () => {
  setReasonModal({ open: false, type: '', record: null, values: null, loading: false });
};
  const handleExport = async () => {
    try {
      const loadingToast = toast.loading('Đang xuất dữ liệu...');
      const response = await exportMaterialCore();

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MaterialCoreExport_${new Date().toISOString().split('T')[0]}.xlsm`);
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
  const handleExportXml = async () => {
    try {
      const loadingToast = toast.loading('Đang xuất dữ liệu XML...');
      const response = await exportMaterialCoreXml();

      // Sử dụng helper function downloadFile
      downloadFile(response, `MaterialCore_Pending_Export_${new Date().toISOString().split('T')[0]}.xml`);

      toast.dismiss(loadingToast);
      toast.success('Xuất file XML thành công!');
    } catch (error) {
      console.error('Export XML error:', error);
      toast.error('Lỗi khi xuất file XML: ' + (error.message || 'Đã có lỗi xảy ra'));
    }
  };
  const handleImportSuccess = () => {
    toast.success('Import thành công!');
    fetchData(1, pagination.pageSize); // Refresh data
  };
  const handleClone = (record) => {
    setModalMode('clone');
    setCloneRecord(record);
    setEditingRecord(null);
    setModalVisible(true);
  };
  const handleViewDetails = (record) => {
    setModalMode('view');
    setEditingRecord(record);
    setCloneRecord(null);
    setModalVisible(true);
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

    // Cập nhật pagination state
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }));

    // Fetch data với current filters
    fetchData(paginationConfig.current, paginationConfig.pageSize, searchFilters);
  };

  const importMenu = (
    <Menu>
      <PermissionGuard requiredPermissions={['create', 'edit']}>
        <Menu.Item
          key="import"
          icon={<ImportOutlined />}
          onClick={() => setImportModalVisible(true)}
        >
          Import từ Excel
        </Menu.Item>
        <Menu.Divider />
      </PermissionGuard>
      <PermissionGuard requiredPermissions={['view']}>
        <Menu.Item
          key="export-excel"
          icon={<FileExcelOutlined />}
          onClick={handleExport}
        >
          Export Excel (.xlsm)
        </Menu.Item>
      </PermissionGuard>
      <PermissionGuard requiredPermissions={['view']}>
        <Menu.Item
          key="export-xml"
          icon={<FileExcelOutlined />}
          onClick={handleExportXml}
        >
          Export XML (Pending Only)
        </Menu.Item>
      </PermissionGuard>
    </Menu>
  );
  const columns = [
    {
      title: 'Vendor',
      dataIndex: 'VENDOR',
      key: 'vendor',
      width: 150,
      align: 'center',
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => handleViewDetails(record)}
          style={{
            padding: 0,
            height: 'auto',
            color: '#1890ff',
            fontWeight: 'normal'
          }}
          title="Click để xem chi tiết bản ghi này"
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Family',
      dataIndex: 'FAMILY',
      key: 'family',
      width: 150,
      align: 'center',
      ...getColumnSearchProps('FAMILY')
    },
    {
      title: 'PREPREG_Count',
      dataIndex: 'PREPREG_COUNT',
      key: 'prepreg_count',
      width: 120,
      align: 'center',
    },
    {
      title: 'Nominal_Thickness',
      dataIndex: 'NOMINAL_THICKNESS',
      key: 'nominal_thickness',
      width: 160,
      align: 'center',
      ...getColumnSearchProps('NOMINAL_THICKNESS')
    },
    {
      title: 'Spec_Thickness',
      dataIndex: 'SPEC_THICKNESS',
      key: 'spec_thickness',
      width: 150,
      align: 'center',
      ...getColumnSearchProps('SPEC_THICKNESS')
    },
    {
      title: 'PREFERENCE_CLASS',
      dataIndex: 'PREFERENCE_CLASS',
      key: 'preference_class',
      width: 150,
      align: 'center'
    },
    {
      title: 'USE_TYPE',
      dataIndex: 'USE_TYPE',
      key: 'use_type',
      width: 150,
      align: 'center',
    },
    {
      title: 'RIGID',
      dataIndex: 'RIGID',
      key: 'rigid',
      width: 120,
      render: (value) => value === 'TRUE' ? 'Có' : 'Không',
      align: 'center',
    },
    {
      title: 'Top_Foil_Cu_Weight',
      dataIndex: 'TOP_FOIL_CU_WEIGHT',
      key: 'top_foil_cu_weight',
      width: 180,
      align: 'center',
      ...getColumnSearchProps('TOP_FOIL_CU_WEIGHT')
    },
    {
      title: 'Bottom_Foil_Cu_Weight',
      dataIndex: 'BOT_FOIL_CU_WEIGHT',
      key: 'bot_foil_cu_weight',
      width: 200,
      align: 'center',
      ...getColumnSearchProps('BOT_FOIL_CU_WEIGHT')
    },
    {
      title: 'Tg_Min',
      dataIndex: 'TG_MIN',
      key: 'tg_min',
      width: 100,
      align: 'center',
    },
    {
      title: 'Tg_Max',
      dataIndex: 'TG_MAX',
      key: 'tg_max',
      width: 100,
      align: 'center',
    },
    {
      title: 'Center_Glass',
      dataIndex: 'CENTER_GLASS',
      key: 'center_glass',
      width: 150,
      align: 'center',
      ...getColumnSearchProps('CENTER_GLASS')
    },
    {
      title: 'Dk_0_1G',
      dataIndex: 'DK_01G',
      key: 'dk_01g',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_0_1G',
      dataIndex: 'DF_01G',
      key: 'df_01g',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_0_001GHz',
      dataIndex: 'DK_0_001GHZ',
      key: 'dk_0_001ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_0_001GHz',
      dataIndex: 'DF_0_001GHZ',
      key: 'df_0_001ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_0_01GHz',
      dataIndex: 'DK_0_01GHZ',
      key: 'dk_0_01ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_0_01GHz',
      dataIndex: 'DF_0_01GHZ',
      key: 'df_0_01ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_0_02GHz',
      dataIndex: 'DK_0_02GHZ',
      key: 'dk_0_02ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_0_02GHz',
      dataIndex: 'DF_0_02GHZ',
      key: 'df_0_02ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_2GHz',
      dataIndex: 'DK_2GHZ',
      key: 'dk_2ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_2GHz',
      dataIndex: 'DF_2GHZ',
      key: 'df_2ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_2_45GHz',
      dataIndex: 'DK_2_45GHZ',
      key: 'dk_2_45ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_2_45GHz',
      dataIndex: 'DF_2_45GHZ',
      key: 'df_2_45ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_3GHz',
      dataIndex: 'DK_3GHZ',
      key: 'dk_3ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_3GHz',
      dataIndex: 'DF_3GHZ',
      key: 'df_3ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_4GHz',
      dataIndex: 'DK_4GHZ',
      key: 'dk_4ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_4GHz',
      dataIndex: 'DF_4GHZ',
      key: 'df_4ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_5GHz',
      dataIndex: 'DK_5GHZ',
      key: 'dk_5ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_5GHz',
      dataIndex: 'DF_5GHZ',
      key: 'df_5ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_6GHz',
      dataIndex: 'DK_6GHZ',
      key: 'dk_6ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_6GHz',
      dataIndex: 'DF_6GHZ',
      key: 'df_6ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_7GHz',
      dataIndex: 'DK_7GHZ',
      key: 'dk_7ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_7GHz',
      dataIndex: 'DF_7GHZ',
      key: 'df_7ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_8GHz',
      dataIndex: 'DK_8GHZ',
      key: 'dk_8ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_8GHz',
      dataIndex: 'DF_8GHZ',
      key: 'df_8ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_9GHz',
      dataIndex: 'DK_9GHZ',
      key: 'dk_9ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_9GHz',
      dataIndex: 'DF_9GHZ',
      key: 'df_9ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_10GHz',
      dataIndex: 'DK_10GHZ',
      key: 'dk_10ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_10GHz',
      dataIndex: 'DF_10GHZ',
      key: 'df_10ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_15GHz',
      dataIndex: 'DK_15GHZ',
      key: 'dk_15ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_15GHz',
      dataIndex: 'DF_15GHZ',
      key: 'df_15ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_16GHz',
      dataIndex: 'DK_16GHZ',
      key: 'dk_16ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_16GHz',
      dataIndex: 'DF_16GHZ',
      key: 'df_16ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_20GHz',
      dataIndex: 'DK_20GHZ',
      key: 'dk_20ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_20GHz',
      dataIndex: 'DF_20GHZ',
      key: 'df_20ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_25GHz',
      dataIndex: 'DK_25GHZ',
      key: 'dk_25ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_25GHz',
      dataIndex: 'DF_25GHZ',
      key: 'df_25ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_30GHz',
      dataIndex: 'DK_30GHZ',
      key: 'dk_30ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_30GHz',
      dataIndex: 'DF_30GHZ',
      key: 'df_30ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_35GHz',
      dataIndex: 'DK_35GHZ',
      key: 'dk_35ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_35GHz',
      dataIndex: 'DF_35GHZ',
      key: 'df_35ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_40GHz',
      dataIndex: 'DK_40GHZ',
      key: 'dk_40ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_40GHz',
      dataIndex: 'DF_40GHZ',
      key: 'df_40ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_45GHz',
      dataIndex: 'DK_45GHZ',
      key: 'dk_45ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_45GHz',
      dataIndex: 'DF_45GHZ',
      key: 'df_45ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_50GHz',
      dataIndex: 'DK_50GHZ',
      key: 'dk_50ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_50GHz',
      dataIndex: 'DF_50GHZ',
      key: 'df_50ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Dk_55GHz',
      dataIndex: 'DK_55GHZ',
      key: 'dk_55ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'Df_55GHz',
      dataIndex: 'DF_55GHZ',
      key: 'df_55ghz',
      width: 120,
      align: 'center',
    },
    {
      title: 'IS_HF',
      dataIndex: 'IS_HF',
      key: 'is_hf',
      width: 120,
      render: (value) => value === 'TRUE' ? 'Có' : 'Không',
      align: 'center',
    },
    {
      title: 'DATA_SOURCE',
      dataIndex: 'DATA_SOURCE',
      key: 'data_source',
      width: 200,
      align: 'center',
    },
    {
      title: 'FILE_NAME',
      dataIndex: 'FILENAME',
      key: 'filename',
      width: 200,
      align: 'center',
    },
    {
      title: 'Người yêu cầu',
      dataIndex: 'REQUESTER_NAME',
      key: 'requester_name',
      width: 150,
      fixed: 'left',
      align: 'center',
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'REQUEST_DATE',
      key: 'request_date',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : '',
      align: 'center',
    },
    {
      title: 'Người xử lý',
      dataIndex: 'HANDLER',
      key: 'handler',
      width: 150,
      align: 'center',
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'COMPLETE_DATE',
      key: 'complete_date',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : '',
      align: 'center',
    },
    {
      title: 'Lý do',
      dataIndex: 'REASON',
      key: 'reason',
      width: 120,
      align: 'center',
    },
    {
    title: 'Thao tác',
    key: 'action',
    fixed: 'right',
    width: 220,
    align: 'center',
    render: (_, record) => {
      if (record.IS_DELETED === 1 || record.IS_DELETED === '1') {
        return (
          <Space size="middle">
            <span style={{ color: '#f0e8e8ff', fontStyle: 'italic' }}>
              Đã xóa
            </span>
            <PermissionGuard requiredPermissions={['view']}>
              <Button
                type="primary"
                icon={<HistoryOutlined />}
                onClick={async () => {
                  try {
                    const response = await fetchMaterialCoreHistory(record.ID);
                    setHistoryData(response.data);
                    setHistoryModalVisible(true);
                  } catch (error) {
                    toast.error('Lỗi khi lấy lịch sử');
                  }
                }}
                title="Lịch sử"
              />
            </PermissionGuard>
          </Space>
        );
      }
      return (
        <Space size="middle">
          <PermissionGuard requiredPermissions={['edit']}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setModalMode('edit');
                setEditingRecord(record);
                setCloneRecord(null);
                setModalVisible(true);
              }}
              title="Sửa"
            />
          </PermissionGuard>

          <PermissionGuard requiredPermissions={['create']}>
            <Button
              type="default"
              icon={<CopyOutlined />}
              onClick={() => handleClone(record)}
              title="Tạo bản sao"
              style={{ color: '#52c41a', borderColor: '#52c41a' }}
            />
          </PermissionGuard>

          <PermissionGuard requiredPermissions={['view']}>
            <Button
              type="primary"
              icon={<HistoryOutlined />}
              onClick={async () => {
                try {
                  const response = await fetchMaterialCoreHistory(record.ID);
                  setHistoryData(response.data);
                  setHistoryModalVisible(true);
                } catch (error) {
                  toast.error('Lỗi khi lấy lịch sử');
                }
              }}
              title="Lịch sử"
            />
          </PermissionGuard>

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

          {!hasPermission('approve') && (
            <Button
              type="default"
              disabled
              style={{
                backgroundColor: record.STATUS === 'Approve' ? '#52c41a' :
                  record.STATUS === 'Cancel' ? '#8c8c8c' : '#f0f0f0',
                borderColor: record.STATUS === 'Approve' ? '#52c41a' :
                  record.STATUS === 'Cancel' ? '#8c8c8c' : '#d9d9d9',
                color: record.STATUS === 'Cancel' ? 'white' :
                  record.STATUS === 'Approve' ? 'white' : '#00000040'
              }}
            >
              {record.STATUS || 'Pending'}
            </Button>
          )}

          <PermissionGuard requiredPermissions={['delete']}>
            <Popconfirm
              title="Xác nhận xóa?"
              onConfirm={() => handleDelete(record)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="primary" danger icon={<DeleteOutlined />} title="Xóa" />
            </Popconfirm>
          </PermissionGuard>
        </Space>
      );
  },
}
  ];


  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h1 style={{ color: '#e29a51ff' }}>
            Core
          </h1>
          <div>
            <select
              style={{ height: 32, minWidth: 180, marginRight: 8, borderRadius: 4, border: '1px solid #1890ff', color: '#1890ff', fontWeight: 500 }}
              onChange={e => {
                const val = e.target.value;
                if (val) window.open(val, '_blank', 'noopener,noreferrer');
              }}
              defaultValue=""
            >
              <option value="" disabled hidden>Hướng dẫn sử dụng</option>
              <option value="/material_core.pdf">Hướng dẫn sử dụng tổng quan</option>
              <option value="/flow_systems.pdf">Lưu trình sử dụng</option>
            </select>
          </div>

          <div>
            <PermissionGuard requiredPermissions={['create']}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setModalMode('create');
                  setEditingRecord(null);
                  setCloneRecord(null);
                  setModalVisible(true);
                }}
                style={{ marginRight: 8 }}
              >
                Thêm mới
              </Button>
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
            </PermissionGuard>
            <PermissionGuard requiredPermissions={['view']}>
              <Dropdown overlay={importMenu} trigger={['click']}>
                <Button style={{ marginRight: 8 }}>
                  <FileExcelOutlined /> Import/Export <DownOutlined />
                </Button>
              </Dropdown>
            </PermissionGuard>
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
            onChange: (page, pageSize) => {
              console.log('Pagination changed:', page, pageSize);
              fetchData(page, pageSize, searchFilters);
            },
            onShowSizeChange: (current, size) => {
              console.log('Page size changed:', current, size);
              fetchData(1, size, searchFilters);
            }
          }}
          onChange={handleTableChange}
          rowClassName={(record) => {
            if (record.IS_DELETED === 1 || record.IS_DELETED === '1') return 'row-deleted';
            if (record.STATUS === 'Pending') return 'row-pending';
            if (record.STATUS === 'Cancel') return 'row-cancel';
            return '';
          }}
        />
        <CreateMaterialCoreModal
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingRecord(null);
            setCloneRecord(null);
            setModalMode('create');
          }}
          onSubmit={modalMode === 'edit' ? handleUpdate : handleCreate}
          editingRecord={editingRecord}
          cloneRecord={cloneRecord}
          mode={modalMode}
        />
        <MaterialCoreHistoryModal
          open={historyModalVisible}
          onCancel={() => setHistoryModalVisible(false)}
          data={historyData}
        />
        <ImportMaterialCoreReviewModal
          open={importModalVisible}
          onCancel={() => setImportModalVisible(false)}
          onSuccess={handleImportSuccess}
        />
        <ReasonModal
          open={reasonModal.open}
          onCancel={handleReasonCancel}
          onConfirm={handleReasonConfirm}
          title={reasonModal.type === 'delete' ? 'Nhập lý do xóa' : 'Nhập lý do cập nhật'}
          placeholder={reasonModal.type === 'delete' ? 'Vui lòng nhập lý do xóa...' : 'Vui lòng nhập lý do cập nhật...'}
          loading={reasonModal.loading}
        />
      </div>
    </MainLayout>
  );
};

export default MaterialCore;