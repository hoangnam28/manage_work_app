import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber, Tabs, Alert } from 'antd';
import moment from 'moment';
import { toast } from 'sonner';
import { CopyOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;

const MaterialPPModal = ({
  open,
  onCancel,
  onSubmit,
  editingRecord,
  cloneRecord = null,
  mode = 'create' }) => {

  const [form] = Form.useForm();
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && editingRecord) {
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
      } else if (mode === 'clone' && cloneRecord) {
        const formattedClone = Object.keys(cloneRecord).reduce((acc, key) => {
          if (key.toUpperCase() === 'ID') {
            acc.id = cloneRecord[key];
          }
          acc[key.toLowerCase()] = cloneRecord[key];
          return acc;
        }, {});
        form.setFieldsValue({
          ...formattedClone,
          name: '',
          request_date: moment(), 
          handler: '',
          complete_date: formattedClone.complete_date ? moment(formattedClone.complete_date) : null,
          status: 'Pending',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: 'Pending',
          is_hf: 'FALSE',
          request_date: moment(),
        });
      }
    }
  }, [open, editingRecord, cloneRecord, mode, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.request_date) {
        values.request_date = values.request_date.toDate().toISOString();
      }
      if (values.complete_date) {
        values.complete_date = values.complete_date.toDate().toISOString();
      }
      if (mode === 'edit' && editingRecord) {
        const recordId = editingRecord.ID || editingRecord.id;
        if (!recordId) {
          throw new Error('Không tìm thấy ID bản ghi');
        }
        values.id = recordId;
      }

      await onSubmit(values, mode);

      if (mode === 'edit') {
        toast.success('Cập nhật thành công!');
      } else if (mode === 'clone') {
        toast.success('Tạo bản sao thành công!');
      } else {
        toast.success('Thêm mới thành công!');
      }
      form.resetFields();
      onCancel();

    } catch (error) {
      console.error('Validation failed:', error);
      toast.error('Có lỗi xảy ra: ' + (error.message || 'Vui lòng kiểm tra lại dữ liệu'));
    }
  };
  const getModalTitle = () => {
    switch (mode) {
      case 'edit':
        return 'Sửa Material PP';
      case 'clone':
        return 'Tạo bản sao Material PP';
      default:
        return 'Thêm Material PP';
    }
  };
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {mode === 'clone' && <CopyOutlined />}
          {getModalTitle()}
        </div>
      }
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
      okText={mode === 'edit' ? 'Cập nhật' : (mode === 'clone' ? 'Tạo bản sao' : 'Thêm mới')}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'Pending',
          is_hf: 'FALSE'
        }}
      >

        <Tabs defaultActiveKey={mode === 'edit' ? "1" : "2"}>
          {(mode === 'edit' || mode === 'clone') && (
            <TabPane tab="1. Thông tin yêu cầu" key="1">
              <Alert
                message="Thông tin yêu cầu"
                description={
                  mode === 'clone'
                    ? "Thông tin người yêu cầu và trạng thái xử lý (đã được reset cho bản ghi mới)"
                    : "Thông tin người yêu cầu và trạng thái xử lý"
                }
                type={mode === 'clone' ? "warning" : "info"}
                showIcon
                style={{ marginBottom: 16 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <Form.Item
                  name="name"
                  label="Người yêu cầu"
                  rules={[{ required: true, message: 'Vui lòng nhập người yêu cầu' }]}

                >
                  <Input placeholder={mode === 'clone' ? "Nhập người yêu cầu mới" : ""} />
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
                  <Input placeholder={mode === 'clone' ? "Nhập người xử lý mới" : ""} />
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
              description={
                mode === 'clone'
                  ? "Các thông số kỹ thuật cơ bản của vật liệu (đã sao chép từ bản ghi gốc, bạn có thể chỉnh sửa)"
                  : "Các thông số kỹ thuật cơ bản của vật liệu"
              }
              type={mode === 'clone' ? "success" : "info"}
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <Form.Item
                name="vendor"
                label="Vendor"
                rules={[{ required: true, message: 'Vui lòng nhập Vendor' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="family"
                label="Family"
                rules={[{ required: true, message: 'Vui lòng nhập Family' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="glass_style"
                label="GLASS_STYLE"
                rules={[{ required: true, message: 'Vui lòng nhập GLASS_STYLE' }]}
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
                rules={[{ required: true, message: 'Vui lòng nhập PREFERENCE CLASS' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="use_type"
                label="USE Type"
                rules={[{ required: true, message: 'Vui lòng nhập USE Type' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="pp_type"
                label="PP Type"
                rules={[{ required: true, message: 'Vui lòng nhập PP Type' }]}
              >
                <Input style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="tg_min"
                label="Tg Min"
                rules={[{ required: true, message: 'Vui lòng nhập Tg Min' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="tg_max"
                label="Tg Max"
                rules={[{ required: true, message: 'Vui lòng nhập Tg Max' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="dk_01g"
                label="DK_01GHz"
                rules={[{ required: true, message: 'Vui lòng nhập DK_01GHz' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_01g"
                label="DF_01GHz"
                rules={[{ required: true, message: 'Vui lòng nhập DF_01GHz' }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="is_hf"
                label="IS_HF"
                rules={[{ required: true, message: 'Vui lòng chọn IS_HF' }]}
              >
                <Select>
                  <Option value="TRUE">Có</Option>
                  <Option value="FALSE">Không</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="data_source"
                label="Nguồn dữ liệu"
                rules={[{ required: true, message: 'Vui lòng nhập nguồn dữ liệu' }]}
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item
                name="filename"
                label="Tên file"
                rules={[{ required: true, message: 'Vui lòng nhập tên file' }]}
              >
                <Input />
              </Form.Item>
            </div>
          </TabPane>
 <TabPane tab="3. Thông số DK/DF" key="3">
            <Alert
              message="Thông số DK/DF theo tần số"
              description={
                mode === 'clone'
                  ? "Các giá trị DK/DF ở các mức tần số khác nhau (đã sao chép từ bản ghi gốc)"
                  : "Các giá trị DK/DF ở các mức tần số khác nhau"
              }
              type={mode === 'clone' ? "success" : "info"}
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              <Form.Item
                name="dk_0_001ghz"
                label="DK_0_001GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_0_001ghz"
                label="DF_0_001GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_0_01ghz"
                label="DK_0_01GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_0_01ghz"
                label="DF_0_01GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_0_02ghz"
                label="DK_0_02GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_0_02ghz"
                label="DF_0_02GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>

              <Form.Item
                name="dk_2ghz"
                label="DK_2GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_2ghz"
                label="DF_2GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_2_45ghz"
                label="DK_2_45GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_2_45ghz"
                label="DF_2_45GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_3ghz"
                label="DK_3GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_3ghz"
                label="DF_3GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_4ghz"
                label="DK_4GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_4ghz"
                label="DF_4GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>

              <Form.Item
                name="dk_5ghz"
                label="DK_5GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_5ghz"
                label="DF_5GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_6ghz"
                label="DK_6GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_6ghz"
                label="DF_6GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_7ghz"
                label="DK_7GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_7ghz"
                label="DF_7GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_8ghz"
                label="DK @ 8GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_8ghz"
                label="DF @ 8GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_9ghz"
                label="DK_9GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_9ghz"
                label="DF_9GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>

              <Form.Item
                name="dk_10ghz"
                label="DK_10GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_10ghz"
                label="DF_10GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_15ghz"
                label="DK_15GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_15ghz"
                label="DF_15GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_16ghz"
                label="DK_16GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_16ghz"
                label="DF_16GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>

              <Form.Item
                name="dk_20ghz"
                label="DK_20GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_20ghz"
                label="DF_20GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_25ghz"
                label="DK_25GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_25ghz"
                label="DF_25GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
            </div>
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default MaterialPPModal;
