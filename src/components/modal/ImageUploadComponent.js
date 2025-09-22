
import React, { useState, useEffect } from 'react';
import { Upload, message, Image, Modal, Row, Col, Card, Button } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { uploadCertificationImages, deleteCertificationImage, getCertificationImageUrl } from '../../utils/material-certification-api';
import { toast } from 'sonner';

const ImageUploadComponent = ({ certificationId, images = [], onImagesChange }) => {
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [processedImages, setProcessedImages] = useState([]);

  // Process images when props change
  useEffect(() => {
    if (images && images.length > 0) {
      const processed = images.map((image, index) => {
        const imageId = image.id || image.imageId || image.ID;
        const imageName = image.name || image.fileName || image.NAME || image.FILENAME || `Image ${index + 1}`;
        
        // Generate URL if not provided
        let imageUrl = image.url || image.URL;
        if (!imageUrl && certificationId && imageId) {
          try {
            imageUrl = getCertificationImageUrl(certificationId, imageId);
            console.log('Generated image URL:', { imageId, certificationId, url: imageUrl });
          } catch (err) {
            console.error('Error generating image URL:', err);
            return null;
          }
        }
        
        if (!imageUrl) {
          console.error('No valid URL generated for image:', { imageId, certificationId });
          return null;
        }
        
        return {
          ...image,
          id: imageId,
          name: imageName,
          url: imageUrl,
          displayUrl: imageUrl,
          loadAttempts: 0,
          size: image.size || image.SIZE,
          type: image.type || image.TYPE || image.imageType
        };
      }).filter(Boolean);
      
      console.log('Processed images:', processed);
      setProcessedImages(processed);
    } else {
      setProcessedImages([]);
    }
  }, [images, certificationId]);

  const validateImageFile = (file) => {
    const isImage = file.type && file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ cho phép upload file ảnh (JPG, PNG, GIF, WEBP)!');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
      return false;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Chỉ hỗ trợ các định dạng: JPG, JPEG, PNG, GIF, WEBP!');
      return false;
    }
    return true;
  };

  const handleUpload = async (file) => {
    if (!certificationId) {
      toast.error('Vui lòng lưu certification trước khi upload ảnh');
      return false;
    }
    if (!validateImageFile(file)) return false;

    try {
      setLoading(true);
      console.log('Uploading file:', file.name, 'to certification:', certificationId);
      
      const response = await uploadCertificationImages(certificationId, [file]);
      console.log('Upload response:', response);

      if (response.success && response.images && response.images.length > 0) {
        const newImages = response.images.map(img => {
          console.log('Processing uploaded image:', img);
          
          const imageId = img.id || img.imageId || img.ID;
          const imageName = img.name || img.fileName || img.NAME || img.FILENAME || file.name;
          
          if (!imageId) {
            console.error('No imageId found in response:', img);
            return null;
          }
          
          const imageUrl = getCertificationImageUrl(certificationId, imageId);
          console.log('Generated URL for new image:', imageUrl);
          
          return {
            id: imageId,
            ID: imageId, // Thêm cả ID viết hoa để tương thích
            url: imageUrl,
            URL: imageUrl, // Thêm cả URL viết hoa để tương thích
            displayUrl: imageUrl,
            name: imageName,
            NAME: imageName, // Thêm cả NAME viết hoa để tương thích
            FILENAME: imageName,
            size: img.size || img.SIZE || file.size,
            SIZE: img.size || img.SIZE || file.size,
            type: img.type || img.TYPE || img.imageType || file.type,
            TYPE: img.type || img.TYPE || img.imageType || file.type,
            createdDate: img.createdDate || new Date().toISOString()
          };
        }).filter(Boolean);

        console.log('New images processed:', newImages);

        // Cập nhật state local ngay lập tức
        const updatedImages = [...images, ...newImages];
        
        // Cập nhật parent component
        if (onImagesChange) {
          onImagesChange(updatedImages);
        }

        toast.success(`Upload thành công ${response.images.length} ảnh`);
        return true;
      } else {
        const msg = response.message || 'Upload failed';
        throw new Error(msg);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Lỗi khi upload ảnh: ' + (err.message || err.toString()));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!certificationId || !imageId) {
      toast.error('Không tìm thấy thông tin ảnh để xóa');
      return;
    }

    try {
      setLoading(true);
      console.log('Deleting image:', imageId, 'from certification:', certificationId);
      
      const resp = await deleteCertificationImage(certificationId, imageId);
      console.log('Delete response:', resp);
      
      if (resp.success) {
        toast.success('Xóa ảnh thành công');
        
        // Cập nhật state ngay lập tức
        const updatedImages = images.filter(img => 
          (img.id || img.imageId || img.ID) !== imageId
        );
        
        if (onImagesChange) {
          onImagesChange(updatedImages);
        }
      } else {
        throw new Error(resp.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.error('Lỗi khi xóa ảnh: ' + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (imageUrl, imageName) => {
    console.log('Preview image:', imageUrl);
    if (!imageUrl) {
      message.error('Không tìm thấy URL ảnh');
      return;
    }
    
    setPreviewImage(imageUrl);
    setPreviewTitle(imageName || 'Xem trước ảnh');
    setPreviewVisible(true);
  };

  const handleCancel = () => {
    setPreviewVisible(false);
    setPreviewImage('');
    setPreviewTitle('');
  };

  const handleImageError = (image, index) => {
    console.error('Image load error:', {
      url: image.url,
      id: image.id,
      certificationId,
      attempts: image.loadAttempts,
      status: 'failed'
    });
    
    const MAX_RETRIES = 2;
    
    if (image.loadAttempts < MAX_RETRIES) {
      try {
        const newUrl = getCertificationImageUrl(certificationId, image.id);
        
        if (!newUrl) {
          console.error('Failed to generate new URL');
          return;
        }

        console.log('Retrying image load:', {
          attempt: image.loadAttempts + 1,
          newUrl,
          imageId: image.id
        });
        
        setProcessedImages(prev => 
          prev.map((img, idx) => 
            idx === index 
              ? { 
                  ...img, 
                  displayUrl: newUrl,
                  loadAttempts: (img.loadAttempts || 0) + 1
                }
              : img
          )
        );
      } catch (err) {
        console.error('Error during image retry:', err);
      }
    }
  };

  const getImageDisplayUrl = (image) => {
    // Thêm cache busting parameter để đảm bảo ảnh mới được load
    const baseUrl = image.displayUrl || image.url || image.URL;
    if (baseUrl && baseUrl.includes('?')) {
      return `${baseUrl}&t=${Date.now()}`;
    } else if (baseUrl) {
      return `${baseUrl}?t=${Date.now()}`;
    }
    return null;
  };

  return (
    <div style={{ marginTop: 16 }}>
      <Row gutter={[16, 16]}>
        {processedImages.map((image, index) => {
          const displayUrl = getImageDisplayUrl(image);
          const imageId = image.id || image.ID;
          
          return (
            <Col xs={12} sm={8} md={6} key={imageId || `img-${index}`}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: 200, 
                    overflow: 'hidden', 
                    backgroundColor: '#f5f5f5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {displayUrl ? (
                      <Image
                        src={displayUrl}
                        alt={image.name || image.NAME || `Image ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover', 
                          cursor: 'pointer' 
                        }}
                        preview={false}
                        onClick={() => handlePreview(displayUrl, image.name || image.NAME)}
                        onError={() => handleImageError(image, index)}
                        loading="lazy"
                        fallback={
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#999',
                            padding: 16,
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Không thể tải ảnh</div>
                            <div style={{ fontSize: 11 }}>{image.name || image.NAME || 'Unknown'}</div>
                            <div style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>
                              ID: {imageId}
                            </div>
                          </div>
                        }
                      />
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#999',
                        padding: 16,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>❌</div>
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Không có URL</div>
                        <div style={{ fontSize: 11 }}>{image.name || image.NAME || 'Unknown'}</div>
                      </div>
                    )}
                  </div>
                }
                actions={[
                  <Button 
                    key="view" 
                    type="text" 
                    icon={<EyeOutlined />} 
                    onClick={() => handlePreview(displayUrl, image.name || image.NAME)} 
                    title="Xem ảnh"
                    disabled={loading || !displayUrl}
                  >
                    Xem
                  </Button>,
                  <Button 
                    key="delete" 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleDelete(imageId)} 
                    loading={loading} 
                    title="Xóa ảnh"
                    disabled={loading}
                  >
                    Xóa
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: 'normal', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {image.name || image.NAME || `Ảnh ${index + 1}`}
                    </div>
                  }
                  description={
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      <div>ID: {imageId}</div>
                      <div>Size: {(image.size || image.SIZE) ? Math.round((image.size || image.SIZE) / 1024) + 'KB' : 'N/A'}</div>
                      <div>Type: {image.type || image.TYPE || 'N/A'}</div>
                      <div style={{ fontSize: '9px', color: '#ccc', marginTop: 4 }}>
                        {displayUrl ? 'URL: OK' : 'URL: Missing'}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          );
        })}

        <Col xs={12} sm={8} md={6}>
          <Upload
            showUploadList={false}
            beforeUpload={validateImageFile}
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                const ok = await handleUpload(file);
                if (ok) {
                  onSuccess(null, file);
                } else {
                  onError(new Error('Upload failed'));
                }
              } catch (err) {
                onError(err);
              }
            }}
            disabled={loading || !certificationId}
            accept="image/*"
          >
            <Card 
              hoverable 
              style={{ 
                height: 200, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                border: '2px dashed #d9d9d9', 
                backgroundColor: loading ? '#f0f0f0' : '#fafafa',
                cursor: loading || !certificationId ? 'not-allowed' : 'pointer',
                opacity: !certificationId ? 0.5 : 1
              }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', color: '#1890ff' }}>
                  <div>Đang upload...</div>
                </div>
              ) : !certificationId ? (
                <div style={{ textAlign: 'center', color: '#999' }}>
                  <div>Lưu certification</div>
                  <div>trước khi upload</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999' }}>
                  <UploadOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                  <div>Thêm ảnh</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Tối đa 5MB</div>
                </div>
              )}
            </Card>
          </Upload>
        </Col>
      </Row>

      <Modal 
        open={previewVisible} 
        title={previewTitle} 
        footer={null} 
        onCancel={handleCancel} 
        width="90%" 
        style={{ maxWidth: '1000px' }} 
        centered 
        destroyOnClose
      >
        {previewImage ? (
          <div style={{ textAlign: 'center' }}>
            <Image 
              src={previewImage} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '80vh' }} 
              onError={() => {
                console.error('Preview image failed to load:', previewImage);
                message.error('Không thể tải ảnh preview');
              }}
              fallback={
                <div style={{ 
                  height: 400, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: '#f5f5f5', 
                  color: '#999',
                  flexDirection: 'column'
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
                  <div>Không thể tải ảnh</div>
                  <div style={{ fontSize: 12, marginTop: 8, color: '#ccc' }}>
                    {previewImage}
                  </div>
                </div>
              }
            />
          </div>
        ) : (
          <div style={{ 
            height: 400, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: '#f5f5f5', 
            color: '#999' 
          }}>
            Không có ảnh để hiển thị
          </div>
        )}
      </Modal>

      {processedImages.length > 0 && (
        <div style={{ marginTop: 16, color: '#666', fontSize: 12 }}>
          <p>Đã upload: {processedImages.length} ảnh</p>
          <p>Định dạng hỗ trợ: JPG, JPEG, PNG, GIF, WEBP (tối đa 5MB/ảnh)</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadComponent;