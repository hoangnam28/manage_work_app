import React, { useState } from 'react';
import { Modal, Button, Upload, Table, Space, Typography, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axios from '../../utils/axios';

const { Dragger } = Upload;
const { Title } = Typography;

const ImportMaterialPpReviewModal = ({ open, onCancel, onSuccess, loadData }) => {
  const [fileList, setFileList] = useState([]);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [importing, setImporting] = useState(false);

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      // Lấy sheet đầu tiên
      const wsname = wb.SheetNames[2];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '' });
      setData(jsonData);
      if (jsonData.length > 0) {
        setColumns(
          Object.keys(jsonData[0]).map((key) => ({
            title: key,
            dataIndex: key,
            key,
            width: 120,
            ellipsis: true,
          }))
        );
      } else {
        setColumns([]);
      }
    };
    reader.readAsBinaryString(file);
    return false; // Ngăn auto upload
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    accept: '.xlsx,.xlsm,.xls',
    beforeUpload: (file) => {
      setFileList([file]);
      handleFile(file);
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setData([]);
      setColumns([]);
    },
  };

  const handleImport = async () => {
    if (!data.length) {
      message.error('Chưa có dữ liệu để import!');
      return;
    }
    setImporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('/material-pp/import-material-pp', { data }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        message.success('Import thành công!');
        if (loadData) await loadData();
        if (onSuccess) onSuccess();
        handleClose();
      } else {
        message.error(response.data.message || 'Import thất bại!');
      }
    } catch (err) {
      message.error('Lỗi import: ' + (err.message || err));
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFileList([]);
    setData([]);
    setColumns([]);
    setImporting(false);
    onCancel();
  };

  return (
    <Modal
      title="Import Material PP từ Excel (Review)"
      open={open}
      onCancel={handleClose}
      width={1000}
      footer={null}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Kéo thả file Excel vào đây hoặc click để chọn
          </p>
          <p className="ant-upload-hint">
            Hỗ trợ file .xlsx, .xlsm, .xls
          </p>
        </Dragger>
        {data.length > 0 && (
          <>
            <Title level={5}>Xem trước dữ liệu ({data.length} dòng):</Title>
            <div style={{ maxHeight: 400, overflow: 'auto', border: '1px solid #eee', borderRadius: 4 }}>
              <Table
                dataSource={data.map((row, idx) => ({ ...row, _key: idx }))}
                columns={columns}
                rowKey="_key"
                size="small"
                scroll={{ x: true }}
                pagination={{ pageSize: 10 }}
              />
            </div>
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button onClick={handleClose} style={{ marginRight: 8 }}>
                Hủy
              </Button>
              <Button type="primary" onClick={handleImport} loading={importing}>
                Import vào hệ thống
              </Button>
            </div>
          </>
        )}
      </Space>
    </Modal>
  );
};

export default ImportMaterialPpReviewModal; 