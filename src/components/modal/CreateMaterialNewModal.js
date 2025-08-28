import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Row, Col } from 'antd';
import moment from 'moment';
import { toast } from 'sonner';


const { Option } = Select;

const CreateMaterialNewModal = ({ open, onCancel, onSubmit, editingRecord }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (editingRecord) {
        // Đưa dữ liệu về đúng tên trường - Keep uppercase for form display
        const formattedRecord = Object.keys(editingRecord).reduce((acc, key) => {
          acc[key.toUpperCase()] = editingRecord[key];
          return acc;
        }, {});
        
        const recordWithId = {
          ...formattedRecord,
          ID: editingRecord.ID || editingRecord.id,
          REQUEST_DATE: formattedRecord.REQUEST_DATE ? moment(formattedRecord.REQUEST_DATE) : moment(),
        };
        
        form.setFieldsValue(recordWithId);
      } else {
        let userInfo = {};
        try {
          userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        } catch (error) {
          console.error('Error parsing userInfo from localStorage:', error);
        }
        
        form.setFieldsValue({
          STATUS: 'Pending',
          IS_HF: 0,
          IS_CAF: 0,
          REQUESTER_NAME: userInfo.username || '',
          REQUEST_DATE: moment()
        });
      }
    }
  }, [open, editingRecord, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Chuyển ngày về ISO string
      if (values.REQUEST_DATE) {
        values.REQUEST_DATE = values.REQUEST_DATE.toDate().toISOString();
      }
      
      // Handle ID for editing
      if (editingRecord) {
        const recordId = editingRecord.ID || editingRecord.id;
        if (!recordId) {
          toast.error('Không tìm thấy ID của bản ghi để cập nhật');
          return;
        }
        values.ID = recordId;
      }

      console.log('Form values before submit:', values);
      
      await onSubmit(values);
      
      if (editingRecord) {
        toast.success('Cập nhật thành công!');
      } else {
        toast.success('Thêm mới thành công!');
        form.resetFields();
      }
    } catch (error) {
      console.error('Submit error:', error);
      
      if (error.message && error.message.includes('Không có dữ liệu cập nhật')) {
        toast.error('Không có dữ liệu nào thay đổi để cập nhật');
      } else if (error.errorFields) {
        toast.error('Vui lòng kiểm tra lại các trường bắt buộc');
      } else {
        toast.error('Có lỗi xảy ra: ' + (error.message || 'Vui lòng kiểm tra lại dữ liệu'));
      }
    }
  };

  return (
    <Modal
      title={editingRecord ? 'Sửa Material New' : 'Thêm Material New'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={800}
      style={{ top: 20 }}
      destroyOnClose={true}
    >
      <Form form={form} layout="vertical">
        {editingRecord && (
          <Form.Item name="ID" hidden>
            <Input />
          </Form.Item>
        )}
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="VENDOR" label="Vendor" rules={[{ required: true, message: 'Nhập Vendor' }]}>
              <Input placeholder={"Nhập một vendor ví dụ: Shengyi"}/>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="FAMILY_CORE" label="Family Core" rules={[{ required: true, message: 'Nhập Family Core' }]}>
              <Input placeholder={"family-core ví dụ:NY3176HF"}/>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="FAMILY_PP" label="Family PP" rules={[{ required: true, message: 'Nhập Family PP' }]}>
              <Input placeholder={"Family PP ví dụ:NY3176HFP"}/>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="IS_HF" label="IS_HF" rules={[{ required: true, message: 'Chọn IS_HF' }]}>
              <Select>
                <Option value={1}>Có</Option>
                <Option value={0}>Không</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="MATERIAL_TYPE" label="Material Type" rules={[{ required: true, message: 'Nhập Material Type' }]}>
              <Input placeholder={"Material Type ví dụ:FR-4.1"}/>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="ERP" label="ERP" rules={[{ required: true, message: 'Nhập giá trị ERP' }]}>
              <Input 
                style={{ width: '100%' }} 
                placeholder="Nhập ERP ví dụ:NY3176HF" 
                min={0} 
                step={1}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="ERP_VENDOR" label="ERP Vendor" rules={[{ required: true, message: 'Nhập giá trị ERP Vendor' }]}>
              <Input placeholder="Nhập ERP_VENDOR ví dụ: Nouya" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="ERP_PP" label="ERP_PP" rules={[{ required: true, message: 'Nhập giá trị ERP_PP' }]}>
              <Input placeholder="Nhập giá trị ERP_PP" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="IS_CAF" label="IS_CAF" rules={[{ required: true, message: 'Chọn IS_CAF' }]}>
              <Select>
                <Option value={1}>Có</Option>
                <Option value={0}>Không</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="TG" label="TG" rules={[{ required: true, message: 'Nhập TG' }]}>
              <Input placeholder='Nhập TG vd: 150'/>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="BORD_TYPE" label="Bord Type" rules={[{ required: true, message: 'Nhập Bord Type' }]}>
              <Input placeholder='Nhập Bord type vd: HDI/MLB'/>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="PLASTIC" label="Plastic" rules={[{ required: true, message: 'Nhập Plastic' }]}>
              <Input placeholder='Nhập PLASTIC vd: 1.48g/cm3'/>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="FILE_NAME" label="File Name" rules={[{ required: true, message: 'Nhập File Name' }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="DATA" label="Data" rules={[{ required: true, message: 'Nhập Data' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="REQUESTER_NAME" label="Người yêu cầu">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="REQUEST_DATE" label="Ngày yêu cầu">
              <DatePicker style={{ width: '100%' }} disabled />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateMaterialNewModal;