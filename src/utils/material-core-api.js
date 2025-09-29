import axios from './axios';

export const fetchMaterialCoreList = async (params = {}) => {
  const token = localStorage.getItem('accessToken');
  const { page = 1, pageSize = 20, ...searchParams } = params;
    
  const queryParams = {
    page,
    pageSize,
    ...searchParams 
  };
  const response = await axios.get(`/material-core/list`, {
    headers: { Authorization: `Bearer ${token}` },
    params: queryParams
  });
  
  return response.data;
};


// Add new function to fetch all data for export
export const fetchAllMaterialCoreData = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`/material-core/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createMaterialCore = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(`/material-core/create`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateMaterialCore = async (id, data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.put(`/material-core/update/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteMaterialCore = async (id, data = {}) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.delete(`/material-core/delete/${id}`, {
    data: data,
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Updated export function to use all data or provided data
export const exportMaterialCore = async (data = null) => {
  const token = localStorage.getItem('accessToken');
  
  // Chuyển đổi key thường sang key viết hoa trước khi gửi sang backend export
  const normalizeKeys = (obj) => {
    const result = {};
    Object.keys(obj).forEach((key) => {
      result[key.toUpperCase()] = obj[key];
    });
    return result;
  };

  try {
    let exportData = data;
    
    // If no data provided, fetch all data from server
    if (!exportData) {
      const allData = await fetchAllMaterialCoreData();
      exportData = allData.data || allData;
    }
    
    // Nếu là mảng thì map, nếu không thì giữ nguyên
    const normalizedData = Array.isArray(exportData) ? exportData.map(normalizeKeys) : exportData;
    
    const response = await axios.post(
      `/material-core/export-xlsm`,
      { data: normalizedData },
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', 
      }
    );
    return response;
  } catch (error) {
    console.error('Error in exportMaterialCore:', error);
    throw error;
  }
};

export const fetchMaterialCoreHistory = async (id) => {
  const token = localStorage.getItem('accessToken');
  try {
    const response = await axios.get(`/material-core-history/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};

// Import Excel file
export const importMaterialCoreExcel = async (file, additionalData = {}) => {
  try {
    const token = localStorage.getItem('accessToken'); // Fix: use consistent token key
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional form data if provided
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const response = await axios.post('/material-core/import-excel', formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.data;
    if (!result || !result.success) {
      throw new Error(result.message || 'Import failed');
    }

    return result;
  } catch (error) {
    console.error('Error importing Excel:', error);
    throw error;
  }
};

// Import Excel data (array)
export const importMaterialCoreData = async (data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post('/material-core/import-material-core', { data }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const exportMaterialCoreXml = async () => {
  const token = localStorage.getItem('accessToken');
  
  try {
    const response = await axios.get(`/material-core/export-xml`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', // Important: để nhận file blob
    });

    return response;
  } catch (error) {
    console.error('Error exporting XML:', error);
    throw error;
  }
};

export const downloadFile = (response, defaultFilename = 'download') => {
  try {
    // Lấy filename từ Content-Disposition header nếu có
    const contentDisposition = response.headers['content-disposition'];
    let filename = defaultFilename;
    
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, '');
      }
    }

    // Tạo blob URL và trigger download
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'application/octet-stream' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};