// CertificationForm.js - Phiên bản cải thiện
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Form, Input, DatePicker, Select, Button, Row, Col, Typography, Divider,
  Tabs, message
} from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import moment from 'moment';
import MainLayout from '../components/layout/MainLayout';
import { Toaster } from 'sonner';
import {
  fetchMaterialCertificationDetail,
  updateMaterialCertification,
  exportCertificationForm,
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
  const [imagesLoading, setImagesLoading] = useState(false); // Thêm loading state riêng cho images

  const certificationId = location.state?.certificationData?.ID || location.state?.certificationId;
  
  useEffect(() => {
    if (certificationId) {
      loadCertificationData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificationId]);

  // Thêm vào CertificationForm.js để debug
const loadCertificationData = async () => {
  try {
    setLoading(true);
    setImagesLoading(true);
    console.log('=== DEBUG: Loading certification data ===');
    console.log('Certification ID:', certificationId);

    const response = await fetchMaterialCertificationDetail(certificationId);
    console.log('=== DEBUG: Full API Response ===');
    console.log('Response:', response);
    console.log('Success:', response.success);
    console.log('Data:', response.data);
    
    if (response.success && response.data) {
      const data = response.data;
      
      // Debug images data
      console.log('=== DEBUG: Images Data ===');
      console.log('data.IMAGES:', data.IMAGES);
      console.log('data.IMAGE_NAME:', data.IMAGE_NAME);
      console.log('data.IMAGE_URL:', data.IMAGE_URL);
      console.log('data.FILENAME:', data.FILENAME);
      console.log('Array.isArray(data.IMAGES):', Array.isArray(data.IMAGES));
      console.log('IMAGES length:', data.IMAGES ? data.IMAGES.length : 'N/A');

      // Set form values (existing code)
      const formValues = {
        ...data,
        RELEASE_DATE: data.RELEASE_DATE ? moment(data.RELEASE_DATE) : null,
        MASS_PRODUCTION_DATE: data.MASS_PRODUCTION_DATE ? moment(data.MASS_PRODUCTION_DATE) : null,
        MATERIAL_CERT_EXPECTED: data.MATERIAL_CERT_EXPECTED ? moment(data.MATERIAL_CERT_EXPECTED) : null,
      };
      form.setFieldsValue(formValues);

      // Enhanced image processing with debug
      let processedImages = [];
      
      if (data.IMAGES && Array.isArray(data.IMAGES) && data.IMAGES.length > 0) {
        console.log('=== DEBUG: Processing IMAGES array ===');
        
        processedImages = data.IMAGES.map((img, index) => {
          console.log(`Processing image ${index}:`, img);
          
          const imageId = img.ID || img.id || img.imageId;
          const imageName = img.NAME || img.name || img.FILENAME || img.fileName || `image-${index + 1}.jpg`;
          
          console.log('Extracted imageId:', imageId);
          console.log('Extracted imageName:', imageName);
          
          if (!imageId) {
            console.error('No imageId found for image:', img);
            return null;
          }
          
          let imageUrl;
          if (img.URL || img.url) {
            imageUrl = img.URL || img.url;
            console.log('Using provided URL:', imageUrl);
          } else if (imageId) {
            imageUrl = `${process.env.REACT_APP_BASE_URL}/material-certification/image/${certificationId}/${imageId}?t=${Date.now()}`;
            console.log('Generated URL:', imageUrl);
          }
          
          if (!imageUrl) {
            console.error('No URL generated for image:', img);
            return null;
          }
          
          // Test if URL is accessible
          const testImage = new Image();
          testImage.onload = () => {
            console.log(`Image ${imageId} loaded successfully:`, imageUrl);
          };
          testImage.onerror = () => {
            console.error(`Image ${imageId} failed to load:`, imageUrl);
          };
          testImage.src = imageUrl;
          
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
          
          console.log(`Processed image ${index}:`, processedImage);
          return processedImage;
        }).filter(Boolean);
        
      } else if (data.IMAGE_NAME || data.IMAGE_URL || data.FILENAME) {
        console.log('=== DEBUG: Processing single image (legacy) ===');
        console.log('IMAGE_NAME:', data.IMAGE_NAME);
        console.log('IMAGE_URL:', data.IMAGE_URL);
        console.log('FILENAME:', data.FILENAME);
        
        const imageId = data.IMAGE_ID || 'legacy-image';
        let imageUrl;
        
        if (data.IMAGE_URL) {
          imageUrl = data.IMAGE_URL;
        } else {
          imageUrl = `${process.env.REACT_APP_BASE_URL}/material-certification/image/${certificationId}?t=${Date.now()}`;
        }
        
        console.log('Legacy image URL:', imageUrl);
        
        const singleImage = {
          id: imageId,
          ID: imageId,
          url: imageUrl,
          URL: imageUrl,
          name: data.IMAGE_NAME || data.FILENAME || 'image.jpg',
          NAME: data.IMAGE_NAME || data.FILENAME || 'image.jpg',
          FILENAME: data.IMAGE_NAME || data.FILENAME || 'image.jpg',
          size: data.IMAGE_SIZE,
          SIZE: data.IMAGE_SIZE,
          type: 'image/jpeg',
          TYPE: 'image/jpeg'
        };
        
        console.log('Processed legacy image:', singleImage);
        processedImages = [singleImage];
      } else {
        console.log('=== DEBUG: No images found ===');
        console.log('Checking all possible image fields:');
        Object.keys(data).forEach(key => {
          if (key.toLowerCase().includes('image') || key.toLowerCase().includes('file')) {
            console.log(`${key}:`, data[key]);
          }
        });
      }

      console.log('=== DEBUG: Final processed images ===');
      console.log('Processed images count:', processedImages.length);
      console.log('Processed images:', processedImages);
      
      setImages(processedImages);

      // Set progress form values (existing code)
      progressForm.setFieldsValue({
        PERSON_IN_CHARGE: data.PERSON_IN_CHARGE || undefined,
        START_DATE: data.START_DATE ? moment(data.START_DATE) : null,
        PD5_REPORT_DEADLINE: data.PD5_REPORT_DEADLINE ? moment(data.PD5_REPORT_DEADLINE) : null,
        COMPLETION_DEADLINE: data.COMPLETION_DEADLINE ? moment(data.COMPLETION_DEADLINE) : null,
        ACTUAL_COMPLETION_DATE: data.ACTUAL_COMPLETION_DATE ? moment(data.ACTUAL_COMPLETION_DATE) : null,
        PD5_REPORT_ACTUAL_DATE: data.PD5_REPORT_ACTUAL_DATE ? moment(data.PD5_REPORT_ACTUAL_DATE) : null,
        PROGRESS_ID: data.PROGRESS_ID || undefined,
        TOTAL_TIME: data.TOTAL_TIME || undefined,
      });
    } else {
      console.error('=== DEBUG: API call failed ===');
      console.log('Response:', response);
    }
  } catch (error) {
    console.error('=== DEBUG: Error loading certification data ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    message.error('Lỗi khi tải dữ liệu chứng nhận');
  } finally {
    setLoading(false);
    setImagesLoading(false);
  }
};

useEffect(() => {
  if (certificationId) {
    loadCertificationData();
    
  }
  //eslint-disable-next-line react-hooks/exhaustive-deps
}, [certificationId]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      console.log('Saving certification form values:', values);

      // Format dates for API
      const formattedValues = {
        ...values,
        RELEASE_DATE: values.RELEASE_DATE ? values.RELEASE_DATE.format('YYYY-MM-DD') : null,
        MASS_PRODUCTION_DATE: values.MASS_PRODUCTION_DATE ? values.MASS_PRODUCTION_DATE.format('YYYY-MM-DD') : null,
        MATERIAL_CERT_EXPECTED: values.MATERIAL_CERT_EXPECTED ? values.MATERIAL_CERT_EXPECTED.format('YYYY-MM-DD') : null,
      };

      const response = await updateMaterialCertification(certificationId, formattedValues);

      if (response.success) {
        message.success('Lưu thông tin thành công!');
        // Không cần reload toàn bộ data, chỉ reload khi cần thiết
      } else {
        message.error(response.message || 'Lưu thất bại');
      }
    } catch (error) {
      console.error('Error saving certification:', error);
      message.error('Lỗi khi lưu thông tin: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const onProgressFinish = async (values) => {
    try {
      setLoading(true);
      console.log('Saving progress form values:', values);

      // Format dates for API
      const formattedValues = {
        ...values,
        START_DATE: values.START_DATE ? values.START_DATE.format('YYYY-MM-DD') : null,
        PD5_REPORT_DEADLINE: values.PD5_REPORT_DEADLINE ? values.PD5_REPORT_DEADLINE.format('YYYY-MM-DD') : null,
        COMPLETION_DEADLINE: values.COMPLETION_DEADLINE ? values.COMPLETION_DEADLINE.format('YYYY-MM-DD') : null,
        ACTUAL_COMPLETION_DATE: values.ACTUAL_COMPLETION_DATE ? values.ACTUAL_COMPLETION_DATE.format('YYYY-MM-DD') : null,
        PD5_REPORT_ACTUAL_DATE: values.PD5_REPORT_ACTUAL_DATE ? values.PD5_REPORT_ACTUAL_DATE.format('YYYY-MM-DD') : null,
        PD5_START_DATE: values.PD5_START_DATE ? values.PD5_START_DATE.format('YYYY-MM-DD') : null,
        PD5_END_DATE: values.PD5_END_DATE ? values.PD5_END_DATE.format('YYYY-MM-DD') : null,
      };

      const response = await updateMaterialCertification(certificationId, formattedValues);

      if (response.success) {
        message.success('Lưu tiến độ thành công!');
      } else {
        message.error(response.message || 'Lưu tiến độ thất bại');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      message.error('Lỗi khi lưu tiến độ: ' + (error.response?.data?.message || error.message));
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
      console.log('Exporting Excel for certification:', certificationId);
      const response = await exportCertificationForm(certificationId);

      if (response.success) {
        message.success(response.message || 'Xuất file Excel thành công!');
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Lỗi khi xuất file: ' + (error.response?.data?.message || error.message));
    } finally {
      setExportLoading(false);
    }
  };

  // Hàm xử lý khi images thay đổi từ ImageUploadComponent
  const handleImagesChange = (newImages) => {
    console.log('Images updated in parent component:', newImages);
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
                      name="RELIABILITY_LEVEL"
                      label="Mức độ tin cậy"
                    >
                      <Input />
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
                      <Select>
                        <Select.Option value="type1">Loại 1</Select.Option>
                        <Select.Option value="type2">Loại 2</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="MATERIAL_STATUS"
                      label="Trạng thái vật liệu"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="MATERIAL_PROPERTY1_ID"
                      label="Thuộc tính 1"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="MATERIAL_PROPERTY2_ID"
                      label="Thuộc tính 2"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="MATERIAL_PROPERTY3_ID"
                      label="Thuộc tính 3"
                    >
                      <Input />
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
                    <Col span={12}>
                      <Form.Item
                        name="PROGRESS_ID"
                        label="Tiến độ (ID)"
                      >
                        <Input placeholder="Nhập PROGRESS_ID" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="PERSON_IN_CHARGE"
                        label="Người phụ trách"
                      >
                        <Input placeholder="hung.nguyencong1" />
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

                {/* Time Management */}
                <Divider orientation="left">Quản lý thời gian</Divider>
                <Row gutter={16} style={{ backgroundColor: '#fff1f0', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <Col span={12}>
                    <Form.Item
                      name="TOTAL_TIME"
                      label="Tổng thời gian (phút)"
                    >
                      <Input type="number" placeholder="Nhập tổng thời gian" />
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