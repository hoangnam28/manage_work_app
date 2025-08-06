import { useEffect, useState } from 'react';
import { Modal, Form, Input, Row, Col, Tabs, Alert, Button, Switch, Space, Select } from 'antd';

const { TabPane } = Tabs;

const UpdateImpedanceModal = ({ visible, onCancel, onUpdate, currentRecord }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [toggleMode, setToggleMode] = useState(false);

  useEffect(() => {
    if (visible && currentRecord) {
      setError(null);
      setSuccessMessage(null);
      setToggleMode(false);
      const initialValues = {};
      
      // Load all IMP fields
      for (let i = 1; i <= 137; i++) {
        const key = `IMP_${i}`;
        if (currentRecord[key] !== undefined && currentRecord[key] !== null) {
          initialValues[`imp_${i}`] = currentRecord[key];
        }
      }
      
      // Load NOTE field
      if (currentRecord.NOTE !== undefined && currentRecord.NOTE !== null) {
        initialValues.note = currentRecord.NOTE;
      }
      
      console.log('Setting initial values:', initialValues); // Debug log
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
      console.log('Form values before processing:', values); // Debug log
      
      const impId = currentRecord.IMP_ID;
      const processedValues = { ...values };

      if (processedValues.note) {
        processedValues.NOTE = processedValues.note;
        delete processedValues.note;
      }

      // Add bulk update flag if in toggle mode for IMP_137
      if (toggleMode && processedValues.imp_137 !== undefined) {
        processedValues.updateByMaHang = true;
      }

      console.log('Processed values to send:', processedValues); // Debug log
      
      const result = await onUpdate(impId, processedValues);

      // Show different success messages based on whether bulk update occurred
      if (result?.bulkUpdate) {
        setSuccessMessage(
          `Cập nhật thành công! ${result.bulkUpdate.message} (Mã hàng: ${result.bulkUpdate.maHang})`
        );
      } else {
        setSuccessMessage('Dữ liệu đã được cập nhật thành công');
      }

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

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
      case 3: return 'Tổng hợp dữ liệu đo thực tế';
      case 4: return 'Mã hàng tham khảo';
      case 5: return 'Khách hàng';
      case 6: return 'Loại khách hàng';
      case 7: return 'Ứng dụng';
      case 8: return 'Phân loại sản xuất';
      case 9: return 'Độ dày bo (µm)';
      case 10: return 'Cấu trúc lớp';
      case 11: return 'CCL';
      case 12: return 'PP';
      case 13: return 'Mực phủ sơn';
      case 14: return 'Lấp lỗ vĩnh viễn BVH';
      case 15: return 'Lấp lỗ vĩnh viễn TH';
      case 16: return 'Lá đồng (µm)';
      case 17: return 'Tỷ lệ đồng còn lại lớp IMP';
      case 18: return 'Tỷ lệ đồng còn lại lớp GND1';
      case 19: return 'Tỷ lê đồng còn lại lớp GND2';
      case 20: return 'Mắt lưới (GND1)';
      case 21: return 'Độ dày (GND1) (µm)';
      case 22: return '% Nhựa (GND1)';
      case 23: return 'Mắt lưới (GND2)';
      case 24: return 'Độ dày (GND2) (µm)';
      case 25: return '% Nhựa (GND2)';
      case 26: return 'Giá trị IMP';
      case 27: return 'Dung sai IMP';
      case 28: return 'Loại IMP';
      case 29: return 'Lớp IMP';
      case 30: return 'GAP';
      case 31: return 'Lớp IMP';
      case 32: return 'Lớp GND1';
      case 33: return 'Lớp GND2';
      case 34: return 'L (µm)';
      case 35: return 'S (µm)';
      case 36: return 'GAP';
      case 37: return 'Giá trị IMP';
      case 38: return 'Độ dày phủ sơn trên PP';
      case 39: return 'Độ dày phủ sơn trên đồng';
      case 40: return 'Độ dày phủ sơn trên PP';
      case 41: return 'DK';
      case 42: return 'Độ dày đồng (µm)';
      case 43: return 'Loại';
      case 44: return 'Độ dày(µm)';
      case 45: return 'DK';
      case 46: return 'Loại';
      case 47: return 'Độ dày (µm)';
      case 48: return 'DK';
      case 49: return 'Đỉnh đường mạch';
      case 50: return 'Chân đường mạch';
      case 51: return 'S (µm)';
      case 52: return 'GAP ｺﾌﾟﾚﾅｰ (µm)';
      case 53: return 'No 1';
      case 54: return 'No 2';
      case 55: return 'No 3';
      case 56: return 'No 4';
      case 57: return 'No 5';
      case 58: return 'AVG';
      case 59: return 'Result';
      case 60: return 'NO1';
      case 61: return 'NO2';
      case 62: return 'NO3';
      case 63: return 'NO4';
      case 64: return 'NO5';
      case 65: return 'AVG';
      case 66: return 'NO1';
      case 67: return 'NO2';
      case 68: return 'NO3';
      case 69: return 'NO4';
      case 70: return 'NO5';
      case 71: return 'AVG';
      case 72: return 'NO1';
      case 73: return 'NO2';
      case 74: return 'NO3';
      case 75: return 'NO4';
      case 76: return 'NO5';
      case 77: return 'AVG';
      case 78: return 'DK';
      case 79: return 'NO1';
      case 80: return 'NO2';
      case 81: return 'NO3';
      case 82: return 'NO4';
      case 83: return 'NO5';
      case 84: return 'AVG';
      case 85: return 'NO1';
      case 86: return 'NO2';
      case 87: return 'NO3';
      case 88: return 'NO4';
      case 89: return 'NO5';
      case 90: return 'AVG';
      case 91: return 'DK';
      case 92: return 'NO1';
      case 93: return 'NO2';
      case 94: return 'NO3';
      case 95: return 'NO4';
      case 96: return 'NO5';
      case 97: return 'AVG';
      case 98: return 'DK';
      case 99: return 'NO1';
      case 100: return 'NO2';
      case 101: return 'NO3';
      case 102: return 'NO4';
      case 103: return 'NO5';
      case 104: return 'AVG';
      case 105: return 'NO1';
      case 106: return 'NO2';
      case 107: return 'NO3';
      case 108: return 'NO4';
      case 109: return 'NO5';
      case 110: return 'AVG';
      case 111: return 'NO1';
      case 112: return 'NO2';
      case 113: return 'NO3';
      case 114: return 'NO4';
      case 115: return 'NO5';
      case 116: return 'AVG';
      case 117: return 'NO1';
      case 118: return 'NO2';
      case 119: return 'NO3';
      case 120: return 'NO4';
      case 121: return 'NO5';
      case 122: return 'AVG';
      case 123: return 'Giá trị IMP';
      case 124: return 'Độ dày phủ sơn trên PP';
      case 125: return 'Độ dày phủ sơn trên đồng';
      case 126: return 'Độ dày phủ sơn trên PP';
      case 127: return 'DK';
      case 128: return 'Độ dày đồng (µm)';
      case 129: return 'Độ dày PP (GND1)';
      case 130: return 'DK (GND1)';
      case 131: return 'Độ dày PP (GND2)';
      case 132: return 'DK (GND2)';
      case 133: return 'Đỉnh đường mạch L';
      case 134: return 'Chân đường mạch L';
      case 135: return 'S (µm)';
      case 136: return 'GAP ｺﾌﾟﾚﾅｰ (µm)';
      case 137: return 'Coupon Code';
      default: return `Imp ${index}`;
    }
  };

  const renderImpedanceFields = (start, end) => {
    let fields = [];
    for (let i = start; i <= end; i++) {
      // Special handling for field at position 3 - this actually controls IMP_137
      if (i === 3) {
        fields.push(
          <Col span={24} key={`special_imp_137`}>
            <Form.Item
              name="imp_137"
              label={getFieldLabel(3)}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Select
                  placeholder="Chọn trạng thái"
                  allowClear
                  style={{ width: '200px' }}
                  onChange={(value) => {
                    console.log('Select onChange - Selected value:', value);
                    // Force update form field value
                    form.setFieldsValue({ imp_137: value });
                  }}
                >
                  <Select.Option value="Có">Có</Select.Option>
                  <Select.Option value="Không">Không</Select.Option>
                </Select>
                <div style={{ marginTop: 8 }}>
                  <Space>
                    <Switch
                      checked={toggleMode}
                      onChange={setToggleMode}
                      size="small"
                    />
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      Cập nhật theo mã hàng (áp dụng cho tất cả bản ghi cùng mã hàng)
                    </span>
                  </Space>
                  {toggleMode && (
                    <div style={{ marginTop: 4, padding: 8, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                      <small style={{ color: '#52c41a' }}>
                        ⚠️ Giá trị đã chọn sẽ được áp dụng cho tất cả bản ghi cùng mã hàng: <strong>{currentRecord?.IMP_2 || 'N/A'}</strong>
                      </small>
                    </div>
                  )}
                </div>
              </Space>
            </Form.Item>
          </Col>
        );
      } else {
        // Render normal field cho các trường khác
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
            <TabPane tab="1. Thông tin cơ bản cột(1-14)" key="1">
              <Alert
                message="Thông tin cơ bản của đơn hàng"
                description="Bao gồm: JobName, Mã Hàng, Mã tham khảo, Khách hàng, Loại khách hàng, Ứng dụng, Phân loại sản xuất, Độ dày bo (µm), Cấu trúc lớp, CCL, PP, Mực phủ sơn, Lấp lỗ vĩnh viễn BVH"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(1, 14)}
              </Row>
            </TabPane>
            <TabPane tab="2. Thông số vật liệu cột(15- 24)" key="2">
              <Alert
                message="Thông số vật liệu"
                description="Bao gồm: Lấp lỗ vĩnh viễn TH, Lá đồng (µm), Tỷ lệ đồng còn lại của các lớp IMP/GND1/GND2, Mắt lưới GND1/GND2, Độ dày và % Nhựa của GND1/GND2"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(15, 24)}
              </Row>
            </TabPane>
            <TabPane tab="3. Yêu cầu kỹ thuật cột (25-36)" key="3">
              <Alert
                message="Yêu cầu thông số kỹ thuật"
                description="Bao gồm: Giá trị IMP, Dung sai IMP, Loại IMP, Thông số các lớp (IMP, GND1, GND2), GAP, L (µm), S (µm)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(25, 36)}
              </Row>
            </TabPane>
            <TabPane tab="4. Tổng hợp kết quả mô phỏng" key="4">
              <Alert
                message="Tổng hợp kết quả mô phỏng"
                description="Bao gồm: Giá trị IMP, Thông số phủ sơn (độ dày trên PP/đồng/PP, DK), Độ dày đồng, Thông số lớp GND1/GND2 (Loại, Độ dày, DK), L(Đỉnh/Chân), S, GAP"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(37, 52)}
              </Row>
            </TabPane>
            <TabPane tab="5. Tổng hợp kết quả đo thực tế - Giá trị IMP" key="5">
              <Alert
                message="Giá trị IMP - Kết quả đo"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình), Result (kết quả đánh giá)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(53, 59)}
              </Row>
            </TabPane>
            <TabPane tab="6. Tổng hợp kết quả đo thực tế - Phủ sơn" key="6">
              <Alert
                message="Độ dày phủ sơn trên PP - Kết quả đo thứ nhất"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của lần đo)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(60, 65)}
              </Row>
            </TabPane>
            <TabPane tab="7. Tổng hợp kết quả đo thực tế - Phủ sơn" key="7">
              <Alert
                message="Độ dày phủ sơn trên đồng - Kết quả đo"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của các lần đo)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(66, 71)}
              </Row>
            </TabPane>
            <TabPane tab="8. Tổng hợp kết quả đo thực tế - Phủ sơn" key="8">
              <Alert
                message="Độ dày phủ sơn trên PP - Kết quả đo thứ hai"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình), DK (giá trị đối kháng)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(72, 78)}
              </Row>
            </TabPane>
            <TabPane tab="9. Tổng hợp kết quả đo thực tế - Độ dày đồng" key="9">
              <Alert
                message="Độ dày đồng - Kết quả đo"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của các lần đo)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(79, 84)}
              </Row>
            </TabPane>
            <TabPane tab="10. Tổng hợp kết quả đo thực tế - Lớp GND1" key="10">
              <Alert
                message="Độ dày PP trên lớp GND1"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình), DK (giá trị đối kháng)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(85, 91)}
              </Row>
            </TabPane>
            <TabPane tab="11. Tổng hợp kết quả đo thực tế - Lớp GND2" key="11">
              <Alert
                message="Độ dày PP trên lớp GND2"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình), DK (giá trị đối kháng)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(92, 98)}
              </Row>
            </TabPane>
            <TabPane tab="12. Tổng hợp kết quả đo thực tế - L (µm)" key="12">
              <Alert
                message="Đỉnh đường mạch L"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của các lần đo đỉnh đường mạch)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(99, 104)}
              </Row>
            </TabPane>
            <TabPane tab="13. Tổng hợp kết quả đo thực tế - L (µm)" key="13">
              <Alert
                message="Chân đường mạch L"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của các lần đo chân đường mạch)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(105, 110)}
              </Row>
            </TabPane>
            <TabPane tab="14. Tổng hợp kết quả đo thực tế - S (µm)" key="14">
              <Alert
                message="Khoảng cách S"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của các lần đo khoảng cách S)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(111, 116)}
              </Row>
            </TabPane>
            <TabPane tab="15. Tổng hợp kết quả đo thực tế - GAP ｺﾌﾟﾚﾅｰ (µm)" key="15">
              <Alert
                message="Khoảng cách GAP ｺﾌﾟﾚﾅｰ"
                description="Bao gồm: No.1-5, AVG (giá trị trung bình của các lần đo khoảng cách GAP)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(117, 122)}
              </Row>
            </TabPane>
            <TabPane tab="16. So sánh kết quả giữa mô phỏng và thực tế" key="16">
              <Alert
                message="So sánh các thông số IMP và phủ sơn"
                description="Bao gồm: Giá trị IMP thực tế, Độ dày phủ sơn trên PP, Độ dày phủ sơn trên đồng, Độ dày phủ sơn trên PP, DK (giá trị đối kháng)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(123, 127)}
              </Row>
            </TabPane>
            <TabPane tab="17. So sánh kết quả giữa mô phỏng và thực tế - Coupon Code" key="17">
              <Alert
                message="So sánh các thông số kỹ thuật"
                description="Bao gồm: Độ dày đồng (µm), Độ dày PP-GND1, DK-GND1, Độ dày PP-GND2, DK-GND2, L (Đỉnh/Chân đường mạch), S (µm), GAP (µm), Kết quả đánh giá - Coupon Code"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {renderImpedanceFields(128, 137)}
              </Row>
            </TabPane>
            <TabPane tab="18. Ghi chú bổ sung" key="18">
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