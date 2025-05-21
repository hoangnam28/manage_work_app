import React, { useState, useEffect } from 'react';
import { Input, Button, Spin, Typography, Alert } from 'antd';
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
  const [hasEditPermission, setHasEditPermission] = useState(false);

  useEffect(() => {
    // Kiểm tra quyền từ token
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setHasEditPermission(['001507', '021253'].includes(decodedToken.company_id));
    }
    loadData();
  }, []);
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchImpedanceData();
      setImpedanceData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching impedance data:', error);
      if (error.response?.status === 403) {
        toast.error('Bạn không có quyền truy cập vào trang này');
      } else {
        toast.error('Lỗi khi tải dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  };

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
        item.IMP_1?.toLowerCase().includes(value.toLowerCase()) || item.IMP_2?.toLowerCase().includes(value.toLowerCase())
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

    // Map data với tên cột phù hợp
    const mappedData = filteredData.map(item => ({
      'JobName': item.IMP_1,
      'Mã Hàng': item.IMP_2,
      'Mã hàng tham khảo': item.IMP_3,
      'Khách hàng': item.IMP_4,
      'Loại khách hàng': item.IMP_5,
      'Ứng dụng': item.IMP_6,
      'Phân loại sản xuất': item.IMP_7,
      'Độ dày bo (µm)': item.IMP_8,
      'Cấu trúc lớp': item.IMP_9,
      'CCL': item.IMP_10,
      'PP': item.IMP_11,
      'Mực phủ sơn': item.IMP_12,
      'Lấp lỗ vĩnh viễn BVH': item.IMP_13,
      'Lấp lỗ vĩnh viễn TH': item.IMP_14,
      'Lá đồng (µm)': item.IMP_15,
      'Tỷ lệ đồng còn lại lớp IMP': item.IMP_16,
      'Tỷ lệ đồng còn lại lớp GND1': item.IMP_17,
      'Tỷ lệ đồng còn lại lớp GND2': item.IMP_18,
      'Mắt lưới': item.IMP_19,
      'Độ dày (µm)': item.IMP_20,
      '% Nhựa': item.IMP_21,
      'Mắt lưới_2': item.IMP_22,
      'Độ dày (µm)_2': item.IMP_23,
      '% Nhựa_2': item.IMP_24,
      'Giá trị IMP': item.IMP_25,
      'Dung sai IMP': item.IMP_26,
      'Loại IMP': item.IMP_27,
      'Lớp IMP': item.IMP_28,
      'GAP': item.IMP_29,
      'Lớp IMP_2': item.IMP_30,
      'Lớp GND1': item.IMP_31,
      'Lớp GND2': item.IMP_32,
      'L (µm)': item.IMP_33,
      'S (µm)': item.IMP_34,
      'GAP ｺﾌﾟﾚﾅｰ (µm)': item.IMP_35,
      'Ghi chú': item.NOTE || item.note
    }));

    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Impedance Data');
    XLSX.writeFile(workbook, 'ImpedanceData.xlsx');
    toast.success('Xuất file Excel thành công');
  };

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div className="impedance-container">
        {!hasEditPermission && (
          <Alert
            message="Chế độ xem"
            description="Bạn đang ở chế độ chỉ xem. Chỉ có thể xem và xuất dữ liệu."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
        <div className="impedance-header">
          <Title level={2} className="impedance-title">Số liệu Impedance</Title>
          <div className="impedance-actions">
            <Input
              className="search-input"
              placeholder="Tìm kiếm theo JOBNAME"
              allowClear
              onChange={handleSearch}
            />
            <div className="action-buttons">
              <Button
                type="dashed"
                onClick={exportToExcel}
              >
                Xuất Excel
              </Button>
              {hasEditPermission && (
                <Button
                  type="primary"
                  onClick={() => setIsCreateModalVisible(true)}
                >
                  Thêm mới
                </Button>
              )}
            </div>
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
              onEdit={hasEditPermission ? handleEdit : null}
              onSoftDelete={hasEditPermission ? handleSoftDelete : null}
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