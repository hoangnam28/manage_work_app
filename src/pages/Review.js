import React, { useState, useEffect, useCallback } from "react";
import { Table, Input, DatePicker, Upload, Button, Modal, Form, Popconfirm, Image, Space } from "antd";
import { UploadOutlined, DeleteOutlined, SaveOutlined, EyeOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from 'moment';
import MainLayout from "../components/layout/MainLayout";
import { Toaster, toast } from 'sonner';

const Review = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Wrap fetchData in useCallback
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

      // Tải hình ảnh cho mỗi bản ghi
      const dataWithImages = await Promise.all(
        processedData.map(async (record) => {
          if (!record.COLUMN_ID) {
            console.warn('Record missing COLUMN_ID:', record);
            return record;
          }
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
  }, []); // Empty dependency array since fetchData doesn't depend on any state/props

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
      
      console.log(`Response for ${field}:`, response.data);
      
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
        
        // Cập nhật state để hiển thị hình ảnh mới
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
      const processedRecord = { ...record };
      if (processedRecord.GHI_CHU) {
        if (typeof processedRecord.GHI_CHU === 'object') {
          if (processedRecord.GHI_CHU._events || processedRecord.GHI_CHU._readableState) {
            processedRecord.GHI_CHU = '';
          } else {
            try {
              processedRecord.GHI_CHU = JSON.stringify(processedRecord.GHI_CHU);
            } catch (e) {
              processedRecord.GHI_CHU = '';
            }
          }
        } else if (typeof processedRecord.GHI_CHU === 'string') {
          if (processedRecord.GHI_CHU.includes('_events') ||
            processedRecord.GHI_CHU.includes('_readableState')) {
            processedRecord.GHI_CHU = '';
          }
        }
      }
      await axios.put(`http://localhost:5000/api/document/update/${processedRecord.COLUMN_ID}`, {
        stt: processedRecord.STT,
        ma: processedRecord.MA,
        khach_hang: processedRecord.KHACH_HANG,
        ma_tai_lieu: processedRecord.MA_TAI_LIEU,
        rev: processedRecord.REV,
        phu_trach_thiet_ke: processedRecord.PHU_TRACH_THIET_KE,
        ngay_thiet_ke: processedRecord.NGAY_THIET_KE ? moment(processedRecord.NGAY_THIET_KE).format('YYYY-MM-DD') : null,
        cong_venh: processedRecord.CONG_VENH,
        phu_trach_review: processedRecord.PHU_TRACH_REVIEW,
        ngay: processedRecord.NGAY ? moment(processedRecord.NGAY).format('YYYY-MM-DD') : null,
        v_cut: processedRecord.V_CUT,
        xu_ly_be_mat: processedRecord.XU_LY_BE_MAT,
        ghi_chu: processedRecord.GHI_CHU
      });
      toast.success('Lưu thành công');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi lưu dữ liệu');
    }
  };

  // Hàm xử lý thay đổi giá trị trong bảng
  const handleCellChange = (value, record, field) => {
    const newData = [...data];
    const index = newData.findIndex(item => item.COLUMN_ID === record.COLUMN_ID);
    if (index > -1) {
      const item = newData[index];
      // Đảm bảo value là chuỗi
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      newData[index] = { ...item, [field]: stringValue };
      setData(newData);

      // Log để kiểm tra
      console.log(`Changed ${field} to:`, stringValue, typeof stringValue);
    }
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
    form.validateFields().then(async values => {
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
    });
  };


  const handleDelete = async (column_id) => {
    try {
      await axios.delete(`http://localhost:5000/api/document/delete/${column_id}`);
      toast.success("Xóa dữ liệu thành công");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xóa dữ liệu");
    }
  };


  const handleExcelUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/review/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(response.data.message);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải lên file Excel');
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
      width: 120,
      render: (text, record) => (
        <Input.TextArea
          value={text}
          onChange={e => handleCellChange(e.target.value, record, 'MA')}
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ width: '100%', resize: 'none' }}
        />
      )
    },
    {
      title: "Khách hàng",
      dataIndex: "KHACH_HANG",
      key: "khach_hang",
      width: 150,
      render: (text, record) => (
        <Input.TextArea
          value={text}
          onChange={e => handleCellChange(e.target.value, record, 'KHACH_HANG')}
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ width: '100%', resize: 'none' }}
        />
      )
    },
    {
      title: "Mã tài liệu khách hàng",
      dataIndex: "MA_TAI_LIEU",
      key: "ma_tai_lieu",
      width: 180,
      render: (text, record) => (
        <Input.TextArea
          value={text}
          onChange={e => handleCellChange(e.target.value, record, 'MA_TAI_LIEU')}
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ width: '100%', resize: 'none' }}
        />
      )
    },
    {
      title: "Rev.",
      dataIndex: "REV",
      key: "rev",
      width: 80,
      render: (text, record) => (
        <Input.TextArea
          value={text}
          onChange={e => handleCellChange(e.target.value, record, 'REV')}
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ width: '100%', resize: 'none' }}
        />
      )
    },
    {
      title: "Phụ trách thiết kế",
      dataIndex: "PHU_TRACH_THIET_KE",
      key: "phu_trach_thiet_ke",
      width: 150,
      render: (text, record) => (
        <Input.TextArea
          value={text}
          onChange={e => handleCellChange(e.target.value, record, 'PHU_TRACH_THIET_KE')}
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ width: '100%', resize: 'none' }}
        />
      )
    },
    {
      title: "Ngày thiết kế",
      dataIndex: "NGAY_THIET_KE",
      key: "ngay_thiet_ke",
      width: 120,
      render: (text, record) => (
        <DatePicker
          value={text ? moment(text) : null}
          onChange={(date, dateString) => handleDateChange(date, dateString, record, 'NGAY_THIET_KE')}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: "Cong vênh",
      dataIndex: "CONG_VENH",
      key: "cong_venh",
      width: 120,
      render: (text, record) => (
        <Input.TextArea
          value={text}
          onChange={e => handleCellChange(e.target.value, record, 'CONG_VENH')}
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ width: '100%', resize: 'none' }}
        />
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
      width: 150,
      render: (text, record) => (
        <Input.TextArea
          value={text}
          onChange={e => handleCellChange(e.target.value, record, 'PHU_TRACH_REVIEW')}
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ width: '100%', resize: 'none' }}
        />
      )
    },
    {
      title: "Ngày",
      dataIndex: "NGAY",
      key: "ngay",
      width: 120,
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
      width: 100,
      render: (text, record) => (
        <Input.TextArea
          value={text}
          onChange={e => handleCellChange(e.target.value, record, 'V_CUT')}
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ width: '100%', resize: 'none' }}
        />
      )
    },
    {
      title: "Hình ảnh",
      key: "hinh_anh2",
      width: 180,
      render: (record) => {
        console.log("Rendering hinh_anh1 for record:", record.COLUMN_ID, record.hinh_anh2);
        
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
      width: 150,
      render: (text, record) => (
        <Input.TextArea
          value={text}
          onChange={e => handleCellChange(e.target.value, record, 'XU_LY_BE_MAT')}
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ width: '100%', resize: 'none' }}
        />
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
          <Input.TextArea
            value={displayValue}
            onChange={e => handleCellChange(e.target.value, record, 'GHI_CHU')}
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ width: '100%', resize: 'none' }}
          />
        );
      }
    },
    {
      title: "Hành động",
      key: "action",
      fixed: 'right',
      width: 150,
      render: (text, record) => (
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

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
  };

  return (
    <MainLayout username="YourUsername" onLogout={() => console.log('Logout')}>
      <Toaster position="top-right" richColors />
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>Tạo mới</Button>
        <Upload beforeUpload={handleExcelUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />}>Import Excel</Button>
        </Upload>
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
        rowClassName={() => 'custom-table-row'}
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
      `}</style>

      <Modal
        title="Tạo mới"
        visible={isModalVisible}
        onOk={handleAddNew}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="ma" label="Đầu mã" rules={[{ required: true, message: 'Vui lòng nhập Đầu mã!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="khach_hang" label="Khách hàng" rules={[{ required: true, message: 'Vui lòng nhập Khách hàng!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ma_tai_lieu" label="Mã tài liệu khách hàng" rules={[{ required: true, message: 'Vui lòng nhập Mã tài liệu khách hàng!' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default Review;