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
      for (let i = 1; i <= 135; i++) {
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
      // Thông tin cơ bản
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
      case 51: return 'NO 1';
      case 52: return 'NO 2';
      case 53: return 'NO 3';
      case 54: return 'NO 4';
      case 55: return 'NO 5';
      case 56: return 'AVG';
      case 57: return 'Result';
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
      // So sánh kết quả
      case 121: return 'Giá trị IMP';
      case 122: return 'Độ dày phủ sơn trên PP';
      case 123: return 'Độ dày phủ sơn trên đồng';
      case 124: return 'Độ dày phủ sơn trên PP';
      case 125: return 'DK';
      case 126: return 'Độ dày đồng (µm)';
      case 127: return 'Độ dày PP (GND1)';
      case 128: return 'DK (GND1)';
      case 129: return 'Độ dày PP (GND2)';
      case 130: return 'DK (GND2)';
      case 131: return 'Đỉnh đường mạch L';
      case 132: return 'Chân đường mạch L';
      case 133: return 'S (µm)';
      case 134: return 'GAP ｺﾌﾟﾚﾅｰ (µm)';
      case 135: return 'Ghi chú';
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
        <Form form={form} layout="vertical">      <Tabs defaultActiveKey="1">
            <TabPane tab="1. Thông tin cơ bản (1-14)" key="1">
              <Alert
                message="Thông tin cơ bản của đơn hàng"
                description="JobName, Mã Hàng, Khách hàng, Loại khách hàng, Ứng dụng, Phân loại sản xuất, CCL, PP, Mực phủ sơn, Lấp lỗ vĩnh viễn..."
                type="info" 
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(1, 10)}
              </Row>
            </TabPane>
            <TabPane tab="2. Thông số vật liệu" key="2">
              <Alert
                message="Thông số chi tiết về vật liệu"
                description="Bao gồm: Thông số PP, mực phủ sơn, độ dày và lấp lỗ vĩnh viễn"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(11, 20)}
              </Row>
            </TabPane>
            <TabPane tab="3. Yêu cầu kỹ thuật" key="3">
              <Alert
                message="Thông số kỹ thuật yêu cầu"
                description="Bao gồm: Các thông số kỹ thuật về GND, độ dày, nhựa và thông số đồng"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(21, 40)}
              </Row>
            </TabPane>
            <TabPane tab="4. Giá trị VIMP đo được" key="4">
              <Alert
                message="Kết quả đo VIMP"
                description="Bao gồm: Các giá trị VIMP đo được từ 1-5, giá trị trung bình và kết quả đánh giá"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(41, 60)}
              </Row>
            </TabPane>
            <TabPane tab="5. Thông số PP và CU" key="5">
              <Alert
                message="Thông số PP và CU"
                description="Bao gồm: Các thông số đo PP và CU từ 1-5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(61, 80)}
              </Row>
            </TabPane>
            <TabPane tab="6. Thông số PP1 và CU1" key="6">
              <Alert
                message="Thông số PP1 và CU1"
                description="Bao gồm: Các thông số đo PP1 và CU1 từ 1-5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(81, 100)}
              </Row>
            </TabPane>
            <TabPane tab="7. Thông số GND1" key="7">
              <Alert
                message="Thông số GND1"
                description="Bao gồm: Các giá trị đo GND1 từ PP1-PP5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(101, 110)}
              </Row>
            </TabPane>
            <TabPane tab="8. Thông số GND2" key="8">
              <Alert
                message="Thông số GND2"
                description="Bao gồm: Các giá trị đo GND2 từ PP1-PP5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(111, 120)}
              </Row>
            </TabPane>
            <TabPane tab="9. Đo chiều dài L" key="9">
              <Alert
                message="Kết quả đo chiều dài L"
                description="Bao gồm: Các giá trị đo L tại đỉnh và chân từ 1-5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(121, 125)}
              </Row>
            </TabPane>            <TabPane tab="10. Đo S và GAP (110-121)" key="10">
              <Alert
                message="Kết quả đo S và GAP"
                description="Các giá trị đo S và GAP từ 1-5 và giá trị trung bình của các phép đo"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(110, 121)}
              </Row>
            </TabPane>
            <TabPane tab="11. So sánh kết quả (122-135)" key="11">
              <Alert
                message="So sánh kết quả giữa mô phỏng và thực tế"
                description="Phân tích sự khác biệt giữa kết quả mô phỏng và đo thực tế"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(126, 135)}
              </Row>
            </TabPane>
            <TabPane tab="12. Ghi chú" key="12">
              <Alert
                message="Ghi chú bổ sung"
                description="Thêm các ghi chú và thông tin bổ sung khác"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={4} placeholder="Nhập ghi chú bổ sung (nếu có)" />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateImpedanceModal;