import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber, Tabs, Alert } from 'antd';
import moment from 'moment';
import { toast } from 'sonner';

const { Option } = Select;
const { TabPane } = Tabs;

const MaterialNewModal = ({ open, onCancel, onSubmit, editingRecord }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (open) {
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
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: 'Pending',
          is_hf: 'FALSE'
        });
      }
    }
  }, [open, editingRecord, form]); const handleSubmit = async () => {
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
      title={editingRecord ? 'Sửa Material New' : 'Thêm Material New'}
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
      >

        <Tabs defaultActiveKey="1">
          {editingRecord && (
            <TabPane tab="1. Thông tin yêu cầu" key="1">
              <Alert
                message="Thông tin yêu cầu"
                description="Thông tin người yêu cầu và trạng thái xử lý"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <Form.Item
                  name="request_date"
                  label="Ngày yêu cầu"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày yêu cầu' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                  <Select>
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
              </div>
            </TabPane>
          )},

          <TabPane tab="2. Thông số kỹ thuật" key="2">
            <Alert
              message="Thông số kỹ thuật"
              description="Các thông số kỹ thuật cơ bản của vật liệu"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <Form.Item
                name="vendor"
                label="Vendor"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="family"
                label="Family"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="glass_style"
                label="GLASS_STYLE"
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="resin_percentage"
                label="RESIN_PERCENTAGE"
                rules={[{ required: true, message: 'Nhập 1 hoặc nhiều giá trị, cách nhau bởi dấu phẩy' }]}
              >
                <Input placeholder="Ví dụ: 72,73,74" />
              </Form.Item>
              <Form.Item
                name="preference_class"
                label="PREFERENCE CLASS"
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="use_type"
                label="USE Type"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="pp_type"
                label="PP Type"
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
                name="dk_01g"
                label="DK @ 0.1GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_01g"
                label="DF @ 0.1GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="is_hf"
                label="IS_HF"
              >
                <Select>
                  <Option value="TRUE">Có</Option>
                  <Option value="FALSE">Không</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="data_source"
                label="Nguồn dữ liệu"
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item
                name="filename"
                label="Tên file"
              >
                <Input />
              </Form.Item>
            </div>
          </TabPane>

        </Tabs>
      </Form>
    </Modal>
  );
};

export default MaterialNewModal;
