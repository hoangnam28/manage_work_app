import axiosInstance from './axiosConfig';

// Get time tracking list for a certification
export const fetchTimeTrackingList = async (certificationId) => {
  try {
    if (!certificationId) {
      throw new Error('Certification ID không hợp lệ');
    }
    
    const response = await axiosInstance.get(`/time-tracking/certification/${certificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching time tracking list:', error);
    throw error;
  }
};

// Create new time tracking record
export const createTimeTracking = async (data) => {
  try {
    const formattedData = {
      certificationId: data.certificationId,
      personDo: data.personDo,
      personCheck: data.personCheck,
      startTime: data.startTime,
      endTime: data.endTime,
      timeDo: data.timeDo ? Number(data.timeDo) : null,
      timeCheck: data.timeCheck ? Number(data.timeCheck) : null,
      workDescription: data.workDescription,
      status: data.status || 'PENDING'
    };

    const response = await axiosInstance.post('/time-tracking/create', formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating time tracking:', error);
    throw error;
  }
};

// Update time tracking record
export const updateTimeTracking = async (id, data) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }

    const formattedData = {
      personDo: data.personDo,
      personCheck: data.personCheck,
      startTime: data.startTime,
      endTime: data.endTime,
      timeDo: data.timeDo ? Number(data.timeDo) : null,
      timeCheck: data.timeCheck ? Number(data.timeCheck) : null,
      workDescription: data.workDescription,
      status: data.status || 'PENDING'
    };

    const response = await axiosInstance.put(`/time-tracking/update/${id}`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error updating time tracking:', error);
    throw error;
  }
};

// Delete time tracking record
export const deleteTimeTracking = async (id) => {
  try {
    if (!id) {
      throw new Error('ID không hợp lệ');
    }
    
    const response = await axiosInstance.delete(`/time-tracking/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting time tracking:', error);
    throw error;
  }
};

// Get summary statistics
export const fetchTimeTrackingSummary = async (certificationId) => {
  try {
    if (!certificationId) {
      throw new Error('Certification ID không hợp lệ');
    }
    
    const response = await axiosInstance.get(`/time-tracking/summary/${certificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching time tracking summary:', error);
    throw error;
  }
};