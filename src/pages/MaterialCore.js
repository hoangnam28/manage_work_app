import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Popconfirm, Input, Dropdown, Menu } from 'antd';
import Highlighter from 'react-highlight-words';
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
  CloseCircleOutlined
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

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
    pageSizeOptions: ['20','50', '100', '200', '500'],
  });

 const fetchData = async (page = 1, pageSize = 20, filters = {}) => {
    setLoading(true);
    try {
      // Xây dựng query params cho tìm kiếm
      const searchQuery = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          searchQuery[key.toLowerCase()] = value;
        }
      });
      
      const response = await fetchMaterialCoreList({
        page,
        pageSize,
        search: searchQuery
      });
      setData(response.data || []);

      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize: pageSize,
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
    fetchData(1, 20); 
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

      console.log('Updating record:', {
        recordId,
        editingRecord,
        values
      });

      const result = await updateMaterialCore(recordId, values);
      if (result && result.success === false) {
        throw new Error(result.message || 'Cập nhật thất bại');
      }

      // Refresh với current pagination
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
    try {
      const id = record.ID || record.id;
      if (!id) {
        toast.error('ID không hợp lệ, không thể cập nhật trạng thái!');
        return;
      }

      const loadingToast = toast.loading('Đang cập nhật...');

      try {
        // Lấy thông tin người dùng từ localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const handler = userInfo.username || 'Unknown';

        // Chuẩn bị dữ liệu cập nhật
        const updateData = {
          status,
          handler,
          // Chỉ cập nhật complete_date khi status là Approve
          ...(status === 'Approve' ? { complete_date: new Date().toISOString() } : {}),
          ...(record.DATA_SOURCE ? {} : { 
            data_source: `C:\\data_source\\${record.VENDOR || 'unknown'}\\${record.FAMILY || 'unknown'}`
          })
        };

        const result = await updateMaterialCore(id, updateData);
        toast.dismiss(loadingToast);
        if (result && result.success === false) {
          throw new Error(result.message || 'Cập nhật trạng thái thất bại');
        }

        toast.success(`Đã cập nhật trạng thái thành công: ${status}`);

        // Refresh với current pagination
        setTimeout(() => {
          fetchData(pagination.current, pagination.pageSize);
        }, 500);

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
  const handleDelete = async (recordId) => {
    try {
      const id = Number(recordId?.id ?? recordId?.ID ?? recordId);
      if (!id || isNaN(id)) {
        toast.error('ID không hợp lệ, không thể xóa!');
        return;
      }
      await deleteMaterialCore(id);
      toast.success('Xóa thành công');

      // Refresh với current pagination
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error deleting material core:', error);
      toast.error('Lỗi khi xóa');
    }
  };
  // Frontend: MaterialCore.js - Optimized handleStatusChange


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
    // Bỏ onFilter vì sẽ search trên server
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
  const handleReset = (clearFilters, dataIndex) => {
    // Xóa filter cho column này
    const newFilters = { ...searchFilters };
    delete newFilters[dataIndex];
    setSearchFilters(newFilters);
    
    // Reset pagination về trang 1
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
    
    // Fetch data với filters đã bị xóa
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
      <Menu.Item
        key="import"
        icon={<ImportOutlined />}
        onClick={() => setImportModalVisible(true)}
      >
        Import từ Excel
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="export-excel"
        icon={<FileExcelOutlined />}
        onClick={handleExport}
      >
        Export Excel (.xlsm)
      </Menu.Item>
      <Menu.Item
        key="export-xml"
        icon={<FileExcelOutlined />}
        onClick={handleExportXml}
      >
        Export XML (Pending Only)
      </Menu.Item>
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
          onClick={() => handleClone(record)}
          style={{
            padding: 0,
            height: 'auto',
            color: '#1890ff',
            fontWeight: 'normal'
          }}
          title="Click để tạo bản sao từ bản ghi này"
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
      title: 'Preference_Class',
      dataIndex: 'PREFERENCE_CLASS',
      key: 'preference_class',
      width: 120,
      align: 'center',
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
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 220, // Tăng width để chứa thêm button
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
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
          <Button
            type="default"
            icon={<CopyOutlined />}
            onClick={() => handleClone(record)}
            title="Tạo bản sao"
            style={{ color: '#52c41a', borderColor: '#52c41a' }}
          />
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
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h1 style={{ color: '#e29a51ff' }}>Core</h1>
          <div>
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
              type="default"
              icon={<FileExcelOutlined />}
              onClick={handleExportXml}
              style={{ marginRight: 8, backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
            >
              Export XML
            </Button>

            <Dropdown overlay={importMenu} trigger={['click']}>
              <Button style={{ marginRight: 8 }}>
                <FileExcelOutlined /> Import/Export <DownOutlined />
              </Button>
            </Dropdown>
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
              fetchData(page, pageSize, searchFilters); // Truyền searchFilters
            },
            onShowSizeChange: (current, size) => {
              console.log('Page size changed:', current, size);
              fetchData(1, size, searchFilters); // Reset về trang 1 với search filters
            }
          }}
          onChange={handleTableChange} // Thêm onChange handler
          rowClassName={(record) => {
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
      </div>
    </MainLayout>
  );
};

export default MaterialCore;