import { Form, Input, DatePicker, Select, Button, Row, Col, Divider, Alert, Space, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ProgressTab = ({ 
  form, 
  onFinish, 
  loading, 
  options,
  currentProgressId,
  onApprovalSuccess,
  personAccept,
  personAcceptQL2 
}) => {
  const navigate = useNavigate();
  
  const handleCompletionDeadlineChange = (date) => {
    if (date) {
      const pd5Deadline = date.clone().subtract(1, 'month');
      form.setFieldsValue({
        PD5_REPORT_DEADLINE: pd5Deadline
      });
    } else {
      form.setFieldsValue({
        PD5_REPORT_DEADLINE: null
      });
    }
  };

  // Kiểm tra điều kiện hiển thị nút phê duyệt
  const showTKSXApproval = currentProgressId === 1; // Đang xác nhận yêu cầu
  const showQL2Approval = currentProgressId === 2; // Đang lập kế hoạch

  // Lấy status name để hiển thị
  const currentProgressName = options.progress?.find(
    p => p.status_id === currentProgressId
  )?.status_name || '';

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{}}
    >
      {/* ✅ PHẦN PHÊ DUYỆT - CHUYỂN LÊN ĐẦU */}
      {(showTKSXApproval || showQL2Approval) && (
        <Card 
          style={{ 
            marginBottom: '24px',
            borderColor: showTKSXApproval ? '#52c41a' : '#1890ff',
            backgroundColor: showTKSXApproval ? '#f6ffed' : '#e6f7ff'
          }}
        >
          <Alert
            message={`Trạng thái hiện tại: ${currentProgressName}`}
            description={
              showTKSXApproval 
                ? 'Yêu cầu đang chờ TKSX phê duyệt. Sau khi phê duyệt, trạng thái sẽ chuyển sang "Đang lập kế hoạch".'
                : 'Kế hoạch đang chờ QL2 phê duyệt. Sau khi phê duyệt, trạng thái sẽ chuyển sang "Đang đánh giá".'
            }
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <Row justify="center">
            <Space size="large">
              {/* Nút TKSX Phê duyệt */}
              {showTKSXApproval && (
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={() => onApprovalSuccess && onApprovalSuccess('tksx')}
                  style={{ 
                    backgroundColor: '#52c41a', 
                    borderColor: '#52c41a',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  TKSX Phê duyệt
                </Button>
              )}

              {/* Nút QL2 Phê duyệt */}
              {showQL2Approval && (
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={() => onApprovalSuccess && onApprovalSuccess('ql2')}
                  style={{ 
                    backgroundColor: '#1890ff', 
                    borderColor: '#1890ff',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  QL2 Phê duyệt
                </Button>
              )}
            </Space>
          </Row>
        </Card>
      )}

      {(personAccept || personAcceptQL2) && (
        <div style={{ marginBottom: '24px' }}>
          {personAccept && (
            <Alert
              message="QL2-PD5 đã phê duyệt"
              description={`Người phê duyệt: ${personAccept}`}
              type="success"
              showIcon
              style={{ marginBottom: personAcceptQL2 ? '12px' : '0' }}
            />
          )}
          
          {personAcceptQL2 && (
            <Alert
              message="QL2 đã phê duyệt"
              description={`Người phê duyệt: ${personAcceptQL2}`}
              type="success"
              showIcon
            />
          )}
        </div>
      )}

      {/* Progress Status Section */}
      <div style={{ backgroundColor: '#f0f8ff', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="MATERIAL_NAME" label="Tên vật liệu">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="MATERIAL_CLASS_ID" label="Phân loại vật liệu">
              <Select placeholder="Chọn phân loại vật liệu" allowClear>
                {options.materialClass?.map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.nameVi} ({item.nameJp})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="LAYER_STRUCTURE" label="Cấu tạo lớp">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="RELIABILITY_LEVEL_ID" label="Mức độ tin cậy">
              <Select placeholder="Chọn mức độ tin cậy" allowClear>
                {options.reliabilityLevel?.map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.nameVi} ({item.nameJp})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>

      <div style={{ backgroundColor: '#f0f8ff', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="PROGRESS_ID" label="Tiến độ">
              <Select placeholder="Chọn trạng thái tiến độ" allowClear disabled>
                {options.progress?.map(item => (
                  <Select.Option key={item.status_id} value={item.status_id}>
                    {item.status_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="PERSON_IN_CHARGE" label="Người phụ trách">
              <Input disabled placeholder="Tự động điền" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="DEPARTMENT_IN_CHARGE" label="Bộ phận phụ trách">
              <Select 
                placeholder="Chọn bộ phận phụ trách" 
                allowClear 
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {options.department?.map(item => (
                  <Select.Option key={item.dept_id} value={item.dept_id}>
                    {item.dept_code}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Department and Person Section */}
      <Divider orientation="left">Phân công thực hiện</Divider>
      <Row
        gutter={16}
        style={{
          backgroundColor: '#e6f7ff',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <Col span={12}>
          <Form.Item name="START_DATE" label="Ngày bắt đầu">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="10/16/2024" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="PD5_REPORT_DEADLINE" label="Kì hạn gửi báo cáo tới PD5">
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Tự động tính = Kỳ hạn hoàn thành - 1 tháng"
              disabled
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="FACTORY_CERT_READY" label="Chứng nhận ở nhà máy khác">
            <Select placeholder="Chọn trạng thái chứng nhận">
              <Select.Option value="yes">Yes</Select.Option>
              <Select.Option value="no">No</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="FACTORY_CERT_STATUS" label="Nhà máy đã chứng nhận">
            <Input placeholder="Nhập tên nhà máy hoặc mô tả" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="FACTORY_LEVEL" label="Cấp độ ở nhà máy khác">
            <Select placeholder="Chọn cấp độ">
              <Select.Option value="level1">1</Select.Option>
              <Select.Option value="level2">2</Select.Option>
              <Select.Option value="level3">3</Select.Option>
              <Select.Option value="level4">4</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="PRICE_REQUEST" label="Yêu cầu báo cáo đánh giá">
            <Input placeholder="Nhập yêu cầu báo cáo đánh giá" />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item 
            name="REPORT_LINK" 
            label="Link gửi báo cáo đánh giá"
            extra="Khi điền link và lưu, trạng thái sẽ tự động chuyển sang 'Đang tổng hợp báo cáo'"
          >
            <Input placeholder="https://example.com/bao-cao" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Thời gian thực hiện</Divider>
      <Row
        gutter={16}
        style={{
          backgroundColor: '#f0f8ff',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <Col span={8}>
          <Form.Item name="COMPLETION_DEADLINE" label="Kỳ hạn hoàn thành">
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="8/2/2025"
              onChange={handleCompletionDeadlineChange}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item 
            name="ACTUAL_COMPLETION_DATE" 
            label="Ngày hoàn thành thực tế"
            extra="Khi điền ngày và lưu, trạng thái sẽ tự động chuyển sang 'Hoàn thành'"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item 
            name="PD5_REPORT_ACTUAL_DATE" 
            label="Ngày gửi báo cáo tới PD5 thực tế"
            extra="Khi điền ngày và lưu, trạng thái sẽ tự động chuyển sang 'HQ đang phê duyệt'"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
      </Row>

      <Row
        gutter={16}
        style={{
          backgroundColor: '#fff1f0',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <Col span={24}>
          <Form.Item name="NOTES_1" label="Ghi chú 1">
            <TextArea rows={4} />
          </Form.Item>
        </Col>
      </Row>

      {/* Buttons Section */}
      <Row justify="space-between" style={{ marginTop: '24px' }}>
        <Col>
          <Button type="default" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Col>
        
        <Col>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu tiến độ
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ProgressTab;