import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber } from 'antd';
import moment from 'moment';
import { toast } from 'sonner';

const { Option } = Select;

const MaterialCoreModal = ({ open, onCancel, onSubmit, editingRecord }) => {
  const [form] = Form.useForm();
  useEffect(() => {    if (open) {
      if (editingRecord) {
        const formattedRecord = Object.keys(editingRecord).reduce((acc, key) => {
          if (key.toUpperCase() === 'ID') {
            acc.id = editingRecord[key];
          }
          acc[key.toLowerCase()] = editingRecord[key];
          return acc;
        }, {});
        form.setFieldsValue({
          ...formattedRecord,
          request_date: formattedRecord.request_date ? moment(formattedRecord.request_date) : null,
          complete_date: formattedRecord.complete_date ? moment(formattedRecord.complete_date) : null,         
          top_foil_cu_weight: formattedRecord.top_foil_cu_weight || null
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: 'Pending',
          is_hf: 'FALSE'
        });
      }
    }
  }, [open, editingRecord, form]);const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.request_date) {
        values.request_date = values.request_date.toDate().toISOString();
      }
      if (values.complete_date) {
        values.complete_date = values.complete_date.toDate().toISOString();
      }      
      if (editingRecord) {
        const recordId = editingRecord.ID || editingRecord.id;
        if (!recordId) {
          throw new Error('Không tìm thấy ID bản ghi');
        }
        values.id = recordId;
      }

      await onSubmit(values);
      
      if (editingRecord) {
        toast.success('Cập nhật thành công!');
      } else {
        toast.success('Thêm mới thành công!');
        form.resetFields(); 
      }

    } catch (error) {
      console.error('Validation failed:', error);
      toast.error('Có lỗi xảy ra: ' + (error.message || 'Vui lòng kiểm tra lại dữ liệu'));
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
        </Form.Item>        <Form.Item
          name="top_foil_cu_weight"
          label="Top Foil Cu Weight"
          rules={[{ required: true, message: editingRecord ? 'Vui lòng chọn một giá trị' : 'Vui lòng chọn ít nhất một giá trị' }]}
        >
          <Select
            mode={editingRecord ? undefined : "multiple"}
            placeholder={editingRecord ? "Chọn một giá trị" : "Chọn một hoặc nhiều giá trị"}
            style={{ width: '100%' }}
            onChange={(value) => {
              form.setFieldsValue({
                top_foil_cu_weight: editingRecord ? value : (Array.isArray(value) ? value : [value])
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
        <div style={{ gridColumn: 'span 3', marginTop: '20px', marginBottom: '10px' }}>
          <h3>Thông số DK/DF theo tần số</h3>
        </div>

        <Form.Item name="dk_0_001ghz" label="DK @ 0.001GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_0_001ghz" label="DF @ 0.001GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <div />
        <Form.Item name="dk_0_01ghz" label="DK @ 0.01GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_0_01ghz" label="DF @ 0.01GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <div />
        <Form.Item name="dk_0_02ghz" label="DK @ 0.02GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_0_02ghz" label="DF @ 0.02GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <div /> 
        <Form.Item name="dk_2ghz" label="DK @ 2GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_2ghz" label="DF @ 2GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <div /> 
        <Form.Item name="dk_2_45ghz" label="DK @ 2.45GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_2_45ghz" label="DF @ 2.45GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <div /> 
        <Form.Item name="dk_3ghz" label="DK @ 3GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_3ghz" label="DF @ 3GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <div /> 
        <Form.Item name="dk_5ghz" label="DK @ 5GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_5ghz" label="DF @ 5GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <div /> 

        <Form.Item name="dk_5ghz_2" label="DK @ 5GHz (2nd)">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_5ghz_2" label="DF @ 5GHz (2nd)">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <div /> 
        <Form.Item name="dk_8ghz" label="DK @ 8GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_8ghz" label="DF @ 8GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <div /> 
        <Form.Item name="dk_10ghz" label="DK @ 10GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_10ghz" label="DF @ 10GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <div /> 
        <Form.Item name="dk_15ghz" label="DK @ 15GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_15ghz" label="DF @ 15GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <div /> 
        <Form.Item name="dk_16ghz" label="DK @ 16GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_16ghz" label="DF @ 16GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <div /> 
        <Form.Item name="dk_20ghz" label="DK @ 20GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
        <Form.Item name="df_20ghz" label="DF @ 20GHz">
          <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MaterialCoreModal;
