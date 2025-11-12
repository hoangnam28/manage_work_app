import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, InputNumber, Tabs, Alert } from 'antd';
import moment from 'moment';
import { toast } from 'sonner';
import { CopyOutlined } from '@ant-design/icons';
import { hasPermission } from '../../utils/permissions';

const { Option } = Select;
const { TabPane } = Tabs;

const MaterialCoreModal = ({
  open,
  onCancel,
  onSubmit,
  editingRecord,
  cloneRecord = null,
  mode = 'create' }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if ((mode === 'edit' || mode === 'view') && editingRecord) {
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
          top_foil_cu_weight: formattedRecord.top_foil_cu_weight || null,
          reason: '' // Reset reason field for new update
        });
      } else if (mode === 'clone' && cloneRecord) {
        const formattedRecord = Object.keys(cloneRecord).reduce((acc, key) => {
          if (key.toUpperCase() === 'ID') {
            return acc; // Skip ID field for clone
          }
          acc[key.toLowerCase()] = cloneRecord[key];
          return acc;
        }, {});
        form.setFieldsValue({
          ...formattedRecord,
          requester_name: '', // Clear requester name để user nhập mới
          request_date: moment(), // Set ngày hiện tại
          handler: '', // Clear handler
          status: 'Pending', // Reset về Pending
          complete_date: null, // Clear complete date
          top_foil_cu_weight: formattedRecord.top_foil_cu_weight || null,
          bot_foil_cu_weight: formattedRecord.bot_foil_cu_weight || null,
        });
      } else {
        // Mode create mới hoàn toàn
        form.resetFields();
        form.setFieldsValue({
          status: 'Pending',
          is_hf: 'FALSE',
          request_date: moment() // Set ngày hiện tại cho bản ghi mới
        });
      }
    }
  }, [open, editingRecord, cloneRecord, mode, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Format dates
      if (values.request_date) {
        values.request_date = values.request_date.toDate().toISOString();
      }
      if (values.complete_date) {
        values.complete_date = values.complete_date.toDate().toISOString();
      }
      
      if (mode === 'view') {
        if (onCancel) onCancel();
        return;
      }

      // Xử lý theo từng mode
      if (mode === 'edit' && editingRecord) {
        // Kiểm tra reason trước khi submit
        if (!values.reason || values.reason.trim() === '') {
          toast.error('Vui lòng nhập lý do cập nhật!');
          return;
        }

        // Logic cho Edit mode
        const recordId = editingRecord.ID || editingRecord.id;
        if (!recordId) {
          throw new Error('Không tìm thấy ID bản ghi');
        }
        values.id = recordId;

        const changedValues = { id: recordId, reason: values.reason };
        const formattedRecord = Object.keys(editingRecord).reduce((acc, key) => {
          acc[key.toLowerCase()] = editingRecord[key];
          return acc;
        }, {});

        Object.keys(values).forEach(key => {
          if (key === 'id' || key === 'reason') return;
          
          let oldValue = formattedRecord[key];
          let newValue = values[key];
          
          if (key === 'request_date' || key === 'complete_date') {
            oldValue = oldValue ? new Date(oldValue).toISOString() : null;
            newValue = newValue ? newValue : null;
          }
          
          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changedValues[key] = newValue;
          }
        });

        const result = await onSubmit(changedValues, mode);

        if (result && result.success === false) {
          throw new Error(result.message || 'Có lỗi xảy ra');
        }

        toast.success(result?.message || 'Cập nhật thành công!');
      } 
      else if (mode === 'clone') {
        // Logic cho Clone mode
        const result = await onSubmit(values, mode);

        if (result && result.success === false) {
          throw new Error(result.message || 'Có lỗi xảy ra');
        }

        toast.success(result?.message || 'Tạo bản sao thành công!');
      } 
      else {
        // Logic cho Create mode (mode === 'create' hoặc không xác định)
        const result = await onSubmit(values, mode);

        if (result && result.success === false) {
          throw new Error(result.message || 'Có lỗi xảy ra');
        }

        toast.success(result?.message || 'Thêm mới thành công!');
      }

      // Reset form và đóng modal sau khi thành công
      form.resetFields();
      if (onCancel) onCancel();

    } catch (error) {
      console.error('Submit failed:', error);
      // Hiển thị toast error khi có lỗi validation hoặc lỗi khác
      if (error.errorFields) {
        toast.error('Vui lòng nhập lý do cập nhật!');
      } else {
        toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại!');
      }
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'edit':
        return 'Sửa Material Core';
      case 'clone':
        return 'Tạo bản sao Material Core';
      case 'view':
        return 'Xem chi tiết Material Core';
      default:
        return 'Thêm Material Core';
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
      okText={
        mode === 'edit' ? 'Cập nhật' :
          mode === 'clone' ? 'Tạo bản sao' :
            mode === 'view' ? 'Đóng' :
              'Thêm mới'
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'Pending',
        }}
      >
        <Tabs defaultActiveKey={mode === 'edit' || mode === 'view' ? "1" : "2"} >
          {/* Tab 1: Thông tin yêu cầu - chỉ hiện khi edit hoặc clone */}
          {(mode === 'edit' || mode === 'clone' || mode === 'view') && hasPermission('approve') && (
            <TabPane tab="1. Thông tin yêu cầu" key="1" >
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
                  name="requester_name"
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
              
              {/* Add reason field for edit mode */}
              {mode === 'edit' && (
                <Form.Item
                  name="reason"
                  label="Lý do cập nhật"
                  rules={[{ required: true, message: 'Vui lòng nhập lý do cập nhật' }]}
                >
                  <Input.TextArea 
                    rows={3} 
                    placeholder="Nhập lý do cập nhật bản ghi này..."
                    disabled={mode === 'view'}
                  />
                </Form.Item>
              )}
            </TabPane>
          )}
          
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
            
            {/* Add reason field for edit mode if not shown in tab 1 */}
            {mode === 'edit' && !hasPermission('approve') && (
              <Form.Item
                name="reason"
                label="Lý do cập nhật"
                rules={[{ required: true, message: 'Vui lòng nhập lý do cập nhật' }]}
                style={{ marginBottom: 16 }}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Nhập lý do cập nhật bản ghi này..."
                  disabled={mode === 'view'}
                />
              </Form.Item>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <Form.Item
                name="vendor"
                label="Vendor"
                rules={[{ required: true, message: "Vui lòng nhập Vendor" }]}
              >
                <Input
                  placeholder={"Nhập một vendor ví dụ: Noya"} />
              </Form.Item>
              <Form.Item
                name="family"
                label="Family"
                rules={[{ required: true, message: "Vui lòng nhập FAMILY" }]}
              >
                <Input placeholder={"Nhập một familt ví dụ: EMC_307(Z)"} />
              </Form.Item>
              <Form.Item
                name="prepreg_count"
                label="PREPREG Count"
                rules={[{ required: true, message: "Vui lòng nhập PREPREG COUNT" }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder='Nhập PrepregCount vd: 12' />
              </Form.Item>
              <Form.Item
                name="nominal_thickness"
                label="Nominal Thickness"
                rules={[{ required: true, message: "Vui lòng nhập NOMINAL THICKNESS" }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.001} placeholder='Nhập NOMINAL THICKNESS vd: 0.209' />
              </Form.Item>
              <Form.Item
                name="spec_thickness"
                label="Spec Thickness"
                rules={[{ required: true, message: "Vui lòng nhập SPEC THICKNESS" }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.001} placeholder='Nhập SPEC THICKNESS vd: 0.203' title='Độ dày danh nghĩa
                (Lấy từ hệ thống mua hàng) sẽ ghép trong tên VL'/>
              </Form.Item>
              <Form.Item
                name="preference_class"
                label="PREFERENCE_CLASS"
                rules={[{ required: true, message: "Vui lòng nhập PREFERENCE_CLASS" }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.001} placeholder='Nhập PREFERENCE_CLASS vd: 1' title='0
                  1
                  2
                  3
                  Độ thông dụng, 3 là cao nhất'/>
              </Form.Item>
              <Form.Item
                name="use_type"
                label="USE Type"
              >
                <Input placeholder='Nhập USE Type vd: HDI/MLB' />
              </Form.Item>
               <Form.Item
                name="rigid"
                label="RIGID"
              >
                <Select placeholder="Chọn RIGID">
                  <Option value="TRUE">TRUE</Option>
                  <Option value="FALSE">FALSE</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="top_foil_cu_weight"
                label="Top Foil Cu Weight"
                rules={[{
                  required: true,
                  message: mode === 'edit' ? 'Vui lòng chọn một giá trị' : 'Vui lòng chọn ít nhất một giá trị'
                },
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
                  mode={(mode === 'edit' || mode === 'view') ? undefined : "multiple"}
                  disabled={mode === 'view'}
                  placeholder={
                    mode === 'view' ? "" :
                      (mode === 'edit' ? "Chọn một giá trị" : "Chọn một hoặc nhiều giá trị")
                  }
                  title='Độ dày lá đồng lớp trên. Trước khi chạy macro, đảm bảo thiết định đúng đơn vị trong sheet "Units translation"'
                >
                  <Option value="L">L</Option>
                  <Option value="H">H</Option>
                  <Option value="1">1</Option>
                  <Option value="2">2</Option>
                  <Option value="Z">Z</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="bot_foil_cu_weight"
                label="Bottom Foil Cu Weight"
                rules={[{
                  required: true,
                  message: mode === 'edit' ? 'Vui lòng chọn một giá trị' : 'Vui lòng chọn ít nhất một giá trị'
                },
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
                  mode={(mode === 'edit' || mode === 'view') ? undefined : "multiple"}
                  disabled={mode === 'view'}
                  placeholder={
                    mode === 'view' ? "" :
                      (mode === 'edit' ? "Chọn một giá trị" : "Chọn một hoặc nhiều giá trị")
                  }
                  title='Độ dày lá đồng lớp dưới'
                >
                  <Option value="L">L</Option>
                  <Option value="H">H</Option>
                  <Option value="1">1</Option>
                  <Option value="2">2</Option>
                  <Option value="Z">Z</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="tg_min"
                label="Tg Min"
                rules={[{ required: true, message: "Vui lòng nhập TG_MIN" }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder='Nhập TG_MIN vd: 180' title='Lấy theo phương pháp đo(TMA)'/>
              </Form.Item>
              <Form.Item
                name="tg_max"
                label="Tg Max"
                rules={[{ required: true, message: "Vui lòng nhập TG_MAX" }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder='Nhập TG_MAX vd: 180' title='Lấy theo phương pháp đo(TMA)'/>
              </Form.Item>
              <Form.Item
                name="center_glass"
                label="Center Glass"
                rules={[{ required: true, message: "Vui lòng nhập CENTER_GLASS" }]}
              >
                <Input placeholder='Nhập CENTER_GLASS vd: 3' />
              </Form.Item>
              <Form.Item
                name="dk_01g"
                label="DK_0.1GHz"
                rules={[{ required: true, message: "Vui lòng nhập DK_0.1GHz" }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} placeholder='Nhập DK_0.1GHz vd: 4.24' />
              </Form.Item>
              <Form.Item
                name="df_01g"
                label="DF_1GHz"
                rules={[{ required: true, message: "Vui lòng nhập DF_1GHz" }]}
              >
                <InputNumber style={{ width: '100%' }} step={0.0001} precision={4} placeholder='Nhập DF_1GHz vd: 0.013' />
              </Form.Item>
              <Form.Item
                name="is_hf"
                label="IS_HF"
                rules={[{ required: true, message: "Vui lòng chọn IS_HF" }]}
              >
                <Select>
                  <Option value="TRUE">Có</Option>
                  <Option value="FALSE">Không</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="data_source"
                label="DATA_SOURCE"
                rules={[{ required: true, message: "Vui lòng nhập DATA_SOURCE" }]}
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item
                name="filename"
                label="FILE_NAME"
                rules={[{ required: true, message: "Vui lòng nhập FILE_NAME" }]}
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