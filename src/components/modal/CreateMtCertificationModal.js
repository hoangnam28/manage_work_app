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
import { uploadCertificationImages, deleteCertificationImage  } from '../../utils/material-certification-api';
import { toast } from 'sonner';

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
  const [savedFormData, setSavedFormData] = useState(null);
  const [savedImages, setSavedImages] = useState({
    catalogImage: null,
    layerStructureImage: null,
    catalogPreview: null,
    layerStructurePreview: null
  });  

   const handleCancel = () => {
    if (mode === 'create') {
      const currentValues = form.getFieldsValue(true);
      setSavedFormData(currentValues);
      setSavedImages({
        catalogImage,
        layerStructureImage,
        catalogPreview,
        layerStructurePreview
      });
    }
    
    if (mode === 'edit') {
      form.resetFields();
      setCatalogImage(null);
      setLayerStructureImage(null);
      setCatalogPreview(null);
      setLayerStructurePreview(null);
      setSavedFormData(null);
      setSavedImages({
        catalogImage: null,
        layerStructureImage: null,
        catalogPreview: null,
        layerStructurePreview: null
      });
    }
    
    onCancel();
  };
  const handleCancelButton = () => {
    form.resetFields();
    setCatalogImage(null);
    setLayerStructureImage(null);
    setCatalogPreview(null);
    setLayerStructurePreview(null);
    setSavedFormData(null);
    setSavedImages({
      catalogImage: null,
      layerStructureImage: null,
      catalogPreview: null,
      layerStructurePreview: null
    });
    onCancel();
  };

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const handleImageUpload = (file, imageType) => {
  console.log('handleImageUpload called:', imageType, file.name);
  
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('Chỉ có thể upload file hình ảnh!');
    return false;
  }

  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('Hình ảnh phải nhỏ hơn 5MB!');
    return false;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    if (imageType === 'catalog') {
      setCatalogPreview(e.target.result);
      setCatalogImage(file);
      // Trigger validation
      form.setFieldsValue({ catalogImage: file.name });
      form.validateFields(['catalogImage']);
    } else {
      setLayerStructurePreview(e.target.result);
      setLayerStructureImage(file);
      // Trigger validation
      form.setFieldsValue({ layerStructureImage: file.name });
      form.validateFields(['layerStructureImage']);
    }
  };
  reader.readAsDataURL(file);

  message.success('Đã chọn hình ' + (imageType === 'catalog' ? 'Catalog' : 'Cấu trúc lớp'));
  return false;
};
const removeImage = (imageType) => {
  if (imageType === 'catalog') {
    setCatalogImage(null);
    setCatalogPreview(null);
    form.setFieldsValue({ catalogImage: null });
    form.validateFields(['catalogImage']);
  } else {
    setLayerStructureImage(null);
    setLayerStructurePreview(null);
    form.setFieldsValue({ layerStructureImage: null });
    form.validateFields(['layerStructureImage']);
  }
};



  useEffect(() => {
    if (!open) return;                 
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    // ✅ Nếu đang edit
    if (editingRecord) {
      const formData = {
        releaseDate: editingRecord.releaseDate || editingRecord.RELEASE_DATE
          ? dayjs(editingRecord.releaseDate || editingRecord.RELEASE_DATE)
          : null,
        factoryName: editingRecord.factoryName || editingRecord.FACTORY_NAME,
        DEPARTMENT_IN_CHARGE: editingRecord.departmentInCharge || editingRecord.DEPARTMENT_IN_CHARGE,
        requestReason: editingRecord.requestReason || editingRecord.REQUEST_REASON,
        layerStructure: editingRecord.layerStructure || editingRecord.LAYER_STRUCTURE,
        RELIABILITY_LEVEL_ID: editingRecord.reliabilityLevelId || editingRecord.RELIABILITY_LEVEL,
        usage: editingRecord.usage || editingRecord.USAGE,
        expectedProductionQty: editingRecord.expectedProductionQty || editingRecord.EXPECTED_PRODUCTION_QTY,
        massProductionDate: editingRecord.massProductionDate || editingRecord.MASS_PRODUCTION_DATE
          ? dayjs(editingRecord.massProductionDate || editingRecord.MASS_PRODUCTION_DATE)
          : null,
        materialCertExpected: editingRecord.materialCertExpected || editingRecord.MATERIAL_CERT_EXPECTED
          ? dayjs(editingRecord.materialCertExpected || editingRecord.MATERIAL_CERT_EXPECTED)
          : null,
        manufacturerName: editingRecord.manufacturerName || editingRecord.MANUFACTURER_NAME,
        factoryLocation: editingRecord.factoryLocation || editingRecord.FACTORY_LOCATION,
        materialName: editingRecord.materialName || editingRecord.MATERIAL_NAME,
        MATERIAL_CLASS_ID: editingRecord.materialClassId || editingRecord.MATERIAL_CLASS,
        materialProperty1Id: editingRecord.materialProperty1Id || editingRecord.MATERIAL_PROPERTY1,
        materialProperty2Id: editingRecord.materialProperty2Id || editingRecord.MATERIAL_PROPERTY2,
        materialProperty3Id: editingRecord.materialProperty3Id || editingRecord.MATERIAL_PROPERTY3,
        materialStatusId: editingRecord.materialStatusId || editingRecord.materialStatus || editingRecord.MATERIAL_STATUS,
        ulStatusId: editingRecord.ulStatusId || editingRecord.ulCertStatus || editingRecord.UL_CERT_STATUS,
        notes1: editingRecord.notes1 || editingRecord.NOTES_1,
      };

      form.setFieldsValue(formData);
      setCatalogImage(null);
      setLayerStructureImage(null);
      setCatalogPreview(null);
      setLayerStructurePreview(null);

      if (editingRecord.IMAGES && editingRecord.IMAGES.length > 0) {
        const catalogImg = editingRecord.IMAGES.find(img =>
          (img.name || img.NAME || '').toLowerCase().includes('catalog')
        );
        const layerImg = editingRecord.IMAGES.find(img =>
          (img.name || img.NAME || '').toLowerCase().includes('layer') ||
          (img.name || img.NAME || '').toLowerCase().includes('structure')
        );

        if (catalogImg) {
          setCatalogPreview(catalogImg.url || catalogImg.URL);
          form.setFieldsValue({ catalogImage: 'existing' });
        }

        if (layerImg) {
          setLayerStructurePreview(layerImg.url || layerImg.URL);
          form.setFieldsValue({ layerStructureImage: 'existing' });
        }
      }
    }
    else {
      if (savedFormData) {
        form.setFieldsValue(savedFormData);
        setCatalogImage(savedImages.catalogImage);
        setLayerStructureImage(savedImages.layerStructureImage);
        setCatalogPreview(savedImages.catalogPreview);
        setLayerStructurePreview(savedImages.layerStructurePreview);
      } else {
        form.resetFields();
        form.setFieldsValue({
          releaseDate: dayjs(),
          factoryName: 'タクタット工場 (ベトナム)',
          PERSON_IN_CHARGE: userInfo.email || userInfo.username,
          DEPARTMENT_IN_CHARGE: userInfo.department,
          START_DATE: dayjs(),
        });

        setCatalogImage(null);
        setLayerStructureImage(null);
        setCatalogPreview(null);
        setLayerStructurePreview(null);
      }
    }
  }, [open, editingRecord, form, savedFormData, savedImages]);
 const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const submitData = {
        ...values,
        releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : null,
        massProductionDate: values.massProductionDate ? values.massProductionDate.format('YYYY-MM-DD') : null,
        materialCertExpected: values.materialCertExpected ? values.materialCertExpected.format('YYYY-MM-DD') : null,
        materialClassId: values.MATERIAL_CLASS_ID,
        reliabilityLevelId: values.RELIABILITY_LEVEL_ID,
        departmentInCharge: values.DEPARTMENT_IN_CHARGE,
        materialProperty1Id: values.materialProperty1Id,
        materialProperty2Id: values.materialProperty2Id,
        materialProperty3Id: values.materialProperty3Id,
        materialStatus: values.materialStatusId,
        ulCertStatus: values.ulStatusId,
      };
      
      console.log('📤 Submitting data:', submitData);
      
      const result = await onSubmit(submitData);
      const certificationId = isEditMode ? editingRecord.id : result.data?.id;
      
      if (mode === 'create') {
        const hasImages = catalogImage || layerStructureImage;      
        if (hasImages) {
          const imagesToUpload = [];
          
          if (catalogImage) {
            const ext = catalogImage.type.split('/')[1] || 'jpg';
            const file = new File([catalogImage], `catalog.${ext}`, { 
              type: catalogImage.type 
            });
            imagesToUpload.push(file);
          }
          
          if (layerStructureImage) {
            const ext = layerStructureImage.type.split('/')[1] || 'jpg';
            const file = new File([layerStructureImage], `layer_structure.${ext}`, { 
              type: layerStructureImage.type 
            });
            imagesToUpload.push(file);
          }  
          
          try {
            const uploadResult = await uploadCertificationImages(certificationId, imagesToUpload);
            if (uploadResult.success) {
              const uploadedCount = uploadResult.count || uploadResult.images?.length || imagesToUpload.length;
              toast.success(`Tạo certification và upload ${uploadedCount} hình thành công!`);
            } else {
              toast.warning('⚠️ Tạo thành công nhưng upload hình thất bại: ' + uploadResult.message);
            }
          } catch (uploadError) {
            console.error('Upload error:', uploadError);
            toast.warning('Tạo certification thành công nhưng upload hình thất bại');
          }
        } else {
          toast.success('Tạo certification thành công!');
        }
        setSavedFormData(null);
        setSavedImages({
          catalogImage: null,
          layerStructureImage: null,
          catalogPreview: null,
          layerStructurePreview: null
        });
      } else if (mode === 'edit') {
        const hasNewImages = catalogImage || layerStructureImage;
        
        if (hasNewImages) {
          try {
            if (catalogImage && editingRecord.CATALOG_IMAGE_ID) {
              await deleteCertificationImage(certificationId, editingRecord.CATALOG_IMAGE_ID);
              console.log('🗑️ Deleted old catalog image');
            }
            
            if (layerStructureImage && editingRecord.LAYER_STRUCTURE_IMAGE_ID) {
              await deleteCertificationImage(certificationId, editingRecord.LAYER_STRUCTURE_IMAGE_ID);
              console.log('🗑️ Deleted old layer structure image');
            }
            
            const imagesToUpload = [];
            
            if (catalogImage) {
              const ext = catalogImage.type.split('/')[1] || 'jpg';
              const file = new File([catalogImage], `catalog.${ext}`, { 
                type: catalogImage.type 
              });
              imagesToUpload.push(file);
            }
            
            if (layerStructureImage) {
              const ext = layerStructureImage.type.split('/')[1] || 'jpg';
              const file = new File([layerStructureImage], `layer_structure.${ext}`, { 
                type: layerStructureImage.type 
              });
              imagesToUpload.push(file);
            }
            
            await uploadCertificationImages(certificationId, imagesToUpload);
            toast.success('Cập nhật ảnh thành công!');
            
          } catch (uploadError) {
            console.error('Upload error:', uploadError);
            toast.warning('Cập nhật thành công nhưng upload ảnh mới thất bại');
          }
        } else {
          toast.success('Cập nhật thành công!');
        }
      }
          
      if (onSuccess) {
        onSuccess(mode === 'create' ? certificationId : null);
      }
      handleCancelButton(); // ✅ Dùng handleCancelButton để xóa hết dữ liệu sau khi submit
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
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
      maskClosable={true}
      destroyOnClose={false}
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
      forceRender
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
              name="DEPARTMENT_IN_CHARGE"
              label="Bộ phận phụ trách"
              rules={[
                { required: true, message: 'Vui lòng chọn bộ phận phụ trách' }
              ]}
            >
              <Select 
                placeholder="Chọn bộ phận phụ trách" 
                allowClear 
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {options.department?.map(item => (
                  <Option key={item.dept_id} value={item.dept_id}>
                    {item.dept_code}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="requestReason"
              label="Lý do yêu cầu"
              rules={[
                { required: true, message: 'Vui lòng nhập lý do yêu cầu' },
                { max: 500, message: 'Lý do yêu cầu không được vượt quá 500 ký tự' },
              ]}
            >
              <TextArea rows={1} placeholder="Nhập lý do yêu cầu" showCount maxLength={500} />
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
                { required: true, message: 'Vui lòng nhập cấu tạo lớp' },
                { max: 200, message: 'Cấu tạo lớp không được vượt quá 200 ký tự' },
              ]}
            >
              <Input placeholder="Nhập cấu tạo lớp" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="MATERIAL_CLASS_ID"
              label="Phân loại vật liệu"
              rules={[
                { required: true, message: 'Vui lòng chọn phân loại vật liệu' },
              ]}
            >
              <Select 
                placeholder="Chọn phân loại vật liệu"
                onChange={(value) => {
                  // Tìm material class được chọn
                  const selectedMaterialClass = options?.materialClass?.find(
                    item => item.id === value
                  );
                  
                  if (selectedMaterialClass) {
                    const nameVi = selectedMaterialClass.nameVi || '';
                    const nameJp = selectedMaterialClass.nameJp || '';
                    
                    // Kiểm tra điều kiện
                    const isBaseMaterial = 
                      [1, 2, 3].includes(value) || 
                      nameVi.startsWith('Vật liệu nền') ||
                      nameJp.startsWith('Vật liệu nền');
                    
                    if (isBaseMaterial) {
                      // Tìm "Ngoài đối tượng"
                      const outOfScopeLevel = options?.reliabilityLevel?.find(
                        level => 
                          level.nameVi === 'Ngoài đối tượng' || 
                          level.nameJp === '対象外'
                      );
                      
                      if (outOfScopeLevel) {
                        form.setFieldsValue({
                          RELIABILITY_LEVEL_ID: outOfScopeLevel.id
                        });
                      }
                    }
                  }
                }}
              >
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
              name="usage"
              label="Ứng dụng"
              rules={[
                { required: true, message: 'Vui lòng nhập ứng dụng' },
                { max: 500, message: 'Ứng dụng không được vượt quá 500 ký tự' },
              ]}
            >
              <TextArea rows={1} placeholder="Nhập ứng dụng" showCount maxLength={500} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="expectedProductionQty"
              label="Sản lượng dự kiến (m2/tháng)"
              rules={[
                { required: true, message: 'Vui lòng nhập sản lượng dự kiến' },
                { pattern: /^[0-9,.\s]+$/, message: 'Sản lượng chỉ được nhập số' },
              ]}
            >
              <Input placeholder="Nhập sản lượng dự kiến" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item 
              name="massProductionDate" 
              label="Ngày dự kiến sản xuất hàng loạt"
              rules={[
                { required: true, message: 'Vui lòng chọn ngày dự kiến sản xuất hàng loạt' },
              ]}
            >
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
              rules={[
                { required: true, message: 'Vui lòng chọn ngày mong muốn nhận chứng nhận vật liệu' },
              ]}
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
                { required: true, message: 'Vui lòng nhập tên nhà sản xuất' },
                {
                  max: 200,
                  message: 'Tên nhà sản xuất không được vượt quá 200 ký tự',
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
                { required: true, message: 'Vui lòng nhập nhà máy sản xuất' },
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
                { required: true, message: 'Vui lòng nhập tên vật liệu' },
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
              name="materialProperty1Id"
              label="Thuộc tính 1"
              rules={[
                { required: true, message: 'Vui lòng chọn Thuộc tính 1' },
              ]}
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
              rules={[
                { required: true, message: 'Vui lòng chọn Thuộc tính 2' },
              ]}
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
              rules={[
                { required: true, message: 'Vui lòng chọn Thuộc tính 3' },
              ]}
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
            <Form.Item name="materialStatusId" label="Mới hoặc thêm nhà máy" rules={[
                { required: true, message: 'Vui lòng chọn trạng thái vật liệu' },
              ]}>
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
            <Form.Item name="ulStatusId" label="Cấu trúc lớp đạt chứng nhận" rules={[
                { required: true, message: 'Vui lòng chọn trạng thái UL' },
              ]}>
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
            <Form.Item label={<span>Catalog <span style={{color: 'red'}}>*</span></span>}>
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
                <Form.Item
                  name="catalogImage"
                  noStyle
                  rules={[
                    {
                      validator: () => {
                        if (isEditMode && catalogPreview) {
                          return Promise.resolve();
                        }
                        if (!catalogImage && !catalogPreview) {
                          return Promise.reject('Vui lòng upload hình Catalog');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                </Form.Item>
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
                <Form.Item
                    name="layerStructureImage"
                    noStyle
                    rules={[
                      {
                        validator: () => {
                          if (isEditMode && layerStructurePreview) {
                            return Promise.resolve();
                          }
                          if (!layerStructureImage && !layerStructurePreview) {
                            return Promise.reject('Vui lòng upload hình Cấu trúc lớp');
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                  </Form.Item>
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