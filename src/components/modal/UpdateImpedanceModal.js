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
      for (let i = 1; i <= 121; i++) {
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
      case 35: return 'Giá trị IMP';
      case 36: return 'Độ dày phủ sơn trên PP';
      case 37: return 'Độ dày phủ sơn trên đồng';
      case 38: return 'Độ dày phủ sơn trên PP';
      case 39: return 'DK';
      case 40: return 'Độ dày đồng (µm)';
      case 41: return 'Loại';
      case 42: return 'Độ dày(µm)';
      case 43: return 'DK';
      case 44: return 'Loại';
      case 45: return 'Độ dày (µm)';
      case 46: return 'DK';
      case 47: return 'Đỉnh đường mạch';
      case 48: return 'Chân đường mạch';
      case 49: return 'S (µm)';
      case 50: return 'GAP ｺﾌﾟﾚﾅｰ (µm)';
      case 51: return 'VIMP 1';
      case 52: return 'VIMP 2';
      case 53: return 'VIMP 3';
      case 54: return 'VIMP 4';
      case 55: return 'VIMP 5';
      case 56: return 'Trung bình IMP';
      case 57: return 'Kết quả IMP';
      case 58: return 'PP 1';
      case 59: return 'PP 2';
      case 60: return 'PP 3';
      case 61: return 'PP 4';
      case 62: return 'PP 5';
      case 63: return 'Trung bình PP';
      case 64: return 'CU 1';
      case 65: return 'CU 2';
      case 66: return 'CU 3';
      case 67: return 'CU 4';
      case 68: return 'CU 5';
      case 69: return 'Trung bình CU';
      case 70: return 'PP1 1';
      case 71: return 'PP1 2';
      case 72: return 'PP1 3';
      case 73: return 'PP1 4';
      case 74: return 'PP1 5';
      case 75: return 'Trung bình PP2';
      case 76: return 'DK 1';
      case 77: return 'CU1 1';
      case 78: return 'CU1 2';
      case 79: return 'CU1 3';
      case 80: return 'CU1 4';
      case 81: return 'CU1 5';
      case 82: return 'Trung bình CU1';
      case 83: return 'GND1 PP1';
      case 84: return 'GND1 PP2';
      case 85: return 'GND1 PP3';
      case 86: return 'GND1 PP4';
      case 87: return 'GND1 PP5';
      case 88: return 'Trung bình GND1 PP';
      case 89: return 'DK 2';
      case 90: return 'GND2 PP1';
      case 91: return 'GND2 PP2';
      case 92: return 'GND2 PP3';
      case 93: return 'GND2 PP4';
      case 94: return 'GND2 PP5';
      case 95: return 'Trung bình GND2 PP';
      case 96: return 'DK 3';
      case 97: return 'L Đỉnh 1';
      case 98: return 'L Đỉnh 2';
      case 99: return 'L Đỉnh 3';
      case 100: return 'L Đỉnh 4';
      case 101: return 'L Đỉnh 5';
      case 102: return 'Trung bình L Đỉnh';
      case 103: return 'L Chân 1';
      case 104: return 'L Chân 2';
      case 105: return 'L Chân 3';
      case 106: return 'L Chân 4';
      case 107: return 'L Chân 5';
      case 108: return 'Trung bình L Chân';
      case 109: return 'S1';
      case 110: return 'S2';
      case 111: return 'S3';
      case 112: return 'S4';
      case 113: return 'S5';
      case 114: return 'Trung bình S';
      case 115: return 'GAP 1';
      case 116: return 'GAP 2';
      case 117: return 'GAP 3';
      case 118: return 'GAP 4';
      case 119: return 'GAP 5';
      case 120: return 'Trung bình GAP';
      case 121: return 'Ghi chú';
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
      title="Cập nhật số liệu Impedance"
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={1200}
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
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin cơ bản (1-10)" key="1">
              <Row gutter={16}>
                {renderImpedanceFields(1, 10)}
              </Row>
            </TabPane>
            <TabPane tab="Vật liệu (11-20)" key="2">
              <Row gutter={16}>
                {renderImpedanceFields(11, 20)}
              </Row>
            </TabPane>
            <TabPane tab="Thông số kỹ thuật (21-35)" key="3">
              <Row gutter={16}>
                {renderImpedanceFields(21, 35)}
              </Row>
            </TabPane>
            <TabPane tab="Giá trị VIMP (52-58)" key="4">
              <Row gutter={16}>
                {renderImpedanceFields(52, 58)}
              </Row>
            </TabPane>
            <TabPane tab="Thông số PP & CU (59-70)" key="5">
              <Row gutter={16}>
                {renderImpedanceFields(59, 70)}
              </Row>
            </TabPane>
            <TabPane tab="Thông số PP1 & CU1 (71-83)" key="6">
              <Row gutter={16}>
                {renderImpedanceFields(71, 83)}
              </Row>
            </TabPane>
            <TabPane tab="GND1 PP (84-89)" key="7">
              <Row gutter={16}>
                {renderImpedanceFields(84, 89)}
              </Row>
            </TabPane>
            <TabPane tab="GND2 PP (90-96)" key="8">
              <Row gutter={16}>
                {renderImpedanceFields(90, 96)}
              </Row>
            </TabPane>
            <TabPane tab="Đo L (97-109)" key="9">
              <Row gutter={16}>
                {renderImpedanceFields(97, 109)}
              </Row>
            </TabPane>
            <TabPane tab="S & GAP (110-121)" key="10">
              <Row gutter={16}>
                {renderImpedanceFields(110, 121)}
              </Row>
            </TabPane>
            <TabPane tab="Ghi chú" key="11">
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