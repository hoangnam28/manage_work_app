import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import {
  fetchMaterialCoreList,
  createMaterialCore,
  updateMaterialCore,
  deleteMaterialCore,
  exportMaterialCore
} from '../utils/material-core-api';
import CreateMaterialCoreModal from '../components/modal/CreateMaterialCoreModal';
import { toast, Toaster } from 'sonner';
import './MaterialCore.css';

const MaterialCore = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchMaterialCoreList();
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
    const topArr = Array.isArray(values.top_foil_cu_weight) ? values.top_foil_cu_weight : [values.top_foil_cu_weight];
    const botArr = Array.isArray(values.bot_foil_cu_weight) ? values.bot_foil_cu_weight : [values.bot_foil_cu_weight];

    await createMaterialCore({
      ...values,
      requester_name: requesterName,
      request_date: today,
      status: 'Pending',
      top_foil_cu_weight: topArr,
      bot_foil_cu_weight: botArr
    });

    toast.success(`Đã thêm thành công ${topArr.length} bản ghi`);
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

      await updateMaterialCore(recordId, values);
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
      await deleteMaterialCore(id);
      toast.success('Xóa thành công');
      fetchData();
    } catch (error) {
      console.error('Error deleting material core:', error);
      toast.error('Lỗi khi xóa');
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportMaterialCore(data);
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

  const columns = [
    {
      title: 'Người yêu cầu',
      dataIndex: 'REQUESTER_NAME',
      key: 'requester_name',
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
      title: 'Vendor',
      dataIndex: 'VENDOR',
      key: 'vendor',
      width: 150
    },
    {
      title: 'Family',
      dataIndex: 'FAMILY',
      key: 'family',
      width: 150
    },
    {
      title: 'PREPREG_Count',
      dataIndex: 'PREPREG_COUNT',
      key: 'prepreg_count',
      width: 120
    },
    {
      title: 'Nominal_Thickness',
      dataIndex: 'NOMINAL_THICKNESS',
      key: 'nominal_thickness',
      width: 150
    },
    {
      title: 'Spec_Thickness',
      dataIndex: 'SPEC_THICKNESS',
      key: 'spec_thickness',
      width: 120
    },
    {
      title: 'Preference_Class',
      dataIndex: 'PREFERENCE_CLASS',
      key: 'preference_class',
      width: 120
    },
    {
      title: 'USE_TYPE',
      dataIndex: 'USE_TYPE',
      key: 'use_type',
      width: 150
    },
    {
      title: 'RIGID',
      dataIndex: 'RIGID',
      key: 'rigid',
      width: 120,
      render: (value) => value === 'TRUE' ? 'Có' : 'Không'
    },
    {
      title: 'Top_Foil_Cu_Weight',
      dataIndex: 'TOP_FOIL_CU_WEIGHT',
      key: 'top_foil_cu_weight',
      width: 150
    },
    {
      title: 'Bottom_Foil_Cu_Weight',
      dataIndex: 'BOT_FOIL_CU_WEIGHT',
      key: 'bot_foil_cu_weight',
      width: 150
    },
    {
      title: 'Tg_Min',
      dataIndex: 'TG_MIN',
      key: 'tg_min',
      width: 100
    },
    {
      title: 'Tg_Max',
      dataIndex: 'TG_MAX',
      key: 'tg_max',
      width: 100
    },
    {
      title: 'Center_Glass',
      dataIndex: 'CENTER_GLASS',
      key: 'center_glass',
      width: 150
    },
    {
      title: 'Dk @ 0.1GHz',
      dataIndex: 'DK_01G',
      key: 'dk_01g',
      width: 120
    },
    {
      title: 'Df @ 0.1GHz',
      dataIndex: 'DF_01G',
      key: 'df_01g',
      width: 120
    },
    {
      title: 'Dk_0_001GHz',
      dataIndex: 'DK_0_001GHZ',
      key: 'dk_0_001ghz',
      width: 120
    },
    {
      title: 'Df_0_001GHz',
      dataIndex: 'DF_0_001GHZ',
      key: 'df_0_001ghz',
      width: 120
    },
    {
      title: 'Dk_0_01GHz',
      dataIndex: 'DK_0_01GHZ',
      key: 'dk_0_01ghz',
      width: 120
    },
    {
      title: 'Df_0_01GHz',
      dataIndex: 'DF_0_01GHZ',
      key: 'df_0_01ghz',
      width: 120
    },
    {
      title: 'Dk_0_02GHz',
      dataIndex: 'DK_0_02GHZ',
      key: 'dk_0_02ghz',
      width: 120
    },
    {
      title: 'Df_0_02GHz',
      dataIndex: 'DF_0_02GHZ',
      key: 'df_0_02ghz',
      width: 120
    },
    {
      title: 'Dk_2GHz',
      dataIndex: 'DK_2GHZ',
      key: 'dk_2ghz',
      width: 120
    },
    {
      title: 'Df_2GHz',
      dataIndex: 'DF_2GHZ',
      key: 'df_2ghz',
      width: 120
    },
    {
      title: 'Dk_2_45GHz',
      dataIndex: 'DK_2_45GHZ',
      key: 'dk_2_45ghz',
      width: 120
    },
    {
      title: 'Df_2_45GHz',
      dataIndex: 'DF_2_45GHZ',
      key: 'df_2_45ghz',
      width: 120
    },
    {
      title: 'Dk_3GHz',
      dataIndex: 'DK_3GHZ',
      key: 'dk_3ghz',
      width: 120
    },
    {
      title: 'Df_3GHz',
      dataIndex: 'DF_3GHZ',
      key: 'df_3ghz',
      width: 120
    },
    {
      title: 'Dk_4GHz',
      dataIndex: 'DK_4GHZ',
      key: 'dk_4ghz',
      width: 120
    },
    {
      title: 'Df_4GHz',
      dataIndex: 'DF_4GHZ',
      key: 'df_4ghz',
      width: 120
    },
    {
      title: 'Dk_5GHz',
      dataIndex: 'DK_5GHZ',
      key: 'dk_5ghz',
      width: 120
    },
    {
      title: 'Df_5GHz',
      dataIndex: 'DF_5GHZ',
      key: 'df_5ghz',
      width: 120
    },
    {
      title: 'Dk_6GHz',
      dataIndex: 'DK_6GHZ',
      key: 'dk_6ghz',
      width: 120
    },
    {
      title: 'Df_6GHz',
      dataIndex: 'DF_6GHZ',
      key: 'df_6ghz',
      width: 120
    },
    {
      title: 'Dk_7GHz',
      dataIndex: 'DK_7GHZ',
      key: 'dk_7ghz',
      width: 120
    },
    {
      title: 'Df_7GHz',
      dataIndex: 'DF_7GHZ',
      key: 'df_7ghz',
      width: 120
    },
    {
      title: 'Dk_8GHz',
      dataIndex: 'DK_8GHZ',
      key: 'dk_8ghz',
      width: 120
    },
    {
      title: 'Df_8GHz',
      dataIndex: 'DF_8GHZ',
      key: 'df_8ghz',
      width: 120
    },
    {
      title: 'Dk_9GHz',
      dataIndex: 'DK_9GHZ',
      key: 'dk_9ghz',
      width: 120
    },
    {
      title: 'Df_9GHz',
      dataIndex: 'DF_9GHZ',
      key: 'df_9ghz',
      width: 120
    },
    {
      title: 'Dk_10GHz',
      dataIndex: 'DK_10GHZ',
      key: 'dk_10ghz',
      width: 120
    },
    {
      title: 'Df_10GHz',
      dataIndex: 'DF_10GHZ',
      key: 'df_10ghz',
      width: 120
    },
    {
      title: 'Dk_15GHz',
      dataIndex: 'DK_15GHZ',
      key: 'dk_15ghz',
      width: 120
    },
    {
      title: 'Df_15GHz',
      dataIndex: 'DF_15GHZ',
      key: 'df_15ghz',
      width: 120
    },
    {
      title: 'Dk_16GHz',
      dataIndex: 'DK_16GHZ',
      key: 'dk_16ghz',
      width: 120
    },
    {
      title: 'Df_16GHz',
      dataIndex: 'DF_16GHZ',
      key: 'df_16ghz',
      width: 120
    },
    {
      title: 'Dk_20GHz',
      dataIndex: 'DK_20GHZ',
      key: 'dk_20ghz',
      width: 120
    },
    {
      title: 'Df_20GHz',
      dataIndex: 'DF_20GHZ',
      key: 'df_20ghz',
      width: 120
    },
    {
      title: 'Dk_25GHz',
      dataIndex: 'DK_25GHZ',
      key: 'dk_25ghz',
      width: 120
    },
    {
      title: 'Df_25GHz',
      dataIndex: 'DF_25GHZ',
      key: 'df_25ghz',
      width: 120
    },
    {
      title: 'Dk_30GHz',
      dataIndex: 'DK_30GHZ',
      key: 'dk_30ghz',
      width: 120
    },
    {
      title: 'Df_30GHz',
      dataIndex: 'DF_30GHZ',
      key: 'df_30ghz',
      width: 120
    },
    {
      title: 'Dk_35GHz',
      dataIndex: 'DK_35GHZ',
      key: 'dk_35ghz',
      width: 120
    },
    {
      title: 'Df_35GHz',
      dataIndex: 'DF_35GHZ',
      key: 'df_35ghz',
      width: 120
    },
    {
      title: 'Dk_40GHz',
      dataIndex: 'DK_40GHZ',
      key: 'dk_40ghz',
      width: 120
    },
    {
      title: 'Df_40GHz',
      dataIndex: 'DF_40GHZ',
      key: 'df_40ghz',
      width: 120
    },
    {
      title: 'Dk_45GHz',
      dataIndex: 'DK_45GHZ',
      key: 'dk_45ghz',
      width: 120
    },
    {
      title: 'Df_45GHz',
      dataIndex: 'DF_45GHZ',
      key: 'df_45ghz',
      width: 120
    },
    {
      title: 'Dk_50GHz',
      dataIndex: 'DK_50GHZ',
      key: 'dk_50ghz',
      width: 120
    },
    {
      title: 'Df_50GHz',
      dataIndex: 'DF_50GHZ',
      key: 'df_50ghz',
      width: 120
    },
    {
      title: 'Dk_55GHz',
      dataIndex: 'DK_55GHZ',
      key: 'dk_55ghz',
      width: 120
    },
    {
      title: 'Df_55GHz',
      dataIndex: 'DF_55GHZ',
      key: 'df_55ghz',
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
      title: 'FILE_NAME',
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
      <Toaster position="top-right" richColors />
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h1>Material Core</h1>
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
        />

        <CreateMaterialCoreModal
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

export default MaterialCore;
