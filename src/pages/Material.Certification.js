import React, { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Popconfirm, Input, Dropdown, Menu, Tag, Tooltip } from 'antd';
import Highlighter from 'react-highlight-words';
import {
  // EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ExportOutlined,
  ReloadOutlined,
  DownOutlined,
  FileExcelOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import {
  fetchMaterialCertificationList,
  createMaterialCertification,
  updateMaterialCertification,
  softDeleteCertification,
  fetchMaterialCertificationOptions
} from '../utils/material-certification-api';
import CreateUlCertificationModal from '../components/modal/CreateUlCertificationModal';
import CertificationHistoryModal from '../components/modal/CertificationHistoryModal';
import { toast, Toaster } from 'sonner';
import './UlCertification.css';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const MaterialCertification = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [searchFilters, setSearchFilters] = useState({});
  const [options, setOptions] = useState({});
  const searchInput = useRef(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState(null);


  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
    pageSizeOptions: ['20', '50', '100'],
  });
  const fetchTimeoutRef = useRef(null);
  const handleViewCertificationForm = (record) => {
    navigate(`/certification-form/${record.ID}`, { 
      state: { certificationData: record } 
    });
  };
  
  const fetchData = async (page = null, pageSize = null, filters = null) => {
    setLoading(true);
    try {
      const currentPage = page || pagination.current;
      const currentPageSize = pageSize || pagination.pageSize;
      const currentFilters = filters !== null ? filters : searchFilters;

      const response = await fetchMaterialCertificationList({
        page: currentPage,
        pageSize: currentPageSize,
        ...currentFilters
      });

      setData(response.data || []);
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        pageSize: currentPageSize,
        total: response.totalRecords || 0
      }));

    } catch (error) {
      console.error('Error fetching UL certification data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch options for dropdowns
  const fetchOptions = async () => {
    try {
      const response = await fetchMaterialCertificationOptions();
      setOptions(response.data || {});
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const handleCreate = async (values) => {
  try {
    const result = await createMaterialCertification(values);
    if (result && result.success === false) {
      throw new Error(result.message || 'Tạo mới thất bại');
    }
    fetchData(1, pagination.pageSize);
    return result; // ⬅️ THÊM DÒNG NÀY

  } catch (error) {
    console.error('Error creating UL certification:', error);
    throw error; // Throw error để Modal xử lý
  }
};

  const handleUpdate = async (values) => {
    try {
      const recordId = editingRecord.ID || editingRecord.id;
      if (!recordId) {
        throw new Error('ID không hợp lệ');
      }

      const result = await updateMaterialCertification(recordId, values);
      if (result && result.success === false) {
        throw new Error(result.message || 'Cập nhật thất bại');
      }

      fetchData(pagination.current, pagination.pageSize);
      setModalVisible(false);
      setEditingRecord(null);

      return { success: true, message: 'Cập nhật thành công' };

    } catch (error) {
      console.error('Error updating UL certification:', error);
      throw new Error('Lỗi khi cập nhật: ' + (error.message || 'Đã có lỗi xảy ra'));
    }
  };

  // Handle delete
  const handleDelete = async (recordOrId) => {
    try {
      const id = Number(recordOrId?.id ?? recordOrId?.ID ?? recordOrId);
      if (!id || isNaN(id)) {
        toast.error('ID không hợp lệ, không thể xóa!');
        return;
      }
      await softDeleteCertification(id);
      toast.success('Xóa thành công');
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error deleting UL certification:', error);
      toast.error('Lỗi khi xóa');
    }
  };

 const handleExport = () => {
  try {


    // ✅ Lấy toàn bộ dữ liệu từ state data
    const exportData = data.map((row) => {
      return {
        ID: row.ID ?? "-",
        MATERIAL_NAME: row.MATERIAL_NAME ?? "-",
        MATERIAL_CLASS: row.MATERIAL_CLASS ?? "-",
        UL_CERT_STATUS: row.UL_CERT_STATUS ?? "-",
        RELIABILITY_LEVEL: row.RELIABILITY_LEVEL ?? "-",
        DEPARTMENT_CODE: row.DEPARTMENT_CODE ?? "-",
        PERSON_IN_CHARGE: row.PERSON_IN_CHARGE ?? "-",
        START_DATE: row.START_DATE
          ? new Date(row.START_DATE).toLocaleDateString("vi-VN")
          : "-",
        PD5_REPORT_DEADLINE: row.PD5_REPORT_DEADLINE
          ? new Date(row.PD5_REPORT_DEADLINE).toLocaleDateString("vi-VN")
          : "-",
        COMPLETION_DEADLINE: row.COMPLETION_DEADLINE
          ? new Date(row.COMPLETION_DEADLINE).toLocaleDateString("vi-VN")
          : "-",
        PD5_REPORT_ACTUAL_DATE: row.PD5_REPORT_ACTUAL_DATE
          ? new Date(row.PD5_REPORT_ACTUAL_DATE).toLocaleDateString("vi-VN")
          : "-",
        ACTUAL_COMPLETION_DATE: row.ACTUAL_COMPLETION_DATE
          ? new Date(row.ACTUAL_COMPLETION_DATE).toLocaleDateString("vi-VN")
          : "-",
        PROGRESS: row.PROGRESS ?? "-",
        NOTES_1: row.NOTES_1 ?? "-",
        PERSON_DO: row.PERSON_DO ?? "-",
        PERSON_CHECK: row.PERSON_CHECK ?? "-",
        TIME_DO: row.TIME_DO ?? "-",
        TIME_CHECK: row.TIME_CHECK ?? "-",
        TOTAL_TIME: row.TOTAL_TIME ?? "-",
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MaterialCertification");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const filename = `MaterialCertification_${new Date()
      .toISOString()
      .split("T")[0]}.xlsx`;

    saveAs(blob, filename);
    toast.success("Xuất file thành công!");
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Lỗi khi xuất file!");
  }
};
const handleExportLateReport = () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lateData = data.filter((row) => {
      const deadline = row.PD5_REPORT_DEADLINE ? new Date(row.PD5_REPORT_DEADLINE) : null;
      const actualDate = row.PD5_REPORT_ACTUAL_DATE ? new Date(row.PD5_REPORT_ACTUAL_DATE) : null;
      
      // Chậm muộn khi:
      // 1. Có deadline
      // 2. Deadline < hôm nay
      // 3. Chưa có ngày gửi thực tế (PD5_REPORT_ACTUAL_DATE)
      // 4. Hoặc đã gửi nhưng sau deadline
      const isLate = deadline && deadline < today && (
        !actualDate || actualDate > deadline
      );
      
      return isLate;
    });

    if (lateData.length === 0) {
      toast.warning('Không có báo cáo chậm muộn nào!');
      return;
    }

    const exportData = lateData.map((row, index) => {
      const deadline = row.PD5_REPORT_DEADLINE ? new Date(row.PD5_REPORT_DEADLINE) : null;
      const actualDate = row.PD5_REPORT_ACTUAL_DATE ? new Date(row.PD5_REPORT_ACTUAL_DATE) : null;
      
      // ✅ Tính số ngày trễ
      let daysLate = 0;
      if (deadline) {
        const compareDate = actualDate || today;
        daysLate = Math.floor((compareDate - deadline) / (1000 * 60 * 60 * 24));
      }

      return {
        STT: index + 1,
        'Tên vật liệu': row.MATERIAL_NAME ?? "-",
        'Loại vật liệu': row.MATERIAL_CLASS ?? "-",
        'Bộ phận phụ trách': row.DEPARTMENT_CODE ?? "-",
        'Người phụ trách': row.PERSON_IN_CHARGE ?? "-",
        'Kỳ hạn gửi báo cáo tới PD5': deadline ? deadline.toLocaleDateString("vi-VN") : "-",
        'Ngày gửi báo cáo tới PD5': actualDate 
          ? actualDate.toLocaleDateString("vi-VN") 
          : "-",
        'Trạng thái': row.PROGRESS_STATUS_NAME || row.PROGRESS || "-",
        'Số ngày trễ': daysLate > 0 ? `${daysLate} ngày` : "-",
        'Ghi chú': row.NOTES_1 ?? "-",
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BaoCaoChamMuon");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const filename = `BaoCaoChamMuon_${new Date().toISOString().split("T")[0]}.xlsx`;

    saveAs(blob, filename);
    toast.success(`Xuất báo cáo thành công! (${lateData.length} bản ghi chậm muộn)`);
  } catch (error) {
    console.error("Export late report error:", error);
    toast.error("Lỗi khi xuất báo cáo chậm muộn!");
  }
};

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, clearFilters, close }) => {
      const initialValue = searchFilters[dataIndex] ?? '';
      if ((!selectedKeys || selectedKeys.length === 0) && initialValue) {
        setSelectedKeys([initialValue]);
      }

      return (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            ref={searchInput}
            placeholder={`Tìm kiếm ${dataIndex}`}
            value={selectedKeys && selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => { handleSearch(selectedKeys, dataIndex); close(); }}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => { handleSearch(selectedKeys, dataIndex); close(); }}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm kiếm
            </Button>
            <Button
              onClick={() => {
                if (clearFilters) {
                  clearFilters();
                }
                handleReset(clearFilters, dataIndex);
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => close()}
            >
              Đóng
            </Button>
          </Space>
        </div>
      );
    },
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{ color: filtered ? '#1890ff' : undefined }}
      />
    ),
    // If server-side filtering is used, AntD's filteredValue is used just for UI persistence.
    filteredValue: searchFilters[dataIndex] ? [searchFilters[dataIndex]] : null,
    // Provide a local filter to allow client-side filtering (instant) if needed.
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      if (recordValue === undefined || recordValue === null) return false;
      return recordValue.toString().toLowerCase().includes(value.toString().toLowerCase());
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) => {
      const searchValue = searchFilters[dataIndex];
      return searchValue ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchValue]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      );
    }
  });

  const handleSearch = (selectedKeys, dataIndex) => {
    const searchValue = selectedKeys && selectedKeys[0];
    const newFilters = { ...searchFilters };
    if (searchValue) {
      newFilters[dataIndex] = searchValue;
    } else {
      delete newFilters[dataIndex];
    }
    setSearchFilters(newFilters);
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
    fetchData(1, pagination.pageSize, newFilters);
  };

  const handleReset = (clearFilters, dataIndex) => {
    const newFilters = { ...searchFilters };
    if (dataIndex) {
      delete newFilters[dataIndex];
    } else {
      Object.keys(newFilters).forEach(k => delete newFilters[k]);
    }
    setSearchFilters(newFilters);
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
    fetchData(1, pagination.pageSize, newFilters);
    if (typeof clearFilters === 'function') clearFilters();
  };

 const handleTableChange = (paginationConfig, filters) => {  
  const newFilters = {};
  
  Object.keys(filters).forEach(key => {
    if (filters[key] && filters[key].length > 0) {
      newFilters[key] = filters[key];
    }
  });
  
  Object.keys(searchFilters).forEach(key => {
    if (!filters.hasOwnProperty(key)) {
      newFilters[key] = searchFilters[key];
    }
  });  
  setSearchFilters(newFilters);
  if (fetchTimeoutRef.current) {
    clearTimeout(fetchTimeoutRef.current);
  }
  
  fetchTimeoutRef.current = setTimeout(() => {
    fetchData(paginationConfig.current, paginationConfig.pageSize, newFilters);
  }, 50);
};


  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'orange';
      case 'Approved': return 'green';
      case 'Rejected': return 'red';
      default: return 'default';
    }
  };
  const columns = [
  {
    title: 'No',
    dataIndex: 'ID',
    key: 'id',
    width: 60,
    fixed: 'left',
    align: 'center',
  },
  {
    title: 'Tên vật liệu',
    dataIndex: 'MATERIAL_NAME',
    key: 'material_name',
    width: 120,
    ...getColumnSearchProps('MATERIAL_NAME'),
    render: (text, record) => (
      <button 
        onClick={() => handleViewCertificationForm(record)}
        style={{ 
          color: '#1890ff', 
          cursor: 'pointer',
          border: 'none',
          background: 'none',
          padding: 0,
          textDecoration: 'underline',
          font: 'inherit',
          textAlign: 'left',
          width: '100%',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: '1.4'
        }}
      >
        {text}
      </button>
    )
  },
  {
    title: 'Loại VL',
    dataIndex: 'MATERIAL_CLASS',
    key: 'material_class',
    width: 80,
    ...getColumnSearchProps('MATERIAL_CLASS'),
    render: (text) => {
      if (!text) return '';
      const matches = text.match(/\b[A-Z]{2,}\b/g); 
      return matches ? matches.join(', ') : text;
    },
    align: 'center'
  },
  {
    title: 'Cấu trúc',
    dataIndex: 'UL_CERT_STATUS',
    key: 'ul_cert_status',
    width: 90,
    align: 'center',
    render: (status) => status ? (
      <Tag color={getStatusColor(status)} style={{ fontSize: '11px', padding: '0 4px' }}>
        {status}
      </Tag>
    ) : '-'
  },
  {
    title: 'Tin cậy',
    dataIndex: 'RELIABILITY_LEVEL',
    key: 'reliability_level',
    width: 70,
    ...getColumnSearchProps('RELIABILITY_LEVEL'),
    render: (text) => {
      if (!text) return '';
      const match = text.match(/\d+/);
      return match ? `Cấp ${match[0]}` : text;
    },
    align: 'center'
  },
  {
    title: 'Tiến độ',
    dataIndex: 'PROGRESS',
    key: 'progress',
    width: 100,
    filters: Array.isArray(options.progress)
      ? options.progress.map(p => ({ text: p.status_name, value: String(p.status_id) }))
      : [],
    filteredValue: searchFilters.PROGRESS || null,
    filterMultiple: true,
    render: (v, record) => {
      if (v) return <div style={{ fontSize: '12px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{v}</div>;
      const progressId = record.PROGRESS_ID ?? record.PROGRESS;
      if (options && Array.isArray(options.progress) && (progressId !== undefined && progressId !== null)) {
        const found = options.progress.find(p => String(p.status_id) === String(progressId));
        if (found) return <div style={{ fontSize: '12px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{found.status_name}</div>;
      }
      return '-';
    },
    align: 'center'
  },
  {
    title: 'Bộ phận',
    dataIndex: 'DEPARTMENT_CODE',
    key: 'department_code',
    width: 70,
    render: (v) => v || '-',            
    align: 'center'
  },
  {
    title: 'Người PT',
    dataIndex: 'PERSON_IN_CHARGE',
    key: 'person_in_charge',
    width: 100,
    render: v => (
      <div style={{ 
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        lineHeight: '1.4'
      }}>
        {v || '-'}
      </div>
    ),
    align: 'center'
  },
  {
    title: 'Bắt đầu',
    dataIndex: 'START_DATE',
    key: 'start_date',
    width: 85,
    render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '-',
    align: 'center'
  },
  {
    title: 'KH gửi PD5',
    dataIndex: 'PD5_REPORT_DEADLINE',
    key: 'pd5_report_deadline',
    width: 85,
    render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '-',
    align: 'center'
  },
  {
    title: 'KH hoàn thành',
    dataIndex: 'COMPLETION_DEADLINE',
    key: 'completion_deadline',
    width: 95,
    render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '-',
    align: 'center'
  },
  {
    title: 'TT gửi PD5',
    dataIndex: 'PD5_REPORT_ACTUAL_DATE',
    key: 'pd5_report_actual_date',
    width: 85,
    render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '-',
    align: 'center'
  },
  {
    title: 'TT hoàn thành',
    dataIndex: 'ACTUAL_COMPLETION_DATE',
    key: 'actual_completion_date',
    width: 95,
    render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '-',
    align: 'center'
  },
  {
    title: 'Ghi chú',
    dataIndex: 'NOTES_1',
    key: 'notes_1',
    width: 120,
    align: 'left',
    render: (text) => (
      <div style={{ 
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        lineHeight: '1.4'
      }}>
        {text || '-'}
      </div>
    )
  },
  {
    title: 'Thao tác',
    key: 'action',
    fixed: 'right',
    width: 130,
    align: 'center',
    render: (_, record) => (
      <Space size="small">
        <Tooltip title="Lịch sử">
          <Button
            type="default"
            icon={<ClockCircleOutlined />}
            onClick={() => handleViewHistory(record)}
            size="small"
          />
        </Tooltip>
        {/* <Tooltip title="Sửa">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
        </Tooltip> */}
        <Popconfirm
          title="Xác nhận xóa?"
          onConfirm={() => handleDelete(record)}
          okText="Có"
          cancelText="Không"
        >
          <Tooltip title="Xóa">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Tooltip>
        </Popconfirm>
      </Space>
    ),
  },
];

const handleViewHistory = (record) => {
  setSelectedCertification(record);
  setHistoryModalVisible(true);
};

  // const handleEdit = (record) => {
  //   console.log('Edit record:', record);
  //   setModalMode('edit');
  //   setEditingRecord(record);
  //   setModalVisible(true);
  // };

  const handleCreateNew = () => {
    setModalMode('create');
    setEditingRecord(null);
    setModalVisible(true);
  };

  const handleModalSuccess = () => {
    fetchData(pagination.current, pagination.pageSize, searchFilters);
  };

  const handleResetFilters = () => {
    setSearchFilters({});
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, {});
  };

  const exportMenu = (
  <Menu>
    <Menu.Item
      key="export-excel"
      icon={<FileExcelOutlined />}
      onClick={handleExport}
    >
      Export Excel (.xlsx)
    </Menu.Item>
    <Menu.Item
      key="export-late-report"
      icon={<FileExcelOutlined style={{ color: '#ff4d4f' }} />}
      onClick={handleExportLateReport}
      style={{ color: '#ff4d4f' }}
    >
      Báo cáo chậm muộn
    </Menu.Item>
  </Menu>
);

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div className="ul-certification-container">
        <div className="ul-certification-header">
          <h1 style={{ color: '#e29a51ff' }}>Chứng nhận vật liệu</h1>
          <div className="header-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
              style={{ marginRight: 8 }}
            >
              Thêm mới
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              style={{ marginRight: 8 }}
            >
              Bỏ lọc
            </Button>
            <Dropdown overlay={exportMenu} trigger={['click']}>
              <Button>
                <ExportOutlined /> Export <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        </div>

        <div className="table-container">
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey={(record) => record.ID || record.id}
             size="small"  // ✅ Thêm size="small" để thu gọn padding
            scroll={{ 
              x: 1400,  // ✅ Giảm từ max xuống cố định
              y: 'calc(100vh - 320px)'  // ✅ Chiều cao động theo màn hình
            }}
            style={{ fontSize: '12px' }} 
            sticky
            pagination={{
              ...pagination,
              size: 'small',
              onChange: (page, pageSize) => {
                fetchData(page, pageSize, searchFilters);
              },
              onShowSizeChange: (size) => {
                fetchData(1, size, searchFilters);
              }
            }}
            onChange={handleTableChange}
          />
        </div>

        <CreateUlCertificationModal
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingRecord(null);
            setModalMode('create');
          }}
          onSubmit={modalMode === 'edit' ? handleUpdate : handleCreate}
          editingRecord={editingRecord}
          mode={modalMode}
          options={options}
          onSuccess={handleModalSuccess}
        />
        <CertificationHistoryModal
          open={historyModalVisible}
          onClose={() => {
            setHistoryModalVisible(false);
            setSelectedCertification(null);
          }}
          certificationId={selectedCertification?.ID}
          certificationName={selectedCertification?.MATERIAL_NAME}
        />
      </div>
    </MainLayout>
  );
};

export default MaterialCertification;