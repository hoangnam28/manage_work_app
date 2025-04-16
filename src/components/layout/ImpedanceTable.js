import React, { useEffect, useState } from 'react';
import { Table, Button, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const ImpedanceTable = ({ data, onEdit }) => {
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
    
    // Update the table data
    setTableData(data);
  }, [data]);

  const columns = [
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'left',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => onEdit(record)}
          />
        </Space>
      ),
    },
    {
      title: 'Mã hàng',
      dataIndex: 'IMP_1',
      key: 'imp_1',
      align: 'center',
    },
    {
      title: 'Imp 2',
      dataIndex: 'IMP_2',
      key: 'imp_2',
      align: 'center',
    },
    {
      title: 'Imp 3',
      dataIndex: 'IMP_3',
      key: 'imp_3',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 4',
      dataIndex: 'IMP_4',
      key: 'imp_4',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 5',
      dataIndex: 'IMP_5',
      key: 'imp_5',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 6',
      dataIndex: 'IMP_6',
      key: 'imp_6',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 7',
      dataIndex: 'IMP_7',
      key: 'imp_7',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 8',
      dataIndex: 'IMP_8',
      key: 'imp_8',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 9',
      dataIndex: 'IMP_9',
      key: 'imp_9',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 10',
      dataIndex: 'IMP_10',
      key: 'imp_10',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 11',
      dataIndex: 'IMP_11',
      key: 'imp_11',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 12',
      dataIndex: 'IMP_12',
      key: 'imp_12',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 13',
      dataIndex: 'IMP_13',
      key: 'imp_13',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 14',
      dataIndex: 'IMP_14',
      key: 'imp_14',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 15',
      dataIndex: 'IMP_15',
      key: 'imp_15',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 16',
      dataIndex: 'IMP_16',
      key: 'imp_16',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 17',
      dataIndex: 'IMP_17',
      key: 'imp_17',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 18',
      dataIndex: 'IMP_18',
      key: 'imp_18',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 19',
      dataIndex: 'IMP_19',
      key: 'imp_19',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 20',
      dataIndex: 'IMP_20',
      key: 'imp_20',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 21',
      dataIndex: 'IMP_21',
      key: 'imp_21',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 22',
      dataIndex: 'IMP_22',
      key: 'imp_22',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 23',
      dataIndex: 'IMP_23',
      key: 'imp_23',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 24',
      dataIndex: 'IMP_24',
      key: 'imp_24',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 25',
      dataIndex: 'IMP_25',
      key: 'imp_25',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 26',
      dataIndex: 'IMP_26',
      key: 'imp_26',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 27',
      dataIndex: 'IMP_27',
      key: 'imp_27',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 28',
      dataIndex: 'IMP_28',
      key: 'imp_28',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 29',
      dataIndex: 'IMP_29',
      key: 'imp_29',
      width: 100,
      align: 'center',
    },
    {
      title: 'Imp 30',
      dataIndex: 'IMP_30',
      key: 'imp_30',
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
        pagination={false}
        size="middle"
        scroll={{ x: 'max-content' }}
      />
    </>
  );
};

export default ImpedanceTable;