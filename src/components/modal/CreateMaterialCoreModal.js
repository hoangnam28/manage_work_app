import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber } from 'antd';
import moment from 'moment';

const { Option } = Select;

const MaterialCoreModal = ({ open, onCancel, onSubmit, editingRecord }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        request_date: editingRecord.request_date ? moment(editingRecord.request_date) : null,
        complete_date: editingRecord.complete_date ? moment(editingRecord.complete_date) : null,
      });
    } else {
      form.resetFields();
    }
  }, [open, editingRecord, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.request_date) {
        values.request_date = values.request_date.format('YYYY-MM-DD');
      }
      if (values.complete_date) {
        values.complete_date = values.complete_date.format('YYYY-MM-DD');
      }
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };
  return (
    <Modal
      title={editingRecord ? 'Sửa Material Core' : 'Thêm Material Core'} 
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={1200}
      style={{
        top: 20
      }}
      bodyStyle={{
        height: 'calc(100vh - 200px)',
        overflow: 'auto'
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'Pending',
          is_hf: 'FALSE'
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px', 
          padding: '20px'
        }}
      >
        <Form.Item
          name="requester_name"
          label="Người yêu cầu"
          rules={[{ required: true, message: 'Vui lòng nhập người yêu cầu' }]}
        >
          <Input style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="request_date"
          label="Ngày yêu cầu"
          rules={[{ required: true, message: 'Vui lòng chọn ngày yêu cầu' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="handler"
          label="Người xử lý"
        >
          <Input style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select style={{ width: '100%' }}>
            <Option value="Pending">Pending</Option>
            <Option value="Approve">Approve</Option>
            <Option value="Cancel">Cancel</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="complete_date"
          label="Ngày hoàn thành"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="vendor"
          label="Vendor"
        >
          <Input style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="family"
          label="Family"
        >
          <Input style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="prepreg_count"
          label="PREPREG Count"
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="nominal_thickness"
          label="Nominal Thickness"
        >
          <InputNumber style={{ width: '100%' }} step={0.001} />
        </Form.Item>

        <Form.Item
          name="spec_thickness"
          label="Spec Thickness"
        >
          <InputNumber style={{ width: '100%' }} step={0.001} />
        </Form.Item>

        <Form.Item
          name="preference_class"
          label="Preference Class"
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="use_type"
          label="USE Type"
        >
          <Input style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="top_foil_cu_weight"
          label="Top Foil Cu Weight"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một giá trị' }]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn một hoặc nhiều giá trị"
            style={{ width: '100%' }}
            onChange={(values) => {
              form.setFieldsValue({
                top_foil_cu_weight: values
              });
            }}
          >
            <Option value="L">L</Option>
            <Option value="H">H</Option>
            <Option value="1">1</Option>
            <Option value="2">2</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="bot_foil_cu_weight"
          label="Bottom Foil Cu Weight"
        >
          <Input style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="tg_min"
          label="Tg Min"
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="tg_max"
          label="Tg Max"
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="center_glass"
          label="Center Glass"
        >
          <Input style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="dk_01g"
          label="Dk @ 0.1GHz"
        >
          <InputNumber style={{ width: '100%' }} step={0.0001} />
        </Form.Item>
        <Form.Item
          name="df_01g"
          label="Df @ 0.1GHz"
        >
          <InputNumber style={{ width: '100%' }} step={0.0001} />
        </Form.Item>
        <Form.Item
          name="is_hf"
          label="High Frequency"
        >
          <Select style={{ width: '100%' }}>
            <Option value="TRUE">Có</Option>
            <Option value="FALSE">Không</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="data_source"
          label="Nguồn dữ liệu"
          style={{ gridColumn: 'span 2' }}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="filename"
          label="Tên file"
        >
          <Input style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MaterialCoreModal;
