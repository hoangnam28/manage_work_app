import axios from 'axios';

export const fetchImpedanceData = async () => {
  try {
    const response = await axios.get('http://192.84.105.173:5000/api/impedance/list-impedance');
    return response.data;
  } catch (error) {
    console.error('Error fetching impedance data:', error);
    throw error;
  }
};


export const createImpedance = async (data) => {
  try {
    const response = await axios.post('http://192.84.105.173:5000/api/impedance/create-impedance', data);
    
    // Normalize field names to match what the table expects
    if (response.data && response.data.data) {
      const responseData = response.data.data;
      return {
        data: {
          ...responseData,
          // Convert lowercase field names to uppercase for table consistency
          IMP_1: responseData.imp_1,
          IMP_2: responseData.imp_2,
          IMP_3: responseData.imp_3,
          IMP_4: responseData.imp_4,
          // Ensure imp_id is available for rowKey
          imp_id: responseData.imp_id
        }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating impedance:', error);
    throw error;
  }
};