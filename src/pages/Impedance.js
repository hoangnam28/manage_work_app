import React, { useState, useEffect } from 'react';
import { Spin, Typography } from 'antd';
import ImpedanceTable from '../components/layout/ImpedanceTable';
import MainLayout from '../components/layout/MainLayout';
import { fetchImpedanceData } from '../utils/api';

const { Title } = Typography;

const Impedance = () => {
  const [impedanceData, setImpedanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchImpedanceData();
        setImpedanceData(data);
      } catch (error) {
        console.error('Error fetching impedance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <MainLayout>
      <div style={{ padding: '16px' }}>
        <Title level={2}>Danh sách Impedance</Title>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <ImpedanceTable data={impedanceData} />
        )}
      </div>
    </MainLayout>
  );
};

export default Impedance;