import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Row, Col } from 'antd';
import { createUlMaterial, updateUlMaterial } from '../../utils/ul-material-api';
import { toast } from 'sonner';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const CreateUlMaterialModal = ({ visible, onCancel, onSuccess, editingRecord, mode = 'create', options = {} }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && mode === 'edit' && editingRecord) {
      form.setFieldsValue({
        supplier: editingRecord.supplier,
        manufaturing: editingRecord.manufaturing,
        material_name: editingRecord.material_name,
        pp: editingRecord.pp,
        type: editingRecord.type,
        structure: editingRecord.structure,
        layer: editingRecord.layer,
        reliability_level_id: editingRecord.reliability_level_id,
        product_code: editingRecord.product_code,
        customer_name: editingRecord.customer_name,
        department: editingRecord.department,
        handler: editingRecord.handler,
        start_date: editingRecord.start_date ? dayjs(editingRecord.start_date) : null,
        proposed_deadline: editingRecord.proposed_deadline ? dayjs(editingRecord.proposed_deadline) : null,
        summary_day: editingRecord.summary_day ? dayjs(editingRecord.summary_day) : null,
        real_date: editingRecord.real_date ? dayjs(editingRecord.real_date) : null,
        deadline: editingRecord.deadline ? dayjs(editingRecord.deadline) : null,
        mass_day: editingRecord.mass_day,
        mass_product: editingRecord.mass_product,
        confirm: editingRecord.confirm,
        confirm_name: editingRecord.confirm_name,
        other_level: editingRecord.other_level,
        request_report: editingRecord.request_report,
        certification_date: editingRecord.certification_date ? dayjs(editingRecord.certification_date) : null,
        note: editingRecord.note
      });
    } else if (visible && mode === 'create') {
      form.resetFields();
    }
  }, [visible, mode, editingRecord, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Convert date fields to string format
      const formattedValues = {
        ...values,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        proposed_deadline: values.proposed_deadline ? values.proposed_deadline.format('YYYY-MM-DD') : null,
        summary_day: values.summary_day ? values.summary_day.format('YYYY-MM-DD') : null,
        real_date: values.real_date ? values.real_date.format('YYYY-MM-DD') : null,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
        certification_date: values.certification_date ? values.certification_date.format('YYYY-MM-DD') : null,
      };

      if (mode === 'create') {
        await createUlMaterial(formattedValues);
        toast.success('Thêm mới thành công');
      } else {
        await updateUlMaterial(editingRecord.id, formattedValues);
        toast.success('Cập nhật thành công');
      }

      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(mode === 'create' ? 'Lỗi khi thêm mới' : 'Lỗi khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={mode === 'create' ? 'Thêm mới UL Material' : 'Chỉnh sửa UL Material'}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {mode === 'create' ? 'Thêm mới' : 'Cập nhật'}
        </Button>
      ]}
      width={1200}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'CCL',
          level_no: 5,
          confirm: 'No'
        }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="supplier"
              label="Nhà cung cấp"
              rules={[{ required: true, message: 'Vui lòng nhập nhà cung cấp' }]}
            >
              <Input placeholder="Nhập nhà cung cấp" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="manufaturing"
              label="Nhà máy sản xuất"
              rules={[{ required: true, message: 'Vui lòng nhập nhà máy sản xuất' }]}
            >
              <Input placeholder="Nhập nhà máy sản xuất" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="material_name"
              label="Tên vật liệu"
              rules={[{ required: true, message: 'Vui lòng nhập tên vật liệu' }]}
            >
              <Input placeholder="Nhập tên vật liệu" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="pp"
              label="PP tương ứng"
            >
              <Input placeholder="Nhập PP tương ứng" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="type"
              label="Loại vật liệu"
              rules={[{ required: true, message: 'Vui lòng chọn loại vật liệu' }]}
            >
              <Select placeholder="Chọn loại vật liệu">
                <Option value="CCL">CCL</Option>
                <Option value="PP">PP</Option>
                <Option value="Resin">Resin</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="structure"
              label="Cấu trúc"
            >
              <Input placeholder="Nhập cấu trúc" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="layer"
              label="Cấu tạo lớp"
            >
              <Input placeholder="Nhập cấu tạo lớp" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="reliability_level_id"
              label="Mức độ tin cậy"
              rules={[{ required: true, message: 'Vui lòng chọn mức độ tin cậy' }]}
            >
              <Select placeholder="Chọn mức độ tin cậy">
                {options?.reliabilityLevel?.map(level => (
                  <Option key={level.id} value={level.id}>
                    {level.nameVi} ({level.nameJp})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="product_code"
              label="Mã hàng"
            >
              <Input placeholder="Nhập mã hàng" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="customer_name"
              label="Tên khách hàng"
            >
              <Input placeholder="Nhập tên khách hàng" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="department"
              label="Bộ phận"
            >
              <Input placeholder="Nhập bộ phận" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="handler"
              label="Người phụ trách"
              rules={[{ required: true, message: 'Vui lòng nhập người phụ trách' }]}
            >
              <Input placeholder="Nhập người phụ trách" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="start_date"
              label="Ngày bắt đầu"
            >
              <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày bắt đầu" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="proposed_deadline"
              label="Kì hạn dự kiến gửi báo cáo tới PD5"
            >
              <DatePicker style={{ width: '100%' }} placeholder="Chọn kì hạn dự kiến" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="summary_day"
              label="Ngày bắt đầu tổng hợp báo cáo"
            >
              <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày tổng hợp" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="real_date"
              label="Ngày gửi tổng Thực tế"
            >
              <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày gửi thực tế" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="deadline"
              label="Kì hạn"
            >
              <DatePicker style={{ width: '100%' }} placeholder="Chọn kì hạn" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="mass_day"
              label="Ngày hàng loạt"
            >
              <Input placeholder="Nhập ngày hàng loạt" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="mass_product"
              label="Sản lượng hàng loạt"
            >
              <Input placeholder="Nhập sản lượng hàng loạt" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="confirm"
              label="Chứng nhận ở nhà máy khác"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái chứng nhận' }]}
            >
              <Select placeholder="Chọn trạng thái chứng nhận">
                <Option value="Yes">Yes</Option>
                <Option value="No">No</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="confirm_name"
              label="Nhà máy đã chứng nhận"
            >
              <Input placeholder="Nhập nhà máy đã chứng nhận" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="other_level"
              label="Cấp độ ở nhà máy khác"
            >
              <InputNumber min={1} max={10} placeholder="Nhập cấp độ" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="request_report"
              label="Yêu cầu báo cáo đánh giá"
            >
              <Input placeholder="Nhập yêu cầu báo cáo" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="certification_date"
              label="Ngày CN"
            >
              <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày chứng nhận" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="note"
              label="Ghi chú"
            >
              <TextArea rows={3} placeholder="Nhập ghi chú" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateUlMaterialModal;
