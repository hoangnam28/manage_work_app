import React, { useState, useEffect, useCallback } from "react";
import { Table, Input, DatePicker, Upload, Button, Modal, Form, Popconfirm, Image, Space, List, Spin } from "antd";
import { Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, SaveOutlined, EyeOutlined, DownloadOutlined, UndoOutlined, HistoryOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from 'moment';
import MainLayout from "../components/layout/MainLayout";
import { Toaster, toast } from 'sonner';
import * as XLSX from 'xlsx';

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

  const { Text } = Typography;
  

  // Thêm hàm để lấy thông tin user từ token
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCurrentUser(response.data);
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/document/list');
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
        `http://localhost:5000/api/document/get-images/${columnId}/${field}`
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
    if (!info.file || !info.file.originFileObj) {
      toast.error('Không tìm thấy file để tải lên');
      return;
    }
  
    if (!record.COLUMN_ID) {
      toast.error('Không tìm thấy ID của bản ghi');
      return;
    }
  
    // Set loading state for this specific upload
    setImageLoadingStates(prev => ({
      ...prev,
      [`${record.COLUMN_ID}-${field}`]: true
    }));
  
    const formData = new FormData();
    formData.append('images', info.file.originFileObj);
  
    try { 
      const response = await axios.post(
        `http://localhost:5000/api/document/upload-images/${record.COLUMN_ID}/${field}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      if (response.data) {
        toast.success('Tải ảnh thành công');
  
        // Tải lại danh sách hình ảnh sau khi upload
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
      // Clear loading state
      setImageLoadingStates(prev => ({
        ...prev,
        [`${record.COLUMN_ID}-${field}`]: false
      }));
    }
  };

  const handleSaveRow = async (record) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token || !currentUser) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }

      const dataToUpdate = {
        ma: record.MA,
        khach_hang: record.KHACH_HANG,
        ma_tai_lieu: record.MA_TAI_LIEU,
        rev: record.REV,
        phu_trach_thiet_ke: record.PHU_TRACH_THIET_KE,
        ngay_thiet_ke: record.NGAY_THIET_KE,
        cong_venh: record.CONG_VENH,
        phu_trach_review: record.PHU_TRACH_REVIEW,
        ngay: record.NGAY,
        v_cut: record.V_CUT,
        xu_ly_be_mat: record.XU_LY_BE_MAT,
        ghi_chu: record.GHI_CHU,
        edited_by: currentUser.username
      };

      await axios.put(
        `http://localhost:5000/api/document/update/${record.COLUMN_ID}`,
        dataToUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Lưu thành công');
      fetchData();
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn');
        // Redirect to login page or handle token expiration
      } else {
        toast.error('Lỗi khi lưu dữ liệu');
      }
    }
  };
  

  // Hàm xử lý thay đổi giá trị trong bảng
  const handleCellChange = (value, record, field) => {
    setData(prevData => {
      const newData = [...prevData];
      const index = newData.findIndex(item => item.COLUMN_ID === record.COLUMN_ID);
      if (index > -1) {
        const item = newData[index];
        if (item[field] !== value) { // Chỉ cập nhật nếu giá trị thực sự thay đổi
          newData[index] = { ...item, [field]: value };
        }
      }
      return newData;
    });
  };
  // Hàm xử lý thay đổi ngày tháng
  const handleDateChange = (date, dateString, record, field) => {
    const newData = [...data];
    const index = newData.findIndex(item => item.COLUMN_ID === record.COLUMN_ID);
    if (index > -1) {
      const item = newData[index];
      newData[index] = { ...item, [field]: date ? date.format('YYYY-MM-DD') : null };
      setData(newData);
    }
  };

  const handleAddNew = () => {
    form.validateFields()
      .then(async values => {
        try {
          await axios.post('http://localhost:5000/api/document/add', values);
          toast.success('Thêm dữ liệu thành công');
          fetchData();
          setIsModalVisible(false);
          form.resetFields();
        } catch (error) {
          console.error(error);
          toast.error('Lỗi khi thêm dữ liệu');
        }
      })
      .catch(errorInfo => {
        console.error('Validation Failed:', errorInfo);
        toast.error('Vui lòng nhập đầy đủ các trường thông tin!');
      });
  };

  const handleDelete = async (column_id) => {
    try {
      await axios.put(`http://localhost:5000/api/document/soft-delete/${column_id}`, {
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
      // Chuẩn bị dữ liệu cho Excel
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

      // Tạo workbook mới
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Điều chỉnh độ rộng cột
      const columnWidths = [
        { wch: 5 },  
        { wch: 15 }, 
        { wch: 20 }, 
        { wch: 25 }, 
        { wch: 8 },  
        { wch: 20 }, 
        { wch: 15 }, 
        { wch: 15 }, 
        { wch: 20 }, 
        { wch: 15 }, 
        { wch: 10 }, 
        { wch: 20 }, 
        { wch: 30 }  
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

      // Tạo tên file với timestamp
      const fileName = `Review_Tasks_${moment().format('DDMMYYYY_HHmmss')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Xuất Excel thành công');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất Excel');
    }
  };

  const handleDeleteImage = async (columnId, field, imageName) => {
    try {
      await axios.delete(`http://localhost:5000/api/document/delete-image/${columnId}/${field}/${imageName}`);
      toast.success('Xóa ảnh thành công');
      
      // Refresh images for this field
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
      const response = await axios.get(`http://localhost:5000/api/document/edit-history/${columnId}/${field}`);
      console.log('History response:', response.data);
      setEditHistory(response.data);
      setHistoryModalVisible(true);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Lỗi khi lấy lịch sử chỉnh sửa');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRestore = async (column_id) => {
    try {
      await axios.put(`http://localhost:5000/api/document/restore/${column_id}`, {
        username: currentUser.username
      });
      toast.success("Khôi phục dữ liệu thành công");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi khôi phục dữ liệu");
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "STT",
      key: "stt",
      width: 60,
      align: 'center'
    },
    {
      title: "Đầu mã",
      dataIndex: "MA",
      key: "ma",
      width: 150,
      render: (text, record) => (
        renderEditableCell(text, record, 'MA')
      )
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
      width: 100,
      render: (text, record) => (
        renderEditableCell(text, record, 'REV')
      )
    },
    {
      title: "Phụ trách thiết kế",
      dataIndex: "PHU_TRACH_THIET_KE",
      key: "phu_trach_thiet_ke",
      width: 150,
      render: (text, record) => (
        renderEditableCell(text, record, 'PHU_TRACH_THIET_KE')
      )
    },
    {
      title: "Ngày thiết kế",
      dataIndex: "NGAY_THIET_KE",
      key: "ngay_thiet_ke",
      width: 160,
      render: (text, record) => {
        const isDeleted = record.IS_DELETED === 1;
        return (
          <div style={{ position: 'relative' }}>
            <DatePicker
              value={text ? moment(text) : null}
              onChange={(date, dateString) => handleDateChange(date, dateString, record, 'NGAY_THIET_KE')}
              style={{ width: '100%' }}
              disabled={isDeleted}
            />
            {!isDeleted && (
              <HistoryOutlined 
                style={{
                  position: 'absolute',
                  right: '28px',
                  top: '8px',
                  fontSize: '14px',
                  color: '#1890ff',
                  opacity: 0.6,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  zIndex: 1
                }}
                onClick={() => fetchEditHistory(record.COLUMN_ID, 'NGAY_THIET_KE')}
              />
            )}
          </div>
        );
      }
    },
    {
      title: "Cong vênh",
      dataIndex: "CONG_VENH",
      key: "cong_venh",
      width: 220,
      render: (text, record) => (
        renderEditableCell(text, record, 'CONG_VENH')
      )
    },
    {
      title: "Hình ảnh",
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
                      src={`http://localhost:5000/uploads/${img}`}
                      alt={`Hình ảnh ${index + 1}`}
                      style={{ width: '100%', maxHeight: '120px', objectFit: 'contain' }}
                      preview={{
                        mask: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EyeOutlined style={{ marginRight: '4px' }} /> Xem
                        </div>
                      }}
                    />
                    <Popconfirm
                      title="Bạn có chắc chắn muốn xóa?"
                      onConfirm={() => handleDeleteImage(record.COLUMN_ID, "hinh_anh1", img)}
                    >
                      <Button icon={<DeleteOutlined />} danger size="small" style={{ position: 'absolute', top: 0, right: 0 }} />
                    </Popconfirm>
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có hình ảnh</p>
            )}
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
          </Space>
        );
      }
    },
    {
      title: "Phụ trách review",
      dataIndex: "PHU_TRACH_REVIEW",
      key: "phu_trach_review",
      width: 180,
      render: (text, record) => (
        renderEditableCell(text, record, 'PHU_TRACH_REVIEW')
      )
    },
    {
      title: "Ngày",
      dataIndex: "NGAY",
      key: "ngay",
      width: 160,
      render: (text, record) => (
        <DatePicker
          value={text ? moment(text) : null}
          onChange={(date, dateString) => handleDateChange(date, dateString, record, 'NGAY')}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: "V-Cut",
      dataIndex: "V_CUT",
      key: "v_cut",
      width: 250,
      render: (text, record) => (
        renderEditableCell(text, record, 'V_CUT')
      )
    },
    {
      title: "Hình ảnh",
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
                      src={`http://localhost:5000/uploads/${img}`}
                      alt={`Hình ảnh ${index + 1}`}
                      style={{ width: '100%', maxHeight: '120px', objectFit: 'contain' }}
                      preview={{
                        mask: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EyeOutlined style={{ marginRight: '4px' }} /> Xem
                        </div>
                      }}
                    />
                    <Popconfirm
                      title="Bạn có chắc chắn muốn xóa?"
                      onConfirm={() => handleDeleteImage(record.COLUMN_ID, "hinh_anh2", img)}
                    >
                      <Button icon={<DeleteOutlined />} danger size="small" style={{ position: 'absolute', top: 0, right: 0 }} />
                    </Popconfirm>
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có hình ảnh</p>
            )}
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
              <Button icon={<UploadOutlined />} style={{ width: '100%' }}>Tải lên</Button>
            </Upload>
          </Space>
        );
      }
    },
    {
      title: "Xử lý bề mặt",
      dataIndex: "XU_LY_BE_MAT",
      key: "xu_ly_be_mat",
      width: 400,
      render: (text, record) => (
        renderEditableCell(text, record, 'XU_LY_BE_MAT')
      )
    },
    {
      title: "Hình ảnh",
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
                      src={`http://localhost:5000/uploads/${img}`}
                      alt={`Hình ảnh ${index + 1}`}
                      style={{ width: '100%', maxHeight: '120px', objectFit: 'contain' }}
                      preview={{
                        mask: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EyeOutlined style={{ marginRight: '4px' }} /> Xem
                        </div>
                      }}
                    />
                    <Popconfirm
                      title="Bạn có chắc chắn muốn xóa?"
                      onConfirm={() => handleDeleteImage(record.COLUMN_ID, "hinh_anh3", img)}
                    >
                      <Button icon={<DeleteOutlined />} danger size="small" style={{ position: 'absolute', top: 0, right: 0 }} />
                    </Popconfirm>
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có hình ảnh</p>
            )}
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
              <Button icon={<UploadOutlined />} style={{ width: '100%' }}>Tải lên</Button>
            </Upload>
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
      width: 250,
      render: (text, record) => (
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
      )
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
        <List
          dataSource={editHistory}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={`${item.EDITED_BY} đã chỉnh sửa lúc - ${item.EDIT_TIME}`}
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

  const renderEditableCell = (text, record, field) => {
    const isDeleted = record.IS_DELETED === 1;
    
    return (
      <div
        onClick={() => !isDeleted && fetchEditHistory(record.COLUMN_ID, field)}
        style={{
          cursor: isDeleted ? 'not-allowed' : 'pointer',
          padding: '4px',
          position: 'relative',
        }}
      >
        <Input.TextArea
          value={text}
          onChange={e => handleCellChange(e.target.value, record, field)}
          autoSize={{ minRows: 1, maxRows: 50 }}
          style={{ 
            width: '100%', 
            resize: 'none',
            backgroundColor: isDeleted ? '#f5f5f5' : 'white',
            color: isDeleted ? '#999' : 'inherit',
            cursor: isDeleted ? 'not-allowed' : 'text',
            paddingRight: '24px'
          }}
          onClick={e => e.stopPropagation()}
          disabled={isDeleted}
        />
        {!isDeleted && (
          <HistoryOutlined 
            style={{
              position: 'absolute',
              right: '8px',
              top: '8px',
              fontSize: '14px',
              color: '#1890ff',
              opacity: 0.6,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={(e) => {
              e.stopPropagation();
              fetchEditHistory(record.COLUMN_ID, field);
            }}
          />
        )}
      </div>
    );
  };

  return (
    <MainLayout username={currentUser?.username} onLogout={() => console.log('Logout')}>
      <Toaster position="top-right" richColors />
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>Tạo mới</Button>
        <Button 
          icon={<DownloadOutlined />} 
          onClick={handleExportExcel}
          type="primary"
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
        >
          Xuất Excel
        </Button>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="column_id"
        scroll={{ x: 'max-content', y: 600 }}
        pagination={pagination}
        onChange={handleTableChange}
        bordered
        size="middle"
        rowClassName={getRowClassName}
        loading={loading}
      />

      <style jsx global>{`
        .custom-table-row td {
          white-space: pre-wrap;
          word-break: break-word;
          vertical-align: top;
          padding: 8px;
        }
        .ant-table-cell {
          vertical-align: top;
        }
        .ant-input {
          white-space: pre-wrap;
        }
        .ant-table-thead > tr > th {
          background-color: #f0f2f5;
          font-weight: bold;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e6f7ff;
        }
        .image-loading {
          position: relative;
        }
        
        .image-loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ant-upload-disabled {
          cursor: not-allowed;
        }
        .cell-new {
          border: 1px solid #1890ff !important;
        }
        .cell-edited {
          border: 1px solid #52c41a !important;
        }
        .history-cell {
          cursor: pointer;
          transition: all 0.3s;
        }
        .history-cell:hover {
          background-color: rgba(24, 144, 255, 0.1);
        }
        .editable-cell {
          cursor: pointer;
          transition: all 0.3s;
        }
        .editable-cell:hover {
          background-color: rgba(24, 144, 255, 0.1);
        }
        .deleted-row td {
          background-color: #f5f5f5 !important;
          color: #999;
          position: relative;
        }
        
        .deleted-row td::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          border-top: 1px solid #ff4d4f;
          pointer-events: none;
        }
        
        .deleted-row:hover td {
          background-color: #f0f0f0 !important;
        }
        
        .deleted-row .ant-input-textarea,
        .deleted-row .ant-picker,
        .deleted-row .ant-upload {
          pointer-events: none;
          background-color: #f5f5f5;
          color: #999;
        }
        
        .deleted-row .ant-input-textarea textarea {
          color: #999;
        }
        
        .deleted-row .ant-picker-input input {
          cursor: not-allowed;
          color: #999;
        }
        
        .deleted-row .ant-upload button,
        .deleted-row .ant-picker,
        .deleted-row .ant-btn:not(.ant-btn-primary) {
          display: none;
        }

        .ant-input-textarea-wrapper {
          position: relative;
        }
        
        .ant-input-textarea-wrapper:hover .anticon-history {
          opacity: 1;
        }
        
        .ant-picker-wrapper {
          position: relative;
        }
        
        .ant-picker-wrapper .anticon-history {
          position: absolute;
          right: 8px;
          top: 8px;
          font-size: 14px;
          color: #1890ff;
          opacity: 0.6;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .ant-picker-wrapper:hover .anticon-history {
          opacity: 1;
        }
      `}</style>
      <CreateDocument />
      <HistoryModal />
    </MainLayout>
  );
};

export default Review;