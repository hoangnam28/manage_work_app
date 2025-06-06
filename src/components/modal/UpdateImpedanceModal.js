import { useEffect, useState } from 'react';
import { Modal, Form, Input, Row, Col, Tabs, Alert, Button } from 'antd';

const { TabPane } = Tabs;

const UpdateImpedanceModal = ({ visible, onCancel, onUpdate, currentRecord }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (visible && currentRecord) {
      setError(null);
      setSuccessMessage(null);
      const initialValues = {};
      // Initialize IMP fields
      for (let i = 1; i <= 135; i++) {
        const key = `IMP_${i}`;
        if (currentRecord[key] !== undefined) {
          initialValues[key.toLowerCase()] = currentRecord[key];
        }
      }
      // Handle NOTE field separately
      if (currentRecord.NOTE !== undefined) {
        initialValues.note = currentRecord.NOTE;
      }
      form.setFieldsValue(initialValues);
    }
  }, [visible, currentRecord, form]);

  const handleOk = async () => {
    if (!currentRecord || !currentRecord.IMP_ID) {
      setError('Không thể cập nhật do không tìm thấy ID hợp lệ');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const values = await form.validateFields();
      const impId = currentRecord.IMP_ID;
      const processedValues = { ...values };
      if (processedValues.note) {
        processedValues.NOTE = processedValues.note;
        delete processedValues.note;
      }
      await onUpdate(impId, processedValues);
      
      setSuccessMessage('Dữ liệu đã được cập nhật thành công');
      
      // Tự động ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (info) {
      console.error('Update Failed:', info);
      setError('Có lỗi xảy ra khi cập nhật dữ liệu');
    } finally {
      setLoading(false);
    }
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
      case 35: return 'GAP';
      case 36: return 'Giá trị IMP';
      case 37: return 'Độ dày phủ sơn trên PP';
      case 38: return 'Độ dày phủ sơn trên đồng';
      case 39: return 'Độ dày phủ sơn trên PP';
      case 40: return 'DK';
      case 41: return 'Độ dày đồng (µm)';
      case 42: return 'Loại';
      case 43: return 'Độ dày(µm)';
      case 44: return 'DK';
      case 45: return 'Loại';
      case 46: return 'Độ dày (µm)';
      case 47: return 'DK';
      case 48: return 'Đỉnh đường mạch';
      case 49: return 'Chân đường mạch';
      case 50: return 'S (µm)';
      case 51: return 'GAP ｺﾌﾟﾚﾅｰ (µm)';
      case 52: return 'No 1';
      case 53: return 'No 2';
      case 54: return 'No 3';
      case 55: return 'No 4';
      case 56: return 'No 5';
      case 57: return 'AVG';
      case 58: return 'Result';
      case 59: return 'NO1';
      case 60: return 'NO2';
      case 61: return 'NO3';
      case 62: return 'NO4';
      case 63: return 'NO5';
      case 64: return 'AVG';
      case 65: return 'NO1';
      case 66: return 'NO2';
      case 67: return 'NO3';
      case 68: return 'NO4';
      case 69: return 'NO5';
      case 70: return 'AVG';
      case 71: return 'NO1';
      case 72: return 'NO2';
      case 73: return 'NO3';
      case 74: return 'NO4';
      case 75: return 'NO5';
      case 76: return 'AVG';
      case 77: return 'DK';
      case 78: return 'NO1';
      case 79: return 'NO2';
      case 80: return 'NO3';
      case 81: return 'NO4';
      case 82: return 'NO5';
      case 83: return 'AVG';
      case 84: return 'NO1';
      case 85: return 'NO2';
      case 86: return 'NO3';
      case 87: return 'NO4';
      case 88: return 'NO5';
      case 89: return 'AVG';
      case 90: return 'DK';
      case 91: return 'NO1';
      case 92: return 'NO2';
      case 93: return 'NO3';
      case 94: return 'NO4';
      case 95: return 'NO5';
      case 96: return 'AVG';
      case 97: return 'DK';
      case 98: return 'NO1';
      case 99: return 'NO2';
      case 100: return 'NO3';
      case 101: return 'NO4';
      case 102: return 'NO5';
      case 103: return 'AVG';
      case 104: return 'NO1';
      case 105: return 'NO2';
      case 106: return 'NO3';
      case 107: return 'NO4';
      case 108: return 'NO5';
      case 109: return 'AVG';
      case 110: return 'NO1';
      case 111: return 'NO2';
      case 112: return 'NO3';
      case 113: return 'NO4';
      case 114: return 'NO5';
      case 115: return 'AVG';
      case 116: return 'NO1';
      case 117: return 'NO2';
      case 118: return 'NO3';
      case 119: return 'NO4';
      case 120: return 'NO5';
      case 121: return 'AVG';
      case 122: return 'Giá trị IMP';
      case 123: return 'Độ dày phủ sơn trên PP';
      case 124: return 'Độ dày phủ sơn trên đồng';
      case 125: return 'Độ dày phủ sơn trên PP';
      case 126: return 'DK';
      case 127: return 'Độ dày đồng (µm)';
      case 128: return 'Độ dày PP (GND1)';
      case 129: return 'DK (GND1)';
      case 130: return 'Độ dày PP (GND2)';
      case 131: return 'DK (GND2)';      case 132: return 'Đỉnh đường mạch L';
      case 133: return 'Chân đường mạch L';
      case 134: return 'S (µm)';
      case 135: return 'GAP ｺﾌﾟﾚﾅｰ (µm)';
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
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Đóng
        </Button>,
        <Button 
          key="update" 
          type="primary" 
          loading={loading}
          onClick={handleOk}
        >
          Cập nhật
        </Button>
      ]}
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {successMessage && (
        <Alert
          message={successMessage}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {currentRecord && (
        <Form form={form} layout="vertical">     
          <Tabs defaultActiveKey="1">
            <TabPane tab="1. Thông tin cơ bản cột(1-13)" key="1">              <Alert
                message="Thông tin cơ bản của đơn hàng"
                description="Bao gồm: JobName, Mã Hàng, Mã tham khảo, Khách hàng, Loại khách hàng, Ứng dụng, Phân loại sản xuất, Độ dày bo (µm), Cấu trúc lớp, CCL, PP, Mực phủ sơn, Lấp lỗ vĩnh viễn BVH"
                type="info" 
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(1, 13)}
              </Row>
            </TabPane>
            <TabPane tab="2. Thông số vật liệu cột(14- 23)" key="2">              <Alert
                message="Thông số vật liệu"
                description="Bao gồm: Lấp lỗ vĩnh viễn TH, Lá đồng (µm), Tỷ lệ đồng còn lại của các lớp IMP/GND1/GND2, Mắt lưới GND1/GND2, Độ dày và % Nhựa của GND1/GND2"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(14, 23)}
              </Row>
            </TabPane>
            <TabPane tab="3. Yêu cầu kỹ thuật cột (24-35)" key="3">              <Alert
                message="Yêu cầu thông số kỹ thuật"
                description="Bao gồm: Giá trị IMP, Dung sai IMP, Loại IMP, Thông số các lớp (IMP, GND1, GND2), GAP, L (µm), S (µm)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(24, 35)}
              </Row>
            </TabPane>
            <TabPane tab="4. Tổng hợp kết quả mô phỏng" key="4">              <Alert
                message="Tổng hợp kết quả mô phỏng"
                description="Bao gồm: Giá trị IMP, Thông số phủ sơn (độ dày trên PP/đồng/PP, DK), Độ dày đồng, Thông số lớp GND1/GND2 (Loại, Độ dày, DK), L(Đỉnh/Chân), S, GAP"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(36, 51)}
              </Row>
            </TabPane>
            <TabPane tab="5. Tổng hợp kết quả đo thực tế - Giá trị IMP" key="5">              <Alert
                message="Giá trị IMP - Kết quả đo"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình), Result (kết quả đánh giá)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(52, 58)}
              </Row>
            </TabPane>            <TabPane tab="6. Tổng hợp kết quả đo thực tế - Phủ sơn" key="6">
              <Alert
                message="Độ dày phủ sơn trên PP - Kết quả đo thứ nhất"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của lần đo)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(59, 64)}
              </Row>
            </TabPane>            <TabPane tab="7. Tổng hợp kết quả đo thực tế - Phủ sơn" key="7">
              <Alert
                message="Độ dày phủ sơn trên đồng - Kết quả đo"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của các lần đo)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(65, 70)}
              </Row>
            </TabPane>            <TabPane tab="8. Tổng hợp kết quả đo thực tế - Phủ sơn" key="8">
              <Alert
                message="Độ dày phủ sơn trên PP - Kết quả đo thứ hai"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình), DK (giá trị đối kháng)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(71, 77 )}
              </Row>
            </TabPane>            <TabPane tab="9. Tổng hợp kết quả đo thực tế - Độ dày đồng" key="9">
              <Alert
                message="Độ dày đồng - Kết quả đo"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của các lần đo)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(78, 83)}
              </Row>
            </TabPane>            <TabPane tab="10. Tổng hợp kết quả đo thực tế - Lớp GND1" key="10">
              <Alert
                message="Độ dày PP trên lớp GND1"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình), DK (giá trị đối kháng)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}  
              />
              <Row gutter={16}>
                {renderImpedanceFields(84, 90)}
              </Row>
            </TabPane>            <TabPane tab="11. Tổng hợp kết quả đo thực tế - Lớp GND2" key="11">
              <Alert
                message="Độ dày PP trên lớp GND2"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình), DK (giá trị đối kháng)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(91, 97)}
              </Row>
            </TabPane>             <TabPane tab="12. Tổng hợp kết quả đo thực tế - L (µm)" key="12">
              <Alert
                message="Đỉnh đường mạch L"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của các lần đo đỉnh đường mạch)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(98, 103 )}
              </Row>
            </TabPane>            <TabPane tab="13. Tổng hợp kết quả đo thực tế - L (µm)" key="13">
              <Alert
                message="Chân đường mạch L"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của các lần đo chân đường mạch)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(104, 109)}
              </Row>
            </TabPane>            <TabPane tab="14. Tổng hợp kết quả đo thực tế - S (µm)" key="14">
              <Alert
                message="Khoảng cách S"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của các lần đo khoảng cách S)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(110, 115)}
              </Row>
            </TabPane>            <TabPane tab="15. Tổng hợp kết quả đo thực tế - GAP ｺﾌﾟﾚﾅｰ (µm)" key="15">
              <Alert
                message="Khoảng cách GAP ｺﾌﾟﾚﾅｰ"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của các lần đo khoảng cách GAP)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(116, 121)}
              </Row>
            </TabPane>            <TabPane tab="16. So sánh kết quả giữa mô phỏng và thực tế" key="16">
              <Alert
                message="So sánh các thông số IMP và phủ sơn"
                description="Bao gồm: Giá trị IMP thực tế, Độ dày phủ sơn trên PP, Độ dày phủ sơn trên đồng, Độ dày phủ sơn trên PP, DK (giá trị đối kháng)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(122, 126)}
              </Row>
            </TabPane>            <TabPane tab="17. So sánh kết quả giữa mô phỏng và thực tế" key="17">
              <Alert
                message="So sánh các thông số kỹ thuật"
                description="Bao gồm: Độ dày đồng (µm), Độ dày PP-GND1, DK-GND1, Độ dày PP-GND2, DK-GND2, L (Đỉnh/Chân đường mạch), S (µm), GAP (µm), Kết quả đánh giá"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(127, 135)}
              </Row>
            </TabPane>            <TabPane tab="18. Ghi chú bổ sung" key="18">
              <Alert
                message="Ghi chú và đánh giá"
                description="Nhập các ghi chú, nhận xét và thông tin bổ sung về kết quả đo và đánh giá"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Form.Item name="note" label="Ghi chú" rules={[{ required: false }]}>
                <Input.TextArea rows={4} placeholder="Nhập ghi chú và đánh giá bổ sung (nếu có)" />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateImpedanceModal;