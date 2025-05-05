import React, { useState, useEffect } from 'react';
import { Input, Button, Spin, Typography } from 'antd';
import ImpedanceTable from '../components/layout/ImpedanceTable';
import MainLayout from '../components/layout/MainLayout';
import CreateImpedanceModal from '../components/modal/CreateImpedanceModal';
import UpdateImpedanceModal from '../components/modal/UpdateImpedanceModal';
import { fetchImpedanceData, createImpedance, updateImpedance, softDeleteImpedance } from '../utils/api';
import { toast, Toaster } from 'sonner';
import * as XLSX from 'xlsx';
import './Impedance.css';

const { Title } = Typography;

const Impedance = () => {
  const [impedanceData, setImpedanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
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
        toast.error('Các trường Imp 1, Imp 2, Imp 3, và Imp 4 là bắt buộc.');
        return;
      }
      const response = await createImpedance(values);
      if (response && response.data) {
        setIsCreateModalVisible(false);
        toast.success('Thêm mới thành công');
        await loadData();
      }
    } catch (error) {
      console.error('Error creating impedance:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi thêm mới dữ liệu');
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
        setIsUpdateModalVisible(false);
        setCurrentRecord(null);
        toast.success('Cập nhật thành công');
        await loadData();
      }
    } catch (error) {
      console.error('Error updating impedance:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật dữ liệu');
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    if (value.trim() === '') {
      setFilteredData(impedanceData);
    } else {
      const filtered = impedanceData.filter((item) =>
        item.IMP_1?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const handleSoftDelete = async (record) => {
    try {
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

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Impedance Data');
    XLSX.writeFile(workbook, 'ImpedanceData.xlsx');
    toast.success('Xuất file Excel thành công');
  };

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div className="impedance-container">
        <Title level={2} className="impedance-title">Số liệu Impedance</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo mã hàng"
            allowClear
            onChange={handleSearch} 
            style={{ width: 300 }}
          />
          <div>
            <Button
              type="dashed"
              style={{ marginRight: 8 }}
              onClick={exportToExcel}
            >
              Export Excel
            </Button>
            <Button
              type="primary"
              onClick={() => setIsCreateModalVisible(true)}
            >
              Thêm mới
            </Button>
          </div>
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