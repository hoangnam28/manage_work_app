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
      case 58: return 'NO1';
      case 59: return 'NO2';
      case 60: return 'NO3';
      case 61: return 'NO4';
      case 62: return 'NO5';
      case 63: return 'AVG';
      case 64: return 'NO1';
      case 65: return 'NO2';
      case 66: return 'NO3';
      case 67: return 'NO4';
      case 68: return 'NO5';
      case 69: return 'AVG';
      case 70: return 'NO1';
      case 71: return 'NO2';
      case 72: return 'NO3';
      case 73: return 'NO4';
      case 74: return 'NO5';
      case 75: return 'AVG';
      case 76: return 'DK';
      case 77: return 'NO1';
      case 78: return 'NO2';
      case 79: return 'NO3';
      case 80: return 'NO4';
      case 81: return 'NO5';
      case 82: return 'AVG';
      case 83: return 'NO1';
      case 84: return 'NO2';
      case 85: return 'NO3';
      case 86: return 'NO4';
      case 87: return 'NO5';
      case 88: return 'AVG';
      case 89: return 'DK';
      case 90: return 'NO1';
      case 91: return 'NO2';
      case 92: return 'NO3';
      case 93: return 'NO4';
      case 94: return 'NO5';
      case 95: return 'AVG';
      case 96: return 'DK';
      case 97: return 'NO1';
      case 98: return 'NO2';
      case 99: return 'NO3';
      case 100: return 'NO4';
      case 101: return 'NO5';
      case 102: return 'AVG';
      case 103: return 'NO1';
      case 104: return 'NO2';
      case 105: return 'NO3';
      case 106: return 'NO4';
      case 107: return 'NO5';
      case 108: return 'AVG';
      case 109: return 'NO1';
      case 110: return 'NO2';
      case 111: return 'NO3';
      case 112: return 'NO4';
      case 113: return 'NO5';
      case 114: return 'AVG';
      case 115: return 'NO1';
      case 116: return 'NO2';
      case 117: return 'NO3';
      case 118: return 'NO4';
      case 119: return 'NO5';
      case 120: return 'AVG';    
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
            <TabPane tab="1. Thông tin cơ bản cột(1-13)" key="1">
              <Alert
                message="Thông tin cơ bản của đơn hàng"
                description="JobName, Mã Hàng, Khách hàng, Loại khách hàng, Ứng dụng, Phân loại sản xuất, CCL, PP, Mực phủ sơn, Lấp lỗ vĩnh viễn..."
                type="info" 
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(1, 13)}
              </Row>
            </TabPane>
            <TabPane tab="2. Thông số vật liệu cột(14- 23)" key="2">
              <Alert
                message="Thông số chi tiết về vật liệu"
                description="Bao gồm: Thông số PP, mực phủ sơn, độ dày và lấp lỗ vĩnh viễn"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(14, 23)}
              </Row>
            </TabPane>
            <TabPane tab="3. Yêu cầu kỹ thuật cột (24-35)" key="3">
              <Alert
                message="Thông số IMP yêu cầu của khách hàng"
                description="Bao gồm: Các thông số kỹ thuật về GND, độ dày, nhựa và thông số đồng"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(24, 35)}
              </Row>
            </TabPane>
            <TabPane tab="4. Tổng hợp kết quả mô phỏng" key="4">
              <Alert
                message="Tổng hợp kết quả mô phỏng"
                description="Bao gồm: Phủ sơn,	Độ dày đồng (µm),	Lớp GND1,	Lớp GND2,	L (µm),	S (µm),	GAP ｺﾌﾟﾚﾅｰ (µm)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(36, 50)}
              </Row>
            </TabPane>
            <TabPane tab="5. Tổng hợp kết quả đo thực tế - Giá trị IMP" key="5">
              <Alert
                message="Giá trị IMP"
                description="Bao gồm: Các thông số đo PP và CU từ 1-5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(51, 57)}
              </Row>
            </TabPane>
            <TabPane tab="6. Tổng hợp kết quả đo thực tế - Phủ sơn" key="6">
              <Alert
                message="Độ dày phủ sơn trên PP"
                description="Bao gồm: Các thông số đo NO1 và NO5 từ 1-5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(58, 63)}
              </Row>
            </TabPane>
            <TabPane tab="7. Tổng hợp kết quả đo thực tế - Phủ sơn" key="7">
              <Alert
                message="Độ dày phủ sơn trên đồng"
                description="Bao gồm: Các thông số đo NO1 và NO5 từ 1-5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(64, 69)}
              </Row>
            </TabPane>
            <TabPane tab="8. Tổng hợp kết quả đo thực tế - Phủ sơn" key="8">
              <Alert
                message="Độ dày phủ sơn trên PP"
                description="Bao gồm: Các thông số đo NO1 và NO5 từ 1-5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(70, 76 )}
              </Row>
            </TabPane>
            <TabPane tab="9. Tổng hợp kết quả đo thực tế - Độ dày đồng" key="9">
              <Alert
                message="Độ dày đồng (µm)"
                description="Bao gồm: Các thông số đo NO1 và NO5 từ 1-5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(77, 82)}
              </Row>
            </TabPane>            
            <TabPane tab="10. Tổng hợp kết quả đo thực tế - Lớp GND1" key="10">
              <Alert
                message="Độ dày PP"
                description="Bao gồm: Các thông số đo NO1 và NO5 từ 1-5 và giá trị trung bình - DK"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}  
              />
              <Row gutter={16}>
                {renderImpedanceFields(83, 89)}
              </Row>
            </TabPane>
            <TabPane tab="11. Tổng hợp kết quả đo thực tế - Lớp GND2" key="11">
              <Alert
                message="Độ dày PP"
                description="Bao gồm: Các thông số đo NO1 và NO5 từ 1-5 và giá trị trung bình - DK"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(90, 96)}
              </Row>
            </TabPane>
             <TabPane tab="12. Tổng hợp kết quả đo thực tế - L (µm)" key="12">
              <Alert
                message="Đỉnh đường mạch"
                description="Bao gồm: Các thông số đo NO1 và NO5 từ 1-5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(97, 102 )}
              </Row>
            </TabPane>
            <TabPane tab="13. Tổng hợp kết quả đo thực tế - L (µm)" key="13">
              <Alert
                message="Chân đường mạch"
                description="Bao gồm: Các thông số đo NO1 và NO5 từ 1-5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(103, 108)}
              </Row>
            </TabPane>
            <TabPane tab="14. Tổng hợp kết quả đo thực tế - S (µm)" key="14">
              <Alert
                message="S (µm)"
                description="Bao gồm: Các thông số đo NO1 và NO5 từ 1-5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(109, 114)}
              </Row>
            </TabPane>
            <TabPane tab="15. Tổng hợp kết quả đo thực tế - GAP ｺﾌﾟﾚﾅｰ (µm)" key="15">
              <Alert
                message="GAP ｺﾌﾟﾚﾅｰ (µm)"
                description="Bao gồm: Các thông số đo NO1 và NO5 từ 1-5 và giá trị trung bình"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(115, 120)}
              </Row>
            </TabPane>
            <TabPane tab="16. So sánh kết quả giữ mô phỏng và thực tế" key="16">
              <Alert
                message="Giá trị IMP - Phủ sơn"
                description="Bao gồm: Giá trị IMP - Phủ sơn, Độ dày phủ sơn trên PP,	Độ dày phủ sơn trên đồng,	Độ dày phủ sơn trên PP"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(121, 125)}
              </Row>
            </TabPane>
            <TabPane tab="17. So sánh kết quả giữ mô phỏng và thực tế" key="17">
              <Alert
                message="Độ dày đồng (µm) - Lớp GND1 - Lớp GND2 - L (µm) - S (µm) - GAP ｺﾌﾟﾚﾅｰ (µm)"
                description="Bao gồm: Độ dày PP-GDN1, DK-GND1, Độ dày PP-GND2, DK-GND2, Đỉnh đường mạch L, Chân đường mạch L, S (µm), GAP ｺﾌﾟﾚﾅｰ (µm)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(126, 134)}
              </Row>
            </TabPane>
            <TabPane tab="18. Ghi chú" key="18">
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