import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  message,
  Space,
  Divider,
  Upload,
  Image,
} from 'antd';
import { CloseOutlined, SaveOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { uploadCertificationImages } from '../../utils/material-certification-api';

const { Option } = Select;
const { TextArea } = Input;

const CreateUlCertificationModal = ({
  open,
  onCancel,
  onSubmit,
  editingRecord,
  mode = 'create',
  options = {},
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [catalogImage, setCatalogImage] = useState(null);
  const [layerStructureImage, setLayerStructureImage] = useState(null);
  const [catalogPreview, setCatalogPreview] = useState(null);
  const [layerStructurePreview, setLayerStructurePreview] = useState(null);

 useEffect(() => {
  if (open) {
    if (editingRecord) {
      // Map field names từ backend sang form
      const formData = {
        releaseDate: editingRecord.RELEASE_DATE
          ? dayjs(editingRecord.RELEASE_DATE)
          : null,
        factoryName: editingRecord.FACTORY_NAME,
        requestReason: editingRecord.REQUEST_REASON,
        layerStructure: editingRecord.LAYER_STRUCTURE,
        usage: editingRecord.USAGE,
        RELIABILITY_LEVEL_ID: editingRecord.RELIABILITY_LEVEL_ID || editingRecord.reliabilityLevelId,
        expectedProductionQty: editingRecord.EXPECTED_PRODUCTION_QTY,
        massProductionDate: editingRecord.MASS_PRODUCTION_DATE
          ? dayjs(editingRecord.MASS_PRODUCTION_DATE)
          : null,
        materialCertExpected: editingRecord.MATERIAL_CERT_EXPECTED
          ? dayjs(editingRecord.MATERIAL_CERT_EXPECTED)
          : null,
        manufacturerName: editingRecord.MANUFACTURER_NAME,
        factoryLocation: editingRecord.FACTORY_LOCATION,
        materialName: editingRecord.MATERIAL_NAME,
        MATERIAL_CLASS_ID: editingRecord.MATERIAL_CLASS_ID || editingRecord.materialClassId,
        materialProperty1Id: editingRecord.MATERIAL_PROPERTY1_ID,
        materialProperty2Id: editingRecord.MATERIAL_PROPERTY2_ID,
        materialProperty3Id: editingRecord.MATERIAL_PROPERTY3_ID,
        materialStatusId: editingRecord.MATERIAL_STATUS,
        ulStatusId: editingRecord.UL_CERT_STATUS,
        notes1: editingRecord.NOTES_1,
      };
      
      console.log('Setting form values for edit:', formData);
      form.setFieldsValue(formData);
    } else {
      form.resetFields();
      // Reset images khi tạo mới
      setCatalogImage(null);
      setLayerStructureImage(null);
      setCatalogPreview(null);
      setLayerStructurePreview(null);
    }
  }
}, [open, editingRecord, form]);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const handleImageUpload = (file, imageType) => {
  console.log('handleImageUpload called:', imageType, file.name, file.size, file.type);
  
  // Kiểm tra file type
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('Chỉ có thể upload file hình ảnh!');
    return false;
  }

  // Kiểm tra size (5MB)
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('Hình ảnh phải nhỏ hơn 5MB!');
    return false;
  }

  // Tạo preview
  const reader = new FileReader();
  reader.onload = (e) => {
    console.log('Image loaded for preview:', imageType);
    if (imageType === 'catalog') {
      setCatalogPreview(e.target.result);
    } else {
      setLayerStructurePreview(e.target.result);
    }
  };
  reader.readAsDataURL(file);

  // Lưu file
  if (imageType === 'catalog') {
    setCatalogImage(file);
    console.log('Catalog image set:', file.name);
  } else {
    setLayerStructureImage(file);
    console.log('Layer structure image set:', file.name);
  }

  message.success('Đã chọn hình ' + (imageType === 'catalog' ? 'Catalog' : 'Cấu trúc lớp'));
  return false; // Prevent auto upload
};
  const removeImage = (imageType) => {
    if (imageType === 'catalog') {
      setCatalogImage(null);
      setCatalogPreview(null);
    } else {
      setLayerStructureImage(null);
      setLayerStructurePreview(null);
    }
  };
useEffect(() => {
  if (open) {
    if (editingRecord) {
      // Map field names từ backend sang form
      const formData = {
        releaseDate: editingRecord.RELEASE_DATE
          ? dayjs(editingRecord.RELEASE_DATE)
          : null,
        factoryName: editingRecord.FACTORY_NAME,
        requestReason: editingRecord.REQUEST_REASON,
        layerStructure: editingRecord.LAYER_STRUCTURE,
        usage: editingRecord.USAGE,
        RELIABILITY_LEVEL_ID: editingRecord.RELIABILITY_LEVEL_ID || editingRecord.reliabilityLevelId,
        expectedProductionQty: editingRecord.EXPECTED_PRODUCTION_QTY,
        massProductionDate: editingRecord.MASS_PRODUCTION_DATE
          ? dayjs(editingRecord.MASS_PRODUCTION_DATE)
          : null,
        materialCertExpected: editingRecord.MATERIAL_CERT_EXPECTED
          ? dayjs(editingRecord.MATERIAL_CERT_EXPECTED)
          : null,
        manufacturerName: editingRecord.MANUFACTURER_NAME,
        factoryLocation: editingRecord.FACTORY_LOCATION,
        materialName: editingRecord.MATERIAL_NAME,
        MATERIAL_CLASS_ID: editingRecord.MATERIAL_CLASS_ID || editingRecord.materialClassId,
        materialProperty1Id: editingRecord.MATERIAL_PROPERTY1_ID,
        materialProperty2Id: editingRecord.MATERIAL_PROPERTY2_ID,
        materialProperty3Id: editingRecord.MATERIAL_PROPERTY3_ID,
        materialStatusId: editingRecord.MATERIAL_STATUS,
        ulStatusId: editingRecord.UL_CERT_STATUS,
        notes1: editingRecord.NOTES_1,
      };
      
      console.log('Setting form values for edit:', formData);
      form.setFieldsValue(formData);
    } else {
      form.resetFields();
      // Reset images khi tạo mới
      setCatalogImage(null);
      setLayerStructureImage(null);
      setCatalogPreview(null);
      setLayerStructurePreview(null);
    }
  }
}, [open, editingRecord, form]);


const handleSubmit = async (values) => {
  setLoading(true);
  
  try {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   MODAL: Starting Form Submission     ║');
    console.log('╚════════════════════════════════════════╝');
    
    // Prepare data
    const submitData = {
      ...values,
      releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : null,
      massProductionDate: values.massProductionDate ? values.massProductionDate.format('YYYY-MM-DD') : null,
      materialCertExpected: values.materialCertExpected ? values.materialCertExpected.format('YYYY-MM-DD') : null,
      materialClassId: values.MATERIAL_CLASS_ID,
      reliabilityLevelId: values.RELIABILITY_LEVEL_ID,
    };

    console.log('📝 MODAL: Form values:', submitData);
    console.log('🖼️ MODAL: Catalog image ready:', !!catalogImage, catalogImage?.name);
    console.log('🖼️ MODAL: Layer image ready:', !!layerStructureImage, layerStructureImage?.name);
    console.log('🎭 MODAL: Current mode:', mode);
    
    // Step 1: Create/Update certification
    console.log('\n--- STEP 1: Creating Certification ---');
    console.log('⏳ MODAL: Calling onSubmit function...');
    
    const result = await onSubmit(submitData);
    
    console.log('\n--- STEP 1 RESULT ---');
    console.log('📥 MODAL: Result type:', typeof result);
    console.log('📥 MODAL: Result is null?', result === null);
    console.log('📥 MODAL: Result is undefined?', result === undefined);
    console.log('📥 MODAL: Full result:', JSON.stringify(result, null, 2));
    
    // Validate result
    if (!result) {
      console.error('❌ MODAL: No result object returned!');
      message.error('Không nhận được phản hồi từ server');
      return;
    }
    
    console.log('✓ MODAL: Result object exists');
    console.log('📊 MODAL: result.success =', result.success);
    
    if (!result.success) {
      console.error('❌ MODAL: Request failed');
      console.error('Error message:', result.message);
      message.error(result.message || 'Có lỗi xảy ra');
      return;
    }
    
    console.log('✓ MODAL: Request successful');
    console.log('📊 MODAL: result.data =', result.data);
    console.log('📊 MODAL: result.data.id =', result.data?.id);
    
    const certificationId = result.data?.id;
    
    if (!certificationId) {
      console.error('❌ MODAL: No certification ID in response!');
      console.error('Expected: result.data.id');
      console.error('Got result.data:', result.data);
      message.error('Không nhận được ID từ server');
      return;
    }
    
    console.log('✅ MODAL: Got certification ID:', certificationId);
    
    // Step 2: Upload images (only for create mode)
    if (mode === 'create') {
      console.log('\n--- STEP 2: Uploading Images ---');
      
      const hasImages = catalogImage || layerStructureImage;
      console.log('🖼️ MODAL: Has images to upload?', hasImages);
      
      if (hasImages) {
        const imagesToUpload = [];
        
        if (catalogImage) {
          const ext = catalogImage.type.split('/')[1] || 'jpg';
          const file = new File([catalogImage], `catalog.${ext}`, { 
            type: catalogImage.type 
          });
          imagesToUpload.push(file);
          console.log('✓ Added catalog:', file.name, `(${(file.size/1024).toFixed(2)} KB)`);
        }
        
        if (layerStructureImage) {
          const ext = layerStructureImage.type.split('/')[1] || 'jpg';
          const file = new File([layerStructureImage], `layer_structure.${ext}`, { 
            type: layerStructureImage.type 
          });
          imagesToUpload.push(file);
          console.log('✓ Added layer structure:', file.name, `(${(file.size/1024).toFixed(2)} KB)`);
        }
        
        console.log(`📤 MODAL: Uploading ${imagesToUpload.length} image(s)...`);
        
        try {
          const uploadResult = await uploadCertificationImages(certificationId, imagesToUpload);
          
          console.log('\n--- STEP 2 RESULT ---');
          console.log('📥 MODAL: Upload result:', uploadResult);
          
          if (uploadResult.success) {
            const uploadedCount = uploadResult.count || uploadResult.images?.length || imagesToUpload.length;
            console.log(`✅ MODAL: Successfully uploaded ${uploadedCount} image(s)`);
            message.success(`✅ Tạo certification và upload ${uploadedCount} hình thành công!`);
          } else {
            console.warn('⚠️ MODAL: Upload reported as not successful');
            message.warning('⚠️ Tạo thành công nhưng upload hình thất bại: ' + uploadResult.message);
          }
        } catch (uploadError) {
          console.error('❌ MODAL: Upload error:', uploadError);
          message.warning('⚠️ Tạo certification thành công nhưng upload hình thất bại');
        }
      } else {
        console.log('ℹ️ MODAL: No images to upload');
        message.success('✅ Tạo certification thành công!');
      }
    } else {
      console.log('\n--- STEP 2: Skipped (Edit mode) ---');
      message.success('✅ ' + (result.message || 'Cập nhật thành công!'));
    }
    
    // Step 3: Callback and close
    console.log('\n--- STEP 3: Cleanup ---');
    console.log('🔄 MODAL: Calling onSuccess callback with ID:', certificationId);
    
    if (onSuccess) {
      onSuccess(mode === 'create' ? certificationId : null);
    } else {
      console.warn('⚠️ MODAL: No onSuccess callback provided');
    }
    
    console.log('🚪 MODAL: Closing modal...');
    handleCancel();
    
    console.log('╔════════════════════════════════════════╗');
    console.log('║   MODAL: Submission Complete ✅        ║');
    console.log('╚════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('\n╔════════════════════════════════════════╗');
    console.error('║   MODAL: Submission FAILED ❌          ║');
    console.error('╚════════════════════════════════════════╝');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    message.error(error.message || 'Có lỗi xảy ra');
  } finally {
    setLoading(false);
    console.log('🏁 MODAL: Loading state reset\n');
  }
};

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>
            {isViewMode
              ? 'Xem chi tiết'
              : isEditMode
                ? 'Chỉnh sửa'
                : 'Thêm mới'}{' '}
            Biểu yêu cầu chứng nhận vật liệu
          </span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      width={1200}
      style={{ top: 20 }}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            {isViewMode && (
              <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                Chế độ xem - Không thể chỉnh sửa
              </span>
            )}
          </div>
          <Space>
            <Button onClick={handleCancel} icon={<CloseOutlined />}>
              {isViewMode ? 'Đóng' : 'Hủy'}
            </Button>
            {!isViewMode && (
              <Button
                type="primary"
                loading={loading}
                onClick={() => form.submit()}
                icon={<SaveOutlined />}
              >
                {isEditMode ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            )}
          </Space>
        </div>
      }
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isViewMode}
        scrollToFirstError
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="releaseDate"
              label="Ngày phát hành"
              rules={[
                { required: true, message: 'Vui lòng chọn ngày phát hành' },
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày phát hành"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="factoryName"
              label="Tên nhà máy"
              rules={[
                {
                  max: 200,
                  message: 'Tên nhà máy không được vượt quá 200 ký tự',
                },
              ]}
            >
              <Input placeholder="Nhập tên nhà máy" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="requestReason"
              label="Lý do yêu cầu"
              rules={[
                {
                  max: 500,
                  message: 'Lý do yêu cầu không được vượt quá 500 ký tự',
                },
              ]}
            >
              <TextArea
                rows={1}
                placeholder="Nhập lý do yêu cầu"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Section 2: Thông tin sản phẩm sử dụng */}
        <Divider orientation="left" style={{ color: '#1890ff', fontWeight: 'bold' }}>
          Thông tin sản phẩm sử dụng
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="layerStructure"
              label="Cấu tạo lớp"
              rules={[
                {
                  max: 50,
                  message: 'Cấu tạo lớp không được vượt quá 50 ký tự',
                },
              ]}
            >
              <Input placeholder="Nhập cấu tạo lớp" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="RELIABILITY_LEVEL_ID"
              label="Mức độ tin cậy"
              rules={[
                { required: true, message: 'Vui lòng chọn mức độ tin cậy' },
              ]}
            >
              <Select placeholder="Chọn mức độ tin cậy">
                {options?.reliabilityLevel?.map((level) => (
                  <Option key={level.id} value={level.id}>
                    {level.nameVi} ({level.nameJp})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="usage"
              label="Ứng dụng"
              rules={[
                {
                  max: 500,
                  message: 'Ứng dụng không được vượt quá 500 ký tự',
                },
              ]}
            >
              <TextArea
                rows={1}
                placeholder="Nhập ứng dụng"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="expectedProductionQty"
              label="Sản lượng dự kiến"
              rules={[
                {
                  max: 100,
                  message: 'Sản lượng dự kiến không được vượt quá 100 ký tự',
                },
              ]}
            >
              <Input placeholder="Nhập sản lượng dự kiến" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="massProductionDate" label="Ngày sản xuất hàng loạt">
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sản xuất hàng loạt"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="materialCertExpected"
              label="Ngày mong muốn nhận chứng nhận vật liệu"
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày mong muốn nhận chứng nhận"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Section 3: Thông tin vật liệu */}
        <Divider orientation="left" style={{ color: '#1890ff', fontWeight: 'bold' }}>
          Thông tin vật liệu
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="manufacturerName"
              label="Tên nhà sản xuất"
              rules={[
                {
                  max: 200,
                  message:
                    'Tên nhà sản xuất không được vượt quá 200 ký tự',
                },
              ]}
            >
              <Input placeholder="Nhập tên nhà sản xuất" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="factoryLocation"
              label="Nhà máy sản xuất"
              rules={[
                {
                  max: 200,
                  message: 'Nhà máy sản xuất không được vượt quá 200 ký tự',
                },
              ]}
            >
              <Input placeholder="Nhập nhà máy sản xuất" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="materialName"
              label="Tên vật liệu"
              rules={[
                {
                  max: 200,
                  message: 'Tên vật liệu không được vượt quá 200 ký tự',
                },
              ]}
            >
              <Input placeholder="Nhập tên vật liệu" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="MATERIAL_CLASS_ID"
              label="Phân loại vật liệu"
            >
              <Select placeholder="Chọn phân loại vật liệu">
                {options?.materialClass?.map(materialClassId => (
                  <Option key={materialClassId.id} value={materialClassId.id}>
                    {materialClassId.nameVi} ({materialClassId.nameJp})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="materialProperty1Id"
              label="Thuộc tính 1"
            >
              <Select placeholder="Chọn Thuộc tính 1" allowClear showSearch>
                {options.materialProperty1?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.nameVi} ({item.nameJp})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="materialProperty2Id"
              label="Thuộc tính 2"
            >
              <Select placeholder="Chọn Thuộc tính 2" allowClear showSearch>
                {options.materialProperty2?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.nameVi} ({item.nameJp})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="materialProperty3Id"
              label="Thuộc tính 3"
            >
              <Select placeholder="Chọn Thuộc tính 3" allowClear showSearch>
                {options.materialProperty3?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.nameVi} ({item.nameJp})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="materialStatusId" label="Mới hoặc thêm nhà máy">
              <Select placeholder="Chọn trạng thái vật liệu" allowClear showSearch>
                {options.materialStatus?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.nameVi} ({item.nameJp})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="ulStatusId" label="Cấu trúc lớp đạt chứng nhận">
              <Select placeholder="Chọn trạng thái UL" allowClear showSearch>
                {options.ulStatus?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.nameVi} ({item.nameJp})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Section 4: Ghi chú */}
        <Divider orientation="left" style={{ color: '#1890ff', fontWeight: 'bold' }}>
          Ghi chú
        </Divider>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="notes1"
              label="Ghi chú 1"
              rules={[
                {
                  max: 1000,
                  message: 'Ghi chú 1 không được vượt quá 1000 ký tự',
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú 1"
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider orientation="left" style={{ color: '#1890ff', fontWeight: 'bold' }}>
          Hình ảnh
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Catalog">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Upload
                  beforeUpload={(file) => handleImageUpload(file, 'catalog')}
                  showUploadList={false}
                  accept="image/*"
                  disabled={isViewMode}
                >
                  <Button icon={<UploadOutlined />} disabled={isViewMode}>
                    Chọn hình Catalog
                  </Button>
                </Upload>
                {catalogPreview && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Image
                      src={catalogPreview}
                      alt="Catalog"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                    {!isViewMode && (
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeImage('catalog')}
                        style={{ position: 'absolute', top: 5, right: 5 }}
                      />
                    )}
                  </div>
                )}
              </Space>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Cấu trúc lớp">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Upload
                  beforeUpload={(file) => handleImageUpload(file, 'layerStructure')}
                  showUploadList={false}
                  accept="image/*"
                  disabled={isViewMode}
                >
                  <Button icon={<UploadOutlined />} disabled={isViewMode}>
                    Chọn hình Cấu trúc lớp
                  </Button>
                </Upload>
                {layerStructurePreview && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Image
                      src={layerStructurePreview}
                      alt="Layer Structure"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                    {!isViewMode && (
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeImage('layerStructure')}
                        style={{ position: 'absolute', top: 5, right: 5 }}
                      />
                    )}
                  </div>
                )}
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateUlCertificationModal;