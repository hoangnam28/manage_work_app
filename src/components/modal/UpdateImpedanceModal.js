import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Row, Col, Tabs, Alert } from 'antd';

const { TabPane } = Tabs;

const UpdateImpedanceModal = ({ visible, onCancel, onUpdate, currentRecord }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible && currentRecord) {
      setError(null);
      const initialValues = {};
      for (let i = 1; i <= 35; i++) {
        const lowerKey = `imp_${i}`;
        const upperKey = `IMP_${i}`;
        if (currentRecord[lowerKey] !== undefined) {
          initialValues[lowerKey] = currentRecord[lowerKey];
        } else if (currentRecord[upperKey] !== undefined) {
          initialValues[lowerKey] = currentRecord[upperKey];
        }
      }
      if (currentRecord.note) {
        initialValues.note = currentRecord.note;
      } else if (currentRecord.NOTE) {
        initialValues.note = currentRecord.NOTE;
      }
      
      form.setFieldsValue(initialValues);
    }
  }, [visible, currentRecord, form]);

  const handleOk = () => {
    if (!currentRecord || !currentRecord.IMP_ID) {
      setError('Không thể cập nhật do không tìm thấy ID hợp lệ');
      return;
    }

    setLoading(true);
    setError(null);
    
    form.validateFields()
      .then((values) => {
        const impId = currentRecord.IMP_ID;
        onUpdate(impId, values);
      })
      .catch((info) => {
        console.error('Validate Failed:', info);
        setError('Lỗi khi kiểm tra dữ liệu form');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getFieldLabel = (index) => {
    switch (index) {
      case 1: return 'JobName';
      case 2: return 'Mã Hàng';
      case 3: return 'Mã hàng tham khảo';
      case 4: return 'Khách hàng';
      case 5: return 'Loại khách hàng';
      case 6: return 'Ứng dụng';
      case 7: return 'Phân loại sản xuất';
      case 8: return 'Độ dày bo (µm)';
      case 9: return 'Cấu trúc lớp';
      case 10: return 'CCL';
      case 11: return 'PP';
      case 12: return 'Mực phủ sơn';
      case 13: return 'Lấp lỗ vĩnh viễn BVH';
      case 14: return 'Lấp lỗ vĩnh viễn TH';
      case 15: return 'Lá đồng (µm)';
      case 16: return 'Tỷ lệ đồng còn lại lớp IMP';
      case 17: return 'Tỷ lệ đồng còn lại lớp GND1';
      case 18: return 'Tỷ lê đồng còn lại lớp GND2';
      case 19: return 'Mắt lưới (GND1)';
      case 20: return 'Độ dày (GND1) (µm)';
      case 21: return '% Nhựa (GND1)';
      case 22: return 'Mắt lưới (GND2)';
      case 23: return 'Độ dày (GND2) (µm)';
      case 24: return '% Nhựa (GND2)';
      case 25: return 'Giá trị IMP';
      case 26: return 'Dung sai IMP';
      case 27: return 'Loại IMP';
      case 28: return 'Lớp IMP';
      case 29: return 'GAP';
      case 30: return 'Lớp IMP';
      case 31: return 'Lớp GND1';
      case 32: return 'Lớp GND2';
      case 33: return 'L (µm)';
      case 34: return 'S (µm)';
      case 35: return 'GAP ｺﾌﾟﾚﾅｰ (µm)';
      default: return `Imp ${index}`;
    }
  };

  const renderImpedanceFields = (start, end) => {
    let fields = [];
    for (let i = start; i <= end; i++) {
      fields.push(
        <Col span={8} key={`imp_${i}`}>
          <Form.Item
            name={`imp_${i}`}
            label={getFieldLabel(i)}
          >
            <Input placeholder={`Nhập ${getFieldLabel(i)}`} />
          </Form.Item>
        </Col>
      );
    }
    return fields;
  };

  return (
    <Modal
      title="Cập nhật dữ liệu Impedance"
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={1000}
      okText="Cập nhật"
      cancelText="Hủy"
      confirmLoading={loading}
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {currentRecord && (
        <Form form={form} layout="vertical">
          <div style={{ marginBottom: 8 }}>
            <strong>ID:</strong> {currentRecord.imp_id}
          </div>
          
          <Tabs defaultActiveKey="1">
            <TabPane tab="Imp 1-10" key="1">
              <Row gutter={16}>
                {renderImpedanceFields(1, 10)}
              </Row>
            </TabPane>
            <TabPane tab="Imp 11-20" key="2">
              <Row gutter={16}>
                {renderImpedanceFields(11, 20)}
              </Row>
            </TabPane>
            <TabPane tab="Imp 21-30" key="3">
              <Row gutter={16}>
                {renderImpedanceFields(21, 30)}
              </Row>
            </TabPane>
            <TabPane tab="Imp 31-35" key="4">
              <Row gutter={16}>
                {renderImpedanceFields(31, 35)}
              </Row>
            </TabPane>
            <TabPane tab="Ghi chú" key="5">
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateImpedanceModal;