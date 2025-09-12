  import axiosInstance from './axiosConfig';

// Lấy danh sách UL Certification với phân trang và tìm kiếm
export const fetchUlCertificationList = async (params = {}) => {
  try {
    console.log('[FE][UL-CERT][LIST] params:', params);
    const response = await axiosInstance.get('/ul-certification/list-ul', {
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        // material_name: params.material_name || '',
      }
    });
    console.log('[FE][UL-CERT][LIST] status:', response.status);
    console.log('[FE][UL-CERT][LIST] payload keys:', Object.keys(response.data || {}));
    console.log('[FE][UL-CERT][LIST] totalRecords:', response.data?.totalRecords);
    console.log('[FE][UL-CERT][LIST] first row:', response.data?.data?.[0]);
    return response.data;
  } catch (error) {
    console.error('Error fetching UL certification list:', error);
    throw error;
  }
};

// Lấy options cho dropdown (Material Properties, Status, etc.)
export const fetchUlCertificationOptions = async () => {
  try {
    const response = await axiosInstance.get('/ul-certification/options');
    return response.data;
  } catch (error) {
    console.error('Error fetching UL certification options:', error);
    throw error;
  }
};

// Tạo mới UL Certification
export const createUlCertification = async (data) => {
  try {
    // Ensure all IDs are numbers or null
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

    const response = await axiosInstance.post('/ul-certification/create', formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating UL certification:', error);
    throw error;
  }
};

// Lấy chi tiết UL Certification theo ID
export const fetchUlCertificationDetail = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }
    
    console.log('[FE][UL-CERT][DETAIL] id:', id);
    const response = await axiosInstance.get(`/ul-certification/${id}`);
    console.log('[FE][UL-CERT][DETAIL] status:', response.status);
    console.log('[FE][UL-CERT][DETAIL] data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching UL certification detail:', error);
    throw error;
  }
};

// Cập nhật UL Certification
export const updateUlCertification = async (id, data) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }

    // Ensure all IDs are numbers or null
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

    const response = await axiosInstance.put(`/ul-certification/${id}`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error updating UL certification:', error);
    throw error;
  }
};

// Xóa UL Certification
export const deleteUlCertification = async (id) => {
  try {
    const response = await axiosInstance.delete(`/ul-certification/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting UL certification:', error);
    throw error;
  }
};

// Xuất Excel
export const exportUlCertification = async () => {
  try {
    const response = await axiosInstance.get('/ul-certification/export', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting UL certification:', error);
    throw error;
  }
};
