import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Spin, Empty } from 'antd';
import axios from '../../utils/axios';

const LargeSizeHistoryModal = ({ visible, onCancel, recordId, recordData }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/large-size/history/${recordId}`);
      setHistoryData(response.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    if (visible && recordId) {
      fetchHistory();
    }
  }, [visible, recordId, fetchHistory]);

  const getActionTypeColor = (actionType) => {
    switch (actionType) {
      case 'CREATE':
        return 'green';
      case 'UPDATE':
        return 'blue';
      case 'DELETE':
        return 'red';
      case 'RESTORE':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getActionTypeText = (actionType) => {
    switch (actionType) {
      case 'CREATE':
        return 'Tạo mới';
      case 'UPDATE':
        return 'Cập nhật';
      case 'DELETE':
        return 'Xóa';
      case 'RESTORE':
        return 'Khôi phục';
      default:
        return actionType;
    }
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'ACTION_AT',
      key: 'action_at',
      width: 150,
      render: (text) => text || '-'
    },
    {
      title: 'Hành động',
      dataIndex: 'ACTION_TYPE',
      key: 'action_type',
      width: 100,
      render: (actionType) => (
        <Tag color={getActionTypeColor(actionType)}>
          {getActionTypeText(actionType)}
        </Tag>
      )
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'ACTION_BY_EMAIL',
      key: 'action_by_email',
      width: 150,
      render: (text) => text || '-'
    },
    {
      title: 'Mã sản phẩm',
      dataIndex: 'CUSTOMER_CODE',
      key: 'customer_code',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Loại bo',
      dataIndex: 'TYPE_BOARD',
      key: 'type_board',
      width: 100,
      render: (text) => text || '-'
    },
    {
      title: 'Kích thước Tối ưu',
      dataIndex: 'SIZE_NORMAL',
      key: 'size_normal',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Tỷ lệ % (Bo thường)',
      dataIndex: 'RATE_NORMAL',
      key: 'rate_normal',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Kích thước bo to',
      dataIndex: 'SIZE_BIG',
      key: 'size_big',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Tỷ lệ % (Bo to)',
      dataIndex: 'RATE_BIG',
      key: 'rate_big',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Yêu cầu sử dụng bo to',
      dataIndex: 'REQUEST',
      key: 'request',
      width: 150,
      render: (text, record) => {
        // Kiểm tra nếu chưa có người xác nhận thì hiển thị trống
        if (!record.CONFIRM_BY || record.CONFIRM_BY === '' || record.CONFIRM_BY === null) {
          return '-';
        }
        // Nếu đã có người xác nhận thì hiển thị giá trị REQUEST
        if (text === 'TRUE') return <Tag color="green">Có</Tag>;
        if (text === 'FALSE') return <Tag color="red">Không</Tag>;
        return text || '-';
      }
    },
    {
      title: 'Người xác nhận',
      dataIndex: 'CONFIRM_BY',
      key: 'confirm_by',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'NOTE',
      key: 'note',
      width: 200,
      render: (text) => text || '-'
    }
  ];

  return (
    <Modal
      title={`Lịch sử chỉnh sửa - ${recordData?.CUSTOMER_CODE || 'Mã hàng'}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1400}
      style={{ top: 20 }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : historyData.length > 0 ? (
        <Table
          columns={columns}
          dataSource={historyData}
          rowKey="HISTORY_ID"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`
          }}
          scroll={{ x: 1200 }}
          size="small"
        />
      ) : (
        <Empty description="Không có lịch sử chỉnh sửa" />
      )}
    </Modal>
  );
};

export default LargeSizeHistoryModal; 