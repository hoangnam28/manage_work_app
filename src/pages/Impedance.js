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
        await loadData();
        
        setIsCreateModalVisible(false);
        toast.success('Thêm mới thành công');
      }
    } catch (error) {
      console.error('Error creating impedance:', error);
      toast.error('Lỗi khi thêm mới dữ liệu');
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
        await loadData();
        
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
        await loadData();
        
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