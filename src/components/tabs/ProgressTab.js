import { Form, Input, DatePicker, Select, Button, Row, Col, Divider, Alert, Space, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { TextArea } = Input;

const ProgressTab = ({ 
  form, 
  onFinish, 
  loading, 
  options,
  currentProgressId,
  onApprovalSuccess,
  personAcceptQL2 
}) => {
  const navigate = useNavigate();
  const [canApprove, setCanApprove] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false);
  
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

  const checkRequiredFields = () => {
    const values = form.getFieldsValue([
      'FACTORY_CERT_READY',
      'FACTORY_CERT_STATUS',
      'FACTORY_LEVEL',
      'PRICE_REQUEST',
      'COMPLETION_DEADLINE'
    ]);

    const allFilled = values.FACTORY_CERT_READY && 
                      values.FACTORY_CERT_STATUS && 
                      values.FACTORY_LEVEL && 
                      values.PRICE_REQUEST && 
                      values.COMPLETION_DEADLINE;
    
    setCanApprove(!!allFilled);
  };

  // Reset saved status when form values change
  const handleFormChange = () => {
    setIsDataSaved(false);
    checkRequiredFields();
  };

  // Handle form save
  const handleFormSave = async () => {
    try {
      await form.validateFields();
      await onFinish(form.getFieldsValue());
      setIsDataSaved(true);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  useEffect(() => {
    checkRequiredFields();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const showTKSXApproval = currentProgressId === 1; 
  const showQL2Approval = currentProgressId === 2; 

  const currentProgressName = options.progress?.find(
    p => p.status_id === currentProgressId
  )?.status_name || '';

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{}}
      onValuesChange={handleFormChange}
    >
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
          
          {!canApprove && showQL2Approval && (
            <Alert
              message="Chưa thể phê duyệt"
              description="Vui lòng điền đầy đủ các trường: Chứng nhận ở nhà máy khác, Nhà máy đã chứng nhận, Cấp độ ở nhà máy khác, Yêu cầu báo cáo đánh giá, và Kỳ hạn hoàn thành trước khi phê duyệt."
              type="warning"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {showQL2Approval && !isDataSaved && (
            <Alert
              message="⚠️ Chưa lưu dữ liệu"
              description="Bạn phải lưu tiến độ trước khi có thể phê duyệt. Vui lòng click nút 'Lưu tiến độ' ở dưới cùng."
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}
          
          <Row justify="center">
            <Space size="large">
              {showQL2Approval && (
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={() => onApprovalSuccess && onApprovalSuccess('ql2')}
                  disabled={!canApprove || !isDataSaved}
                  title={!isDataSaved ? 'Vui lòng lưu tiến độ trước khi phê duyệt' : ''}
                  style={{ 
                    backgroundColor: (canApprove && isDataSaved) ? '#1890ff' : undefined, 
                    borderColor: (canApprove && isDataSaved) ? '#1890ff' : undefined,
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

      {(personAcceptQL2) && (
        <div style={{ marginBottom: '24px' }}>
          {personAcceptQL2 && (
            <Alert
              message="QL2-(PD5) đã phê duyệt"
              description={`Người phê duyệt: ${personAcceptQL2}`}
              type="success"
              showIcon
            />
          )}
        </div>
      )}
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
          <Col span={24}>
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
              <Input />
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
          <Form.Item 
            name="FACTORY_CERT_READY" 
            label={<span>Chứng nhận ở nhà máy khác <span style={{color: 'red'}}>*</span></span>}
          >
            <Select placeholder="Chọn trạng thái chứng nhận">
              <Select.Option value="yes">Yes</Select.Option>
              <Select.Option value="no">No</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item 
            name="FACTORY_CERT_STATUS" 
            label={<span>Nhà máy đã chứng nhận <span style={{color: 'red'}}>*</span></span>}
          >
            <Input placeholder="Nhập tên nhà máy hoặc mô tả" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item 
            name="FACTORY_LEVEL" 
            label={<span>Cấp độ ở nhà máy khác <span style={{color: 'red'}}>*</span></span>}
          >
            <Select placeholder="Chọn cấp độ">
              <Select.Option value="level1">1</Select.Option>
              <Select.Option value="level2">2</Select.Option>
              <Select.Option value="level3">3</Select.Option>
              <Select.Option value="level4">4</Select.Option>
              <Select.Option value="level5">5</Select.Option>
              <Select.Option value="level6">6</Select.Option>
              <Select.Option value="-">-</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item 
            name="PRICE_REQUEST" 
            label={<span>Yêu cầu báo cáo đánh giá <span style={{color: 'red'}}>*</span></span>}
          >
            <Select placeholder="Chọn cấp độ">
              <Select.Option value="Gia công">Gia công</Select.Option>
              <Select.Option value="Tin cậy">Tin cậy</Select.Option>
              <Select.Option value="Gia công & Tin cậy">Gia công & Tin cậy</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item 
            name="REPORT_LINK" 
            label="Link gửi báo cáo đánh giá"
            extra="Khi điền link và lưu, sẽ tự động cập nhật 'Ngày gửi báo cáo tới PD5 thực tế'"
          >
            <TextArea rows={1} placeholder="https://example.com/bao-cao" />
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
        <Col span={24}>
          <Form.Item 
            name="LINK_RAKRAK_DOCUMENT" 
            label="Link RakRak Document (Kết quả chứng nhận)"
            extra="Khi điền link và lưu, sẽ tự động cập nhật 'Ngày hoàn thành thực tế'"
          >
            <TextArea rows={1} placeholder="https://example.com/bao-cao" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="COMPLETION_DEADLINE" label={<span>Kỳ hạn hoàn thành <span style={{color: 'red'}}>*</span></span>}>
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
            extra="Tự động cập nhật khi điền Link gửi báo cáo đánh giá"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item 
            name="DATE_PD5_HQ" 
            label="Ngày PD5 gửi tổng"
            extra="Khi điền ngày và lưu, trạng thái sẽ tự động chuyển sang 'HQ đang phê duyệt'"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item 
            name="DATE_PD5_GET_REPORT" 
            label="Ngày PD5 tổng hợp báo cáo"
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
          <Button 
        type="primary" 
        loading={loading}
        onClick={handleFormSave}  
      >
        Lưu tiến độ
      </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ProgressTab;