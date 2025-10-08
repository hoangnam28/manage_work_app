import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Row, Col } from 'antd';
import moment from 'moment';
import { toast } from 'sonner';

const { TextArea } = Input;
const { Option } = Select;

const TimeTrackingModal = ({ open, onCancel, onSubmit, editingRecord, mode, certificationId, assignee }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && editingRecord) {
        form.setFieldsValue({
          personCheck: editingRecord.PERSON_CHECK,
          startTime: editingRecord.START_TIME ? moment(editingRecord.START_TIME) : null,
          timeCheck: editingRecord.TIME_CHECK,
          workDescription: editingRecord.WORK_DESCRIPTION,
          status: editingRecord.STATUS || 'PENDING'
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: 'PENDING'
        });
      }
    }
  }, [open, mode, editingRecord, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const userDataStr = localStorage.getItem('userInfo');
      let personDo = 'Unknown User';

      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          personDo = userData.username || userData.userId || 'Unknown User';
        } catch (parseError) {
          console.error('Error parsing userData:', parseError);
          toast.warning('Không thể lấy thông tin người dùng, sử dụng giá trị mặc định');
        }
      } else {
        toast.warning('Không tìm thấy thông tin người dùng trong localStorage');
      }

      const formattedValues = {
        ...values,
        certificationId: certificationId,
        personDo: personDo, // Sử dụng username từ localStorage
        startTime: values.startTime ? values.startTime.format('YYYY-MM-DD HH:mm:ss') : null,
        timeCheck: values.timeCheck || null
      };

      await onSubmit(formattedValues);
      toast.success(mode === 'edit' ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      form.resetFields();
      onCancel();
    } catch (error) {
      if (error.errorFields) {
        toast.error('Vui lòng điền đầy đủ thông tin!');
      } else {
        toast.error('Có lỗi xảy ra: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const modalTitle = mode === 'edit' ? 'Chỉnh sửa thời gian thao tác' : 'Thêm thời gian thao tác';

  return (
    <Modal
      title={modalTitle}
      open={open}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      width={800}
      okText={mode === 'edit' ? 'Cập nhật' : 'Thêm mới'}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 'PENDING' }}
      >

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="startTime"
              label="Thời gian bắt đầu"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
            >
              <DatePicker
                showTime={{
                  format: 'HH:mm:ss',
                  showSecond: true,
                }}
                format="DD/MM/YYYY HH:mm:ss"
                style={{ width: '100%' }}
                placeholder="Chọn thời gian bắt đầu"
                disabledDate={(current) => {
                  // Không cho phép chọn ngày quá khứ và ngày tương lai xa hơn 1 năm
                  return current && (current < moment().startOf('day') || current > moment().add(1, 'year'));
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="personCheck"
              label="Người kiểm tra"
            >
              <Input placeholder="Nhập tên người kiểm tra" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="timeCheck"
              label="Thời gian kiểm tra (phút)"
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Nhập số phút"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Bỏ hẳn Row chứa timeDo và endTime */}

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="PENDING">Đang thực hiện</Option>
            <Option value="COMPLETED">Hoàn thành</Option>
            <Option value="PAUSED">Tạm dừng</Option>
            <Option value="CANCELLED">Hủy</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="workDescription"
          label="Mô tả công việc"
        >
          <TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết công việc đã thực hiện..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TimeTrackingModal;