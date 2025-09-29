import { Modal, Input, Form } from 'antd';

const { TextArea } = Input;

const ReasonModal = ({ 
  open, 
  onCancel, 
  onConfirm, 
  title = 'Nhập lý do',
  placeholder = 'Vui lòng nhập lý do...',
  loading = false 
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onConfirm(values.reason);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Xác nhận"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label="Lý do"
          rules={[
            { required: true, message: 'Vui lòng nhập lý do!' },
            { min: 5, message: 'Lý do phải có ít nhất 5 ký tự!' }
          ]}
        >
          <TextArea
            placeholder={placeholder}
            rows={4}
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReasonModal;