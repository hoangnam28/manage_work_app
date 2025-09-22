import axiosInstance from './axiosConfig';

// Get image URL by certificationId and imageId - FIXED VERSION
export const getCertificationImageUrl = (certificationId, imageId) => {
  if (!certificationId || !imageId) {
    console.warn('Missing certificationId or imageId for image URL generation');
    return null;
  }
  
  const certId = parseInt(certificationId);
  const imgId = parseInt(imageId);
  
  if (isNaN(certId) || isNaN(imgId)) {
    console.warn('Invalid certificationId or imageId:', certificationId, imageId);
    return null;
  }
  
  const baseURL = axiosInstance.defaults.baseURL || '';
  const url = `${baseURL}/material-certification/image/${certId}/${imgId}`;
  
  console.log('Generated image URL:', url);
  return url;
};


// Upload multiple images - IMPROVED VERSION
export const uploadCertificationImages = async (certificationId, files) => {
  try {
    if (!certificationId || !files || files.length === 0) {
      throw new Error('Thiếu ID hoặc file để upload');
    }
    
    console.log('Uploading images for certification:', certificationId);
    console.log('Files to upload:', files.length);
    
    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      console.log(`Adding file ${index}:`, file.name, file.size);
      formData.append('images', file);
    });
    
    const response = await axiosInstance.post(`/material-certification/upload-images/${certificationId}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
      timeout: 60000 // 60 seconds timeout for large uploads
    });
    
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading certification images:', error);
    throw error;
  }
};

// Get all images for a certification - IMPROVED VERSION
export const listCertificationImages = async (certificationId) => {
  try {
    if (!certificationId) {
      throw new Error('Cần có ID certification để lấy danh sách ảnh');
    }
    
    console.log('Fetching images for certification:', certificationId);
    
    const response = await axiosInstance.get(`/material-certification/images/${certificationId}`);
    
    console.log('Images list response:', response.data);
    
    // Ensure images array exists and has proper URLs
    if (response.data && response.data.images) {
      response.data.images = response.data.images.map(image => ({
        ...image,
        // Ensure URL is properly formatted
        url: image.url || getCertificationImageUrl(certificationId, image.id || image.imageId)
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error listing certification images:', error);
    throw error;
  }
};

// Delete specific image by imageId
export const deleteCertificationImage = async (certificationId, imageId) => {
  try {
    if (!certificationId || !imageId) {
      throw new Error('Thiếu certification ID hoặc image ID');
    }
    
    console.log('Deleting image:', imageId, 'from certification:', certificationId);
    const response = await axiosInstance.delete(`/material-certification/image/${certificationId}/${imageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting certification image:', error);
    throw error;
  }
};

// Test image URL accessibility - NEW HELPER FUNCTION
export const testImageUrl = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      mode: 'cors'
    });
    return response.ok;
  } catch (error) {
    console.error('Image URL test failed:', imageUrl, error);
    return false;
  }
};

// Fetch certification detail with better image handling
export const fetchMaterialCertificationDetail = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }
    
    console.log('Fetching certification detail for ID:', id);
    const response = await axiosInstance.get(`/material-certification/${id}`);
    
    console.log('Certification detail response:', response.data);
    
    // If response includes images, ensure they have proper URLs
    if (response.data && response.data.images) {
      response.data.images = response.data.images.map(image => ({
        ...image,
        url: image.url || getCertificationImageUrl(id, image.id || image.imageId)
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching UL certification detail:', error);
    throw error;
  }
};

// Keep all other existing functions unchanged
export const fetchMaterialCertificationList = async (params = {}) => {
  try {
    console.log('[FE][UL-CERT][LIST] params:', params);
    const response = await axiosInstance.get('/material-certification/list-ul', {
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching UL certification list:', error);
    throw error;
  }
};

export const fetchMaterialCertificationOptions = async () => {
  try {
    const response = await axiosInstance.get('/material-certification/options');
    return response.data;
  } catch (error) {
    console.error('Error fetching UL certification options:', error);
    throw error;
  }
};

export const createMaterialCertification = async (data) => {
  try {
    const formattedData = {
      ...data,
      materialProperty1Id: data.materialProperty1Id ? Number(data.materialProperty1Id) : null,
      materialProperty2Id: data.materialProperty2Id ? Number(data.materialProperty2Id) : null,
      materialProperty3Id: data.materialProperty3Id ? Number(data.materialProperty3Id) : null,
      materialStatusId: data.materialStatusId ? Number(data.materialStatusId) : null,
      ulStatusId: data.ulStatusId ? Number(data.ulStatusId) : null,
      materialClassId: data.materialClassId ? Number(data.materialClassId) : null,
      reliabilityLevelId: data.reliabilityLevelId ? Number(data.reliabilityLevelId) : null,
    };

    const response = await axiosInstance.post('/material-certification/create', formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating UL certification:', error);
    throw error;
  }
};

export const updateMaterialCertification = async (id, data) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }

    const formattedData = {
      ...data,
      materialProperty1Id: data.materialProperty1Id ? Number(data.materialProperty1Id) : null,
      materialProperty2Id: data.materialProperty2Id ? Number(data.materialProperty2Id) : null,
      materialProperty3Id: data.materialProperty3Id ? Number(data.materialProperty3Id) : null,
      materialStatusId: data.materialStatusId ? Number(data.materialStatusId) : null,
      ulStatusId: data.ulStatusId ? Number(data.ulStatusId) : null,
      materialClassId: data.materialClassId ? Number(data.materialClassId) : null,
      reliabilityLevelId: data.reliabilityLevelId ? Number(data.reliabilityLevelId) : null,
    };

    const response = await axiosInstance.put(`/material-certification/update/${id}`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error updating UL certification:', error);
    throw error;
  }
};

export const deleteMaterialCertification = async (id) => {
  try {
    const response = await axiosInstance.delete(`/material-certification/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting UL certification:', error);
    throw error;
  }
};

export const exportMaterialCertification = async () => {
  try {
    const response = await axiosInstance.get('/material-certification/export', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting UL certification:', error);
    throw error;
  }
};

export const exportCertificationForm = async (certificationId) => {
  try {
    if (!certificationId) {
      throw new Error('Không tìm thấy ID certification');
    }
    const response = await axiosInstance.get(`/material-certification/export-form/${certificationId}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CertificationForm_${certificationId}_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    console.log('[FE][UL-CERT][EXPORT-FORM] download completed');
    return { success: true, message: 'Xuất file Excel thành công!' };
  } catch (error) {
    console.error('Error exporting certification form:', error);
    throw error;
  }
};

export const updateCertificationTotalTime = async (certificationId, totalTime) => {
  try {
    if (!certificationId) {
      throw new Error('ID không hợp lệ');
    }

    const response = await axiosInstance.put(`/material-certification/${certificationId}`, {
      totalTime: totalTime
    });

    return response.data;
  } catch (error) {
    console.error('Error updating certification total time:', error);
    throw error;
  }
};