import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Card, Statistic, Row, Col, Tag } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import TimeTrackingModal from '../modal/TimeTrackingModal';
import { toast } from 'sonner';
import {
  fetchTimeTrackingList,
  createTimeTracking,
  updateTimeTracking,
  deleteTimeTracking,
  fetchTimeTrackingSummary
} from '../../utils/time-tracking-api';
import moment from 'moment';

const TimeTrackingTab = ({ certificationId, assignee }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [summary, setSummary] = useState(null);
  const [currentTimes, setCurrentTimes] = useState({});

 useEffect(() => {
  const interval = setInterval(() => {
    const runningRecords = data.filter(
      record => record.STATUS === 'IN_PROGRESS' && record.START_TIME && !record.END_TIME
    );
    
    const times = {};
    runningRecords.forEach(record => {
      const startTime = moment(record.START_TIME);
      const currentTime = moment();
      times[record.TIME_TRACKING_ID] = currentTime.diff(startTime, 'minutes');
    });
    
    setCurrentTimes(times);
  }, 1000); // Update mỗi giây

  return () => clearInterval(interval);
}, [data]);

  useEffect(() => {
  if (certificationId) {
    loadData();
    loadSummary();
  }
  //eslint-disable-next-line react-hooks/exhaustive-deps
}, [certificationId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchTimeTrackingList(certificationId);
      setData(response.data || []);
    } catch (error) {
      console.error('Error loading time tracking:', error);
      toast.error('Lỗi khi tải dữ liệu thời gian');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await fetchTimeTrackingSummary(certificationId);
      setSummary(response.data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handleCreate = async (values) => {
    try {
      await createTimeTracking(values);
      loadData();
      loadSummary();
      setModalVisible(false);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdate = async (values) => {
    try {
      const recordId = editingRecord.TIME_TRACKING_ID;
      await updateTimeTracking(recordId, values);
      loadData();
      loadSummary();
      setModalVisible(false);
      setEditingRecord(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteTimeTracking(record.TIME_TRACKING_ID);
      toast.success('Xóa thành công');
      loadData();
      loadSummary();
    } catch (error) {
      console.error('Error deleting time tracking:', error);
      toast.error('Lỗi khi xóa');
    }
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleCreateNew = () => {
    setModalMode('create');
    setEditingRecord(null);
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'IN_PROGRESS': return 'processing';
      case 'PENDING': return 'orange';
      case 'PAUSED': return 'blue';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'IN_PROGRESS': return 'Đang làm';
      case 'PENDING': return 'Chờ thực hiện';
      case 'PAUSED': return 'Tạm dừng';
      case 'CANCELLED': return 'Hủy';
      default: return status;
    }
  };

 // Trong TimeTrackingTab.jsx - handleStartWork
const handleStartWork = async (record) => {
  try {
    const startTime = moment();
    
    // ✅ Đảm bảo tất cả giá trị đều hợp lệ
    const values = {
      certificationId: record.CERTIFICATION_ID,
      personDo: record.PERSON_DO || '',
      personCheck: record.PERSON_CHECK || null,
      startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
      endTime: null, // Explicitly set to null
      timeDo: null,
      timeCheck: record.TIME_CHECK || 0,
      totalTime: 0,
      workDescription: record.WORK_DESCRIPTION || null,
      status: 'IN_PROGRESS'
    };
    
    console.log('Sending to API:', values); // Debug
    
    await updateTimeTracking(record.TIME_TRACKING_ID, values);
    toast.success('Đã bắt đầu công việc');
    loadData();
    loadSummary();
  } catch (error) {
    console.error('Error starting work:', error);
    toast.error('Lỗi khi bắt đầu công việc');
  }
};

  const handleFinishWork = async (record) => {
  try {
    const endTime = moment();
    const startTime = moment(record.START_TIME);
    const timeDiff = endTime.diff(startTime, 'minutes');

    const values = {
      certificationId: record.CERTIFICATION_ID,
      personDo: record.PERSON_DO || null,
      personCheck: record.PERSON_CHECK || null,
      startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
      endTime: endTime.format('YYYY-MM-DD HH:mm:ss'),
      timeDo: timeDiff || 0,
      timeCheck: record.TIME_CHECK || 0,
      workDescription: record.WORK_DESCRIPTION || null,
      status: 'COMPLETED'
    };
    
    await updateTimeTracking(record.TIME_TRACKING_ID, values);
    toast.success(`Đã hoàn thành công việc (${timeDiff} phút)`);
    loadData();
    loadSummary();
  } catch (error) {
    console.error('Error finishing work:', error);
    toast.error('Lỗi khi hoàn thành công việc');
  }
};

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'PERSON_DO',
      key: 'person_do',
      width: 150,
    },
    {
      title: 'Người kiểm tra',
      dataIndex: 'PERSON_CHECK',
      key: 'person_check',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'START_TIME',
      key: 'start_time',
      width: 180,
      render: (date) => {
        if (!date) return '-';
        return moment(date).format('DD/MM/YYYY HH:mm:ss');
      },
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'END_TIME',
      key: 'end_time',
      width: 180,
      render: (date) => {
        if (!date) return '-';
        return moment(date).format('DD/MM/YYYY HH:mm:ss');
      },
    },
    {
    title: 'TG đang chạy (phút)',
    key: 'running_time',
    width: 150,
    align: 'center',
    render: (_, record) => {
      if (record.STATUS === 'IN_PROGRESS' && record.START_TIME && !record.END_TIME) {
        return (
          <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
            {currentTimes[record.TIME_TRACKING_ID] || 0}
          </span>
        );
      }
      return '-';
    }
  },
  {
    title: 'TG thực hiện (phút)',
    dataIndex: 'TIME_DO',
    key: 'time_do',
    width: 150,
    align: 'center',
    render: (time) => <span style={{ fontWeight: 'bold' }}>{time || 0}</span>,
  },
    {
      title: 'TG kiểm tra (phút)',
      dataIndex: 'TIME_CHECK',
      key: 'time_check',
      width: 150,
      align: 'center',
      render: (time) => <span style={{ fontWeight: 'bold' }}>{time || 0}</span>,
    },
    {
      title: 'Tổng TG (phút)',
      dataIndex: 'TOTAL_TIME',
      key: 'total_time',
      width: 130,
      align: 'center',
      render: (time) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '16px' }}>
          {time || 0}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'STATUS',
      key: 'status',
      width: 130,
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Mô tả công việc',
      dataIndex: 'WORK_DESCRIPTION',
      key: 'work_description',
      width: 250,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
  title: 'Thao tác',
  key: 'action',
  fixed: 'right',
  width: 200,
  align: 'center',
  render: (_, record) => (
    <Space size="small">
      {/* Hiện nút Start khi: chưa có START_TIME */}
      {!record.START_TIME && (
        <Button
          type="primary"
          icon={<ClockCircleOutlined />}
          onClick={() => handleStartWork(record)}
          size="small"
          style={{ backgroundColor: '#52c41a' }}
        >
          Start
        </Button>
      )}
      
      {/* Hiện nút Finish khi: đã có START_TIME nhưng chưa có END_TIME */}
      {record.START_TIME && !record.END_TIME && (
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => handleFinishWork(record)}
          size="small"
          style={{ backgroundColor: '#1890ff' }}
        >
          Finish
        </Button>
      )}
      
      <Button
        type="default"
        icon={<EditOutlined />}
        onClick={() => handleEdit(record)}
        size="small"
      />
      
      <Popconfirm
        title="Xác nhận xóa?"
        onConfirm={() => handleDelete(record)}
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
}
  ];

  return (
    <>
      {summary && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số bản ghi"
                value={summary.TOTAL_RECORDS}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng TG thực hiện"
                value={summary.TOTAL_TIME_DO}
                suffix="phút"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng TG kiểm tra"
                value={summary.TOTAL_TIME_CHECK}
                suffix="phút"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng thời gian"
                value={summary.TOTAL_TIME}
                suffix="phút"
                valueStyle={{ color: '#cf1322', fontSize: '24px', fontWeight: 'bold' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Action Button */}
      <Row justify="end" style={{ marginBottom: '16px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateNew}
        >
          Thêm thời gian thao tác
        </Button>
      </Row>

      {/* Time Tracking Table */}
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey={(record) => record.TIME_TRACKING_ID}
        scroll={{ x: 'max-content' }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
          pageSizeOptions: ['10', '20', '50'],
        }}
      />

      {/* Modal */}
     <TimeTrackingModal
  open={modalVisible}
  onCancel={() => {
    setModalVisible(false);
    setEditingRecord(null);
    setModalMode('create');
  }}
  onSubmit={modalMode === 'edit' ? handleUpdate : handleCreate}
  editingRecord={editingRecord}
  mode={modalMode}
  certificationId={certificationId}
  assignee={assignee} // Truyền assignee vào
/>
    </>
  );
};

export default TimeTrackingTab;