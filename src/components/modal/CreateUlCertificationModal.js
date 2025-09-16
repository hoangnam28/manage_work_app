import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  message,
  Space,
  Tabs,
} from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const CreateUlCertificationModal = ({
  open,
  onCancel,
  onSubmit,
  editingRecord,
  mode = 'create',
  options = {},
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        const formData = {
          ...editingRecord,
          releaseDate: editingRecord.RELEASE_DATE
            ? dayjs(editingRecord.RELEASE_DATE)
            : null,
          massProductionDate: editingRecord.MASS_PRODUCTION_DATE
            ? dayjs(editingRecord.MASS_PRODUCTION_DATE)
            : null,
          materialCertExpected: editingRecord.MATERIAL_CERT_EXPECTED
            ? dayjs(editingRecord.MATERIAL_CERT_EXPECTED)
            : null,
          MATERIAL_CLASS_ID: editingRecord.MATERIAL_CLASS_ID || editingRecord.materialClassId,
          RELIABILITY_LEVEL_ID: editingRecord.RELIABILITY_LEVEL_ID || editingRecord.reliabilityLevelId,
        };
        form.setFieldsValue(formData);
      } else {
        form.resetFields();
      }
    }
  }, [open, editingRecord, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        releaseDate: values.releaseDate
          ? values.releaseDate.format('YYYY-MM-DD')
          : null,
        massProductionDate: values.massProductionDate
          ? values.massProductionDate.format('YYYY-MM-DD')
          : null,
        materialCertExpected: values.materialCertExpected
          ? values.materialCertExpected.format('YYYY-MM-DD')
          : null,
        // Đảm bảo chỉ gửi một phiên bản của mỗi trường
        materialClassId: values.MATERIAL_CLASS_ID,
        reliabilityLevelId: values.RELIABILITY_LEVEL_ID,
      };

      const result = await onSubmit(submitData);

      if (result && result.success) {
        message.success(result.message || 'Thao tác thành công');
        onSuccess && onSuccess();
        onCancel();
      } else {
        message.error(result?.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>
            {isViewMode
              ? 'Xem chi tiết'
              : isEditMode
              ? 'Chỉnh sửa'
              : 'Thêm mới'}{' '}
            Material Certification
          </span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      width={1200}
      style={{ top: 20 }}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            {isViewMode && (
              <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                Chế độ xem - Không thể chỉnh sửa
              </span>
            )}
          </div>
          <Space>
            <Button onClick={handleCancel} icon={<CloseOutlined />}>
              {isViewMode ? 'Đóng' : 'Hủy'}
            </Button>
            {!isViewMode && (
              <Button
                type="primary"
                loading={loading}
                onClick={() => form.submit()}
                icon={<SaveOutlined />}
              >
                {isEditMode ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            )}
          </Space>
        </div>
      }
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isViewMode}
        scrollToFirstError
      >
        <Tabs defaultActiveKey="1">
          {/* Tab 1: Thông tin cơ bản */}
          <Tabs.TabPane tab="Lý do yêu cầu" key="1">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="releaseDate"
                  label="Ngày phát hành"
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày phát hành' },
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày phát hành"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="factoryName"
                  label="Tên nhà máy"
                  rules={[
                    {
                      max: 200,
                      message: 'Tên nhà máy không được vượt quá 200 ký tự',
                    },
                  ]}
                >
                  <Input placeholder="Nhập tên nhà máy" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="requestReason"
                  label="Lý do yêu cầu"
                  rules={[
                    {
                      max: 500,
                      message: 'Lý do yêu cầu không được vượt quá 500 ký tự',
                    },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Nhập lý do yêu cầu"
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* Tab 2: Thông tin sản xuất */}
          <Tabs.TabPane tab="Thông tin sản phẩm sử dụng" key="2">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="layerStructure"
                  label="Cấu tạo lớp"
                  rules={[
                    {
                      max: 50,
                      message: 'Cấu tạo lớp không được vượt quá 50 ký tự',
                    },
                  ]}
                >
                  <Input placeholder="Nhập cấu tạo lớp" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="RELIABILITY_LEVEL_ID"
                  label="Mức độ tin cậy"
                  rules={[
                    { required: true, message: 'Vui lòng chọn mức độ tin cậy' },
                  ]}
                >
                  <Select placeholder="Chọn mức độ tin cậy">
                    {options?.reliabilityLevel?.map((level) => (
                      <Option key={level.id} value={level.id}>
                        {level.nameVi} ({level.nameJp})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="usage"
                  label="Ứng dụng"
                  rules={[
                    {
                      max: 500,
                      message: 'Ứng dụng không được vượt quá 500 ký tự',
                    },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Nhập ứng dụng"
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expectedProductionQty"
                  label="Sản lượng dự kiến"
                  rules={[
                    {
                      max: 100,
                      message: 'Sản lượng dự kiến không được vượt quá 100 ký tự',
                    },
                  ]}
                >
                  <Input placeholder="Nhập sản lượng dự kiến" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="massProductionDate" label="Ngày sản xuất hàng loạt">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày sản xuất hàng loạt"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="materialCertExpected"
                  label="Ngày mong muốn nhận chứng nhận vật liệu"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày mong muốn nhận chứng nhận"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* Tab 4: Thông tin vật liệu */}
          <Tabs.TabPane tab="Thông tin vật liệu" key="3">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="manufacturerName"
                  label="Tên nhà sản xuất"
                  rules={[
                    {
                      max: 200,
                      message:
                        'Tên nhà sản xuất không được vượt quá 200 ký tự',
                    },
                  ]}
                >
                  <Input placeholder="Nhập tên nhà sản xuất" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="factoryLocation"
                  label="Nhà máy sản xuất"
                  rules={[
                    {
                      max: 200,
                      message: 'Nhà máy sản xuất không được vượt quá 200 ký tự',
                    },
                  ]}
                >
                  <Input placeholder="Nhập nhà máy sản xuất" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="materialName"
                  label="Tên vật liệu"
                  rules={[
                    {
                      max: 200,
                      message: 'Tên vật liệu không được vượt quá 200 ký tự',
                    },
                  ]}
                >
                  <Input placeholder="Nhập tên vật liệu" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="MATERIAL_CLASS_ID"
                  label="Phân loại vật liệu"
                >
                  <Select placeholder="Chọn phân loại vật liệu">
                    {options?.materialClass?.map(materialClassId => (
                      <Option key={materialClassId.id} value={materialClassId.id}>
                        {materialClassId.nameVi} ({materialClassId.nameJp})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              

              <Col span={8}>
                <Form.Item
                  name="materialProperty1Id"
                  label="属性1 - Thuộc tính 1"
                >
                  <Select placeholder="Chọn Thuộc tính 1" allowClear showSearch>
                    {options.materialProperty1?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.nameVi} ({item.nameJp})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="materialProperty2Id"
                  label="属性2 - Thuộc tính 2"
                >
                  <Select placeholder="Chọn Thuộc tính 2" allowClear showSearch>
                    {options.materialProperty2?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.nameVi} ({item.nameJp})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="materialProperty3Id"
                  label="属性3 - Thuộc tính 3"
                >
                  <Select placeholder="Chọn Thuộc tính 3" allowClear showSearch>
                    {options.materialProperty3?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.nameVi} ({item.nameJp})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="materialStatusId" label="Trạng thái vật liệu">
                  <Select placeholder="Chọn trạng thái vật liệu" allowClear showSearch>
                    {options.materialStatus?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.nameVi} ({item.nameJp})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="ulStatusId" label="Trạng thái UL">
                  <Select placeholder="Chọn trạng thái UL" allowClear showSearch>
                    {options.ulStatus?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.nameVi} ({item.nameJp})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* Tab 5: Ghi chú */}
          <Tabs.TabPane tab="Ghi chú" key="4">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="notes1"
                  label="Ghi chú 1"
                  rules={[
                    {
                      max: 1000,
                      message: 'Ghi chú 1 không được vượt quá 1000 ký tự',
                    },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Nhập ghi chú 1"
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="notes2"
                  label="Ghi chú 2"
                  rules={[
                    {
                      max: 1000,
                      message: 'Ghi chú 2 không được vượt quá 1000 ký tự',
                    },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Nhập ghi chú 2"
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default CreateUlCertificationModal;
