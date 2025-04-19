import React, { useState, useEffect } from 'react';
import { Button, Spin, Typography } from 'antd';
import ImpedanceTable from '../components/layout/ImpedanceTable';
import MainLayout from '../components/layout/MainLayout';
import CreateImpedanceModal from '../components/modal/CreateImpedanceModal';
import UpdateImpedanceModal from '../components/modal/UpdateImpedanceModal';
import { fetchImpedanceData, createImpedance, updateImpedance, softDeleteImpedance } from '../utils/api';
import { toast } from 'sonner'; 
import './Impedance.css';
import { Toaster } from 'sonner';
import { Input } from 'antd';

const { Title } = Typography;
const { Search } = Input;

const Impedance = () => {
  const [impedanceData, setImpedanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]); // Dữ liệu sau khi lọc
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchImpedanceData();
      setImpedanceData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching impedance data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (values) => {
    try {
      if (!values.imp_1 || !values.imp_2 || !values.imp_3 || !values.imp_4) {
        throw new Error('Các trường Imp 1, Imp 2, Imp 3, và Imp 4 là bắt buộc.');
      }
      const response = await createImpedance(values); 
  
      if (response && response.data) {
        const newRow = {
          ...response.data,
          key: response.data.imp_id,
          IMP_1: response.data.imp_1 || response.data.IMP_1,
          IMP_2: response.data.imp_2 || response.data.IMP_2,
          IMP_3: response.data.imp_3 || response.data.IMP_3,
          IMP_4: response.data.imp_4 || response.data.IMP_4,
          IMP_5: response.data.imp_5 || response.data.IMP_5,
          IMP_6: response.data.imp_6 || response.data.IMP_6,
          IMP_7: response.data.imp_7 || response.data.IMP_7,
          IMP_8: response.data.imp_8 || response.data.IMP_8,
          IMP_9: response.data.imp_9 || response.data.IMP_9,
          IMP_10: response.data.imp_10 || response.data.IMP_10,
          IMP_11: response.data.imp_11 || response.data.IMP_11,
          IMP_12: response.data.imp_12 || response.data.IMP_12,
          IMP_13: response.data.imp_13 || response.data.IMP_13,
          IMP_14: response.data.imp_14 || response.data.IMP_14,
          IMP_15: response.data.imp_15 || response.data.IMP_15,
          IMP_16: response.data.imp_16 || response.data.IMP_16,
          IMP_17: response.data.imp_17 || response.data.IMP_17,
          IMP_18: response.data.imp_18 || response.data.IMP_18,
          IMP_19: response.data.imp_19 || response.data.IMP_19,
          IMP_20: response.data.imp_20 || response.data.IMP_20,
          IMP_21: response.data.imp_21 || response.data.IMP_21,
          IMP_22: response.data.imp_22 || response.data.IMP_22,
          IMP_23: response.data.imp_23 || response.data.IMP_23,
          IMP_24: response.data.imp_24 || response.data.IMP_24,
          IMP_25: response.data.imp_25 || response.data.IMP_25,
          IMP_26: response.data.imp_26 || response.data.IMP_26,
          IMP_27: response.data.imp_27 || response.data.IMP_27,
          IMP_28: response.data.imp_28 || response.data.IMP_28,
          IMP_29: response.data.imp_29 || response.data.IMP_29,
          IMP_30: response.data.imp_30 || response.data.IMP_30,
          NOTE: response.data.note || response.data.NOTE
        };
        
        setImpedanceData(prevData => [...prevData, newRow]);
        setFilteredData(prevData => [...prevData, newRow]);
        
        setIsCreateModalVisible(false);
        toast.success('Thêm mới thành công');
      }
    } catch (error) {
      toast.error('Lỗi khi thêm mới dữ liệu');
      console.error('Error creating impedance:', error);
    }
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setIsUpdateModalVisible(true);
  };

  const handleUpdate = async (impId, values) => {
    try {
      if (!impId || impId === 'undefined' || impId === 'null') {
        toast.error('Không thể cập nhật vì không có ID hợp lệ');
        return;
      }    
      const response = await updateImpedance(impId, values);
      
      if (response && response.data) {
        setImpedanceData(prevData => {
          return prevData.map(item => {
            if (item.imp_id === impId) {
              const updatedData = response.data;
              return {
                ...item,
                ...updatedData,
                key: item.imp_id 
              };
            }
            return item;
          });
        });
        
        setFilteredData(prevData => {
          return prevData.map(item => {
            if (item.imp_id === impId) {
              const updatedData = response.data;
              return {
                ...item,
                ...updatedData,
                key: item.imp_id 
              };
            }
            return item;
          });
        });
        
        setIsUpdateModalVisible(false);
        setCurrentRecord(null);
        toast.success('Cập nhật thành công');
      }
    } catch (error) {
      console.error('Error updating impedance:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi cập nhật dữ liệu';
      toast.error(errorMessage);
    }
  };

  const handleSearch = (value) => {
    const filtered = impedanceData.filter((item) =>
      item.IMP_1.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleSoftDelete = async (record) => {
    try {
      // Check for both uppercase and lowercase imp_id
      const impId = record.imp_id || record.IMP_ID;
      
      if (!impId) {
        toast.error('Không thể xóa: ID không hợp lệ');
        return;
      }
      
      const response = await softDeleteImpedance(impId);
      if (response) {
        setImpedanceData(prevData => prevData.filter(item => 
          (item.imp_id !== impId && item.IMP_ID !== impId)
        ));
        setFilteredData(prevData => prevData.filter(item => 
          (item.imp_id !== impId && item.IMP_ID !== impId)
        ));
        toast.success('Xóa thành công');
      }
    } catch (error) {
      console.error('Error soft deleting impedance:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi xóa dữ liệu';
      toast.error(errorMessage);
    }
  };

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div className="impedance-container">
        <Title level={2} className="impedance-title">Số liệu Impedance</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm theo mã hàng"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            onClick={() => setIsCreateModalVisible(true)}
          >
            Thêm mới
          </Button>
        </div>
        {loading ? (
          <div className="impedance-loading">
            <Spin size="large" />
          </div>
        ) : (
          <div className="impedance-table-container">
            <ImpedanceTable 
              data={filteredData} 
              onEdit={handleEdit}
              onSoftDelete={handleSoftDelete}
            />
          </div>
        )}
        <CreateImpedanceModal
          visible={isCreateModalVisible}
          onCancel={() => setIsCreateModalVisible(false)}
          onCreate={handleCreate}
        />
        <UpdateImpedanceModal
          visible={isUpdateModalVisible}
          onCancel={() => {
            setIsUpdateModalVisible(false);
            setCurrentRecord(null);
          }}
          onUpdate={handleUpdate}
          currentRecord={currentRecord}
        />
      </div>
    </MainLayout>
  );
};

export default Impedance;