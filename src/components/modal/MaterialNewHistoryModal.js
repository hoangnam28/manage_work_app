import React from 'react';
import { Modal, Table, Tag } from 'antd';
import moment from 'moment';

const HistoryNewModal = ({ open, onCancel, data = [] }) => {
  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'CREATED_AT',
      key: 'created_at',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm:ss'),
      width: 180,
    },
    {
      title: 'Hành động',
      dataIndex: 'ACTION_TYPE',
      key: 'action_type',
      width: 120,
      render: (type) => {
        let color = 'blue';
        let text = 'Chỉnh sửa';
        
        if (type === 'CREATE') {
          color = 'green';
          text = 'Thêm mới';
        } else if (type === 'DELETE') {
          color = 'red';
          text = 'Xóa';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'USER_FULLNAME',
      key: 'user_fullname',
      width: 200,
    },
    {
      title: 'Vendor',
      dataIndex: 'VENDOR',
      key: 'vendor',
      width: 200,
    },
    {
      title: 'Family Core',
      dataIndex: 'FAMILY_CORE',
      key: 'family_core',
      width: 200,
    },
    {
      title: 'Family PP',
      dataIndex: 'FAMILY_PP',
      key: 'family_pp',
      width: 200,
    },
    {
      title: 'Is HF',
      dataIndex: 'IS_HF',
      key: 'is_hf',
      width: 200,
    },
    {
      title: 'Material Type',
      dataIndex: 'MATERIAL_TYPE',
      key: 'material_type',
      width: 200,
    },
    {
      title: 'ERP',
      dataIndex: 'ERP',
      key: 'erp',
      width: 200,
    },
    {
      title: 'ERP Vendor',
      dataIndex: 'ERP_VENDOR',
      key: 'erp_vendor',
      width: 200,
    },
    {
      title: 'TG',
      dataIndex: 'TG',
      key: 'tg',
      width: 100,
    },
    {
      title: 'Is CAF',
      dataIndex: 'IS_CAF',
      key: 'is_caf',
      width: 100,
    },
    {
      title: 'Board Type',
      dataIndex: 'BORD_TYPE',
      key: 'bord_type',
      width: 100,
    },
    {
      title: 'Plastic',
      dataIndex: 'PLASTIC',
      key: 'plastic',
      width: 100,
    },
    {
      title: 'Data Source',
      dataIndex: 'DATA',
      key: 'datas',
      width: 200,
    },
    {
      title: 'File Name',
      dataIndex: 'FILE_NAME',
      key: 'file_name',
      width: 200,
    }
  ];

 return (
    <Modal
      title="Lịch sử thay đổi"
      open={open}
      onCancel={onCancel}
      width={1400}
      footer={null}
      className="history-modal" // Thêm className
    >
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="ID"
          scroll={{ y: 400 }} // Cố định chiều cao của table
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng số ${total} bản ghi`,
            position: ['bottomCenter'],
            size: 'default'
          }}
          className="fixed-pagination-table"
        />
      </div>
    </Modal>
  );
};

export default HistoryNewModal;
