import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined 
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import { 
  fetchMaterialPpList, 
  createMaterialPp,
  updateMaterialPp,
  deleteMaterialPp 
} from '../utils/material-pp-api';
import CreateMaterialPpModal from '../components/modal/CreateMaterialPPModal';
import { toast } from 'sonner';
import './MaterialCore.css';

const MaterialProperties = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

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
  
      await createMaterialPp({
        ...values,
        name: requesterName,
        request_date: today,
        status: 'Pending',
      });
  
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

  const columns = [
    {
      title: 'Người yêu cầu',
      dataIndex: 'NAME',
      key: 'name',
      width: 150,
      fixed: 'left'
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'REQUEST_DATE',
      key: 'request_date',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : ''
    },
    {
      title: 'Người xử lý',
      dataIndex: 'HANDLER',
      key: 'handler',
      width: 150
    },
    {
      title: 'Trạng thái',
      dataIndex: 'STATUS',
      key: 'status',
      width: 120
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'COMPLETE_DATE',
      key: 'complete_date',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : ''
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'VENDOR',
      key: 'vendor',
      width: 150
    },
    {
      title: 'FAMILY',
      dataIndex: 'FAMILY',
      key: 'family',
      width: 150
    },
    {
      title: 'Số lớp prepreg',
      dataIndex: 'PREPREG_COUNT',
      key: 'prepreg_count',
      width: 120
    },
    {
      title: 'Độ dày danh nghĩa',
      dataIndex: 'NOMINAL_THICKNESS',
      key: 'nominal_thickness',
      width: 150
    },
    {
      title: 'Độ dày spec',
      dataIndex: 'SPEC_THICKNESS',
      key: 'spec_thickness',
      width: 120
    },
    {
      title: 'Preference Class',
      dataIndex: 'PREFERENCE_CLASS',
      key: 'preference_class',
      width: 120
    },
    {
      title: 'Loại sử dụng',
      dataIndex: 'USE_TYPE',
      key: 'use_type',
      width: 150
    },
    {
      title: 'Tg Min',
      dataIndex: 'TG_MIN',
      key: 'tg_min',
      width: 100
    },
    {
      title: 'Tg Max',
      dataIndex: 'TG_MAX',
      key: 'tg_max',
      width: 100
    },
    {
      title: 'Center Glass',
      dataIndex: 'CENTER_GLASS',
      key: 'center_glass',
      width: 150
    },
    {
      title: 'Dk @ 0.1GHz (Legacy)',
      dataIndex: 'DK_01G',
      key: 'dk_01g',
      width: 120
    },
    {
      title: 'Df @ 0.1GHz (Legacy)',
      dataIndex: 'DF_01G',
      key: 'df_01g',
      width: 120
    },
    {
      title: 'Dk @ 0.001GHz',
      dataIndex: 'DK_0_001GHZ',
      key: 'dk_0_001ghz',
      width: 120
    },
    {
      title: 'Df @ 0.001GHz',
      dataIndex: 'DF_0_001GHZ',
      key: 'df_0_001ghz',
      width: 120
    },
    {
      title: 'Dk @ 0.01GHz',
      dataIndex: 'DK_0_01GHZ',
      key: 'dk_0_01ghz',
      width: 120
    },
    {
      title: 'Df @ 0.01GHz',
      dataIndex: 'DF_0_01GHZ',
      key: 'df_0_01ghz',
      width: 120
    },
    {
      title: 'Dk @ 0.02GHz',
      dataIndex: 'DK_0_02GHZ',
      key: 'dk_0_02ghz',
      width: 120
    },
    {
      title: 'Df @ 0.02GHz',
      dataIndex: 'DF_0_02GHZ',
      key: 'df_0_02ghz',
      width: 120
    },
    {
      title: 'Dk @ 2GHz',
      dataIndex: 'DK_2GHZ',
      key: 'dk_2ghz',
      width: 120
    },
    {
      title: 'Df @ 2GHz',
      dataIndex: 'DF_2GHZ',
      key: 'df_2ghz',
      width: 120
    },
    {
      title: 'Dk @ 2.45GHz',
      dataIndex: 'DK_2_45GHZ',
      key: 'dk_2_45ghz',
      width: 120
    },
    {
      title: 'Df @ 2.45GHz',
      dataIndex: 'DF_2_45GHZ',
      key: 'df_2_45ghz',
      width: 120
    },
    {
      title: 'Dk @ 3GHz',
      dataIndex: 'DK_3GHZ',
      key: 'dk_3ghz',
      width: 120
    },
    {
      title: 'Df @ 3GHz',
      dataIndex: 'DF_3GHZ',
      key: 'df_3ghz',
      width: 120
    },
    {
      title: 'Dk @ 4GHz',
      dataIndex: 'DK_4GHZ',
      key: 'dk_4ghz',
      width: 120
    },
    {
      title: 'Df @ 4GHz',
      dataIndex: 'DF_4GHZ',
      key: 'df_4ghz',
      width: 120
    },
    {
      title: 'Dk @ 5GHz',
      dataIndex: 'DK_5GHZ',
      key: 'dk_5ghz',
      width: 120
    },
    {
      title: 'Df @ 5GHz',
      dataIndex: 'DF_5GHZ',
      key: 'df_5ghz',
      width: 120
    },
    {
      title: 'Dk @ 5GHz_2',
      dataIndex: 'DK_5GHZ_2',
      key: 'dk_5ghz_2',
      width: 120
    },
    {
      title: 'Df @ 5GHz_2',
      dataIndex: 'DF_5GHZ_2',
      key: 'df_5ghz_2',
      width: 120
    },
    {
      title: 'Dk @ 8GHz',
      dataIndex: 'DK_8GHZ',
      key: 'dk_8ghz',
      width: 120
    },
    {
      title: 'Df @ 8GHz',
      dataIndex: 'DF_8GHZ',
      key: 'df_8ghz',
      width: 120
    },
    {
      title: 'Dk @ 10GHz',
      dataIndex: 'DK_10GHZ',
      key: 'dk_10ghz',
      width: 120
    },
    {
      title: 'Df @ 10GHz',
      dataIndex: 'DF_10GHZ',
      key: 'df_10ghz',
      width: 120
    },
    {
      title: 'Dk @ 15GHz',
      dataIndex: 'DK_15GHZ',
      key: 'dk_15ghz',
      width: 120
    },
    {
      title: 'Df @ 15GHz',
      dataIndex: 'DF_15GHZ',
      key: 'df_15ghz',
      width: 120
    },
    {
      title: 'Dk @ 16GHz',
      dataIndex: 'DK_16GHZ',
      key: 'dk_16ghz',
      width: 120
    },
    {
      title: 'Df @ 16GHz',
      dataIndex: 'DF_16GHZ',
      key: 'df_16ghz',
      width: 120
    },
    {
      title: 'Dk @ 20GHz',
      dataIndex: 'DK_20GHZ',
      key: 'dk_20ghz',
      width: 120
    },
    {
      title: 'Df @ 20GHz',
      dataIndex: 'DF_20GHZ',
      key: 'df_20ghz',
      width: 120
    },
    {
      title: 'Dk @ 25GHz',
      dataIndex: 'DK_25GHZ',
      key: 'dk_25ghz',
      width: 120
    },
    {
      title: 'Df @ 25GHz',
      dataIndex: 'DF_25GHZ',
      key: 'df_25ghz',
      width: 120
    },
    {
      title: 'IS_HF',
      dataIndex: 'IS_HF',
      key: 'is_hf',
      width: 120,
      render: (value) => value === 'TRUE' ? 'Có' : 'Không'
    },
    {
      title: 'DATA_SOURCE',
      dataIndex: 'DATA_SOURCE',
      key: 'data_source',
      width: 200
    },
    {
      title: 'FILE NAME',
      dataIndex: 'FILENAME',
      key: 'filename',
      width: 200
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 120,
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
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h1>Material Properties</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecord(null);
              setModalVisible(true);
            }}
          >
            Thêm mới
          </Button>
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
