import { useState, useEffect } from 'react';
import { Input, Button, Spin, Typography, Alert, Select } from 'antd';
import ImpedanceTable from '../components/layout/ImpedanceTable';
import MainLayout from '../components/layout/MainLayout';
import CreateImpedanceModal from '../components/modal/CreateImpedanceModal';
import UpdateImpedanceModal from '../components/modal/UpdateImpedanceModal';
import ImportImpedanceModal from '../components/modal/ImportImpedanceModal';
import { fetchImpedanceData, createImpedance, updateImpedance, softDeleteImpedance, importImpedance } from '../utils/api';
import { EyeOutlined } from "@ant-design/icons";
import { toast, Toaster } from 'sonner';
import * as XLSX from 'xlsx';
import './Impedance.css';
import { useCallback } from 'react';

const { Title } = Typography;

const Impedance = () => {
  const [impedanceData, setImpedanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Hàm xử lý khi token hết hạn
  const handleTokenExpiration = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken'); // Nếu có refresh token
    
    // Hiển thị thông báo
    toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    
    // Chuyển hướng về trang login sau 2 giây
    setTimeout(() => {
      window.location.href = 'http://192.84.105.173:8888/';
    }, 2000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchImpedanceData();
      // Đảm bảo dữ liệu là mảng
      const data = Array.isArray(response) ? response :
        (response && Array.isArray(response.data) ? response.data : []);
      setImpedanceData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching impedance data:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        handleTokenExpiration();
      } else {
        toast.error('Lỗi khi tải dữ liệu');
        setImpedanceData([]);
        setFilteredData([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        
        // Kiểm tra thời gian hết hạn của token
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          handleTokenExpiration();
          return;
        }
        
        setHasEditPermission(['001507', '021253', '000001', '008048', '030783', '030516'].includes(decodedToken.company_id));
      } catch (error) {
        console.error('Error parsing token:', error);
        handleTokenExpiration();
        return;
      }
    }
    loadData();
  }, [shouldRefresh, loadData]);
  const handleCreate = async (values) => {
    try {
      if (!values.imp_1 || !values.imp_2 || !values.imp_3 || !values.imp_4) {
        toast.error('Các trường Imp 1, Imp 2, Imp 3, và Imp 4 là bắt buộc.');
        return;
      }
      const response = await createImpedance(values);
      if (response && response.data) {
        setIsCreateModalVisible(false);
        toast.success('Thêm mới thành công');
        await loadData();
      }
    } catch (error) {
      console.error('Error creating impedance:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi thêm mới dữ liệu');
    }
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setIsUpdateModalVisible(true);
  };

  const handleUpdate = async (impId, values) => {
    try {
      if (!impId || impId === 'undefined' || impId === 'null') {
        toast.error('Không thể cập nhật vì không có ID hợp lệ');
        return;
      } const response = await updateImpedance(impId, values);
      if (response && response.data) {
        toast.success('Cập nhật thành công');
        await loadData();
      }
    } catch (error) {
      console.error('Error updating impedance:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật dữ liệu');
    }
  };

  const handleSearchInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    if (newValue === '') {
      setFilteredData(impedanceData); 
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setFilteredData(impedanceData); 
  };

  const handleSearchSubmit = () => {
    if (searchValue.trim() === '') {
      setFilteredData(impedanceData);
    } else {
      const filtered = impedanceData.filter((item) =>
      (item.IMP_1?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.IMP_2?.toLowerCase().includes(searchValue.toLowerCase()))
      );
      setFilteredData(filtered);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleSoftDelete = async (record) => {
    try {
      const impId = record.imp_id || record.IMP_ID;

      if (!impId) {
        toast.error('Không thể xóa: ID không hợp lệ');
        return;
      }

      const response = await softDeleteImpedance(impId);
      if (response) {
        await loadData();

        toast.success('Xóa thành công');
      }
    } catch (error) {
      console.error('Error soft deleting impedance:', error);
      const errorMessage = error.response?.data?.error || 'Lỗi khi xóa dữ liệu';
      toast.error(errorMessage);
    }
  };
  const exportToExcel = async () => {
    if (filteredData.length === 0) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }

    try {
      setExportLoading(true);
      const dataToExport = selectedCodes.length > 0
        ? impedanceData.filter(item => selectedCodes.includes(item.IMP_2))
        : filteredData;

      if (dataToExport.length === 0) {
        toast.error('Không có dữ liệu nào phù hợp với các mã hàng đã chọn');
        return;
      }

      const mappedData = dataToExport.map(item => ({
        'JobName': item.IMP_1 ?? '-',
        'Mã Hàng': item.IMP_2 ?? '-',
        'Ngày tạo': item.IMP_138 ?? '-',
        'Tổng hợp dữ liệu đo thực tế': item.IMP_137 ?? '-',
        'Mã hàng tham khảo': item.IMP_3 ?? '-',
        'Khách hàng': item.IMP_4 ?? '-',
        'Loại khách hàng': item.IMP_5 ?? '-',
        'Ứng dụng': item.IMP_6 ?? '-',
        'Phân loại sản xuất': item.IMP_7 ?? '-',
        'Độ dày bo (µm)': item.IMP_8 ?? '-',
        'Cấu trúc lớp': item.IMP_9 ?? '-',
        'CCL': item.IMP_10 ?? '-',
        'PP': item.IMP_11 ?? '-',
        'Mực phủ sơn': item.IMP_12 ?? '-',
        'Lấp lỗ vĩnh viễn BVH': item.IMP_13 ?? '-',
        'Lấp lỗ vĩnh viễn TH': item.IMP_14 ?? '-',
        'Thông số vật liệu|Đồng|Lá đồng (µm)': item.IMP_15 ?? '-',
        'Thông số vật liệu|Đồng|Tỷ lệ đồng còn lại lớp IMP': item.IMP_16 ?? '-',
        'Thông số vật liệu|Đồng|Tỷ lệ đồng còn lại lớp GND1': item.IMP_17 ?? '-',
        'Thông số vật liệu|Đồng|Tỷ lệ đồng còn lại lớp GND2': item.IMP_18 ?? '-',
        'Thông số vật liệu|Lớp GND1|Mắt lưới': item.IMP_19 ?? '-',
        'Thông số vật liệu|Lớp GND1|Độ dày (µm)': item.IMP_20 ?? '-',
        'Thông số vật liệu|Lớp GND1|% Nhựa': item.IMP_21 ?? '-',
        'Thông số vật liệu|Lớp GND2|Mắt lưới': item.IMP_22 ?? '-',
        'Thông số vật liệu|Lớp GND2|Độ dày (µm)': item.IMP_23 ?? '-',
        'Thông số vật liệu|Lớp GND2|% Nhựa': item.IMP_24 ?? '-',
        'Thông tin IMP yêu cầu của khách hàng|Giá trị IMP': item.IMP_25 ?? '-',
        'Thông tin IMP yêu cầu của khách hàng|Dung sai IMP': item.IMP_26 ?? '-',
        'Thông tin IMP yêu cầu của khách hàng|Loại IMP': item.IMP_27 ?? '-',
        'Thông tin IMP yêu cầu của khách hàng|Lớp IMP': item.IMP_28 ?? '-',
        'Thông tin IMP yêu cầu của khách hàng|GAP': item.IMP_29 ?? '-',
        'Thông tin IMP yêu cầu của khách hàng|Lớp IMP ': item.IMP_30 ?? '-',
        'Thông tin IMP yêu cầu của khách hàng|Lớp GND1': item.IMP_31 ?? '-',
        'Thông tin IMP yêu cầu của khách hàng|Lớp GND2': item.IMP_32 ?? '-',
        'Thông tin IMP yêu cầu của khách hàng|L (µm)': item.IMP_33 ?? '-',
        'Thông tin IMP yêu cầu của khách hàng|S (µm)': item.IMP_34 ?? '-',
        'Thông tin IMP yêu cầu của khách hàng|GAP ｺﾌﾟﾚﾅｰ (µm)': item.IMP_35 ?? '-',
        'Coupon Code': item.IMP_136 ?? '-',
        'Tổng hợp kết quả mô phỏng|Giá trị IMP': item.IMP_36 ?? '-',
        'Tổng hợp kết quả mô phỏng|Phủ sơn|Độ dày phủ sơn trên PP (1)': item.IMP_37 ?? '-',
        'Tổng hợp kết quả mô phỏng|Phủ sơn|Độ dày phủ sơn trên đồng': item.IMP_38 ?? '-',
        'Tổng hợp kết quả mô phỏng|Phủ sơn|Độ dày phủ sơn trên PP (2)': item.IMP_39 ?? '-',
        'Tổng hợp kết quả mô phỏng|Phủ sơn|DK': item.IMP_40 ?? '-',
        'Tổng hợp kết quả mô phỏng|Độ dày đồng (µm)': item.IMP_41 ?? '-',
        'Tổng hợp kết quả mô phỏng|Lớp GND1|Loại': item.IMP_42 ?? '-',
        'Tổng hợp kết quả mô phỏng|Lớp GND1|Độ dày (µm)': item.IMP_43 ?? '-',
        'Tổng hợp kết quả mô phỏng|Lớp GND1|DK': item.IMP_44 ?? '-',
        'Tổng hợp kết quả mô phỏng|Lớp GND2|Loại': item.IMP_45 ?? '-',
        'Tổng hợp kết quả mô phỏng|Lớp GND2|Độ dày (µm)': item.IMP_46 ?? '-',
        'Tổng hợp kết quả mô phỏng|Lớp GND2|DK': item.IMP_47 ?? '-',
        'Tổng hợp kết quả mô phỏng|L (µm)|Đỉnh đường mạch': item.IMP_48 ?? '-',
        'Tổng hợp kết quả mô phỏng|L (µm)|Chân đường mạch': item.IMP_49 ?? '-',
        'Tổng hợp kết quả mô phỏng|S (µm)': item.IMP_50 ?? '-',
        'Tổng hợp kết quả mô phỏng|GAP ｺﾌﾟﾚﾅｰ (µm)': item.IMP_51 ?? '-',
        'Tổng kết quả đo thực tế|Giá trị IMP|No 1': item.IMP_52 ?? '-',
        'Tổng kết quả đo thực tế|Giá trị IMP|No 2': item.IMP_53 ?? '-',
        'Tổng kết quả đo thực tế|Giá trị IMP|No 3': item.IMP_54 ?? '-',
        'Tổng kết quả đo thực tế|Giá trị IMP|No 4': item.IMP_55 ?? '-',
        'Tổng kết quả đo thực tế|Giá trị IMP|No 5': item.IMP_56 ?? '-',
        'Tổng kết quả đo thực tế|Giá trị IMP|AVG': item.IMP_57 ?? '-',
        'Tổng kết quả đo thực tế|Giá trị IMP|Result': item.IMP_58 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên PP (1)|No 1': item.IMP_59 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên PP (1)|No 2': item.IMP_60 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên PP (1)|No 3': item.IMP_61 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên PP (1)|No 4': item.IMP_62 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên PP (1)|No 5': item.IMP_63 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên PP (1)|AVG': item.IMP_64 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên đồng|No 1': item.IMP_65 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên đồng|No 2': item.IMP_66 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên đồng|No 3': item.IMP_67 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên đồng|No 4': item.IMP_68 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên đồng|No 5': item.IMP_69 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên đồng|AVG': item.IMP_70 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên PP (2)|No 1': item.IMP_71 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên PP (2)|No 2': item.IMP_72 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên PP (2)|No 3': item.IMP_73 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên PP (2)|No 4': item.IMP_74 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên PP (2)|No 5': item.IMP_75 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|Độ dày phủ sơn trên PP (2)|AVG': item.IMP_76 ?? '-',
        'Tổng kết quả đo thực tế|Phủ sơn|DK': item.IMP_77 ?? '-',
        'Tổng kết quả đo thực tế|Độ dày đồng|No 1': item.IMP_78 ?? '-',
        'Tổng kết quả đo thực tế|Độ dày đồng|No 2': item.IMP_79 ?? '-',
        'Tổng kết quả đo thực tế|Độ dày đồng|No 3': item.IMP_80 ?? '-',
        'Tổng kết quả đo thực tế|Độ dày đồng|No 4': item.IMP_81 ?? '-',
        'Tổng kết quả đo thực tế|Độ dày đồng|No 5': item.IMP_82 ?? '-',
        'Tổng kết quả đo thực tế|Độ dày đồng|AVG': item.IMP_83 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND1|Độ dày PP|No 1': item.IMP_84 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND1|Độ dày PP|No 2': item.IMP_85 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND1|Độ dày PP|No 3': item.IMP_86 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND1|Độ dày PP|No 4': item.IMP_87 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND1|Độ dày PP|No 5': item.IMP_88 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND1|Độ dày PP|AVG': item.IMP_89 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND1|DK': item.IMP_90 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND2|Độ dày PP|No 1': item.IMP_91 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND2|Độ dày PP|No 2': item.IMP_92 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND2|Độ dày PP|No 3': item.IMP_93 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND2|Độ dày PP|No 4': item.IMP_94 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND2|Độ dày PP|No 5': item.IMP_95 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND2|Độ dày PP|AVG': item.IMP_96 ?? '-',
        'Tổng kết quả đo thực tế|Lớp GND2|DK': item.IMP_97 ?? '-',
        'Tổng kết quả đo thực tế|L (µm)|Đỉnh đường mạch|No 1': item.IMP_98 ?? '-',
        'Tổng kết quả đo thực tế|L (µm)|Đỉnh đường mạch|No 2': item.IMP_99 ?? '-',
        'Tổng kết quả đo thực tế|L (µm)|Đỉnh đường mạch|No 3': item.IMP_100 ?? '-',
        'Tổng kết quả đo thực tế|L (µm)|Đỉnh đường mạch|No 4': item.IMP_101 ?? '-',
        'Tổng kết quả đo thực tế|L (µm)|Đỉnh đường mạch|No 5': item.IMP_102 ?? '-',
        'Tổng kết quả đo thực tế|L (µm)|Đỉnh đường mạch|AVG': item.IMP_103 ?? '-',
        'Tổng kết quả đo thực tế|L (µm)|Chân đường mạch|No 1': item.IMP_104 ?? '-',
        'Tổng kết quả đo thực tế|L (µm)|Chân đường mạch|No 2': item.IMP_105 ?? '-',
        'Tổng kết quả đo thực tế|L (µm)|Chân đường mạch|No 3': item.IMP_106 ?? '-',
        'Tổng kết quả đo thực tế|L (µm)|Chân đường mạch|No 4': item.IMP_107 ?? '-',
        'Tổng kết quả đo thực tế|L (µm)|Chân đường mạch|No 5': item.IMP_108 ?? '-',
        'Tổng kết quả đo thực tế|L (µm)|Chân đường mạch|AVG': item.IMP_109 ?? '-',
        'Tổng kết quả đo thực tế|S (µm)|No 1': item.IMP_110 ?? '-',
        'Tổng kết quả đo thực tế|S (µm)|No 2': item.IMP_111 ?? '-',
        'Tổng kết quả đo thực tế|S (µm)|No 3': item.IMP_112 ?? '-',
        'Tổng kết quả đo thực tế|S (µm)|No 4': item.IMP_113 ?? '-',
        'Tổng kết quả đo thực tế|S (µm)|No 5': item.IMP_114 ?? '-',
        'Tổng kết quả đo thực tế|S (µm)|AVG': item.IMP_115 ?? '-',
        'Tổng kết quả đo thực tế|GAP ｺﾌﾟﾚﾅｰ (µm)|No 1': item.IMP_116 ?? '-',
        'Tổng kết quả đo thực tế|GAP ｺﾌﾟﾚﾅｰ (µm)|No 2': item.IMP_117 ?? '-',
        'Tổng kết quả đo thực tế|GAP ｺﾌﾟﾚﾅｰ (µm)|No 3': item.IMP_118 ?? '-',
        'Tổng kết quả đo thực tế|GAP ｺﾌﾟﾚﾅｰ (µm)|No 4': item.IMP_119 ?? '-',
        'Tổng kết quả đo thực tế|GAP ｺﾌﾟﾚﾅｰ (µm)|No 5': item.IMP_120 ?? '-',
        'Tổng kết quả đo thực tế|GAP ｺﾌﾟﾚﾅｰ (µm)|AVG': item.IMP_121 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| Giá trị IMP': item.IMP_122,
        'So sánh kết quả giữa mô phỏng và thực tế| Phủ sơn| Độ dày phủ sơn trên PP (1)': item.IMP_123 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| Phủ sơn| Độ dày phủ sơn trên đồng': item.IMP_124 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| Phủ sơn| Độ dày phủ sơn trên PP (2)': item.IMP_125 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| Phủ sơn| DK': item.IMP_126 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| Độ dày đồng (µm)': item.IMP_127 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| Lớp GND1| Độ dày PP': item.IMP_128 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| Lớp GND1| DK': item.IMP_129 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| Lớp GND2| Độ dày PP': item.IMP_130 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| Lớp GND2| DK': item.IMP_131 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| L (µm)| Đỉnh đường mạch': item.IMP_132 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| L (µm)| Chân đường mạch': item.IMP_133 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| S (µm)': item.IMP_134 ?? '-',
        'So sánh kết quả giữa mô phỏng và thực tế| GAP ｺﾌﾟﾚﾅｰ (µm)': item.IMP_135 ?? '-', 
        
      }));

      const worksheet = XLSX.utils.json_to_sheet(mappedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Impedance Data');

      const filename = selectedCodes.length > 0
        ? `ImpedanceData_${selectedCodes.join('_')}.xlsx`
        : 'ImpedanceData.xlsx';

      await XLSX.writeFile(workbook, filename);
      toast.success(selectedCodes.length > 0
        ? `Đã xuất dữ liệu của ${selectedCodes.length} mã hàng ra file Excel`
        : 'Đã xuất toàn bộ dữ liệu ra file Excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Lỗi khi xuất file Excel');
    } finally {
      setExportLoading(false);
    }
  };
  const getProductCodes = () => {
    if (!impedanceData || !Array.isArray(impedanceData)) {
      return [];
    }
    return impedanceData
      .filter(item => item && item.IMP_2) 
      .map(item => ({
        value: item.IMP_2,
        label: item.IMP_2
      }))
      .filter((item, index, self) =>
        index === self.findIndex(t => t.value === item.value)
      ); 
  };
  const handleSearchSelect = (value) => {
    if (!value) {
      setSearchOptions(getProductCodes());
      return;
    }

    const searchValue = value.toLowerCase();
    const allOptions = getProductCodes();
    const filtered = allOptions.filter(option =>
      option.value.toLowerCase().includes(searchValue) ||
      option.label.toLowerCase().includes(searchValue)
    );
    if (filtered.length === 0 && value.trim() !== '') {
      filtered.push({
        value: value,
        label: `${value} (Mã hàng mới)`,
      });
    }
    setSearchOptions(filtered);
  };
  const handleProductCodeChange = (values) => {
    setSelectedCodes(values);
    if (values.length === 0) {
      setFilteredData(impedanceData);
    } else {
      const filtered = impedanceData.filter(item =>
        values.includes(item.IMP_2)
      );
      setFilteredData(filtered);
    }
  };

  const handleDataChange = () => {
    setShouldRefresh(prev => !prev);
  };

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div className="impedance-container">
        {!hasEditPermission && (
          <Alert
            message="Chế độ xem"
            description="Bạn đang ở chế độ chỉ xem. Chỉ có thể xem và xuất dữ liệu."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
        <div className="impedance-header">
          <Title level={2} className="impedance-title">Số liệu Impedance</Title>
          <div className="impedance-actions">
            <div className="search-container" style={{ display: 'flex', gap: '8px' }}>
              <Input
                className="search-input"
                placeholder="Tìm kiếm theo JOBNAME hoặc Mã hàng"
                allowClear
                value={searchValue}
                onChange={handleSearchInputChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                onClear={handleClearSearch}
              />
              <Button
                type="primary"
                onClick={handleSearchSubmit}
                disabled={loading}
              >
                Tìm kiếm
              </Button>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => window.open('/user_guide_imp.pdf', '_blank', 'noopener,noreferrer')}
                style={{ background: '#1890ff', borderColor: '#1890ff' }}
              >
                Hướng dẫn sử dụng
              </Button>
            </div>
            <Select
              mode="multiple"
              showSearch
              placeholder="Chọn hoặc nhập mã hàng..."
              options={searchOptions.length > 0 ? searchOptions : getProductCodes()}
              onSearch={handleSearchSelect}
              onChange={handleProductCodeChange}
              value={selectedCodes}
              style={{ width: '300px', marginLeft: '8px' }}
              disabled={loading}
              filterOption={false}
              maxTagCount="responsive"
              allowClear
              showArrow
              loading={loading}
              optionFilterProp="label"
              notFoundContent={loading ? 
              <Spin size="small" /> : "Không tìm thấy mã hàng"}
            />
            <div className="action-buttons">
              <Button
                type="dashed"
                onClick={exportToExcel}
                loading={exportLoading}
                disabled={loading}
              >
                {exportLoading ? 'Đang xuất...' : 'Xuất Excel'}
              </Button>
              {hasEditPermission && (
                <>
                  <Button
                    type="dashed"
                    onClick={() => setIsImportModalVisible(true)}
                    disabled={loading}
                  >
                    Import Excel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => setIsCreateModalVisible(true)}
                    disabled={loading}
                  >
                    Thêm mới
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="impedance-loading">
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          <div className="impedance-table-container">
            <ImpedanceTable
              data={filteredData}
              onDataChange={handleDataChange}
              onEdit={hasEditPermission ? handleEdit : null}
              onSoftDelete={hasEditPermission ? handleSoftDelete : null}
            />
          </div>
        )}        <CreateImpedanceModal
          visible={isCreateModalVisible}
          onCancel={() => setIsCreateModalVisible(false)}
          onCreate={handleCreate}
        />
        <UpdateImpedanceModal
          visible={isUpdateModalVisible}
          onCancel={() => {
            setIsUpdateModalVisible(false);
            setCurrentRecord(null);
          }}
          onUpdate={handleUpdate}
          currentRecord={currentRecord}
        />
        <ImportImpedanceModal
          visible={isImportModalVisible}
          onCancel={() => setIsImportModalVisible(false)}
          onImport={async (data) => {
            try {
              await importImpedance(data);
              toast.success('Import thành công');
              setIsImportModalVisible(false);
              await loadData();
            } catch (error) {
              console.error('Error importing data:', error);
              toast.error(error.response?.data?.message || 'Lỗi khi import dữ liệu');
            }
          }}
        />
      </div>
    </MainLayout>
  );
};

export default Impedance;