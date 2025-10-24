import React from 'react';
import { Form, Input, DatePicker, Select, Button, Row, Col, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const ProgressTab = ({ 
  form, 
  onFinish, 
  loading, 
  options 
}) => {
  const navigate = useNavigate();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{}}
    >
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
              <Select placeholder="Chọn trạng thái tiến độ" allowClear>
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
              <Input placeholder="hung.nguyencong1" />
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
      <Row gutter={16} style={{ backgroundColor: '#e6f7ff', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
        <Col span={12}>
          <Form.Item name="START_DATE" label="Ngày bắt đầu">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="10/16/2024" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="PD5_REPORT_DEADLINE" label="Kì hạn gửi báo cáo tới PD5">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="7/2/2025" />
          </Form.Item>
        </Col>
      </Row>

      {/* Timeline Section */}
      <Divider orientation="left">Thời gian thực hiện</Divider>
      <Row gutter={16} style={{ backgroundColor: '#f0f8ff', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
        <Col span={8}>
          <Form.Item name="COMPLETION_DEADLINE" label="Ngày mong muốn nhận chứng nhận">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="8/2/2025" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="ACTUAL_COMPLETION_DATE" label="Ngày hoàn thành thực tế">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="PD5_REPORT_ACTUAL_DATE" label="Ngày gửi báo cáo tới PD5 thực tế">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16} style={{ backgroundColor: '#fff1f0', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
        <Col span={24}>
          <Form.Item name="NOTES_1" label="Ghi chú 1">
            <TextArea rows={4} />
          </Form.Item>
        </Col>
      </Row>

      <Row justify="end" style={{ marginTop: '24px' }}>
        <Button type="default" onClick={() => navigate(-1)} style={{ marginRight: '8px' }}>
          Quay lại
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Lưu tiến độ
        </Button>
      </Row>
    </Form>
  );
};

export default ProgressTab;