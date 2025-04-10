import React, { useEffect } from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';

const UpdateDocumentModal = ({ visible, onCancel, onOk, record }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        ma: record.MA,
        khach_hang: record.KHACH_HANG,
        doi_tuong: record.DOI_TUONG,
        ma_tai_lieu: record.MA_TAI_LIEU,
        rev: record.REV,
        cong_venh: record.CONG_VENH,
        v_cut: record.V_CUT,
        xu_ly_be_mat: record.XU_LY_BE_MAT,
        ghi_chu: record.GHI_CHU,
      });
    }
  }, [visible, record, form]);

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        onOk(values);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title="Cập nhật thông tin"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={800} // Tăng chiều rộng modal
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ma: record?.MA,
          khach_hang: record?.KHACH_HANG,
          doi_tuong: record?.DOI_TUONG,
          ma_tai_lieu: record?.MA_TAI_LIEU,
          rev: record?.REV,
          cong_venh: record?.CONG_VENH,
          v_cut: record?.V_CUT,
          xu_ly_be_mat: record?.XU_LY_BE_MAT,
          ghi_chu: record?.GHI_CHU,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ma"
              label="Đầu mã"
              rules={[{ required: true, message: 'Vui lòng nhập Đầu mã!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="khach_hang"
              label="Khách hàng"
              rules={[{ required: true, message: 'Vui lòng nhập Khách hàng!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="doi_tuong"
              label="Đối Tượng"
              rules={[{ required: true, message: 'Vui lòng nhập Đối Tượng!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ma_tai_lieu"
              label="Mã tài liệu khách hàng"
              rules={[{ required: true, message: 'Vui lòng nhập Mã tài liệu khách hàng!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="rev"
              label="Rev."
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="cong_venh"
              label="Cong vênh"
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="v_cut"
              label="V-Cut"
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="xu_ly_be_mat"
              label="Xử lý bề mặt"
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="ghi_chu"
              label="Ghi chú"
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default UpdateDocumentModal;