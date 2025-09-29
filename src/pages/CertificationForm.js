import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Form, Input, DatePicker, Select, Button, Row, Col, Typography, Divider,
  Tabs, message
} from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import moment from 'moment';
import MainLayout from '../components/layout/MainLayout';
import { Toaster, toast } from 'sonner';
import {
  fetchMaterialCertificationDetail,
  updateMaterialCertification,
  exportCertificationForm,
  fetchMaterialCertificationOptions, // Thêm import này
} from '../utils/material-certification-api';
import ImageUploadComponent from '../components/modal/ImageUploadComponent';

const { Title } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const CertificationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [progressForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('certification');
  const [exportLoading, setExportLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [options, setOptions] = useState({}); // Thêm state cho options

  const certificationId = location.state?.certificationData?.ID || location.state?.certificationId;

  useEffect(() => {
    if (certificationId) {
      loadCertificationData();
      loadOptions(); // Load options khi component mount
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificationId]);

  // Hàm load options từ API
  const loadOptions = async () => {
    try {
      const response = await fetchMaterialCertificationOptions();
      if (response.success) {
        setOptions(response.data);
        console.log('Options loaded:', response.data);
      }
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const loadCertificationData = async () => {
    try {
      setLoading(true);
      setImagesLoading(true);
      const response = await fetchMaterialCertificationDetail(certificationId);
      if (response.success && response.data) {
        const data = response.data;
        const formValues = {
          RELEASE_DATE: data.RELEASE_DATE ? moment(data.RELEASE_DATE) : null,
          FACTORY_NAME: data.FACTORY_NAME,
          REQUEST_REASON: data.REQUEST_REASON,
          LAYER_STRUCTURE: data.LAYER_STRUCTURE,
          USAGE: data.USAGE,
          RELIABILITY_LEVEL_ID: data.RELIABILITY_LEVEL_ID,
          EXPECTED_PRODUCTION_QTY: data.EXPECTED_PRODUCTION_QTY,
          MASS_PRODUCTION_DATE: data.MASS_PRODUCTION_DATE ? moment(data.MASS_PRODUCTION_DATE) : null,
          MATERIAL_CERT_EXPECTED: data.MATERIAL_CERT_EXPECTED ? moment(data.MATERIAL_CERT_EXPECTED) : null,
          MANUFACTURER_NAME: data.MANUFACTURER_NAME,
          FACTORY_LOCATION: data.FACTORY_LOCATION,
          MATERIAL_NAME: data.MATERIAL_NAME,
          MATERIAL_CLASS_ID: data.MATERIAL_CLASS_ID,
          MATERIAL_PROPERTY1_ID: data.MATERIAL_PROPERTY1_ID,
          MATERIAL_PROPERTY2_ID: data.MATERIAL_PROPERTY2_ID,
          MATERIAL_PROPERTY3_ID: data.MATERIAL_PROPERTY3_ID,
          MATERIAL_STATUS: data.MATERIAL_STATUS, // Sử dụng đúng tên cột
          UL_CERT_STATUS: data.UL_CERT_STATUS,   // Sử dụng đúng tên cột
          NOTES_1: data.NOTES_1,
          NOTES_2: data.NOTES_2,
        };

        form.setFieldsValue(formValues);

        let processedImages = [];

        if (data.IMAGES && Array.isArray(data.IMAGES) && data.IMAGES.length > 0) {

          processedImages = data.IMAGES.map((img, index) => {
            const imageId = img.ID || img.id || img.imageId;
            const imageName = img.NAME || img.name || img.FILENAME || img.fileName || `image-${index + 1}.jpg`;

            if (!imageId) {
              console.error('No imageId found for image:', img);
              return null;
            }

            let imageUrl;
            if (img.URL || img.url) {
              imageUrl = img.URL || img.url;
            } else if (imageId) {
              imageUrl = `${process.env.REACT_APP_BASE_URL}/material-certification/image/${certificationId}/${imageId}?t=${Date.now()}`;
            }

            if (!imageUrl) {
              console.error('No URL generated for image:', img);
              return null;
            }

            const processedImage = {
              id: imageId,
              ID: imageId,
              url: imageUrl,
              URL: imageUrl,
              name: imageName,
              NAME: imageName,
              FILENAME: imageName,
              size: img.SIZE || img.size,
              SIZE: img.SIZE || img.size,
              type: img.TYPE || img.type || img.imageType,
              TYPE: img.TYPE || img.type || img.imageType,
              createdDate: img.CREATED_DATE || img.createdDate
            };

            return processedImage;
          }).filter(Boolean);

        } else {
          console.log('=== DEBUG: No images found ===');
        }

        setImages(processedImages);

        // Set progress form values
        const progressFormValues = {
          // Dữ liệu tiến độ
          PERSON_IN_CHARGE: data.PERSON_IN_CHARGE || undefined,
          START_DATE: data.START_DATE ? moment(data.START_DATE) : null,
          PD5_REPORT_DEADLINE: data.PD5_REPORT_DEADLINE ? moment(data.PD5_REPORT_DEADLINE) : null,
          COMPLETION_DEADLINE: data.COMPLETION_DEADLINE ? moment(data.COMPLETION_DEADLINE) : null,
          ACTUAL_COMPLETION_DATE: data.ACTUAL_COMPLETION_DATE ? moment(data.ACTUAL_COMPLETION_DATE) : null,
          PD5_REPORT_ACTUAL_DATE: data.PD5_REPORT_ACTUAL_DATE ? moment(data.PD5_REPORT_ACTUAL_DATE) : null,
          PROGRESS_ID: data.PROGRESS_ID || undefined,
          TOTAL_TIME: data.TOTAL_TIME || undefined,
          PP_SIMILAR: data.PP_SIMILAR || undefined,

          // Dữ liệu từ certification form
          MATERIAL_NAME: data.MATERIAL_NAME,
          MATERIAL_CLASS_ID: data.MATERIAL_CLASS_ID,
          LAYER_STRUCTURE: data.LAYER_STRUCTURE,
          RELIABILITY_LEVEL_ID: data.RELIABILITY_LEVEL_ID,
          USAGE: data.USAGE,
          MANUFACTURER_NAME: data.MANUFACTURER_NAME,
          FACTORY_LOCATION: data.FACTORY_LOCATION,
          MATERIAL_PROPERTY1_ID: data.MATERIAL_PROPERTY1_ID,
          MATERIAL_PROPERTY2_ID: data.MATERIAL_PROPERTY2_ID,
          MATERIAL_PROPERTY3_ID: data.MATERIAL_PROPERTY3_ID,
          MATERIAL_STATUS: data.MATERIAL_STATUS,
          UL_CERT_STATUS: data.UL_CERT_STATUS,
          EXPECTED_PRODUCTION_QTY: data.EXPECTED_PRODUCTION_QTY,
          MASS_PRODUCTION_DATE: data.MASS_PRODUCTION_DATE ? moment(data.MASS_PRODUCTION_DATE) : null,
          MATERIAL_CERT_EXPECTED: data.MATERIAL_CERT_EXPECTED ? moment(data.MATERIAL_CERT_EXPECTED) : null,
          RELEASE_DATE: data.RELEASE_DATE ? moment(data.RELEASE_DATE) : null,
          FACTORY_NAME: data.FACTORY_NAME,
          REQUEST_REASON: data.REQUEST_REASON,
          DEPARTMENT_IN_CHARGE: data.DEPT_ID || data.DEPARTMENT_IN_CHARGE || data.DEPT_NAME || undefined, 
          NOTES_1: data.NOTES_1,
          NOTES_2: data.NOTES_2,
        };
        progressForm.setFieldsValue(progressFormValues);
      } else {
        console.error('=== DEBUG: API call failed ===');
      }
    } catch (error) {
      console.error('=== DEBUG: Error loading certification data ===');
      console.error('Error:', error);
      toast.error('Lỗi khi tải dữ liệu chứng nhận');
    } finally {
      setLoading(false);
      setImagesLoading(false);
    }
  };

// Fixed onFinish function - merge với progress form data
const onFinish = async (values) => {
  try {
    setLoading(true);
    
    // Lấy dữ liệu hiện tại từ progress form
    const progressData = progressForm.getFieldsValue();
    
    // Format dates for API - mapping đúng tên field
    const formattedValues = {
      // Dữ liệu từ certification form
      releaseDate: values.RELEASE_DATE ? values.RELEASE_DATE.format('YYYY-MM-DD') : null,
      factoryName: values.FACTORY_NAME,
      requestReason: values.REQUEST_REASON,
      layerStructure: values.LAYER_STRUCTURE,
      usage: values.USAGE,
      reliabilityLevelId: values.RELIABILITY_LEVEL_ID,
      expectedProductionQty: values.EXPECTED_PRODUCTION_QTY,
      massProductionDate: values.MASS_PRODUCTION_DATE ? values.MASS_PRODUCTION_DATE.format('YYYY-MM-DD') : null,
      materialCertExpected: values.MATERIAL_CERT_EXPECTED ? values.MATERIAL_CERT_EXPECTED.format('YYYY-MM-DD') : null,
      manufacturerName: values.MANUFACTURER_NAME,
      factoryLocation: values.FACTORY_LOCATION,
      materialName: values.MATERIAL_NAME,
      materialClassId: values.MATERIAL_CLASS_ID,
      materialProperty1Id: values.MATERIAL_PROPERTY1_ID,
      materialProperty2Id: values.MATERIAL_PROPERTY2_ID,
      materialProperty3Id: values.MATERIAL_PROPERTY3_ID,
      materialStatusId: values.MATERIAL_STATUS,
      ulStatusId: values.UL_CERT_STATUS,
      notes1: values.NOTES_1,
      notes2: values.NOTES_2,
      
      // Merge dữ liệu từ progress form để không bị mất
      personInCharge: progressData.PERSON_IN_CHARGE,
      departmentInCharge: progressData.DEPARTMENT_IN_CHARGE,
      startDate: progressData.START_DATE ? progressData.START_DATE.format('YYYY-MM-DD') : null,
      pd5ReportDeadline: progressData.PD5_REPORT_DEADLINE ? progressData.PD5_REPORT_DEADLINE.format('YYYY-MM-DD') : null,
      completionDeadline: progressData.COMPLETION_DEADLINE ? progressData.COMPLETION_DEADLINE.format('YYYY-MM-DD') : null,
      actualCompletionDate: progressData.ACTUAL_COMPLETION_DATE ? progressData.ACTUAL_COMPLETION_DATE.format('YYYY-MM-DD') : null,
      pd5ReportActualDate: progressData.PD5_REPORT_ACTUAL_DATE ? progressData.PD5_REPORT_ACTUAL_DATE.format('YYYY-MM-DD') : null,
      progress: progressData.PROGRESS_ID,
      totalTime: progressData.TOTAL_TIME,
    };

    const response = await updateMaterialCertification(certificationId, formattedValues);

    if (response.success) {
      toast.success('Lưu thông tin thành công!');
      // Cập nhật progress form với dữ liệu mới từ certification form
      const currentProgressValues = progressForm.getFieldsValue();
      progressForm.setFieldsValue({
        ...currentProgressValues,
        MATERIAL_NAME: values.MATERIAL_NAME,
        MATERIAL_CLASS_ID: values.MATERIAL_CLASS_ID,
        LAYER_STRUCTURE: values.LAYER_STRUCTURE,
        RELIABILITY_LEVEL_ID: values.RELIABILITY_LEVEL_ID,
        NOTES_1: values.NOTES_1,
      });
    } else {
      toast.error(response.message || 'Lưu thất bại');
    }
  } catch (error) {
    console.error('Error saving certification:', error);
    toast.error('Lỗi khi lưu thông tin: ' + (error.response?.data?.message || error.message));
  } finally {
    setLoading(false);
  }
};

// Fixed onProgressFinish function - merge với certification form data  
const onProgressFinish = async (values) => {
  try {
    setLoading(true);
    
    // Lấy dữ liệu hiện tại từ certification form
    const certificationData = form.getFieldsValue();
    
    const formattedValues = {
      personInCharge: values.PERSON_IN_CHARGE,
      departmentInCharge: values.DEPARTMENT_IN_CHARGE,
      startDate: values.START_DATE ? values.START_DATE.format('YYYY-MM-DD') : null,
      pd5ReportDeadline: values.PD5_REPORT_DEADLINE ? values.PD5_REPORT_DEADLINE.format('YYYY-MM-DD') : null,
      completionDeadline: values.COMPLETION_DEADLINE ? values.COMPLETION_DEADLINE.format('YYYY-MM-DD') : null,
      actualCompletionDate: values.ACTUAL_COMPLETION_DATE ? values.ACTUAL_COMPLETION_DATE.format('YYYY-MM-DD') : null,
      pd5ReportActualDate: values.PD5_REPORT_ACTUAL_DATE ? values.PD5_REPORT_ACTUAL_DATE.format('YYYY-MM-DD') : null,
      progress: values.PROGRESS_ID,
      totalTime: values.TOTAL_TIME,
      materialName: values.MATERIAL_NAME,
      materialClassId: values.MATERIAL_CLASS_ID,
      layerStructure: values.LAYER_STRUCTURE,
      reliabilityLevelId: values.RELIABILITY_LEVEL_ID,
      notes1: values.NOTES_1,
      releaseDate: certificationData.RELEASE_DATE ? certificationData.RELEASE_DATE.format('YYYY-MM-DD') : null,
      factoryName: certificationData.FACTORY_NAME,
      requestReason: certificationData.REQUEST_REASON,
      usage: certificationData.USAGE,
      expectedProductionQty: certificationData.EXPECTED_PRODUCTION_QTY,
      massProductionDate: certificationData.MASS_PRODUCTION_DATE ? certificationData.MASS_PRODUCTION_DATE.format('YYYY-MM-DD') : null,
      materialCertExpected: certificationData.MATERIAL_CERT_EXPECTED ? certificationData.MATERIAL_CERT_EXPECTED.format('YYYY-MM-DD') : null,
      manufacturerName: certificationData.MANUFACTURER_NAME,
      factoryLocation: certificationData.FACTORY_LOCATION,
      materialProperty1Id: certificationData.MATERIAL_PROPERTY1_ID,
      materialProperty2Id: certificationData.MATERIAL_PROPERTY2_ID,
      materialProperty3Id: certificationData.MATERIAL_PROPERTY3_ID,
      materialStatusId: certificationData.MATERIAL_STATUS,
      ulStatusId: certificationData.UL_CERT_STATUS,
      notes2: certificationData.NOTES_2,
    };

    const response = await updateMaterialCertification(certificationId, formattedValues);

    if (response.success) {
      toast.success('Lưu tiến độ thành công!');
      // Đồng bộ dữ liệu sang certification form nếu có thay đổi
      const currentCertValues = form.getFieldsValue();
      form.setFieldsValue({
        ...currentCertValues,
        MATERIAL_NAME: values.MATERIAL_NAME,
        MATERIAL_CLASS_ID: values.MATERIAL_CLASS_ID,
        LAYER_STRUCTURE: values.LAYER_STRUCTURE,
        RELIABILITY_LEVEL_ID: values.RELIABILITY_LEVEL_ID,
        NOTES_1: values.NOTES_1,
      });
    } else {
      toast.error(response.message || 'Lưu tiến độ thất bại');
    }
  } catch (error) {
    console.error('Error saving progress:', error);
    toast.error('Lỗi khi lưu tiến độ: ' + (error.response?.data?.message || error.message));
  } finally {
    setLoading(false);
  }
};

  const handleExportExcel = async () => {
    if (!certificationId) {
      message.error('Không tìm thấy ID certification');
      return;
    }

    setExportLoading(true);
    try {
      const response = await exportCertificationForm(certificationId);

      if (response.success) {
        toast.success(response.message || 'Xuất file Excel thành công!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất file: ' + (error.response?.data?.message || error.message));
    } finally {
      setExportLoading(false);
    }
  };

  // Hàm xử lý khi images thay đổi từ ImageUploadComponent
  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0 }}>
            Quản lý chứng nhận vật liệu
          </Title>

          {/* Export Excel Button */}
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            loading={exportLoading}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Xuất Excel
          </Button>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: '24px' }}
          >
            <TabPane
              tab={
                <span style={{
                  backgroundColor: activeTab === 'certification' ? '#e29a51ff' : '#ddd',
                  color: activeTab === 'certification' ? 'white' : '#666',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  Biểu yêu cầu chứng nhận
                </span>
              }
              key="certification"
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{}}
              >
                <Divider orientation="left">Thông tin yêu cầu</Divider>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="RELEASE_DATE"
                      label="Ngày phát hành"
                      rules={[{ required: true, message: 'Vui lòng chọn ngày phát hành' }]}
                    >
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="FACTORY_NAME"
                      label="Nhà máy yêu cầu"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="REQUEST_REASON"
                      label="Lý do yêu cầu"
                    >
                      <TextArea rows={1} />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">Thông tin vật liệu</Divider>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="LAYER_STRUCTURE"
                      label="Cấu tạo lớp"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="USAGE"
                      label="Ứng dụng"
                    >
                      <TextArea rows={1} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="RELIABILITY_LEVEL_ID"
                      label="Mức độ tin cậy"
                    >
                      <Select placeholder="Chọn mức độ tin cậy" allowClear>
                        {options.reliabilityLevel?.map(item => (
                          <Select.Option key={item.id} value={item.id}>
                            {item.nameVi} ({item.nameJp})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="EXPECTED_PRODUCTION_QTY"
                      label="Sản lượng dự kiến"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="MASS_PRODUCTION_DATE"
                      label="Ngày dự kiến hàng loạt"
                    >
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="MATERIAL_CERT_EXPECTED"
                      label="Ngày mong muốn nhận chứng nhận"
                    >
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">Thông tin nhà sản xuất</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="MANUFACTURER_NAME"
                      label="Tên nhà sản xuất"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="FACTORY_LOCATION"
                      label="Nhà máy sản xuất"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="MATERIAL_NAME"
                      label="Tên vật liệu"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="MATERIAL_CLASS_ID"
                      label="Phân loại vật liệu"
                    >
                      <Select placeholder="Chọn phân loại vật liệu" allowClear>
                        {options.materialClass?.map(item => (
                          <Select.Option key={item.id} value={item.id}>
                            {item.nameVi} ({item.nameJp})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="MATERIAL_STATUS"
                      label="Trạng thái vật liệu"
                    >
                      <Select placeholder="Chọn trạng thái vật liệu" allowClear>
                        {options.materialStatus?.map(item => (
                          <Select.Option key={item.id} value={item.id}>
                            {item.nameVi} ({item.nameJp})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="MATERIAL_PROPERTY1_ID"
                      label="Thuộc tính 1"
                    >
                      <Select placeholder="Chọn thuộc tính 1" allowClear>
                        {options.materialProperty1?.map(item => (
                          <Select.Option key={item.id} value={item.id}>
                            {item.nameVi} ({item.nameJp})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="MATERIAL_PROPERTY2_ID"
                      label="Thuộc tính 2"
                    >
                      <Select placeholder="Chọn thuộc tính 2" allowClear>
                        {options.materialProperty2?.map(item => (
                          <Select.Option key={item.id} value={item.id}>
                            {item.nameVi} ({item.nameJp})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="MATERIAL_PROPERTY3_ID"
                      label="Thuộc tính 3"
                    >
                      <Select placeholder="Chọn thuộc tính 3" allowClear>
                        {options.materialProperty3?.map(item => (
                          <Select.Option key={item.id} value={item.id}>
                            {item.nameVi} ({item.nameJp})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="UL_CERT_STATUS"
                      label="Trạng thái chứng nhận UL"
                    >
                      <Select placeholder="Chọn trạng thái UL" allowClear>
                        {options.ulStatus?.map(item => (
                          <Select.Option key={item.id} value={item.id}>
                            {item.nameVi} ({item.nameJp})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">Ghi chú</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="NOTES_1"
                      label="Ghi chú 1"
                    >
                      <TextArea rows={4} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="NOTES_2"
                      label="Ghi chú 2"
                    >
                      <TextArea rows={4} />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span>Hình ảnh chứng nhận ({images.length} ảnh)</span>
                  </div>
                </Divider>

                <Row justify="center" style={{ marginBottom: '24px' }}>
                  <Col span={24}>
                    <div style={{
                      width: '100%',
                      padding: '24px',
                      background: '#fafafa',
                      borderRadius: '8px',
                      border: '1px dashed #d9d9d9'
                    }}>
                      {imagesLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                          <div style={{ fontSize: '16px', marginBottom: '8px' }}>Đang tải ảnh...</div>
                        </div>
                      ) : (
                        <ImageUploadComponent
                          certificationId={certificationId}
                          images={images}
                          onImagesChange={handleImagesChange}
                        />
                      )}

                      {!imagesLoading && images.length === 0 && (
                        <div style={{
                          textAlign: 'center',
                          color: '#999',
                          marginTop: '16px',
                          fontSize: '14px'
                        }}>
                          Chưa có ảnh nào được upload. Nhấn vào nút "Thêm ảnh" để bắt đầu.
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>

                <Row justify="end" style={{ marginTop: '24px' }}>
                  <Button type="default" onClick={() => navigate(-1)} style={{ marginRight: '8px' }}>
                    Quay lại
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Lưu thay đổi
                  </Button>
                </Row>
              </Form>
            </TabPane>

            <TabPane
              tab={
                <span style={{
                  backgroundColor: activeTab === 'progress' ? '#e29a51ff' : '#ddd',
                  color: activeTab === 'progress' ? 'white' : '#666',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  Tiến độ chứng nhận
                </span>
              }
              key="progress"
            >
              {/* Progress Form */}
              <Form
                form={progressForm}
                layout="vertical"
                onFinish={onProgressFinish}
                initialValues={{}}
              >
                {/* Progress Status Section */}
                <div style={{ backgroundColor: '#f0f8ff', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="MATERIAL_NAME"
                        label="Tên vật liệu"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="MATERIAL_CLASS_ID"
                        label="Phân loại vật liệu"
                      >
                        <Select placeholder="Chọn phân loại vật liệu" allowClear>
                          {options.materialClass?.map(item => (
                            <Select.Option key={item.id} value={item.id}>
                              {item.nameVi} ({item.nameJp})
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="LAYER_STRUCTURE"
                        label="Cấu tạo lớp"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="RELIABILITY_LEVEL_ID"
                        label="Mức độ tin cậy"
                      >
                        <Select placeholder="Chọn mức độ tin cậy" allowClear>
                          {options.reliabilityLevel?.map(item => (
                            <Select.Option key={item.id} value={item.id}>
                              {item.nameVi} ({item.nameJp})
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <div style={{ backgroundColor: '#f0f8ff', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="PROGRESS_ID" label="Tiến độ">
                        <Select placeholder="Chọn trạng thái tiến độ" allowClear>
                          {options.progress?.map(item => (
                            <Select.Option key={item.status_id} value={item.status_id}>
                              {item.status_name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="PERSON_IN_CHARGE"
                        label="Người phụ trách"
                      >
                        <Input placeholder="hung.nguyencong1" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="DEPARTMENT_IN_CHARGE"
                        label="Bộ phận phụ trách"
                      >
                        <Select placeholder="Chọn bộ phận phụ trách" allowClear showSearch
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }>
                          {options.department?.map(item => (
                            <Select.Option key={item.dept_id} value={item.dept_id}>
                              {item.dept_code} - {item.dept_name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                {/* Department and Person Section */}
                <Divider orientation="left">Phân công thực hiện</Divider>
                <Row gutter={16} style={{ backgroundColor: '#e6f7ff', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <Col span={12}>
                    <Form.Item
                      name="START_DATE"
                      label="Ngày bắt đầu"
                    >
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="10/16/2024" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="PD5_REPORT_DEADLINE"
                      label="Kì hạn gửi báo cáo tới PD5"
                    >
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="7/2/2025" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Timeline Section */}
                <Divider orientation="left">Thời gian thực hiện</Divider>
                <Row gutter={16} style={{ backgroundColor: '#f0f8ff', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <Col span={8}>
                    <Form.Item
                      name="COMPLETION_DEADLINE"
                      label="Kì hạn hoàn thành"
                    >
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="8/2/2025" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="ACTUAL_COMPLETION_DATE"
                      label="Ngày hoàn thành thực tế"
                    >
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="PD5_REPORT_ACTUAL_DATE"
                      label="Ngày gửi báo cáo tới PD5 thực tế"
                    >
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                </Row>


                <Row gutter={16} style={{ backgroundColor: '#fff1f0', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <Col span={24}>
                    <Form.Item
                      name="NOTES_1"
                      label="Ghi chú 1"
                    >
                      <TextArea rows={4} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row justify="end" style={{ marginTop: '24px' }}>
                  <Button type="default" onClick={() => navigate(-1)} style={{ marginRight: '8px' }}>
                    Quay lại
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Lưu tiến độ
                  </Button>
                </Row>
              </Form>
            </TabPane>

            <TabPane
              tab={
                <span style={{
                  backgroundColor: activeTab === 'pd5-time' ? '#e29a51ff' : '#ddd',
                  color: activeTab === 'pd5-time' ? 'white' : '#666',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  Thời gian thao tác QL2
                </span>
              }
              key="pd5-time"
            >
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Title level={4}>Thời gian thao tác QL2</Title>
                <p>Nội dung tab này sẽ được phát triển thêm...</p>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default CertificationForm;