import { Form, Input, DatePicker, Select, Button, Row, Col, Divider, Alert, Space, Card, Upload, Popconfirm, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, UploadOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined, FileOutlined } from '@ant-design/icons';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getPDFLabel } from '../../utils/pdf-labels';
import {
  uploadCertificationPDF,
  getCertificationPDFInFor,
  deleteCertificationPDF,
  downloadCertificationPDF,
  getCertificationPDFUrl,
  submittingReported 
} from '../../utils/material-certification-api';
import moment from 'moment'; 

const { TextArea } = Input;

const ProgressTab = ({
  form,
  onFinish,
  loading,
  options,
  currentProgressId,
  onApprovalSuccess,
  personAcceptQL2,
  certificationId,
  ulCertStatus,
}) => {
  const navigate = useNavigate();
  const [canApprove, setCanApprove] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [loadingPDFs, setLoadingPDFs] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState({});
  const [submittingReport, setSubmittingReport] = useState(false);

  // ===== HELPER FUNCTION: Kiểm tra PDF nào cần hiển thị =====
  const shouldShowPDF = useCallback((pdfNumber) => {
  const materialClassId = form.getFieldValue('MATERIAL_CLASS_ID');
  const priceRequest = form.getFieldValue('PRICE_REQUEST');
  const ulCertValue = form.getFieldValue('UL_CERT_STATUS') || ulCertStatus;
  
  const isPaintRelatedMaterial = materialClassId && [4, 5, 7].includes(materialClassId);
  const isRigidMaterial = materialClassId === 1;
  const hasUlCert123 = ulCertValue && [1, 2, 3].includes(ulCertValue);
  
  const isProcessingOnly = priceRequest === 'Gia công';
  const isBoth = priceRequest === 'Gia công & Tin cậy';
  
  switch(pdfNumber) {
    case 1: // Báo cáo tin cậy
      // Ẩn nếu: ID [4,5,7] + "Gia công" HOẶC ID 1 + "Gia công"
      if (isPaintRelatedMaterial && isProcessingOnly) return false;
      if (isRigidMaterial && isProcessingOnly) return false;
      // Hiển thị trong tất cả các trường hợp khác (bao gồm "Tin cậy" và "Gia công & Tin cậy")
      return true;
      
    case 2:
    case 3:
    case 4:
    case 5:
      // Hiển thị nếu: ID 1 + ("Gia công" HOẶC "Gia công & Tin cậy")
      return isRigidMaterial && (isProcessingOnly || isBoth);
      
    case 6:
      // Hiển thị nếu: ID 1 + UL khác [1,2,3] + ("Gia công" HOẶC "Gia công & Tin cậy")
      return isRigidMaterial && !hasUlCert123 && (isProcessingOnly || isBoth);
      
    case 7:
      // PDF 7 (Other) - hiển thị trong logic hiện tại
      return true;
      
    case 8: // Mực phủ sơn
      // Hiển thị nếu: ID [4,5,7] + ("Gia công" HOẶC "Gia công & Tin cậy")
      return isPaintRelatedMaterial && (isProcessingOnly || isBoth);
      
    default:
      return false;
  }
}, [form, ulCertStatus]);

  // ===== COMPONENT CON: Render từng PDF item =====
  const PDFUploadItem = ({ pdfNumber, label }) => {
    const pdfFile = pdfFiles.find(p => p.number === pdfNumber);
    
    return (
      <Col span={12} key={`pdf-${pdfNumber}`}>
        <Form.Item label={label}>
          {pdfFile?.hasFile ? (
            <div style={{
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
              padding: '12px',
              backgroundColor: '#fff'
            }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pdfFile.fileName}
                  </span>
                </div>
                <Space size="small">
                  <Button 
                    size="small" 
                    icon={<EyeOutlined />} 
                    onClick={() => handlePDFPreview(pdfNumber)}
                  >
                    Xem
                  </Button>
                  <Button 
                    size="small" 
                    icon={<DownloadOutlined />} 
                    onClick={() => handlePDFDownload(pdfNumber, pdfFile.fileName)}
                  >
                    Tải về
                  </Button>
                  <Popconfirm
                    title="Xác nhận xóa PDF"
                    description="Bạn có chắc chắn muốn xóa file này?"
                    onConfirm={() => handlePDFDelete(pdfNumber)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>
                </Space>
              </Space>
            </div>
          ) : (
            <Upload 
              beforeUpload={(file) => handlePDFUpload(file, pdfNumber)} 
              showUploadList={false} 
              accept=".pdf"
            >
              <Button icon={<UploadOutlined />} loading={uploadingPDF[pdfNumber]} block>
                {uploadingPDF[pdfNumber] ? 'Đang upload...' : 'Chọn file PDF'}
              </Button>
            </Upload>
          )}
        </Form.Item>
      </Col>
    );
  };

  // ===== CHECK ALL REQUIRED PDFs UPLOADED =====
  const checkAllRequiredPDFsUploaded = useCallback(() => {
    const materialClassId = form.getFieldValue('MATERIAL_CLASS_ID');
    const priceRequest = form.getFieldValue('PRICE_REQUEST');
    const ulCertValue = form.getFieldValue('UL_CERT_STATUS') || ulCertStatus;

    const isPaintRelatedMaterial = materialClassId && [4, 5, 7].includes(materialClassId);
    const isRigidMaterial = materialClassId === 1;
    const hasUlCert123 = ulCertValue && [1, 2, 3].includes(ulCertValue);

    const isProcessingOnly = priceRequest === 'Gia công';
    const isReliabilityOnly = priceRequest === 'Tin cậy';
    const isBoth = priceRequest === 'Gia công & Tin cậy';

    let requiredPDFs = [];

    if (isPaintRelatedMaterial) {
      if (isProcessingOnly) {
        requiredPDFs = [8];
      } else if (isReliabilityOnly) {
        requiredPDFs = [1];
      } else if (isBoth) {
        requiredPDFs = [1, 8];
      }
    } else if (isRigidMaterial) {
      if (isReliabilityOnly) {
        requiredPDFs = [1];
      } else if (isProcessingOnly) {
        if (hasUlCert123) {
          requiredPDFs = [2, 3, 4, 5];
        } else {
          requiredPDFs = [2, 3, 4, 5, 6];
        }
      } else if (isBoth) {
        if (hasUlCert123) {
          requiredPDFs = [1, 2, 3, 4, 5];
        } else {
          requiredPDFs = [1, 2, 3, 4, 5, 6];
        }
      }
    }

    return requiredPDFs.every(pdfNum => 
      pdfFiles.find(p => p.number === pdfNum)?.hasFile
    );
  }, [form, ulCertStatus, pdfFiles]);

  // ===== HANDLE SUBMIT REPORT =====
  const handleSubmitReport = async () => {
    try {
      setSubmittingReport(true);
      
      const result = await submittingReported(certificationId);
      
      if (result.success) {
        toast.success('Nộp báo cáo thành công');
        
        const reportDate = result.data.reportDate;
        form.setFieldsValue({
          PD5_REPORT_ACTUAL_DATE: reportDate ? moment(reportDate) : null
        });
        await loadPDFInfo();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Lỗi khi nộp báo cáo: ' + error.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  // ===== HANDLE FORM CHANGE =====
  const handleFormChange = () => {
    setIsDataSaved(false);
    checkRequiredFields();
  };

  // ===== HANDLE COMPLETION DEADLINE CHANGE =====
  const handleCompletionDeadlineChange = (date) => {
    if (date) {
      const pd5Deadline = date.clone().subtract(1, 'month');
      form.setFieldsValue({
        PD5_REPORT_DEADLINE: pd5Deadline
      });
    } else {
      form.setFieldsValue({
        PD5_REPORT_DEADLINE: null
      });
    }
  };

  // ===== LOAD PDF INFO =====
  const loadPDFInfo = useCallback(async () => {
    if (!certificationId) return;
    try {
      setLoadingPDFs(true);
      const response = await getCertificationPDFInFor(certificationId);
      if (response.success) {
        setPdfFiles(response.pdfFiles || []);
      }
    } catch (error) {
      console.error('Error loading PDF info:', error);
      toast.error('Lỗi khi tải thông tin PDF');
    } finally {
      setLoadingPDFs(false);
    }
  }, [certificationId]);

  useEffect(() => {
    loadPDFInfo();
  }, [loadPDFInfo]);

  // ===== HANDLE PDF UPLOAD =====
  const handlePDFUpload = async (file, pdfNumber) => {
    console.log('📄 File info:', {
      name: file.name,
      type: file.type,
      size: file.size,
      pdfNumber: pdfNumber
    });

    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isPDF) {
      toast.error('Chỉ chấp nhận file PDF');
      return false;
    }

    const isLt10MB = file.size / 1024 / 1024 < 10;
    if (!isLt10MB) {
      toast.error('File phải nhỏ hơn 10MB');
      return false;
    }

    try {
      setUploadingPDF(prev => ({ ...prev, [pdfNumber]: true }));
      await uploadCertificationPDF(certificationId, pdfNumber, file);
      toast.success(`Tải lên ${getPDFLabel(pdfNumber)} thành công`);
      
      await loadPDFInfo();
      handleFormChange();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi khi tải lên PDF: ' + (error.message || ''));
    } finally {
      setUploadingPDF(prev => ({ ...prev, [pdfNumber]: false }));
    }

    return false;
  };

  // ===== HANDLE PDF DELETE =====
  const handlePDFDelete = async (pdfNumber) => {
    try {
      await deleteCertificationPDF(certificationId, pdfNumber);
      toast.success(`Xoá ${getPDFLabel(pdfNumber)} thành công`);
      
      await loadPDFInfo();
      handleFormChange();
      
    } catch (error) {
      toast.error('Lỗi khi xoá PDF: ' + error.message);
    }
  };

  // ===== HANDLE PDF DOWNLOAD =====
  const handlePDFDownload = async (pdfNumber, fileName) => {
    try {
      await downloadCertificationPDF(certificationId, pdfNumber, fileName);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Lỗi khi download PDF: ' + error.message);
    }
  };

  // ===== HANDLE PDF PREVIEW =====
  const handlePDFPreview = (pdfNumber) => {
    const url = getCertificationPDFUrl(certificationId, pdfNumber);
    if (url) {
      window.open(url, '_blank');
    }
  };

  // ===== CHECK REQUIRED FIELDS =====
  const checkRequiredFields = () => {
    const values = form.getFieldsValue([
      'FACTORY_CERT_READY',
      'FACTORY_CERT_STATUS',
      'FACTORY_LEVEL',
      'PRICE_REQUEST',
      'COMPLETION_DEADLINE'
    ]);

    const allFilled = values.FACTORY_CERT_READY &&
      values.FACTORY_CERT_STATUS &&
      values.FACTORY_LEVEL &&
      values.PRICE_REQUEST &&
      values.COMPLETION_DEADLINE;

    setCanApprove(!!allFilled);
  };

  // ===== HANDLE FORM SAVE =====
  const handleFormSave = async () => {
    try {
      await form.validateFields();
      await onFinish(form.getFieldsValue());
      setIsDataSaved(true);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  useEffect(() => {
    checkRequiredFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const showTKSXApproval = currentProgressId === 1;
  const showQL2Approval = currentProgressId === 2;

  const currentProgressName = options.progress?.find(
    p => p.status_id === currentProgressId
  )?.status_name || '';

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{}}
      onValuesChange={handleFormChange}
    >
      {/* ===== APPROVAL SECTION ===== */}
      {(showTKSXApproval || showQL2Approval) && (
        <Card
          style={{
            marginBottom: '24px',
            borderColor: showTKSXApproval ? '#52c41a' : '#1890ff',
            backgroundColor: showTKSXApproval ? '#f6ffed' : '#e6f7ff'
          }}
        >
          <Alert
            message={`Trạng thái hiện tại: ${currentProgressName}`}
            description={
              showTKSXApproval
                ? 'Yêu cầu đang chờ TKSX phê duyệt. Sau khi phê duyệt, trạng thái sẽ chuyển sang "Đang lập kế hoạch".'
                : 'Kế hoạch đang chờ QL2 phê duyệt. Sau khi phê duyệt, trạng thái sẽ chuyển sang "Đang đánh giá".'
            }
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          {!canApprove && showQL2Approval && (
            <Alert
              message="Chưa thể phê duyệt"
              description="Vui lòng điền đầy đủ các trường: Chứng nhận ở nhà máy khác, Nhà máy đã chứng nhận, Cấp độ ở nhà máy khác, Yêu cầu báo cáo đánh giá, và Kỳ hạn hoàn thành trước khi phê duyệt."
              type="warning"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {showQL2Approval && !isDataSaved && (
            <Alert
              message="⚠️ Chưa lưu dữ liệu"
              description="Bạn phải lưu tiến độ trước khi có thể phê duyệt. Vui lòng click nút 'Lưu tiến độ' ở dưới cùng."
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          <Row justify="center">
            <Space size="large">
              {showQL2Approval && (
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={() => onApprovalSuccess && onApprovalSuccess('ql2')}
                  disabled={!canApprove || !isDataSaved}
                  title={!isDataSaved ? 'Vui lòng lưu tiến độ trước khi phê duyệt' : ''}
                  style={{
                    backgroundColor: (canApprove && isDataSaved) ? '#1890ff' : undefined,
                    borderColor: (canApprove && isDataSaved) ? '#1890ff' : undefined,
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  QL2 Phê duyệt
                </Button>
              )}
            </Space>
          </Row>
        </Card>
      )}

      {/* ===== APPROVED STATUS ===== */}
      {personAcceptQL2 && (
        <div style={{ marginBottom: '24px' }}>
          <Alert
            message="QL2-(PD5) đã phê duyệt"
            description={`Người phê duyệt: ${personAcceptQL2}`}
            type="success"
            showIcon
          />
        </div>
      )}

      {/* ===== MATERIAL INFO SECTION ===== */}
      <div style={{ backgroundColor: '#f0f8ff', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="MATERIAL_NAME" label="Tên vật liệu">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="MATERIAL_CLASS_ID" label="Phân loại vật liệu">
              <Select placeholder="Chọn phân loại vật liệu" allowClear>
                {options.materialClass?.map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.nameVi} ({item.nameJp})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="LAYER_STRUCTURE" label="Cấu tạo lớp">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="UL_CERT_STATUS" label="Cấu trúc lớp đạt chứng nhận">
              <Select placeholder="Chọn trạng thái UL" allowClear>
                {options.ulStatus?.map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.nameVi} ({item.nameJp})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="RELIABILITY_LEVEL_ID" label="Mức độ tin cậy">
              <Select placeholder="Chọn mức độ tin cậy" allowClear>
                {options.reliabilityLevel?.map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.nameVi} ({item.nameJp})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* ===== PROGRESS SECTION ===== */}
      <div style={{ backgroundColor: '#f0f8ff', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="PROGRESS_ID" label="Tiến độ">
              <Select placeholder="Chọn trạng thái tiến độ" allowClear disabled>
                {options.progress?.map(item => (
                  <Select.Option key={item.status_id} value={item.status_id}>
                    {item.status_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="PERSON_IN_CHARGE" label="Người phụ trách">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="DEPARTMENT_IN_CHARGE" label="Bộ phận phụ trách">
              <Select
                placeholder="Chọn bộ phận phụ trách"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {options.department?.map(item => (
                  <Select.Option key={item.dept_id} value={item.dept_id}>
                    {item.dept_code}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* ===== ASSIGNMENT SECTION ===== */}
      <Divider orientation="left">Phân công thực hiện</Divider>
      <Row gutter={16} style={{ backgroundColor: '#e6f7ff', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <Col span={12}>
          <Form.Item name="START_DATE" label="Ngày bắt đầu">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="10/16/2024" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="PD5_REPORT_DEADLINE" label="Kì hạn gửi báo cáo tới PD5">
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Tự động tính = Kỳ hạn hoàn thành - 1 tháng"
              disabled
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="FACTORY_CERT_READY"
            label={<span>Chứng nhận ở nhà máy khác <span style={{ color: 'red' }}>*</span></span>}
          >
            <Select placeholder="Chọn trạng thái chứng nhận">
              <Select.Option value="yes">Yes</Select.Option>
              <Select.Option value="no">No</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="FACTORY_CERT_STATUS"
            label={<span>Nhà máy đã chứng nhận <span style={{ color: 'red' }}>*</span></span>}
          >
            <Input placeholder="Nhập tên nhà máy hoặc mô tả" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="FACTORY_LEVEL"
            label={<span>Cấp độ ở nhà máy khác <span style={{ color: 'red' }}>*</span></span>}
          >
            <Select placeholder="Chọn cấp độ">
              <Select.Option value="level1">1</Select.Option>
              <Select.Option value="level2">2</Select.Option>
              <Select.Option value="level3">3</Select.Option>
              <Select.Option value="level4">4</Select.Option>
              <Select.Option value="level5">5</Select.Option>
              <Select.Option value="level6">6</Select.Option>
              <Select.Option value="-">-</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="PRICE_REQUEST"
            label={<span>Yêu cầu báo cáo đánh giá <span style={{ color: 'red' }}>*</span></span>}
          >
            <Select placeholder="Chọn cấp độ">
              <Select.Option value="Gia công">Gia công</Select.Option>
              <Select.Option value="Tin cậy">Tin cậy</Select.Option>
              <Select.Option value="Gia công & Tin cậy">Gia công & Tin cậy</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* ===== PDF REPORTS SECTION ===== */}
      <Row gutter={16} style={{ backgroundColor: '#f8fff0ff', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        {loadingPDFs ? (
          <Col span={24} style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: '12px', color: '#999' }}>
              Đang tải thông tin PDF files...
            </div>
          </Col>
        ) : (
          <>
            {/* SECTION 1: BÁO CÁO TIN CẬY */}
            {(shouldShowPDF(1) || shouldShowPDF(7))&& (
              <>
                <Col span={24}>
                  <Divider orientation="left" style={{ marginTop: 0 }}>
                    Báo cáo tính tin cậy
                  </Divider>
                </Col>
                <PDFUploadItem pdfNumber={1} label="Báo cáo tin cậy (Reliability)" />
              </>
            )}

            {/* SECTION 2: BÁO CÁO GIA CÔNG */}
            {(shouldShowPDF(2) || shouldShowPDF(3) || shouldShowPDF(4) || 
              shouldShowPDF(5) || shouldShowPDF(6) || shouldShowPDF(8) || shouldShowPDF(7)) && (
              <>
                <Col span={24}>
                  <Divider orientation="left">Báo cáo tính gia công</Divider>
                </Col>

                {shouldShowPDF(2) && <PDFUploadItem pdfNumber={2} label="NC" />}
                {shouldShowPDF(3) && <PDFUploadItem pdfNumber={3} label="Gia công ngoại hình" />}
                {shouldShowPDF(4) && <PDFUploadItem pdfNumber={4} label="Mạ (Plating)" />}
                {shouldShowPDF(5) && <PDFUploadItem pdfNumber={5} label="Hàn điểm + Ép lớp (Spot Welding + Laminate)" />}
                {shouldShowPDF(6) && <PDFUploadItem pdfNumber={6} label="LAZER" />}
                {shouldShowPDF(8) && <PDFUploadItem pdfNumber={8} label="Mực phủ sơn, lấp lỗ, in chữ (Ink)" />}
                {shouldShowPDF(7) && <PDFUploadItem pdfNumber={7} label="Báo cáo khác"/> }
              </>
            )}

            {/* MESSAGE KHI CHƯA CHỌN ĐIỀU KIỆN */}
            {!shouldShowPDF(1) && !shouldShowPDF(2) && !shouldShowPDF(3) && 
             !shouldShowPDF(4) && !shouldShowPDF(5) && !shouldShowPDF(6) && 
             !shouldShowPDF(8) && (
              <Col span={24}>
                <Alert
                  message="Chưa chọn yêu cầu báo cáo"
                  description="Vui lòng chọn 'Phân loại vật liệu', 'Cấu trúc lớp đạt chứng nhận' và 'Yêu cầu báo cáo đánh giá' để hiển thị các mẫu PDF cần upload."
                  type="info"
                  showIcon
                  style={{ margin: '20px 0' }}
                />
              </Col>
            )}
          </>
        )}
      </Row>
      <Col span={24}>
          {checkAllRequiredPDFsUploaded() ? (
            <Form.Item label="Nộp báo cáo đánh giá">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message="Đã upload đủ PDF yêu cầu"
                  description="Bạn có thể nộp báo cáo để gửi tới PD5"
                  type="success"
                  showIcon
                />
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleSubmitReport}
                  loading={submittingReport}
                  disabled={!!form.getFieldValue('PD5_REPORT_ACTUAL_DATE')}
                  size="large"
                >
                  {form.getFieldValue('PD5_REPORT_ACTUAL_DATE') 
                    ? 'Đã nộp báo cáo' 
                    : 'Nộp báo cáo'}
                </Button>
              </Space>
            </Form.Item>
          ) : (
            <Form.Item label="Nộp báo cáo đánh giá">
              <Alert
                message="Chưa đủ điều kiện nộp báo cáo"
                description="Vui lòng upload đầy đủ các file PDF yêu cầu trước khi nộp báo cáo"
                type="warning"
                showIcon
              />
            </Form.Item>
          )}
        </Col>
      <Divider orientation="left">Thời gian thực hiện</Divider>
      <Row
        gutter={16}
        style={{
          backgroundColor: '#f0f8ff',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <Col span={24}>
          <Form.Item
            name="LINK_RAKRAK_DOCUMENT"
            label="Link RakRak Document (Kết quả chứng nhận)"
            extra="Khi điền link và lưu, sẽ tự động cập nhật 'Ngày hoàn thành thực tế'"
          >
            <TextArea rows={1} placeholder="https://example.com/bao-cao" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="COMPLETION_DEADLINE" label={<span>Kỳ hạn hoàn thành <span style={{ color: 'red' }}>*</span></span>}>
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="8/2/2025"
              onChange={handleCompletionDeadlineChange}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="ACTUAL_COMPLETION_DATE"
            label="Ngày hoàn thành thực tế"
            extra="Khi điền ngày và lưu, trạng thái sẽ tự động chuyển sang 'Hoàn thành'"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="PD5_REPORT_ACTUAL_DATE"
            label="Ngày gửi báo cáo tới PD5 thực tế"
            extra="Tự động cập nhật khi điền Link gửi báo cáo đánh giá"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="DATE_PD5_HQ"
            label="Ngày PD5 gửi tổng"
            extra="Khi điền ngày và lưu, trạng thái sẽ tự động chuyển sang 'HQ đang phê duyệt'"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="DATE_PD5_GET_REPORT"
            label="Ngày PD5 tổng hợp báo cáo"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
      </Row>

      <Row
        gutter={16}
        style={{
          backgroundColor: '#fff1f0',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <Col span={24}>
          <Form.Item name="NOTES_1" label="Ghi chú 1">
            <TextArea rows={4} />
          </Form.Item>
        </Col>
      </Row>

      {/* Buttons Section */}
      <Row justify="space-between" style={{ marginTop: '24px' }}>
        <Col>
          <Button type="default" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Col>

        <Col>
          <Button
            type="primary"
            loading={loading}
            onClick={handleFormSave}
          >
            Lưu tiến độ
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ProgressTab;