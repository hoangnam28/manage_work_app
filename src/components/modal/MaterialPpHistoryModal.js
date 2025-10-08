import React from 'react';
import { Modal, Table, Tag } from 'antd';
import moment from 'moment';

const HistoryModal = ({ open, onCancel, data = [] }) => {
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
      title: 'Family',
      dataIndex: 'FAMILY',
      key: 'family',
      width: 200,
    },
    {
      title: 'Glass Style',
      dataIndex: 'GLASS_STYLE',
      key: 'glass_style',
      width: 200,
    },
    {
      title: 'Resin Percentage',
      dataIndex: 'RESIN_PERCENTAGE',
      key: 'resin_percentage',
      width: 200,
    },
    {
      title: 'Rav Thickness',
      dataIndex: 'RAV_THICKNESS',
      key: 'rav_thickness',
      width: 200,
    },
    {
      title: 'Preference Class',
      dataIndex: 'PREFERENCE_CLASS',
      key: 'preference_class',
      width: 200,
    },
    {
      title: 'Use Type',
      dataIndex: 'USE_TYPE',
      key: 'use_type',
      width: 200,
    },
    {
      title: 'PP Type',
      dataIndex: 'PP_TYPE',
      key: 'pp_type',
      width: 100,
    },
    {
      title: 'Tg Min',
      dataIndex: 'TG_MIN',
      key: 'tg_min',
      width: 100,
    },
    {
      title: 'Tg Max',
      dataIndex: 'TG_MAX',
      key: 'tg_max',
      width: 100,
    },
    {
      title: 'DK 0.1GHz',
      dataIndex: 'DK_01GHZ',
      key: 'dk_01ghz',
      width: 100,
    },
    {
      title: 'DF 0.1GHz',
      dataIndex: 'DF_1GHZ',
      key: 'df_01ghz',
      width: 100,
    },
    {
      title: 'DK 0.001GHz',
      dataIndex: 'DK_0_001GHZ',
      key: 'dk_0_001ghz',
      width: 100,
    },
    {
      title: 'DF 0.001GHz',
      dataIndex: 'DF_0_001GHZ',
      key: 'df_0_001ghz',
      width: 100,
    },
    {
      title: 'DK 0.01GHz',
      dataIndex: 'DK_0_01GHZ',
      key: 'dk_0_01ghz',
      width: 100,
    },
    {
      title: 'DF 0.01GHz',
      dataIndex: 'DF_0_01GHZ',
      key: 'df_0_01ghz',
      width: 100,
    },
    {
      title: 'DK 0.01GHz',
      dataIndex: 'DK_0_01GHZ',
      key: 'dk_0_01ghz',
      width: 100,
    },
    {
      title: 'DF 0.01GHz',
      dataIndex: 'DF_0_01GHZ',
      key: 'df_0_01ghz',
      width: 100,
    },
    {
      title: 'DK 2GHz',
      dataIndex: 'DK_2GHZ',
      key: 'dk_2ghz',
      width: 100,
    },
    {
      title: 'DF 2GHz',
      dataIndex: 'DF_2GHZ',
      key: 'df_2ghz',
      width: 100,
    },
    {
      title: 'DK 2.45GHz',
      dataIndex: 'DK_2_45GHZ',
      key: 'dk_2_45ghz',
      width: 100,
    },
    {
      title: 'DF 2.45GHz',
      dataIndex: 'DF_2_45GHZ',
      key: 'df_2_45ghz',
      width: 100,
    },
    {
      title: 'DK 3GHz',
      dataIndex: 'DK_3GHZ',
      key: 'dk_3ghz',
      width: 100,
    },
    {
      title: 'DF 3GHz',
      dataIndex: 'DF_3GHZ',
      key: 'df_3ghz',
      width: 100,
    },
    {
      title: 'DK 4GHz',
      dataIndex: 'DK_4GHZ',
      key: 'dk_4ghz',
      width: 100,
    },
    {
      title: 'DF 4GHz',
      dataIndex: 'DF_4GHZ',
      key: 'df_4ghz',
      width: 100,
    },
    {
      title: 'DK 5GHz',
      dataIndex: 'DK_5GHZ',
      key: 'dk_5ghz',
      width: 100,
    },
    {
      title: 'DF 5GHz',
      dataIndex: 'DF_5GHZ',
      key: 'df_5ghz',
      width: 100,
    },
    {
      title: 'DK 6GHz',
      dataIndex: 'DK_6GHZ',
      key: 'dk_6ghz',
      width: 100,
    },
    {
      title: 'DF 6GHz',
      dataIndex: 'DF_6GHZ',
      key: 'df_6ghz',
      width: 100,
    },
    {
      title: 'DK 7GHz',
      dataIndex: 'DK_7GHZ',
      key: 'dk_7ghz',
      width: 100,
    },
    {
      title: 'DF 7GHz',
      dataIndex: 'DF_7GHZ',
      key: 'df_7ghz',
      width: 100,
    },
    {
      title: 'DK 8GHz',
      dataIndex: 'DK_8GHZ',
      key: 'dk_8ghz',
      width: 100,
    },
    {
      title: 'DF 8GHz',
      dataIndex: 'DF_8GHZ',
      key: 'df_8ghz',
      width: 100,
    },
    {
      title: 'DK 9GHz',
      dataIndex: 'DK_9GHZ',
      key: 'dk_9ghz',
      width: 100,
    },
    {
      title: 'DF 9GHz',
      dataIndex: 'DF_9GHZ',
      key: 'df_9ghz',
      width: 100,
    },
    {
      title: 'DK 10GHz',
      dataIndex: 'DK_10GHZ',
      key: 'dk_10ghz',
      width: 100,
    },
    {
      title: 'DF 10GHz',
      dataIndex: 'DF_10GHZ',
      key: 'df_10ghz',
      width: 100,
    },
    {
      title: 'DK 15GHz',
      dataIndex: 'DK_15GHZ',
      key: 'dk_15ghz',
      width: 100,
    },
    {
      title: 'DF 15GHz',
      dataIndex: 'DF_15GHZ',
      key: 'df_15ghz',
      width: 100,
    },
    {
      title: 'DK 16GHz',
      dataIndex: 'DK_16GHZ',
      key: 'dk_16ghz',
      width: 100,
    },
    {
      title: 'DF 16GHz',
      dataIndex: 'DF_16GHZ',
      key: 'df_16ghz',
      width: 100,
    },
    {
      title: 'DK 20GHz',
      dataIndex: 'DK_20GHZ',
      key: 'dk_20ghz',
      width: 100,
    },
    {
      title: 'DF 20GHz',
      dataIndex: 'DF_20GHZ',
      key: 'df_20ghz',
      width: 100,
    },
    {
      title: 'DK 25GHz',
      dataIndex: 'DK_25GHZ',
      key: 'dk_25ghz',
      width: 100,
    },
    {
      title: 'DF 25GHz',
      dataIndex: 'DF_25GHZ',
      key: 'df_25ghz',
      width: 100,
    },
    {
      title: 'Is HF',
      dataIndex: 'IS_HF',
      key: 'is_hf',
      width: 100,
      render: (isHF) => (isHF ? 'Có' : 'Không'),
    },
        {
          title: 'Trạng thái',
          dataIndex: 'STATUS',
          key: 'status',
          width: 120,
          render: (status) => {
            let color = 'blue';
            if (status === 'Pending') color = 'orange';
            else if (status === 'Approve') color = 'green';
            else if (status === 'Cancel') color = 'grey';
    
            return <Tag color={color}>{status}</Tag>;
          }
        },
    {
      title: 'Data Source',
      dataIndex: 'DATA_SOURCE',
      key: 'data_source',
      width: 200,
    },
    {
      title: 'File Name',
      dataIndex: 'FILENAME',
      key: 'filename',
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

export default HistoryModal;
