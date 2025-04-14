import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Row, Col, Tabs, Alert } from 'antd';

const { TabPane } = Tabs;

const UpdateImpedanceModal = ({ visible, onCancel, onUpdate, currentRecord }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible && currentRecord) {
      // Reset error state
      setError(null);
      
      // Initialize form with current values from the record
      const initialValues = {};
      
      // Extract all imp_1 to imp_30 values from lowercase or uppercase keys
      for (let i = 1; i <= 30; i++) {
        const lowerKey = `imp_${i}`;
        const upperKey = `IMP_${i}`;
        
        // Use lowercase key if available, otherwise try uppercase
        if (currentRecord[lowerKey] !== undefined) {
          initialValues[lowerKey] = currentRecord[lowerKey];
        } else if (currentRecord[upperKey] !== undefined) {
          initialValues[lowerKey] = currentRecord[upperKey];
        }
      }
      
      // Add note if available
      if (currentRecord.note) {
        initialValues.note = currentRecord.note;
      } else if (currentRecord.NOTE) {
        initialValues.note = currentRecord.NOTE;
      }
      
      form.setFieldsValue(initialValues);
    }
  }, [visible, currentRecord, form]);

  const handleOk = () => {
    // Check if the currentRecord exists and has a valid ID
    if (!currentRecord || !currentRecord.IMP_ID) {
      setError('Không thể cập nhật do không tìm thấy ID hợp lệ');
      return;
    }

    setLoading(true);
    setError(null);
    
    form.validateFields()
      .then((values) => {
        // Make sure we have an ID for the update
        const impId = currentRecord.IMP_ID;
        
        // Log for debugging
        console.log('Updating record with ID:', impId);
        console.log('Update values:', values);
        
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

  // Helper function to create form items in batches
  const renderImpedanceFields = (start, end) => {
    let fields = [];
    for (let i = start; i <= end; i++) {
      fields.push(
        <Col span={8} key={`imp_${i}`}>
          <Form.Item
            name={`imp_${i}`}
            label={`Imp ${i}`}
            // No required validation - all fields are optional
          >
            <Input placeholder={`Nhập giá trị (số hoặc chữ)`} />
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
            <TabPane tab="Ghi chú" key="4">
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