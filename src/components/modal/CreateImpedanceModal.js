import React from 'react';
import { Modal, Form, Input } from 'antd';

const CreateImpedanceModal = ({ visible, onCancel, onCreate }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        onCreate(values); // Gửi dữ liệu lên server
        form.resetFields(); // Reset form sau khi gửi
      })
      .catch((info) => {
        console.error('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title="Thêm mới Impedance"
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Tạo mới"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="imp_1"
          label="Imp 1"
          rules={[{ required: true, message: 'Vui lòng nhập giá trị Imp 1!' }]}
        >
          <Input placeholder="Nhập giá trị (số hoặc chữ)" />
        </Form.Item>
        <Form.Item
          name="imp_2"
          label="Imp 2"
          rules={[{ required: true, message: 'Vui lòng nhập giá trị Imp 2!' }]}
        >
          <Input placeholder="Nhập giá trị (số hoặc chữ)" />
        </Form.Item>
        <Form.Item
          name="imp_3"
          label="Imp 3"
          rules={[{ required: true, message: 'Vui lòng nhập giá trị Imp 3!' }]}
        >
          <Input placeholder="Nhập giá trị (số hoặc chữ)" />
        </Form.Item>
        <Form.Item
          name="imp_4"
          label="Imp 4"
          rules={[{ required: true, message: 'Vui lòng nhập giá trị Imp 4!' }]}
        >
          <Input placeholder="Nhập giá trị (số hoặc chữ)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateImpedanceModal;