import React, { useState, useEffect } from 'react';
import { Button, Spin, Typography } from 'antd';
import ImpedanceTable from '../components/layout/ImpedanceTable';
import MainLayout from '../components/layout/MainLayout';
import CreateImpedanceModal from '../components/modal/CreateImpedanceModal';
import { fetchImpedanceData, createImpedance } from '../utils/api';
import { toast } from 'sonner'; 
import './Impedance.css';
import { Toaster } from 'sonner';

const { Title } = Typography;

const Impedance = () => {
  const [impedanceData, setImpedanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
      const response = await createImpedance(values);
      
      if (response && response.data) {
        // Format the new data with the same structure as the existing data
        const newRow = {
          ...response.data,
          IMP_1: response.data.imp_1,
          IMP_2: response.data.imp_2, 
          IMP_3: response.data.imp_3,
          IMP_4: response.data.imp_4,
          // Ensure the key is properly formatted to match the table requirements
          key: response.data.imp_id
        };
        
        // Update the state with the new row
        setImpedanceData(prevData => {
          const newData = [...prevData, newRow];
          return newData;
        });
        
        setIsModalVisible(false);
        toast.success('Thêm mới thành công');
      }
    } catch (error) {
      toast.error('Lỗi khi thêm mới dữ liệu');
      console.error('Error creating impedance:', error);
    }
  };

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div className="impedance-container">
        <Title level={2} className="impedance-title">Số liệu Impedance</Title>
        <Button
          type="primary"
          onClick={() => setIsModalVisible(true)}
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
            <ImpedanceTable data={impedanceData} />
          </div>
        )}
        <CreateImpedanceModal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onCreate={handleCreate}
        />
      </div>
    </MainLayout>
  );
};

export default Impedance;