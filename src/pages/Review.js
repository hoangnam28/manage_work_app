import React, { useState, useEffect, useCallback } from "react";
import { Table, Input, Upload, Button, Modal, Form, Popconfirm, Image, Space, List, Spin, Checkbox } from "antd";
import { Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, SaveOutlined, EyeOutlined, DownloadOutlined, UndoOutlined, HistoryOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from 'moment';
import MainLayout from "../components/layout/MainLayout";
import { Toaster, toast } from 'sonner';
import * as XLSX from 'xlsx';
import './Review.css';
import ConfirmReviewResetButton from "../components/button/ConfirmReviewResetButton ";


const Review = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [editHistory, setEditHistory] = useState([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [currentReviewRow, setCurrentReviewRow] = useState(null);
  const [selectedReviewTypes, setSelectedReviewTypes] = useState({
    CI: false,
    Design: false
  });
  const [filteredData, setFilteredData] = useState([]);
  const [reviewStatus, setReviewStatus] = useState({});

  const { Text } = Typography;

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!token || !userInfo) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }
      const response = await axios.get('http://192.84.105.173:5000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCurrentUser(response.data);
      const authorizedIds = ['017965', '006065', '003524', '008247', '006064', '030516', '005322', '003216','012967', '024432','007787'];
      const userCompanyId = response.data.company_id ? response.data.company_id.toString().trim() : '';
      const hasPermission = authorizedIds.includes(userCompanyId);
      setHasEditPermission(hasPermission);

    } catch (error) {
      console.error('Error fetching user info:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn');
      }
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleSearch = (value) => {
    if (value.trim() === '') {
      setFilteredData(data); // Reset to original data if search is cleared
    } else {
      const filtered = data.filter((item) =>
        item.MA?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  // Update filteredData whenever the original data changes
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const fetchReviewStatus = async (columnId) => {
    try {
      const response = await axios.get(`http://192.84.105.173:5000/api/document/review-status/${columnId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review status:', error);
      return null;
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://192.84.105.173:5000/api/document/list');
      const processedData = response.data.map(item => {
        const processedItem = { ...item };
        if (processedItem.GHI_CHU) {
          if (typeof processedItem.GHI_CHU === 'string' &&
            (processedItem.GHI_CHU.startsWith('{') ||
              processedItem.GHI_CHU.includes('_events') ||
              processedItem.GHI_CHU.includes('_readableState'))) {
            try {
              const jsonObj = JSON.parse(processedItem.GHI_CHU);
              if (jsonObj._events || jsonObj._readableState) {
                processedItem.GHI_CHU = '';
              } else {
                processedItem.GHI_CHU = JSON.stringify(jsonObj);
              }
            } catch (e) {
              if (processedItem.GHI_CHU.includes('_events') ||
                processedItem.GHI_CHU.includes('_readableState')) {
                processedItem.GHI_CHU = '';
              }
            }
          }
        }
        return processedItem;
      });

      const dataWithImages = await Promise.all(
        processedData.map(async (record) => {
          const hinh_anh1 = await fetchImages(record.COLUMN_ID, "hinh_anh1");
          const hinh_anh2 = await fetchImages(record.COLUMN_ID, "hinh_anh2");
          const hinh_anh3 = await fetchImages(record.COLUMN_ID, "hinh_anh3");

          // Fetch review status for each record
          const status = await fetchReviewStatus(record.COLUMN_ID);
          if (status) {
            setReviewStatus(prev => ({
              ...prev,
              [record.COLUMN_ID]: status
            }));
          }

          return {
            ...record,
            hinh_anh1,
            hinh_anh2,
            hinh_anh3
          };
        })
      );
      setData(dataWithImages);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchImages = async (columnId, field) => {
    try {
      if (!columnId) {
        return [];
      }

      const response = await axios.get(
        `http://192.84.105.173:5000/api/document/get-images/${columnId}/${field}`
      );

      if (response.data && Array.isArray(response.data.images)) {
        return response.data.images;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  const handleUpload = async (info, record, field) => {
    if (!hasEditPermission) {
      toast.error('Bạn không có quyền tải lên hình ảnh');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Vui lòng đăng nhập lại');
      return;
    }

    setImageLoadingStates(prev => ({
      ...prev,
      [`${record.COLUMN_ID}-${field}`]: true
    }));

    const formData = new FormData();
    formData.append('images', info.file.originFileObj);

    try {
      const response = await axios.post(
        `http://192.84.105.173:5000/api/document/upload-images/${record.COLUMN_ID}/${field}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        toast.success('Tải ảnh thành công');
        const updatedImages = await fetchImages(record.COLUMN_ID, field);
        const newData = [...data];
        const index = newData.findIndex(item => item.COLUMN_ID === record.COLUMN_ID);
        if (index > -1) {
          newData[index][field] = updatedImages;
          setData(newData);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tải lên hình ảnh');
    } finally {
      setImageLoadingStates(prev => ({
        ...prev,
        [`${record.COLUMN_ID}-${field}`]: false
      }));
    }
  };

  const handleCellChange = (value, record, field) => {
    setData(prevData => {
      const newData = [...prevData];
      const index = newData.findIndex(item => item.COLUMN_ID === record.COLUMN_ID);
      if (index > -1) {
        const item = newData[index];
        if (item[field] !== value) {
          newData[index] = { ...item, [field]: value };
          if (field === 'REV') {
            newData[index].oldREV = item.REV;
          }
        }
      }
      return newData;
    });
  };

  const handleSaveRow = async (record) => {
    if (!hasEditPermission) {
      toast.error('Bạn không có quyền chỉnh sửa dữ liệu');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      if (!token || !currentUser) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }

      if (!record.COLUMN_ID) {
        toast.error('Không tìm thấy ID của bản ghi');
        return;
      }

      const dataToUpdate = {
        ma: record.MA,
        khach_hang: record.KHACH_HANG,
        ma_tai_lieu: record.MA_TAI_LIEU,
        rev: record.REV,
        cong_venh: record.CONG_VENH,
        v_cut: record.V_CUT,
        xu_ly_be_mat: record.XU_LY_BE_MAT,
        ghi_chu: record.GHI_CHU,
        edited_by: currentUser.username
      };
      await axios.put(`http://192.84.105.173:5000/api/document/update/${record.COLUMN_ID}`, dataToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const hasRevChanged = record.oldREV !== undefined && record.oldREV !== record.REV;
      if (hasRevChanged) {
        setCurrentReviewRow(record);
        setIsReviewModalVisible(true);
      } else {
        toast.success('Lưu thành công');
        fetchData();
      }
    } catch (error) {
      console.error('Error saving row:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn');
      } else if (error.response?.status === 404) {
        toast.error('Không tìm thấy bản ghi');
      } else {
        toast.error('Lỗi khi lưu dữ liệu');
      }
    }
  };
  const handleAddNew = () => {
    form.validateFields()
      .then(async (values) => {
        try {
          const dataToAdd = {
            ...values,
            REV: '',
            CONG_VENH: '',
            V_CUT: '',
            XU_LY_BE_MAT: '',
            GHI_CHU: '',
            created_by: currentUser.username,
            created_at: new Date().toISOString(),
          };

          await axios.post('http://192.84.105.173:5000/api/document/add', dataToAdd);
          toast.success('Thêm dữ liệu thành công');
          fetchData(); // Refresh the table data
          setIsModalVisible(false);
          form.resetFields();
        } catch (error) {
          console.error(error);
          toast.error('Lỗi khi thêm dữ liệu');
        }
      })
      .catch((errorInfo) => {
        console.error('Validation Failed:', errorInfo);
        toast.error('Vui lòng nhập đầy đủ các trường thông tin!');
      });
  };
  const handleDelete = async (column_id) => {
    if (!hasEditPermission) {
      toast.error('Bạn không có quyền xóa dữ liệu');
      return;
    }
    try {
      await axios.put(`http://192.84.105.173:5000/api/document/soft-delete/${column_id}`, {
        username: currentUser.username,
        company_id: currentUser.company_id
      });
      toast.success("Đánh dấu xóa thành công");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi đánh dấu xóa");
    }
  };

  const handleExportExcel = () => {
    try {
      const exportData = data.map(item => ({
        'STT': item.STT,
        'Đầu mã': item.MA,
        'Khách hàng': item.KHACH_HANG,
        'Mã tài liệu khách hàng': item.MA_TAI_LIEU,
        'Rev.': item.REV,
        'Phụ trách thiết kế': item.PHU_TRACH_THIET_KE,
        'Ngày thiết kế': item.NGAY_THIET_KE ? moment(item.NGAY_THIET_KE).format('DD/MM/YYYY') : '',
        'Cong vênh': item.CONG_VENH,
        'Phụ trách review': item.PHU_TRACH_REVIEW,
        'Ngày': item.NGAY ? moment(item.NGAY).format('DD/MM/YYYY') : '',
        'V-Cut': item.V_CUT,
        'Xử lý bề mặt': item.XU_LY_BE_MAT,
        'Ghi chú': item.GHI_CHU
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      const columnWidths = [
        { wch: 5 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 30 }
      ];
      ws['!cols'] = columnWidths;
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!ws[address]) continue;
        ws[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "EEEEEE" } },
          alignment: { horizontal: "center" }
        };
      }

      XLSX.utils.book_append_sheet(wb, ws, "Danh sách Review");

      const fileName = `Review_Tasks_${moment().format('DDMMYYYY_HHmmss')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Xuất Excel thành công');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất Excel');
    }
  };

  const handleDeleteImage = async (columnId, field, imageName) => {
    if (!hasEditPermission) {
      toast.error('Bạn không có quyền xóa hình ảnh');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Vui lòng đăng nhập lại');
      return;
    }

    try {
      await axios.delete(
        `http://192.84.105.173:5000/api/document/delete-image/${columnId}/${field}/${imageName}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('Xóa ảnh thành công');

      const updatedImages = await fetchImages(columnId, field);
      const newData = [...data];
      const index = newData.findIndex(item => item.COLUMN_ID === columnId);
      if (index > -1) {
        newData[index][field] = updatedImages;
        setData(newData);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Lỗi khi xóa ảnh');
    }
  };

  const fetchEditHistory = async (columnId, field) => {
    setHistoryLoading(true);
    try {
      const response = await axios.get(`http://192.84.105.173:5000/api/document/edit-history/${columnId}/${field}`);
      const { creator, history } = response.data;

      setEditHistory({
        creator,
        history,
      });
      setHistoryModalVisible(true);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Lỗi khi lấy lịch sử chỉnh sửa');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRestore = async (column_id) => {
    if (!hasEditPermission) {
      toast.error('Bạn không có quyền khôi phục dữ liệu');
      return;
    }
    try {
      await axios.put(`http://192.84.105.173:5000/api/document/restore/${column_id}`, {
        username: currentUser.username
      });
      toast.success("Khôi phục dữ liệu thành công");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi khôi phục dữ liệu");
    }
  };

  const handleReviewTypeSubmit = async () => {
    if (!currentReviewRow) return;

    try {
      const newStatus = {
        CI_REVIEWED: selectedReviewTypes.CI ? 0 : 1,
        DESIGN_REVIEWED: selectedReviewTypes.Design ? 1 : 0,
        CI_REVIEWED_BY: selectedReviewTypes.CI ? currentUser.username : null,
        DESIGN_REVIEWED_BY: selectedReviewTypes.Design ? currentUser.username : null,
        CI_REVIEWED_AT: selectedReviewTypes.CI ? new Date().toISOString() : null,
        DESIGN_REVIEWED_AT: selectedReviewTypes.Design ? new Date().toISOString() : null
      };
      setReviewStatus(prev => {
        const updatedStatus = {
          ...prev,
          [currentReviewRow.COLUMN_ID]: newStatus
        };
        return updatedStatus;
      });
      if (selectedReviewTypes.CI) {
        await handleReviewConfirm(currentReviewRow.COLUMN_ID, 'CI');
      }
      if (selectedReviewTypes.Design) {
        await handleReviewConfirm(currentReviewRow.COLUMN_ID, 'Design');
      }

      // Reset modal state
      setIsReviewModalVisible(false);
      setSelectedReviewTypes({ CI: false, Design: false });
      setCurrentReviewRow(null);

      toast.success('Lưu thông tin thành công!');
      fetchData(); // Refresh data to ensure consistency
    } catch (error) {
      console.error('Error updating review types:', error);
      toast.error('Lỗi khi cập nhật loại review');
    }
  };

  const handleReviewConfirm = async (columnId, type) => {
    try {
      const response = await axios.post('http://192.84.105.173:5000/api/document/confirm-review', {
        column_id: columnId,
        review_type: type,
        reviewed_by: currentUser.username
      });
      setReviewStatus(prev => ({
        ...prev,
        [columnId]: response.data.status
      }));

      toast.success(`Đã xác nhận ${type} review thành công`);
    } catch (error) {
      console.error('Error confirming review:', error);
      toast.error('Lỗi khi xác nhận review');
    }
  };

  const renderConfirmReviewButton = (field, record, status) => {
    if (field === 'V_CUT' && status.CI_REVIEWED) {
      return (
        <ConfirmReviewResetButton
          columnId={record.COLUMN_ID}
          field={field}
          onResetSuccess={fetchData}
        />
      );
    }

    if (field === 'XU_LY_BE_MAT' && status.CI_REVIEWED) {
      return (
        <ConfirmReviewResetButton
          columnId={record.COLUMN_ID}
          field={field}
          onResetSuccess={fetchData}
        />
      );
    }

    if (field === 'CONG_VENH' && status.DESIGN_REVIEWED) {
      return (
        <ConfirmReviewResetButton
          columnId={record.COLUMN_ID}
          field={field}
          onResetSuccess={fetchData}
        />
      );
    }

    return null;
  };

  const renderEditableCell = (text, record, field) => {
    const isDeleted = record.IS_DELETED === 1;
    const isDisabled = isDeleted || !hasEditPermission;
    const status = reviewStatus[record.COLUMN_ID] || {};
    const getStylesAndNotification = () => {
      if (isDeleted) {
        return { styles: { borderColor: '#d9d9d9', backgroundColor: '#f5f5f5' }, notification: null };
      }

      if ((field === 'V_CUT' || field === 'XU_LY_BE_MAT') && status.CI_REVIEWED) {
        return {
          styles: {
            borderColor: 'red',
            borderWidth: '3px',
            backgroundColor: '#ffd6d6',
            color: 'red',
            fontWeight: 'bold',
            boxShadow: '0 0 8px rgba(255, 0, 0, 0.5)',
          },
          notification: 'CI Review lại',
        };
      }

      if (field === 'CONG_VENH' && status.DESIGN_REVIEWED) {
        return {
          styles: {
            borderColor: 'blue',
            borderWidth: '3px',
            backgroundColor: '#d6e4ff',
            color: 'blue',
            fontWeight: 'bold',
            boxShadow: '0 0 8px rgba(0, 0, 255, 0.5)',
          },
          notification: 'Thiết kế Review lại',
        };
      }

      return { styles: { borderColor: '#d9d9d9', backgroundColor: 'white' }, notification: null };
    };

    const { styles, notification } = getStylesAndNotification();

    return (
      <div
        onClick={() => !isDisabled && fetchEditHistory(record.COLUMN_ID, field)}
        style={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          padding: '4px',
          position: 'relative',
        }}
      >
        <Input.TextArea
          value={text}
          onChange={(e) => handleCellChange(e.target.value, record, field)}
          autoSize={{ minRows: 1, maxRows: 50 }}
          style={{
            width: '100%',
            resize: 'none',
            backgroundColor: styles.backgroundColor,
            color: styles.color || 'inherit',
            paddingRight: '24px',
            borderColor: styles.borderColor,
            borderWidth: styles.borderWidth || '1px',
            borderStyle: 'solid',
            boxShadow: styles.boxShadow,
            fontWeight: styles.fontWeight || 'normal',
            transition: 'all 0.3s',
          }}
          onClick={(e) => e.stopPropagation()}
          disabled={isDisabled}
        />
        <HistoryOutlined
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            fontSize: '14px',
            color: '#1890ff',
            opacity: 0.6,
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onClick={(e) => {
            e.stopPropagation();
            fetchEditHistory(record.COLUMN_ID, field);
          }}
        />
        {notification && (
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              left: '0',
              color: styles.color,
              fontWeight: 'bold',
              fontSize: '12px',
            }}
          >
            {notification}
          </div>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "STT",
      key: "stt",
      width: 45,
      align: "center",
      fixed: "left",
    },
    {
      title: "Đầu mã",
      dataIndex: "MA",
      key: "ma",
      width: 150,
      fixed: "left",
      render: (text, record) => renderEditableCell(text, record, "MA"),
    },
    {
      title: "Khách hàng",
      dataIndex: "KHACH_HANG",
      key: "khach_hang",
      width: 150,
      render: (text, record) => (
        renderEditableCell(text, record, 'KHACH_HANG')
      )
    },
    {
      title: "Mã tài liệu khách hàng",
      dataIndex: "MA_TAI_LIEU",
      key: "ma_tai_lieu",
      width: 180,
      render: (text, record) => (
        renderEditableCell(text, record, 'MA_TAI_LIEU')
      )
    },
    {
      title: "Rev.",
      dataIndex: "REV",
      key: "rev",
      width: 130,
      render: (text, record) => {
        const isDisabled = record.IS_DELETED === 1 || !hasEditPermission;
        return (
          <div
            onClick={() => fetchEditHistory(record.COLUMN_ID, "REV")}
            style={{
              cursor: "pointer",
              padding: "4px",
              position: "relative",
            }}
          >
            <Input.TextArea
              value={text}
              onChange={(e) => handleCellChange(e.target.value, record, "REV")}
              autoSize={{ minRows: 1, maxRows: 50 }}
              style={{
                width: "100%",
                resize: "none",
                backgroundColor: isDisabled ? "white" : "white",
                color: isDisabled ? "inherit" : "inherit",
                paddingRight: "24px",
                borderColor: "#d9d9d9",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
              onClick={(e) => e.stopPropagation()}
              disabled={isDisabled}
            />
            <HistoryOutlined
              style={{
                position: "absolute",
                right: "8px",
                top: "8px",
                fontSize: "14px",
                color: "#1890ff",
                opacity: 0.6,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onClick={(e) => {
                e.stopPropagation();
                fetchEditHistory(record.COLUMN_ID, "REV");
              }}
            />
          </div>
        );
      },
    },
    {
      title: "Cong vênh",
      dataIndex: "CONG_VENH",
      key: "cong_venh",
      width: 220,
      render: (text, record) => {
        const status = reviewStatus[record.COLUMN_ID] || {};
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderEditableCell(text, record, 'CONG_VENH')}
            {renderConfirmReviewButton('CONG_VENH', record, status)}
          </div>
        );
      },
    },
    {
      title: "Hình ảnh Cong vênh",
      key: "hinh_anh1",
      width: 180,
      render: (record) => {
        const isLoading = imageLoadingStates[`${record.COLUMN_ID}-hinh_anh1`];
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            {Array.isArray(record.hinh_anh1) && record.hinh_anh1.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {record.hinh_anh1.map((img, index) => (
                  <div key={index} style={{
                    border: '1px solid #f0f0f0',
                    padding: '4px',
                    borderRadius: '4px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <Image
                      src={`http://192.84.105.173:5000/uploads/${img}`}
                      alt={`Hình ảnh ${index + 1}`}
                      style={{ width: '100%', maxHeight: '120px', objectFit: 'contain' }}
                      preview={{
                        mask: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EyeOutlined style={{ marginRight: '4px' }} /> Xem
                        </div>
                      }}
                    />
                    {hasEditPermission && !record.IS_DELETED && (
                      <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDeleteImage(record.COLUMN_ID, "hinh_anh1", img)}
                      >
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          size="small"
                          style={{ position: 'absolute', top: 0, right: 0 }}
                        />
                      </Popconfirm>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có hình ảnh</p>
            )}
            {hasEditPermission && !record.IS_DELETED && (
              <Upload
                name="images"
                customRequest={({ file, onSuccess }) => {
                  const info = { file: { originFileObj: file } };
                  handleUpload(info, record, "hinh_anh1");
                  setTimeout(() => onSuccess("ok"), 0);
                }}
                showUploadList={false}
                accept="image/*"
                disabled={isLoading}
              >
                <Button
                  icon={<UploadOutlined />}
                  style={{ width: '100%' }}
                  loading={isLoading}
                >
                  {isLoading ? 'Đang tải lên...' : 'Tải lên'}
                </Button>
              </Upload>
            )}
          </Space>
        );
      }
    },
    {
      title: "V-Cut",
      dataIndex: "V_CUT",
      key: "v_cut",
      width: 250,
      render: (text, record) => {
        const status = reviewStatus[record.COLUMN_ID] || {};
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderEditableCell(text, record, 'V_CUT')}
            {renderConfirmReviewButton('V_CUT', record, status)}
          </div>
        );
      },
    },
    {
      title: "Hình ảnh V-Cut",
      key: "hinh_anh2",
      width: 180,
      render: (record) => {
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            {Array.isArray(record.hinh_anh2) && record.hinh_anh2.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {record.hinh_anh2.map((img, index) => (
                  <div key={index} style={{ border: '1px solid #f0f0f0', padding: '4px', borderRadius: '4px' }}>
                    <Image
                      src={`http://192.84.105.173:5000/uploads/${img}`}
                      alt={`Hình ảnh ${index + 1}`}
                      style={{ width: '100%', maxHeight: '120px', objectFit: 'contain' }}
                      preview={{
                        mask: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EyeOutlined style={{ marginRight: '4px' }} /> Xem
                        </div>
                      }}
                    />
                    {hasEditPermission && !record.IS_DELETED && (
                      <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDeleteImage(record.COLUMN_ID, "hinh_anh2", img)}
                      >
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          size="small"
                          style={{ position: 'absolute', top: 0, right: 0 }}
                        />
                      </Popconfirm>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có hình ảnh</p>
            )}
            {hasEditPermission && !record.IS_DELETED && (
              <Upload
                name="images"
                customRequest={({ file, onSuccess }) => {
                  const info = { file: { originFileObj: file } };
                  handleUpload(info, record, "hinh_anh2");
                  setTimeout(() => onSuccess("ok"), 0);
                }}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  icon={<UploadOutlined />}
                  style={{ width: '100%' }}
                >
                  Tải lên
                </Button>
              </Upload>
            )}
          </Space>
        );
      }
    },
    {
      title: "Xử lý bề mặt",
      dataIndex: "XU_LY_BE_MAT",
      key: "xu_ly_be_mat",
      width: 400,
      render: (text, record) => {
        const status = reviewStatus[record.COLUMN_ID] || {};
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderEditableCell(text, record, 'XU_LY_BE_MAT')}
            {renderConfirmReviewButton('XU_LY_BE_MAT', record, status)}
          </div>
        );
      },
    },
    {
      title: "Hình ảnh Xử lý bề mặt",
      key: "hinh_anh3",
      width: 180,
      render: (record) => {
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            {Array.isArray(record.hinh_anh3) && record.hinh_anh3.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {record.hinh_anh3.map((img, index) => (
                  <div key={index} style={{ border: '1px solid #f0f0f0', padding: '4px', borderRadius: '4px' }}>
                    <Image
                      src={`http://192.84.105.173:5000/uploads/${img}`}
                      alt={`Hình ảnh ${index + 1}`}
                      style={{ width: '100%', maxHeight: '120px', objectFit: 'contain' }}
                      preview={{
                        mask: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EyeOutlined style={{ marginRight: '4px' }} /> Xem
                        </div>
                      }}
                    />
                    {hasEditPermission && !record.IS_DELETED && (
                      <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDeleteImage(record.COLUMN_ID, "hinh_anh3", img)}
                      >
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          size="small"
                          style={{ position: 'absolute', top: 0, right: 0 }}
                        />
                      </Popconfirm>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có hình ảnh</p>
            )}
            {hasEditPermission && !record.IS_DELETED && (
              <Upload
                name="images"
                customRequest={({ file, onSuccess }) => {
                  const info = { file: { originFileObj: file } };
                  handleUpload(info, record, "hinh_anh3");
                  setTimeout(() => onSuccess("ok"), 0);
                }}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  icon={<UploadOutlined />}
                  style={{ width: '100%' }}
                >
                  Tải lên
                </Button>
              </Upload>
            )}
          </Space>
        );
      }
    },
    {
      title: "Ghi chú",
      dataIndex: "GHI_CHU",
      key: "ghi_chu",
      width: 180,
      render: (text, record) => {
        let displayValue = '';

        if (text === null || text === undefined) {
          displayValue = '';
        } else if (typeof text === 'object') {
          if (text._events || text._readableState) {
            displayValue = '';
          } else {
            try {
              displayValue = JSON.stringify(text);
            } catch (e) {
              displayValue = '';
            }
          }
        } else if (typeof text === 'string') {
          if (text.includes('_events') || text.includes('_readableState')) {
            displayValue = '';
          } else {
            displayValue = text;
          }
        } else {
          displayValue = String(text);
        }

        return (
          renderEditableCell(displayValue, record, 'GHI_CHU')
        );
      }
    },
    {
      title: "Hành động",
      key: "action",
      fixed: 'right',
      width: 120,
      render: (text, record) => {
        if (!hasEditPermission) {
          return null;
        }

        return (
          <Space direction="vertical">
            {record.IS_DELETED === 1 ? (
              <>
                <div style={{ color: '#ff4d4f' }}>
                  <div>Đã xóa bởi: {record.DELETED_BY}</div>
                  <div>Thời gian: {record.DELETED_AT}</div>
                </div>
                <Button
                  icon={<UndoOutlined />}
                  onClick={() => handleRestore(record.COLUMN_ID)}
                  type="primary"
                  size="small"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Khôi phục
                </Button>
              </>
            ) : (
              <Space>
                <Button
                  icon={<SaveOutlined />}
                  onClick={() => handleSaveRow(record)}
                  type="primary"
                  size="small"
                >
                  Lưu
                </Button>
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa?"
                  onConfirm={() => handleDelete(record.COLUMN_ID)}
                >
                  <Button icon={<DeleteOutlined />} danger size="small" />
                </Popconfirm>
              </Space>
            )}
          </Space>
        );
      }
    }
  ];

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50'],
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
  });

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const HistoryModal = () => (
    <Modal
      title="Lịch sử chỉnh sửa"
      open={historyModalVisible}
      onCancel={() => setHistoryModalVisible(false)}
      footer={null}
      width={600}
    >
      {historyLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
        </div>
      ) : (
        <>
          {editHistory.creator && (
            <div style={{ marginBottom: '16px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
              <p><strong>Người tạo:</strong> {editHistory.creator.CREATED_BY || 'Không xác định'}</p>
              <p><strong>Thời gian tạo:</strong> {editHistory.creator.CREATED_AT || 'Không xác định'}</p>
            </div>
          )}
          <List
            dataSource={editHistory.history}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <span>{item.EDITED_BY} đã chỉnh sửa lúc: {item.EDIT_TIME}</span>
                    </Space>
                  }
                  description={
                    <Space direction="vertical">
                      <Text type="secondary">Nội dung cũ: {item.OLD_VALUE || '(trống)'}</Text>
                      <Text>Nội dung mới: {item.NEW_VALUE}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
            locale={{ emptyText: 'Chưa có lịch sử chỉnh sửa' }}
          />
        </>
      )}
    </Modal>
  );
  const CreateDocument = () => (
    <Modal
      title="Tạo mới"
      visible={isModalVisible}
      onOk={handleAddNew}
      onCancel={() => setIsModalVisible(false)}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="ma"
          label="Đầu mã"
          rules={[{ required: true, message: 'Vui lòng nhập Đầu mã!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="khach_hang"
          label="Khách hàng"
          rules={[{ required: true, message: 'Vui lòng nhập Khách hàng!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="ma_tai_lieu"
          label="Mã tài liệu khách hàng"
          rules={[{ required: true, message: 'Vui lòng nhập Mã tài liệu khách hàng!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );

  const getRowClassName = (record) => {
    if (record.IS_DELETED) {
      return 'deleted-row';
    }
    return 'custom-table-row';
  };

  const ReviewTypeModal = () => (
    <Modal
      title="Chọn loại Review"
      open={isReviewModalVisible}
      onOk={handleReviewTypeSubmit}
      onCancel={() => {
        setIsReviewModalVisible(false);
        setSelectedReviewTypes({ CI: false, Design: false });
      }}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Checkbox
          checked={selectedReviewTypes.CI}
          onChange={(e) => setSelectedReviewTypes(prev => ({
            ...prev,
            CI: e.target.checked
          }))}
        >
          CI Review
        </Checkbox>
        <Checkbox
          checked={selectedReviewTypes.Design}
          onChange={(e) => setSelectedReviewTypes(prev => ({
            ...prev,
            Design: e.target.checked
          }))}
        >
          Thiết kế Review
        </Checkbox>
      </div>
    </Modal>
  );

  return (
    <MainLayout username={currentUser?.username} onLogout={() => console.log('Logout')}>
      <Toaster position="top-right" richColors />
      {!hasEditPermission && (
        <div style={{
          marginBottom: 16,
          padding: 8,
          background: '#fffbe6',
          border: '1px solid #ffe58f',
          borderRadius: 4
        }}>
          <Text type="warning">Bạn đang ở chế độ chỉ xem. Chỉ người dùng được ủy quyền mới có thể chỉnh sửa dữ liệu.</Text>
        </div>
      )}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {hasEditPermission && (
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Tạo mới
          </Button>
        )}
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExportExcel}
          type="primary"
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
        >
          Xuất Excel
        </Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => window.open('/user_guide.docx', '_blank')}
          style={{ background: '#1890ff', borderColor: '#1890ff' }}
        >
          Hướng dẫn sử dụng
        </Button>
        <Input
          placeholder="Tìm kiếm theo Đầu mã"
          allowClear
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      <Table
        dataSource={filteredData} // Use filteredData instead of data
        columns={columns}
        rowKey="column_id"
        scroll={{ x: 'max-content', y: 760 }}
        pagination={pagination}
        onChange={handleTableChange}
        bordered
        size="middle"
        rowClassName={getRowClassName}
        loading={loading}
      />
      <CreateDocument />
      <HistoryModal />
      <ReviewTypeModal />
    </MainLayout>
  );
};

export default Review;