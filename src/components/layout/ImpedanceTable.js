import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const ImpedanceTable = ({ data, onEdit, onSoftDelete }) => {
  const [tableData, setTableData] = useState([]);
  const [newRowId, setNewRowId] = useState(null);

  useEffect(() => {
    if (data.length > tableData.length) {
      const newRow = data[data.length - 1];
      if (newRow && newRow.imp_id) {
        setNewRowId(newRow.imp_id);
        setTimeout(() => {
          setNewRowId(null);
        }, 1000);
      }
    }
    setTableData(data);
  }, [data, tableData.length]);

  const columns = [
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'left',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Xóa dữ liệu"
            description="Bạn có chắc chắn muốn xóa dữ liệu này?"
            onConfirm={() => onSoftDelete(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
    {
      title: 'JobName',
      dataIndex: 'IMP_1',
      key: 'imp_1',
      align: 'center',
      fixed: 'left',
    },
    {
      title: 'Mã Hàng',
      dataIndex: 'IMP_2',
      key: 'imp_2',
      align: 'center',
    },
    {
      title: 'Mã hàng tham khảo',
      dataIndex: 'IMP_3',
      key: 'imp_3',
      width: 100,
      align: 'center',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'IMP_4',
      key: 'imp_4',
      width: 100,
      align: 'center',
    },
    {
      title: 'Loại khách hàng',
      dataIndex: 'IMP_5',
      key: 'imp_5',
      width: 100,
      align: 'center',
    },
    {
      title: 'Ứng dụng',
      dataIndex: 'IMP_6',
      key: 'imp_6',
      width: 100,
      align: 'center',
    },
    {
      title: 'Phân loại sản xuất',
      dataIndex: 'IMP_7',
      key: 'imp_7',
      width: 100,
      align: 'center',
    },
    {
      title: 'Độ dày bo (µm)',
      dataIndex: 'IMP_8',
      key: 'imp_8',
      width: 100,
      align: 'center',
    },
    {
      title: 'Cấu trúc lớp',
      dataIndex: 'IMP_9',
      key: 'imp_9',
      width: 100,
      align: 'center',
    },
    {
      title: 'Cấu trúc lớp',
      dataIndex: 'IMP_10',
      key: 'imp_10',
      width: 100,
      align: 'center',
    },
    {
      title: 'CCL',
      dataIndex: 'IMP_11',
      key: 'imp_11',
      width: 100,
      align: 'center',
    },
    {
      title: 'PP',
      dataIndex: 'IMP_12',
      key: 'imp_12',
      width: 100,
      align: 'center',
    },
    {
      title: 'Mực phủ sơn',
      dataIndex: 'IMP_13',
      key: 'imp_13',
      width: 100,
      align: 'center',
    },
    {
      title: 'Lấp lỗ vĩnh viễn BVH',
      dataIndex: 'IMP_14',
      key: 'imp_14',
      width: 100,
      align: 'center',
    },
    {
      title: 'Lấp lỗ vĩnh viễn TH',
      dataIndex: 'IMP_15',
      key: 'imp_15',
      width: 100,
      align: 'center',
    },
    {
      title: 'Lá đồng (µm)',
      dataIndex: 'IMP_16',
      key: 'imp_16',
      width: 100,
      align: 'center',
    },
    {
      title: 'Tỷ lệ đồng còn lại lớp IMP',
      dataIndex: 'IMP_17',
      key: 'imp_17',
      width: 100,
      align: 'center',
    },
    {
      title: 'Tỷ lệ đồng còn lại lớp GND1',
      dataIndex: 'IMP_18',
      key: 'imp_18',
      width: 100,
      align: 'center',
    },
    {
      title: 'Tỷ lê đồng còn lại lớp GND2',
      dataIndex: 'IMP_19',
      key: 'imp_19',
      width: 100,
      align: 'center',
    },
    {
      title: 'Mắt lưới',
      dataIndex: 'IMP_20',
      key: 'imp_20',
      width: 100,
      align: 'center',
    },
    {
      title: 'Độ dày (µm)',
      dataIndex: 'IMP_21',
      key: 'imp_21',
      width: 100,
      align: 'center',
    },
    {
      title: '% Nhựa',
      dataIndex: 'IMP_22',
      key: 'imp_22',
      width: 100,
      align: 'center',
    },
    {
      title: 'Độ dày (µm)',
      dataIndex: 'IMP_23',
      key: 'imp_23',
      width: 100,
      align: 'center',
    },
    {
      title: 'Giá trị IMP',
      dataIndex: 'IMP_24',
      key: 'imp_24',
      width: 100,
      align: 'center',
    },
    {
      title: 'Dung sai IMP',
      dataIndex: 'IMP_25',
      key: 'imp_25',
      width: 100,
      align: 'center',
    },
    {
      title: 'Loại IMP',
      dataIndex: 'IMP_26',
      key: 'imp_26',
      width: 100,
      align: 'center',
    },
    {
      title: 'Lớp IMP',
      dataIndex: 'IMP_27',
      key: 'imp_27',
      width: 100,
      align: 'center',
    },
    {
      title: 'GAP',
      dataIndex: 'IMP_28',
      key: 'imp_28',
      width: 100,
      align: 'center',
    },
    {
      title: 'Lớp IMP',
      dataIndex: 'IMP_29',
      key: 'imp_29',
      width: 100,
      align: 'center',
    },
    {
      title: 'Lớp GND1',
      dataIndex: 'IMP_30',
      key: 'imp_30',
      width: 100,
      align: 'center',
    },
    {
      title: 'IMP_31',
      dataIndex: 'IMP_31',
      key: 'imp_31',
      width: 100,
      align: 'center',
    },
    {
      title: 'IMP_32',
      dataIndex: 'IMP_32',
      key: 'imp_32',
      width: 100,
      align: 'center',
    },
    {
      title: 'IMP_33',
      dataIndex: 'IMP_33',
      key: 'imp_33',
      width: 100,
      align: 'center',
    },
    {
      title: 'IMP_34',
      dataIndex: 'IMP_34',
      key: 'imp_34',
      width: 100,
      align: 'center',
    },
    {
      title: 'IMP_35',
      dataIndex: 'IMP_35',
      key: 'imp_35',
      width: 100,
      align: 'center',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'NOTE',
      key: 'note',
      width: 200,
    },
  ];

  // Add row class to highlight new rows
  const rowClassName = (record) => {
    return record.imp_id === newRowId ? 'ant-table-row-new' : '';
  };

  return (
    <>
      <Table
        dataSource={tableData}
        columns={columns}
        rowKey="imp_id"
        rowClassName={rowClassName}
        bordered
        pagination={{
          pageSize: 10, 
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'], 
        }}
        size="middle"
        scroll={{ x: 'max-content' }}
      />
    </>
  );
};

export default ImpedanceTable;