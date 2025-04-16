import React, { useState, useEffect } from 'react';
import { Button, Spin, Typography } from 'antd';
import ImpedanceTable from '../components/layout/ImpedanceTable';
import MainLayout from '../components/layout/MainLayout';
import CreateImpedanceModal from '../components/modal/CreateImpedanceModal';
import UpdateImpedanceModal from '../components/modal/UpdateImpedanceModal';
import { fetchImpedanceData, createImpedance, updateImpedance } from '../utils/api';
import { toast } from 'sonner'; 
import './Impedance.css';
import { Toaster } from 'sonner';

const { Title } = Typography;

const Impedance = () => {
  const [impedanceData, setImpedanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchImpedanceData();
      setImpedanceData(data);
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
        };
        setImpedanceData((prevData) => [...prevData, newRow]);
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
        
        setIsUpdateModalVisible(false);
        setCurrentRecord(null);
        toast.success('Cập nhật thành công');
        loadData();
      }
    } catch (error) {
      console.error('Error updating impedance:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi cập nhật dữ liệu';
      toast.error(errorMessage);
    }
  };

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div className="impedance-container">
        <Title level={2} className="impedance-title">Số liệu Impedance</Title>
        <Button
          type="primary"
          onClick={() => setIsCreateModalVisible(true)}
          style={{ marginBottom: 16 }}
        >
          Thêm mới
        </Button>
        {loading ? (
          <div className="impedance-loading">
            <Spin size="large" />
          </div>
        ) : (
          <div className="impedance-table-container">
            <ImpedanceTable 
              data={impedanceData}
              onEdit={handleEdit}
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