import React, { useEffect, useState } from 'react';
import { Modal, Table } from 'antd';
import axios from 'axios';

const EditHistory = ({ documentId, visible, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchEditHistory();
    }
  }, []);

  const fetchEditHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/edit-history/${documentId}`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching edit history:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Edited By',
      dataIndex: 'EDITED_BY',
      key: 'edited_by',
    },
    {
      title: 'Old Content',
      dataIndex: 'OLD_CONTENT',
      key: 'old_content',
    },
    {
      title: 'New Content',
      dataIndex: 'NEW_CONTENT',
      key: 'new_content',
    },
    {
      title: 'Edit Time',
      dataIndex: 'EDIT_TIME',
      key: 'edit_time',
      render: (text) => new Date(text).toLocaleString(),
    },
  ];

  return (
    <Modal
      title="Edit History"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Table
        columns={columns}
        dataSource={history}
        rowKey="HISTORY_ID"
        loading={loading}
        pagination={false}
      />
    </Modal>
  );
};

export default EditHistory;