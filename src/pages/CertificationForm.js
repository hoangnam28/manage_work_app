import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, DatePicker, Select, Button, Row, Col, Typography, Divider } from 'antd';
import moment from 'moment';
import MainLayout from '../components/layout/MainLayout';

const { Title } = Typography;
const { TextArea } = Input;

const CertificationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const certificationData = location.state?.certificationData;

  // Set initial form values if data exists
  React.useEffect(() => {
    if (certificationData) {
      form.setFieldsValue({
        ...certificationData,
        RELEASE_DATE: certificationData.RELEASE_DATE ? moment(certificationData.RELEASE_DATE) : null,
        MASS_PRODUCTION_DATE: certificationData.MASS_PRODUCTION_DATE ? moment(certificationData.MASS_PRODUCTION_DATE) : null,
        MATERIAL_CERT_EXPECTED: certificationData.MATERIAL_CERT_EXPECTED ? moment(certificationData.MATERIAL_CERT_EXPECTED) : null,
      });
    }
  }, [certificationData, form]);

  const onFinish = (values) => {
    console.log('Form values:', values);
    // Add API call to save data here
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
          Biểu yêu cầu chứng nhận vật liệu
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{}}
          style={{ background: 'white', padding: '24px', borderRadius: '8px' }}
        >
          <Divider orientation="left">Thông tin yêu cầu</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="RELEASE_DATE"
                label="Ngày phát hành"
                rules={[{ required: true, message: 'Vui lòng chọn ngày phát hành' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="FACTORY_NAME"
                label="Nhà máy yêu cầu"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="REQUEST_REASON"
                label="Lý do yêu cầu"
              >
                <TextArea rows={1} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Thông tin vật liệu</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="LAYER_STRUCTURE"
                label="Cấu tạo lớp"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="USAGE"
                label="Ứng dụng"
              >
                <TextArea rows={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="RELIABILITY_LEVEL"
                label="Mức độ tin cậy"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="EXPECTED_PRODUCTION_QTY"
                label="Sản lượng dự kiến"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="MASS_PRODUCTION_DATE"
                label="Ngày dự kiến hàng loạt"
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="MATERIAL_CERT_EXPECTED"
                label="Ngày mong muốn nhận chứng nhận"
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Thông tin nhà sản xuất</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="MANUFACTURER_NAME"
                label="Tên nhà sản xuất"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="FACTORY_LOCATION"
                label="Nhà máy sản xuất"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="MATERIAL_NAME"
                label="Tên vật liệu"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="MATERIAL_CLASS"
                label="Phân loại vật liệu"
              >
                <Select>
                  <Select.Option value="type1">Loại 1</Select.Option>
                  <Select.Option value="type2">Loại 2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="MATERIAL_STATUS"
                label="Trạng thái vật liệu"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="MATERIAL_PROPERTY1"
                label="Thuộc tính 1"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="MATERIAL_PROPERTY2"
                label="Thuộc tính 2"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="MATERIAL_PROPERTY3"
                label="Thuộc tính 3"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Ghi chú</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="NOTES_1"
                label="Ghi chú 1"
              >
                <TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="NOTES_2"
                label="Ghi chú 2"
              >
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end" style={{ marginTop: '24px' }}>
            <Button type="default" onClick={() => navigate(-1)} style={{ marginRight: '8px' }}>
              Quay lại
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu thay đổi
            </Button>
          </Row>
        </Form>
      </div>
    </MainLayout>
  );
};

export default CertificationForm;