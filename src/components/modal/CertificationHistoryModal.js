import React, { useState, useEffect } from 'react';
import { Modal, Timeline, Spin, Empty, Tag, Descriptions, Collapse } from 'antd';
import { 
  ClockCircleOutlined, 
  PlusCircleOutlined, 
  EditOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { fetchCertificationHistory } from '../../utils/material-certification-api';
import { toast } from 'sonner';

const { Panel } = Collapse;

const CertificationHistoryModal = ({ open, onClose, certificationId, certificationName }) => {
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    if (open && certificationId) {
      fetchHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, certificationId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetchCertificationHistory(certificationId);
      setHistoryData(response.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Không thể tải lịch sử thay đổi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const match = dateString.match(/^(\d{2})-([A-Z]{3})-(\d{2})/);
    if (!match) return '-';

    const day = match[1];
    const monthStr = match[2];
    const year = '20' + match[3]; 
    const monthMap = {
      JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
      JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
    };

    const month = monthMap[monthStr] || '01';
    return `${day}/${month}/${year}`;
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'CREATE':
        return <PlusCircleOutlined style={{ fontSize: '16px' }} />;
      case 'UPDATE':
        return <EditOutlined style={{ fontSize: '16px' }} />;
      default:
        return <ClockCircleOutlined style={{ fontSize: '16px' }} />;
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'CREATE':
        return 'green';
      case 'UPDATE':
        return 'blue';
      case 'APPROVE':
        return 'purple';
      case 'DELETE':
        return 'red';
      default:
        return 'default';
    }
  };

  const getActionText = (actionType) => {
    switch (actionType) {
      case 'CREATE':
        return 'Tạo mới';
      case 'UPDATE':
        return 'Cập nhật';
      case 'APPROVE':
        return 'Phê duyệt';
      case 'DELETE':
        return 'Xóa';
      default:
        return actionType;
    }
  };

  const fieldLabels = {
    releaseDate: 'Ngày phát hành',
    factoryName: 'Tên nhà máy',
    requestReason: 'Lý do yêu cầu',
    layerStructure: 'Cấu trúc lớp',
    usage: 'Mục đích sử dụng',
    reliabilityLevelId: 'Mức độ tin cậy',
    expectedProductionQty: 'Số lượng sản xuất dự kiến',
    massProductionDate: 'Ngày sản xuất hàng loạt',
    materialCertExpected: 'Ngày chứng nhận vật liệu dự kiến',
    manufacturerName: 'Tên nhà sản xuất',
    factoryLocation: 'Địa điểm nhà máy',
    materialName: 'Tên vật liệu',
    materialClassId: 'Loại vật liệu',
    materialProperty1Id: 'Thuộc tính 1',
    materialProperty2Id: 'Thuộc tính 2',
    materialProperty3Id: 'Thuộc tính 3',
    materialStatusId: 'Trạng thái vật liệu',
    ulStatusId: 'Trạng thái UL',
    notes1: 'Ghi chú 1',
    notes2: 'Ghi chú 2',
    departmentInCharge: 'Bộ phận phụ trách',
    personInCharge: 'Người phụ trách',
    startDate: 'Ngày bắt đầu',
    pd5ReportDeadline: 'Kỳ hạn gửi báo cáo tới PD5',
    completionDeadline: 'Kỳ hạn hoàn thành',
    actualCompletionDate: 'Ngày hoàn thành thực tế',
    pd5ReportActualDate: 'Ngày gửi báo cáo tới PD5 thực tế',
    progress: 'Tiến độ',
    PROGRESS_ID: 'Tiến độ',
    factoryCertReady: 'Chứng nhận ở nhà máy khác',
    factoryCertStatus: 'Nhà máy chứng nhận',
    factoryLevel: 'Cấp độ ở nhà máy khác',
    priceRequest: 'Yêu cầu báo cáo đánh giá',
    reportLink: 'Link gửi báo cáo đánh giá',
    totalTime: 'Tổng thời gian',
    personDo: 'Người làm',
    personCheck: 'Người check',
    timeDo: 'Thời gian làm (phút)',
    timeCheck: 'Thời gian check (phút)',
    datePd5Hq: 'Ngày PD5 gửi HQ',
    datePd5GetReport: 'Ngày PD5 tổng hợp báo cáo',
    PERSON_ACCEPT: 'Người phê duyệt TKSX',
    PERSON_ACCEPT_QL2: 'Người phê duyệt QL2',
    IS_DELETED: 'Trạng thái xóa',
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Có' : 'Không';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const renderChangedFields = (history) => {
  if (history.actionType === 'CREATE') {
    const newValues = history.newValues || {};
    const entries = Object.entries(newValues);

    return (
      <Descriptions bordered size="small" column={1}>
        {entries.map(([key, value]) => (
          <Descriptions.Item
            key={key}
            label={
              <span
                style={{
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  maxWidth: '200px'
                }}
              >
                {fieldLabels[key] || key}
              </span>
            }
            contentStyle={{
              fontSize: '12px',
              wordBreak: 'break-word'
            }}
          >
            <Tag color="green" style={{ margin: 0 }}>
              {formatValue(value)}
            </Tag>
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  }

  if (history.actionType === 'UPDATE' && history.changedFields?.length > 0) {
    const entries = history.changedFields.map(field => ({
      field,
      oldValue: history.oldValues?.[field],
      newValue: history.newValues?.[field]
    }));

    return (
      <Descriptions bordered size="small" column={1}>
        {entries.map(({ field, oldValue, newValue }) => (
          <Descriptions.Item
            key={field}
            label={
              <span
                style={{
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  maxWidth: '200px'
                }}
              >
                {fieldLabels[field] || field}
              </span>
            }
            contentStyle={{
              fontSize: '12px',
              wordBreak: 'break-word'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}
            >
              <Tag color="red" style={{ margin: 0 }}>
                {formatValue(oldValue)}
              </Tag>
              <span style={{ fontSize: '12px' }}>→</span>
              <Tag color="green" style={{ margin: 0 }}>
                {formatValue(newValue)}
              </Tag>
            </div>
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  }

  if (history.actionType === 'APPROVE') {
    return (
      <Descriptions bordered size="small" column={1}>
        {history.changedFields?.map(field => (
          <Descriptions.Item
            key={field}
            label={
              <span style={{ fontSize: '12px' }}>
                {fieldLabels[field] || field}
              </span>
            }
            contentStyle={{ fontSize: '12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag color="red" style={{ margin: 0 }}>
                {formatValue(history.oldValues?.[field])}
              </Tag>
              <span>→</span>
              <Tag color="green" style={{ margin: 0 }}>
                {formatValue(history.newValues?.[field])}
              </Tag>
            </div>
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  }

  return (
    <Empty
      description="Không có thay đổi"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  );
};

  return (
    <Modal
      title={
        <div>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          Lịch sử thay đổi: {certificationName || `ID ${certificationId}`}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" tip="Đang tải lịch sử..." />
        </div>
      ) : historyData.length === 0 ? (
        <Empty description="Không có lịch sử thay đổi" />
      ) : (
        <Timeline mode="left" style={{ marginTop: 20 }}>
          {historyData.map((history, index) => (
            <Timeline.Item
              key={history.historyId}
              dot={getActionIcon(history.actionType)}
              color={getActionColor(history.actionType)}
            >
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <Tag color={getActionColor(history.actionType)}>
                    {getActionText(history.actionType)}
                  </Tag>
                  <Tag icon={<CalendarOutlined />}>
                    {formatDate(history.actionDate || history.createdAt || history.timestamp)}
                  </Tag>
                </div>

                <div style={{ marginBottom: 8, fontSize: '13px', color: '#666' }}>
                  <UserOutlined style={{ marginRight: 4 }} />
                  Người thực hiện: <strong>{history.actionBy}</strong>
                  {history.ipAddress && (
                    <>
                      <EnvironmentOutlined style={{ marginLeft: 12, marginRight: 4 }} />
                      IP: {history.ipAddress}
                    </>
                  )}
                </div>

                {history.notes && (
                  <div style={{ marginBottom: 8, fontSize: '13px', fontStyle: 'italic' }}>
                    {history.notes}
                  </div>
                )}

                <Collapse 
                  ghost 
                  defaultActiveKey={index === 0 ? ['1'] : []}
                  style={{ marginTop: 8 }}
                >
                  <Panel 
                    header={
                      <span style={{ fontSize: '13px' }}>
                        Chi tiết thay đổi 
                        {history.changedFields && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            {history.changedFields.length} trường
                          </Tag>
                        )}
                      </span>
                    } 
                    key="1"
                  >
                    {renderChangedFields(history)}
                  </Panel>
                </Collapse>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </Modal>
  );
};

export default CertificationHistoryModal;