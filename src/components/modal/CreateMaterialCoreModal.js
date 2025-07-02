import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber, Tabs, Alert } from 'antd';
import moment from 'moment';
import { toast} from 'sonner';

const { Option } = Select;
const { TabPane } = Tabs;

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
      >
        
          <Tabs defaultActiveKey="1">
            { editingRecord && (
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
                name="requester_name"
                label="Người yêu cầu"
                rules={[{ required: true, message: 'Vui lòng nhập người yêu cầu' }]}
              >
                <Input />
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
                <Input />
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
                rules={[{required: true, message:"Vui lòng nhập Vendor"}]}
                
              >
                <Input
                placeholder={ "Nhập một vendor ví dụ: Noya" }/>
              </Form.Item>
              <Form.Item
                name="family"
                label="Family"
                rules={[{required: true, message:"Vui lòng nhập FAMILY"}]}
              > 
                <Input />
              </Form.Item>
              <Form.Item
                name="prepreg_count"
                label="PREPREG Count"
                rules={[{required: true, message:"Vui lòng nhập PREPREG COUNT"}]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="nominal_thickness"
                label="Nominal Thickness"
                rules={[{required: true, message:"Vui lòng nhập NOMINAL THICKNESS"}]}
              >
                <InputNumber style={{ width: '100%' }} step={0.001} />
              </Form.Item>
              <Form.Item
                name="spec_thickness"
                label="Spec Thickness"
                rules={[{required: true, message:"Vui lòng nhập SPEC THICKNESS"}]}
              >
                <InputNumber style={{ width: '100%' }} step={0.001} />
              </Form.Item>
              <Form.Item
                name="preference_class"
                label="Preference Class"
                rules={[{required: true, message:"Vui lòng nhập PREFERENCE CLASS"}]}
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
                name="top_foil_cu_weight"
                label="Top Foil Cu Weight"
                rules={[{ required: true, message: editingRecord ? 'Vui lòng chọn một giá trị' : 'Vui lòng chọn ít nhất một giá trị' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const bot = getFieldValue('bot_foil_cu_weight');
                      if (!value || !bot) return Promise.resolve();
                      if (Array.isArray(value) && Array.isArray(bot) && value.length !== bot.length) {
                        return Promise.reject(new Error('Số lượng giá trị Top/Bot Foil Cu Weight phải bằng nhau'));
                      }
                      return Promise.resolve();
                    }
                  })
                ]}
              >
                <Select
                  mode={editingRecord ? undefined : "multiple"}
                  placeholder={editingRecord ? "Chọn một giá trị" : "Chọn một hoặc nhiều giá trị"}
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
                rules={[{ required: true, message: editingRecord ? 'Vui lòng chọn một giá trị' : 'Vui lòng chọn ít nhất một giá trị' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const top = getFieldValue('top_foil_cu_weight');
                      if (!value || !top) return Promise.resolve();
                      if (Array.isArray(value) && Array.isArray(top) && value.length !== top.length) {
                        return Promise.reject(new Error('Số lượng giá trị Top/Bot Foil Cu Weight phải bằng nhau'));
                      }
                      return Promise.resolve();
                    }
                  })
                ]}
              >
                <Select
                  mode={editingRecord ? undefined : "multiple"}
                  placeholder={editingRecord ? "Chọn một giá trị" : "Chọn một hoặc nhiều giá trị"}
                >
                  <Option value="L">L</Option>
                  <Option value="H">H</Option>
                  <Option value="1">1</Option>
                  <Option value="2">2</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="tg_min"
                label="Tg Min"
                rules={[{required: true, message:"Vui lòng nhập TG_MIN"}]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="tg_max"
                label="Tg Max"
                rules={[{required: true, message:"Vui lòng nhập TG_MAX"}]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="center_glass"
                label="Center Glass"
                rules={[{required: true, message:"Vui lòng nhập CENTER_GLASS"}]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="dk_01g"
                label="DK_0.1GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_01g"
                label="DF_0.1GHz"
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
                label="DATA_SOURCE"
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item
                name="filename"
                label="FILE_NAME"
              >
                <Input />
              </Form.Item>
            </div>
          </TabPane>

          <TabPane tab="3. Thông số DK/DF" key="3">
            <Alert
              message="Thông số DK/DF theo tần số"
              description="Các giá trị DK/DF ở các mức tần số khác nhau"
              type="info"
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
              <Form.Item
                name="dk_30ghz"
                label="DK_30GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_30ghz"
                label="DF_30GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>

              <Form.Item
                name="dk_35ghz"
                label="DK_35GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_35ghz"
                label="DF_35GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_40ghz"
                label="DK_40GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_40ghz"
                label="DF_40GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_45ghz"
                label="DK_45GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_45ghz"
                label="DF_45GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>

              <Form.Item
                name="dk_50ghz"
                label="DK_50GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_50ghz"
                label="DF_50GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="dk_55ghz"
                label="DK_55GHz"
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} />
              </Form.Item>
              <Form.Item
                name="df_55ghz"
                label="DF_55GHz"
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

export default MaterialCoreModal;
