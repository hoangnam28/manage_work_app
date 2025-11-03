import axiosInstance from './axiosConfig';

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
  
  return url;
};

export const listCertificationImages = async (certificationId) => {
  try {
    if (!certificationId) {
      throw new Error('Cần có ID certification để lấy danh sách ảnh');
    }
    
    console.log('Fetching images for certification:', certificationId);
    
    const response = await axiosInstance.get(`/material-certification/images/${certificationId}`);
    
    console.log('Images list response:', response.data);
    
    if (response.data && response.data.images) {
      response.data.images = response.data.images.map(image => ({
        ...image,
        url: image.url || getCertificationImageUrl(certificationId, image.id || image.imageId)
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error listing certification images:', error);
    throw error;
  }
};

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

export const fetchMaterialCertificationDetail = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }
    const response = await axiosInstance.get(`/material-certification/${id}`);
    console.log('Certification detail response:', response.data);
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

export const fetchMaterialCertificationList = async (params = {}) => {
  try {
    console.log('[FE][UL-CERT][LIST] params:', params);
    // Pass all params through to backend so filters (e.g. PROGRESS) are handled server-side
    const response = await axiosInstance.get('/material-certification/list-ul', {
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        // spread any additional filters (e.g. PROGRESS, MATERIAL_NAME, etc.)
        ...Object.keys(params).reduce((acc, key) => {
          if (key !== 'page' && key !== 'pageSize') acc[key] = params[key];
          return acc;
        }, {})
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
    console.log('=== API: createMaterialCertification START ===');
    console.log('📤 API: Input data:', data);
    
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
    // Validation
    if (!response.data) {
      console.error('❌ API: No response.data!');
      throw new Error('No response data from server');
    }
    
    if (!response.data.success) {
      console.error('❌ API: Request not successful');
      throw new Error(response.data.message || 'Request failed');
    }
    
    if (!response.data.data || typeof response.data.data.id === 'undefined') {
      console.error('❌ API: No ID in response!');
      console.error('Full response.data:', JSON.stringify(response.data, null, 2));
      throw new Error('No certification ID returned from server');
    }

    
    return response.data;
    
  } catch (error) {
    console.error('❌ API: Error in createMaterialCertification');
    console.error('Error object:', error);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request (no response):', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
};

export const uploadCertificationImages = async (certificationId, files) => {
  try {
    if (!certificationId || !files || files.length === 0) {
      throw new Error('Thiếu ID hoặc file để upload');
    }
    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      console.log(`📎 API: File ${index + 1}:`, {
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type
      });
      formData.append('images', file);
    });
    
    console.log('⏳ API: Uploading images...');
    
    const response = await axiosInstance.post(
      `/material-certification/upload-images/${certificationId}`, 
      formData, 
      {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        },
        timeout: 60000 
      }
    );
    
    return response.data;
    
  } catch (error) {
    console.error('Error:', error);
    
    if (error.response) {
      console.error('Upload error response:', error.response.data);
    }
    
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
      progress: data.PROGRESS_ID ?? data.progress,
      departmentInCharge: data.DEPARTMENT_IN_CHARGE ?? data.departmentInCharge,
      personInCharge: data.PERSON_IN_CHARGE ?? data.personInCharge,
      startDate: data.START_DATE ?? data.startDate,
      pd5ReportDeadline: data.PD5_REPORT_DEADLINE ?? data.pd5ReportDeadline,
      completionDeadline: data.COMPLETION_DEADLINE ?? data.completionDeadline,
      actualCompletionDate: data.ACTUAL_COMPLETION_DATE ?? data.actualCompletionDate,
      pd5ReportActualDate: data.PD5_REPORT_ACTUAL_DATE ?? data.pd5ReportActualDate,
      factoryCertReady: data.FACTORY_CERT_READY ?? data.factoryCertReady,
      factoryCertStatus: data.FACTORY_CERT_STATUS ?? data.factoryCertStatus,
      factoryLevel: data.FACTORY_LEVEL ?? data.factoryLevel,
      priceRequest: data.PRICE_REQUEST ?? data.priceRequest,
      reportLink: data.REPORT_LINK ?? data.reportLink,
      materialName: data.MATERIAL_NAME ?? data.materialName,
      layerStructure: data.LAYER_STRUCTURE ?? data.layerStructure,
      notes1: data.NOTES_1 ?? data.notes1,
    };

    const cleanData = {};
    Object.keys(formattedData).forEach(key => {
      if (key !== key.toUpperCase()) { 
        cleanData[key] = formattedData[key];
      }
    });

    console.log('🔄 Formatted data for update:', cleanData);

    const response = await axiosInstance.put(`/material-certification/update/${id}`, cleanData);
    return response.data;
  } catch (error) {
    console.error('Error updating UL certification:', error);
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
    
    const response = await axiosInstance.post(`/material-certification/export/excel`, {
      ids: [certificationId]
    }, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CertificationForm_${new Date().toISOString().split('T')[0]}.xlsx`);
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

/**
 * Lấy lịch sử thay đổi của một certification
 */
export const fetchCertificationHistory = async (certificationId) => {
  try {
    if (!certificationId) {
      throw new Error('ID certification không hợp lệ');
    }
    
    console.log('📜 Fetching history for certification:', certificationId);
    
    const response = await axiosInstance.get(
      `/material-certification/${certificationId}/history`
    );
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Lỗi khi lấy lịch sử');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching certification history:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Lỗi khi lấy lịch sử');
    }
    throw error;
  }
};

// Thêm vào utils/material-certification-api.js

/**
 * TKSX phê duyệt yêu cầu
 * Chuyển từ "Đang xác nhận yêu cầu" (1) -> "Đang lập kế hoạch" (2)
 */
export const tksxApproveCertification = async (certificationId) => {
  try {
    if (!certificationId) {
      throw new Error('ID certification không hợp lệ');
    }
    
    console.log('📝 TKSX approving certification:', certificationId);
    
    const response = await axiosInstance.post(
      `/material-certification/approve/${certificationId}/tksx`
    );
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Lỗi khi phê duyệt');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error in TKSX approval:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Lỗi khi phê duyệt');
    }
    throw error;
  }
};

/**
 * QL2 phê duyệt kế hoạch
 * Chuyển từ "Đang lập kế hoạch" (2) -> "Đang đánh giá" (3)
 */
export const ql2ApproveCertification = async (certificationId) => {
  try {
    if (!certificationId) {
      throw new Error('ID certification không hợp lệ');
    }
        
    const response = await axiosInstance.post(
      `/material-certification/approve/${certificationId}/ql2`
    );
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Lỗi khi phê duyệt');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error in QL2 approval:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Lỗi khi phê duyệt');
    }
    throw error;
  }
};

export const softDeleteCertification = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }

    console.log('🗑️ Soft deleting certification:', id);

    const response = await axiosInstance.delete(`/material-certification/${id}`);

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Lỗi khi xóa certification');
    }

    console.log('✅ Soft delete successful:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Error soft deleting certification:', error);
    
    if (error.response) {
      throw new Error(error.response.data?.message || 'Lỗi khi xóa certification');
    }
    
    throw error;
  }
};