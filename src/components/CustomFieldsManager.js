// src/components/CustomFieldsManager.jsx

import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Input, Button, Space, Table, message,
  Popconfirm, Tag, Card, Radio, InputNumber, DatePicker,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, SettingOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { projectCustomFieldsApi } from '../utils/project-custom-fields-api';

const CustomFieldsManager = ({ projectId, visible, onClose, onFieldsChange }) => {
  const [form] = Form.useForm();
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldType, setFieldType] = useState('TEXT');
  const [options, setOptions] = useState(['']);

  // Load custom fields
  const loadCustomFields = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const data = await projectCustomFieldsApi.getCustomFields(projectId);
      setCustomFields(data);
      if (onFieldsChange) {
        onFieldsChange(data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách cột tùy chỉnh');
      console.error('Error loading custom fields:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && projectId) {
      loadCustomFields();
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, projectId]);

  // Handle submit create custom field
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      const payload = {
        fieldName: values.fieldName,
        fieldType: values.fieldType || fieldType,
        isRequired: values.isRequired || false,
        displayOrder: customFields.length,
        defaultValue: values.defaultValue || null, // Thêm giá trị mặc định
      };

      // Nếu là SELECT type, thêm options
      if ((values.fieldType || fieldType) === 'SELECT') {
        const validOptions = options.filter(o => o.trim() !== '');
        if (validOptions.length === 0) {
          message.warning('Vui lòng thêm ít nhất một tùy chọn');
          return;
        }
        payload.fieldOptions = validOptions;
        
        // Validate defaultValue nằm trong options
        if (values.defaultValue && !validOptions.includes(values.defaultValue)) {
          message.warning('Giá trị mặc định phải nằm trong danh sách tùy chọn');
          return;
        }
      }

      await projectCustomFieldsApi.createCustomField(projectId, payload);

      message.success('Tạo cột tùy chỉnh thành công');
      
      // Reset form
      form.resetFields();
      setFieldType('TEXT');
      setOptions(['']);
      
      // Reload list
      await loadCustomFields();
    } catch (error) {
      message.error('Lỗi khi tạo cột tùy chỉnh');
      console.error('Error creating custom field:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete custom field
  const handleDelete = async (fieldId) => {
    try {
      await projectCustomFieldsApi.deleteCustomField(projectId, fieldId);
      message.success('Xóa cột thành công');
      await loadCustomFields();
    } catch (error) {
      message.error('Lỗi khi xóa cột');
      console.error('Error deleting custom field:', error);
    }
  };

  // Handle add option for SELECT type
  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  // Handle option change
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Handle remove option
  const handleRemoveOption = (index) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  // Get field type label and color
  const getFieldTypeInfo = (type) => {
    const typeMap = {
      TEXT: { label: 'TEXT', color: 'blue' },
      NUMBER: { label: 'NUMBER', color: 'green' },
      DATE: { label: 'DATE', color: 'orange' },
      SELECT: { label: 'SELECT', color: 'purple' },
    };
    return typeMap[type] || { label: type, color: 'default' };
  };

  // Render default value input based on field type
  const renderDefaultValueInput = () => {
    switch (fieldType) {
      case 'NUMBER':
        return (
          <Form.Item
            name="defaultValue"
            label="Giá trị mặc định"
            extra="Giá trị này sẽ được tự động điền khi tạo dự án mới"
          >
            <InputNumber
              placeholder="VD: 100000"
              style={{ width: '100%' }}
            />
          </Form.Item>
        );
      
      case 'DATE':
        return (
          <Form.Item
            name="defaultValue"
            label="Giá trị mặc định"
            extra="Giá trị này sẽ được tự động điền khi tạo dự án mới"
          >
            <DatePicker
              placeholder="Chọn ngày"
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Form.Item>
        );
      
      case 'SELECT':
        return (
          <Form.Item
            name="defaultValue"
            label="Giá trị mặc định"
            extra="Chọn một trong các tùy chọn ở trên làm giá trị mặc định"
          >
            <select
              className="ant-input"
              style={{ width: '100%', padding: '4px 11px', height: '32px' }}
            >
              <option value="">-- Không chọn --</option>
              {options.filter(o => o.trim()).map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
          </Form.Item>
        );
      
      case 'TEXT':
      default:
        return (
          <Form.Item
            name="defaultValue"
            label="Giá trị mặc định"
            extra="Giá trị này sẽ được tự động điền khi tạo dự án mới"
          >
            <Input
              placeholder="VD: Xử lý công việc, Làm FE, Làm BE..."
              maxLength={500}
            />
          </Form.Item>
        );
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Tên cột',
      dataIndex: 'fieldName',
      key: 'fieldName',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Loại dữ liệu',
      dataIndex: 'fieldType',
      key: 'fieldType',
      render: (type) => {
        const info = getFieldTypeInfo(type);
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: 'Giá trị mặc định',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      render: (value) => {
        if (!value) return <Tag color="default">Không có</Tag>;
        return <Tag color="cyan">{value}</Tag>;
      },
    },
    {
      title: 'Tùy chọn',
      dataIndex: 'fieldOptions',
      key: 'fieldOptions',
      render: (options, record) => {
        if (record.fieldType === 'SELECT' && options) {
          const optionsList = Array.isArray(options) ? options : [];
          return (
            <Space size={4} wrap>
              {optionsList.slice(0, 3).map((opt, idx) => (
                <Tag key={idx} color="cyan">{opt}</Tag>
              ))}
            </Space>
          );
        }
        return '-';
      },
    },
    {
      title: 'Bắt buộc',
      dataIndex: 'isRequired',
      key: 'isRequired',
      render: (required) =>
        required ? <Tag color="red">Bắt buộc</Tag> : <Tag>Tùy chọn</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Xóa cột này?"
          description="Dữ liệu trong cột sẽ bị mất vĩnh viễn!"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
          >
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined style={{ color: '#1890ff' }} />
          <span>Quản lý cột tùy chỉnh</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
    >
      {/* Danh sách cột hiện tại */}
      <Card
        title={
          <Space>
            <span>Danh sách cột hiện tại</span>
            <Tag color="blue">{customFields.length} cột</Tag>
          </Space>
        }
        size="small"
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={columns}
          dataSource={customFields}
          loading={loading}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'Chưa có cột tùy chỉnh nào. Thêm cột mới bên dưới.',
          }}
        />
      </Card>

      {/* Form thêm cột mới */}
      <Card title="Thêm cột mới" size="small">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            fieldType: 'TEXT',
            isRequired: false,
          }}
        >
          <Form.Item
            name="fieldName"
            label="Tên cột"
            rules={[
              { required: true, message: 'Vui lòng nhập tên cột' },
              { min: 2, message: 'Tên cột phải có ít nhất 2 ký tự' },
              { max: 100, message: 'Tên cột không được quá 100 ký tự' },
            ]}
          >
            <Input
              placeholder="VD: Xử lý công việc, Ngân sách, Phòng ban..."
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            name="fieldType"
            label="Loại dữ liệu"
            rules={[{ required: true, message: 'Vui lòng chọn loại dữ liệu' }]}
          >
            <Radio.Group onChange={(e) => setFieldType(e.target.value)}>
              <Radio.Button value="TEXT">Văn bản</Radio.Button>
              <Radio.Button value="NUMBER">Số</Radio.Button>
              <Radio.Button value="DATE">Ngày</Radio.Button>
              <Radio.Button value="SELECT">Dropdown</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* Options for SELECT type */}
          {fieldType === 'SELECT' && (
            <Form.Item label="Danh sách tùy chọn">
              <Space direction="vertical" style={{ width: '100%' }}>
                {options.map((option, index) => (
                  <Space key={index} style={{ width: '100%' }}>
                    <Input
                      placeholder={`Tùy chọn ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    {options.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => handleRemoveOption(index)}
                      >
                        Xóa
                      </Button>
                    )}
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={handleAddOption}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm tùy chọn
                </Button>
              </Space>
            </Form.Item>
          )}

          {/* Default Value Input - Dynamic based on field type */}
          {renderDefaultValueInput()}

          <Form.Item name="isRequired" label="Trường bắt buộc">
            <Radio.Group>
              <Radio value={false}>Không</Radio>
              <Radio value={true}>Có</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                loading={submitting}
              >
                Thêm cột
              </Button>
              <Button onClick={() => {
                form.resetFields();
                setFieldType('TEXT');
                setOptions(['']);
              }}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Modal>
  );
};

export default CustomFieldsManager;