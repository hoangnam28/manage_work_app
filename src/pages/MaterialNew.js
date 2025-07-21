import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Popconfirm, Input } from 'antd';
import Highlighter from 'react-highlight-words';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import {
  fetchMaterialNewList,
  createMaterialNew,
  updateMaterialNew,
  deleteMaterialNew,
  exportMaterialNew,
} from '../utils/material-new-api';
import CreateMaterialPpModal from '../components/modal/CreateMaterialPPModal';
import { toast, Toaster } from 'sonner';
import './MaterialCore.css';


const MaterialProperties = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchMaterialNewList();
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
  const handleCreate = async (values) => {
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
        await createMaterialNew({
          ...values,
          resin_percentage: resin,
          name: requesterName,
          request_date: today,
          status: 'Pending',
        });
      }

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
      // Đảm bảo lấy đúng id, ưu tiên id, nếu không có thì lấy ID
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
  const handleExport = async () => {
      try {
        const response = await exportMaterialNew(data);
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
  onFilter: (value, record) =>
    record[dataIndex]
      .toString()
      .toLowerCase()
      .includes(value.toLowerCase()),
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
      align: 'center'
    },
    {
      title: 'FAMILY_Core',
      dataIndex: 'FAMILY_Core',
      key: 'family_core',
      width: 150,
      align: 'center',
      ...getColumnSearchProps('FAMILY_Core')
    },
    {
      title: 'FAMILY_PP',
      dataIndex: 'FAMILY_PP',
      key: 'family_pp',
      width: 120,
      align: 'center',
      ...getColumnSearchProps('FAMILY_PP')
    },
    {
      title: 'IS_HF',
      dataIndex: 'IS_HF',
      key: 'is_hf',
      width: 150,
      align: 'center',
      ...getColumnSearchProps('IS_HF')
    },
    {
      title: 'MATERIAL_TYPE',
      dataIndex: 'MATERIAL_TYPE',
      key: 'material_type',
      width: 120,
      align: 'center'
    },
    {
      title: 'ERP',
      dataIndex: 'ERP',
      key: 'erp',
      width: 150,
      align: 'center'
    },
    {
      title: 'ERP_VENDOR',
      dataIndex: 'ERP_VENDOR',
      key: 'erp_vendor',
      width: 100,
      align: 'center'
    },
    {
      title: 'IS_CAF',
      dataIndex: 'IS_CAF',
      key: 'is_caf',
      width: 100,
      align: 'center'
    },
    {
      title: 'TG(TMA)',
      dataIndex: 'TG_TMA',
      key: 'tg_tma',
      width: 100,
      align: 'center'
    },
    {
      title: 'BoardType',
      dataIndex: 'BORD_TYPE',
      key: 'bord_type',
      width: 150,
      align: 'center'
    },
    {
      title: 'Mật độ nhựa',
      dataIndex: 'plastic',
      key: 'plastic',
      width: 120,
      align: 'center'
    },
    {
      title: 'DK-DF_FileName',
      dataIndex: 'file_name',
      key: 'file_name',
      width: 120,
      align: 'center'
    },
    {
      title: 'DATA_SOURCE',
      dataIndex: 'data',
      key: 'data',
      width: 120,
      align: 'center'
    },
    {
      title: 'Người yêu cầu',
      dataIndex: 'REQUESTER_NAME',
      key: 'requester_name',
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
      title: 'Trạng thái',
      dataIndex: 'STATUS',
      key: 'status',
      width: 120,
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
              setEditingRecord(record);
              setModalVisible(true);
            }}
          />
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
          <h1>Material New</h1>
          <div>
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
          <Button
            type="default"
            onClick={handleExport}
          >
            Xuất Excel
          </Button>
        </div>
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

        <CreateMaterialPpModal
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingRecord(null);
          }}
          onSubmit={editingRecord ? handleUpdate : handleCreate}
          editingRecord={editingRecord}
        />
      </div>
    </MainLayout>
  );
};

export default MaterialProperties;
