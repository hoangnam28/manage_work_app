import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Popconfirm, Input } from 'antd';
import Highlighter from 'react-highlight-words';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  HistoryOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import {
  fetchMaterialPpList,
  createMaterialPp,
  updateMaterialPp,
  deleteMaterialPp,
  exportMaterialPp,
  fetchMaterialPpHistory
} from '../utils/material-pp-api';
import CreateMaterialPpModal from '../components/modal/CreateMaterialPPModal';
import MaterialPpHistoryModal from '../components/modal/MaterialPpHistoryModal';
import { toast, Toaster } from 'sonner';
import './MaterialCore.css';
import ImportMaterialPpReviewModal from '../components/modal/ImportMaterialPpReviewModal';


const MaterialProperties = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [importReviewModalVisible, setImportReviewModalVisible] = useState(false);
  const [cloneRecord, setCloneRecord] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchMaterialPpList();
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching material core data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      const resinArr = String(values.resin_percentage)
        .split(',')
        .map(v => Number(v.trim()))
        .filter(v => !isNaN(v));

      // Gửi từng bản ghi lên BE
      for (const resin of resinArr) {
        await createMaterialPp({
          ...values,
          resin_percentage: resin,
          name: requesterName,
          request_date: today,
          status: 'Pending',
        });
      }
      setCloneRecord(null); // Reset clone record
      setModalMode('create'); // Reset mode
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

      console.log('Updating record:', {
        recordId,
        editingRecord,
        values
      });

      await updateMaterialPp(recordId, values);
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
      // Đảm bảo lấy đúng id, ưu tiên id, nếu không có thì lấy ID
      const id = Number(recordId?.id ?? recordId?.ID ?? recordId);
      if (!id || isNaN(id)) {
        toast.error('ID không hợp lệ, không thể xóa!');
        return;
      }
      await deleteMaterialPp(id);
      toast.success('Xóa thành công');
      fetchData();
    } catch (error) {
      console.error('Error deleting material core:', error);
      toast.error('Lỗi khi xóa');
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
          };
  
          const result = await updateMaterialPp(id, updateData);
          toast.dismiss(loadingToast);
          if (result && result.success === false) {
            throw new Error(result.message || 'Cập nhật trạng thái thất bại');
          }
  
          toast.success(`Đã cập nhật trạng thái thành công: ${status}`);
  
          // Refresh với current pagination
          setTimeout(() => {
            fetchData();
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
  const handleExport = async () => {
    try {
      const response = await exportMaterialPp(data);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'MaterialCoreExport.xlsm');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Lỗi khi xuất file');
    }
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
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
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
    onFilter: (value, record) => {
      // Fix: Handle null/undefined values safely
      const fieldValue = record[dataIndex];
      if (fieldValue === null || fieldValue === undefined) {
        return false; // or return true if you want to include null values in search
      }
      return fieldValue
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
    fetchData();
  };


  const columns = [

    {
      title: 'VENDOR',
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
      title: 'FAMILY',
      dataIndex: 'FAMILY',
      key: 'family',
      width: 150,
      align: 'center',
      ...getColumnSearchProps('FAMILY')
    },
    {
      title: 'GLASS_STYLE',
      dataIndex: 'GLASS_STYLE',
      key: 'glass_style',
      width: 120,
      align: 'center',
      ...getColumnSearchProps('GLASS_STYLE')
    },
    {
      title: 'RESIN_PERCENTAGE',
      dataIndex: 'RESIN_PERCENTAGE',
      key: 'resin_percentage',
      width: 150,
      align: 'center',
      ...getColumnSearchProps('RESIN_PERCENTAGE')
    },
    {
      title: 'PREFERENCE_CLASS',
      dataIndex: 'PREFERENCE_CLASS',
      key: 'preference_class',
      width: 120,
      align: 'center'
    },
    {
      title: 'USE_TYPE',
      dataIndex: 'USE_TYPE',
      key: 'use_type',
      width: 150,
      align: 'center'
    },
    {
      title: 'PP_TYPE',
      dataIndex: 'PP_TYPE',
      key: 'pp_type',
      width: 100,
      align: 'center'
    },
    {
      title: 'TG_MIN',
      dataIndex: 'TG_MIN',
      key: 'tg_min',
      width: 100,
      align: 'center'
    },
    {
      title: 'TG_MAX',
      dataIndex: 'TG_MAX',
      key: 'tg_max',
      width: 100,
      align: 'center'
    },
    {
      title: 'DK_01G',
      dataIndex: 'DK_01G',
      key: 'dk_01g',
      width: 120,
      align: 'center'
    },
    {
      title: 'DF_01G',
      dataIndex: 'DF_01G',
      key: 'df_01g',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK_0_001GHZ',
      dataIndex: 'DK_0_001GHZ',
      key: 'dk_0_001ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DF_0_001GHZ',
      dataIndex: 'DF_0_001GHZ',
      key: 'df_0_001ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK_0_01GHZ',
      dataIndex: 'DK_0_01GHZ',
      key: 'dk_0_01ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DF_0_01GHZ',
      dataIndex: 'DF_0_01GHZ',
      key: 'df_0_01ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK_0_02GHZ',
      dataIndex: 'DK_0_02GHZ',
      key: 'dk_0_02ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DF_0_02GHZ',
      dataIndex: 'DF_0_02GHZ',
      key: 'df_0_02ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK_2GHZ',
      dataIndex: 'DK_2GHZ',
      key: 'dk_2ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DF_2GHZ',
      dataIndex: 'DF_2GHZ',
      key: 'df_2ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK_2_45GHZ',
      dataIndex: 'DK_2_45GHZ',
      key: 'dk_2_45ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DF_2_45GHZ',
      dataIndex: 'DF_2_45GHZ',
      key: 'df_2_45ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK_3GHZ',
      dataIndex: 'DK_3GHZ',
      key: 'dk_3ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DF_3GHZ',
      dataIndex: 'DF_3GHZ',
      key: 'df_3ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK_4GHz',
      dataIndex: 'DK_4GHZ',
      key: 'dk_4ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DF_4GHz',
      dataIndex: 'DF_4GHZ',
      key: 'df_4ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK_5GHz',
      dataIndex: 'DK_5GHZ',
      key: 'dk_5ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DF_5GHz',
      dataIndex: 'DF_5GHZ',
      key: 'df_5ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK_6GHz',
      dataIndex: 'DK_6GHZ',
      key: 'dk_6ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DF_7GHz',
      dataIndex: 'DF_7GHZ',
      key: 'df_5ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK_8GHz',
      dataIndex: 'DK_8GHZ',
      key: 'dk_8ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DF_8GHz',
      dataIndex: 'DF_8GHZ',
      key: 'df_8ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK_9GHz',
      dataIndex: 'DK_9GHZ',
      key: 'dk_9ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DF_9GHz',
      dataIndex: 'DF_9GHZ',
      key: 'df_9ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK_10GHz',
      dataIndex: 'DK_10GHZ',
      key: 'dk_10ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'Df @ 10GHz',
      dataIndex: 'DF_10GHZ',
      key: 'df_10ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'Dk @ 15GHz',
      dataIndex: 'DK_15GHZ',
      key: 'dk_15ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'Df @ 15GHz',
      dataIndex: 'DF_15GHZ',
      key: 'df_15ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'Dk @ 16GHz',
      dataIndex: 'DK_16GHZ',
      key: 'dk_16ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'Df @ 16GHz',
      dataIndex: 'DF_16GHZ',
      key: 'df_16ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'Dk @ 20GHz',
      dataIndex: 'DK_20GHZ',
      key: 'dk_20ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'Df @ 20GHz',
      dataIndex: 'DF_20GHZ',
      key: 'df_20ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'Dk @ 25GHz',
      dataIndex: 'DK_25GHZ',
      key: 'dk_25ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'Df @ 25GHz',
      dataIndex: 'DF_25GHZ',
      key: 'df_25ghz',
      width: 120,
      align: 'center'
    },
    {
      title: 'IS_HF',
      dataIndex: 'IS_HF',
      key: 'is_hf',
      width: 120,
      align: 'center',
      render: (value) => value === 'TRUE' ? 'Có' : 'Không'
    },
    {
      title: 'DATA_SOURCE',
      dataIndex: 'DATA_SOURCE',
      key: 'data_source',
      width: 200,
      align: 'center'
    },
    {
      title: 'FILE NAME',
      dataIndex: 'FILENAME',
      key: 'filename',
      width: 200,
      align: 'center'
    },
    {
      title: 'Người yêu cầu',
      dataIndex: 'NAME',
      key: 'name',
      width: 150,
      fixed: 'left',
      align: 'center'
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'REQUEST_DATE',
      key: 'request_date',
      width: 120,
      align: 'center',
      render: (date) => date ? new Date(date).toLocaleDateString() : ''
    },
    {
      title: 'Người xử lý',
      dataIndex: 'HANDLER',
      key: 'handler',
      width: 150,
      align: 'center'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'STATUS',
      key: 'status',
      width: 120,
      align: 'center'
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'COMPLETE_DATE',
      key: 'complete_date',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : '',
      align: 'center'
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 120,
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
                const response = await fetchMaterialPpHistory(record.ID);
                setHistoryData(response.data);
                setHistoryModalVisible(true);
              } catch (error) {
                toast.error('Lỗi khi lấy lịch sử');
              }
            }}
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
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h1>Material Prepreg</h1>
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
              onClick={handleExport}
              style={{ marginRight: 8 }}
            >
              Xuất Excel
            </Button>
            <Button
              type="default"
              onClick={() => setImportReviewModalVisible(true)}
            >
              Import Excel
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
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
            if (record.STATUS === 'Pending') return 'row-pending';
            if (record.STATUS === 'Cancel') return 'row-cancel';
            return '';
          }}
        />

        <CreateMaterialPpModal
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
        <MaterialPpHistoryModal
          open={historyModalVisible}
          onCancel={() => setHistoryModalVisible(false)}
          data={historyData}
        />
        <ImportMaterialPpReviewModal
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
