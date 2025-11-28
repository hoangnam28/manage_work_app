import { Form, Input, DatePicker, Select, Button, Row, Col, Divider, Alert, Space, Card, Upload, Popconfirm, Spin, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, UploadOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined, FileOutlined } from '@ant-design/icons';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { getPDFLabel } from '../../utils/pdf-labels';
import {
  uploadCertificationPDF,
  getCertificationPDFInFor,
  submittingReported,
  resubmitReport,
  getCertificationPDFFiles,
  deleteCertificationPDFFile,
  fetchCertificationHistory
} from '../../utils/material-certification-api';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/vi_VN';

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
  const [canSubmitReport, setCanSubmitReport] = useState(false);
  const [reuploadedFiles, setReuploadedFiles] = useState([]);
  const [canResubmitReport, setCanResubmitReport] = useState(false);
  const [resubmittingReport, setResubmittingReport] = useState(false);
  const [pdfFilesList, setPdfFilesList] = useState({});
  const [loadingFiles, setLoadingFiles] = useState({});
  const [hasUploadHistory, setHasUploadHistory] = useState(false);




  const uploadingRef = useRef({});

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

    switch (pdfNumber) {
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
        // PDF 7 (Other) - luôn hiển thị là optional
        return true;

      case 8: // Mực phủ sơn
        // Hiển thị nếu: ID [4,5,7] + ("Gia công" HOẶC "Gia công & Tin cậy")
        return isPaintRelatedMaterial && (isProcessingOnly || isBoth);

      default:
        return false;
    }
  }, [form, ulCertStatus]);

  const loadPDFFiles = useCallback(async (pdfNumber) => {
    if (!certificationId) return;
    try {
      setLoadingFiles(prev => ({ ...prev, [pdfNumber]: true }));
      const response = await getCertificationPDFFiles(certificationId, pdfNumber);

      if (response.success) {
        setPdfFilesList(prev => ({
          ...prev,
          [pdfNumber]: response.files || []
        }));
      }
    } catch (error) {
      console.error(`Error loading files for PDF${pdfNumber}:`, error);
      // Don't show error toast, just log it
    } finally {
      setLoadingFiles(prev => ({ ...prev, [pdfNumber]: false }));
    }
  }, [certificationId]);

  // ===== COMPONENT CON: Render từng PDF item =====
  const PDFUploadItem = ({ pdfNumber, label }) => {
    const pdfFile = pdfFiles.find(p => p.number === pdfNumber);
    const files = pdfFilesList[pdfNumber] || [];
    const fileCount = pdfFile?.fileCount || 0;

    return (
      <Col span={12} key={`pdf-${pdfNumber}`}>
        <Form.Item label={
          <span>
            {label}
            {fileCount > 0 && (
              <Badge
                count={fileCount}
                style={{ marginLeft: '8px', backgroundColor: '#52c41a' }}
              />
            )}
          </span>
        }>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Upload button */}
            <Upload
              multiple
              beforeUpload={() => false}
              onChange={(info) => {
              if (info.fileList.length > 0) {
                // Chỉ lấy những file MỚI được thêm vào (chưa có status)
                const newFiles = info.fileList
                  .filter(file => !file.status) // Lọc file chưa được xử lý
                  .map(f => f.originFileObj)
                  .filter(Boolean); // Loại bỏ undefined
                
                if (newFiles.length > 0) {
                  handlePDFUpload(newFiles, pdfNumber);
                }
              }
            }}
              showUploadList={false}
              accept=".pdf"
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploadingPDF[pdfNumber]}
                block
                type={fileCount > 0 ? "default" : "primary"}
              >
                {uploadingPDF[pdfNumber]
                  ? 'Đang upload...'
                  : fileCount > 0
                    ? `Thêm file (${fileCount} file)`
                    : 'Chọn file PDF'}
              </Button>
            </Upload>

            {/* List of uploaded files */}
            {loadingFiles[pdfNumber] ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="small" />
              </div>
            ) : files.length > 0 ? (
              <div style={{
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: '#fafafa',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {files.map((file, index) => (
                    <div
                      key={file.fileId}  // ✅ Dùng fileId thay vì index
                      style={{
                        padding: '8px',
                        backgroundColor: '#fff',
                        borderRadius: '4px',
                        border: '1px solid #e8e8e8'
                      }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }} size={4}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                          <span style={{
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: 500
                          }}>
                            {index + 1}. {file.fileName}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#999', paddingLeft: '24px' }}>
                          {(file.fileSize / 1024).toFixed(2)} KB
                          {file.uploadDate && ` • ${moment(file.uploadDate, "DD-MMM-YY hh.mm.ss.SSSSSS A").format("DD-MMM-YY")}`}
                        </div>
                        <Space size="small" style={{ paddingLeft: '24px' }}>
                          <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handlePreviewPDFFile(file.url)}
                          >
                            Xem
                          </Button>
                          <Button
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => handlePDFDownload(file.url, file.fileName)}
                          >
                            Tải về
                          </Button>
                          <Popconfirm
                            title="Xác nhận xóa file"
                            description={`Bạn có chắc muốn xóa "${file.fileName}"?`}
                            onConfirm={() => handlePDFDelete(file.fileId, pdfNumber)}  // ✅ Pass fileId
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
                  ))}
                </Space>
              </div>
            ) : null}
          </Space>
        </Form.Item>
      </Col>
    );
  };
  const checkAllRequiredPDFsUploaded = useCallback(() => {
    const materialClassId = form.getFieldValue('MATERIAL_CLASS_ID');
    const priceRequest = form.getFieldValue('PRICE_REQUEST');
    const ulCertValue = form.getFieldValue('UL_CERT_STATUS') || ulCertStatus;
    const reportActualDate = form.getFieldValue('PD5_REPORT_ACTUAL_DATE');

    if (reportActualDate) {
      return true;
    }
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

    // ✅ Check if each required PDF has at least 1 file
    const allUploaded = requiredPDFs.every(pdfNum => {
      const files = pdfFilesList[pdfNum] || [];
      return files.length > 0;
    });

    return allUploaded;
  }, [form, ulCertStatus, pdfFilesList]);

  useEffect(() => {
    const canSubmit = checkAllRequiredPDFsUploaded();
    setCanSubmitReport(canSubmit);
  }, [checkAllRequiredPDFsUploaded]);
  useEffect(() => {
    const canSubmit = checkAllRequiredPDFsUploaded();
    setCanSubmitReport(canSubmit);
  }, [checkAllRequiredPDFsUploaded, pdfFiles]);



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
     handleFormChange();
  };
  const checkCanResubmit = useCallback(() => {
  const reportActualDate = form.getFieldValue('PD5_REPORT_ACTUAL_DATE');

  // Nếu đã có report date → không cho resubmit
  if (reportActualDate) {
    setCanResubmitReport(false);
    return;
  }

  // ✅ KIỂM TRA LỊCH SỬ: Nếu không có lịch sử upload → không cho resubmit
  if (!hasUploadHistory) {
    setCanResubmitReport(false);
    return;
  }

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

  // ✅ Kiểm tra tất cả required PDF đã upload
  const allUploaded = requiredPDFs.every(pdfNum => {
    const files = pdfFilesList[pdfNum] || [];
    return files.length > 0;
  });

  setCanResubmitReport(allUploaded);
}, [form, ulCertStatus, pdfFilesList, hasUploadHistory]); // ✅ Thêm hasUploadHistory vào deps

  useEffect(() => {
    checkCanResubmit();
  }, [checkCanResubmit, pdfFiles, reuploadedFiles]);
  const loadPDFInfo = useCallback(async () => {
    if (!certificationId) return;
    try {
      setLoadingPDFs(true);
      const response = await getCertificationPDFInFor(certificationId);
      if (response.success) {
        setPdfFiles(response.pdfFiles || []);
        response.pdfFiles.forEach(pdf => {
          if (pdf.hasFile && pdf.fileCount > 0) {
            loadPDFFiles(pdf.number);
          }
        });
      }
    } catch (error) {
      console.error('Error loading PDF info:', error);
      toast.error('Lỗi khi tải thông tin PDF');
    } finally {
      setLoadingPDFs(false);
    }
  }, [certificationId, loadPDFFiles]);

  useEffect(() => {
    loadPDFInfo();
  }, [loadPDFInfo]);

  useEffect(() => {
    loadPDFInfo();
  }, [loadPDFInfo]);


const handlePDFUpload = async (fileList, pdfNumber) => {
  if (!fileList || fileList.length === 0) return false;

  // ✅ Kiểm tra đang upload
  const uploadKey = `${pdfNumber}-${fileList.map(f => f.name).join('-')}`;
  if (uploadingRef.current[uploadKey]) {
    console.log('⚠️ Duplicate upload prevented for:', uploadKey);
    return false;
  }

  const files = Array.isArray(fileList) ? fileList : [fileList];

  const invalidFiles = files.filter(file => {
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isLt10MB = file.size / 1024 / 1024 < 10;
    return !isPDF || !isLt10MB;
  });

  if (invalidFiles.length > 0) {
    toast.error('Một số file không hợp lệ (chỉ chấp nhận PDF < 10MB)');
    return false;
  }

  try {
    uploadingRef.current[uploadKey] = true;
    setUploadingPDF(prev => ({ ...prev, [pdfNumber]: true }));

    const result = await uploadCertificationPDF(certificationId, pdfNumber, files);
      if (result.success) {
        if (result.isReupload) {
          const uploadedFileNames = files.map(f => f.name);
          setReuploadedFiles(prev => {
            const existingIndex = prev.findIndex(f => f.pdfNumber === pdfNumber);

            if (existingIndex !== -1) {
              return prev.map((item, idx) =>
                idx === existingIndex
                  ? {
                    ...item,
                    files: [...item.files, ...uploadedFileNames]
                  }
                  : item
              );
            } else {
              return [...prev, {
                pdfNumber: pdfNumber,
                label: getPDFLabel(pdfNumber),
                files: uploadedFileNames
              }];
            }
          });

          toast.success(
            `Upload lại ${files.length} file cho ${getPDFLabel(pdfNumber)} thành công`,
            { duration: 3000 }
          );
        } else {
          toast.success(`Tải lên ${files.length} file thành công`);
        }

        await loadPDFInfo();
        await loadPDFFiles(pdfNumber);
        handleFormChange();
      }

    } catch (error) {
    console.error('Upload error:', error);
    toast.error('Lỗi khi tải lên PDF: ' + (error.message || ''));
  } finally {
    delete uploadingRef.current[uploadKey];
    setUploadingPDF(prev => ({ ...prev, [pdfNumber]: false }));
  }

  return false;
};

  const handlePDFDelete = async (fileId, pdfNumber) => {
  try {
    const result = await deleteCertificationPDFFile(certificationId, fileId);

    if (result.success) {
      toast.success(`Xóa file thành công`);

      await loadPDFFiles(pdfNumber);
      await loadPDFInfo();

      const deletedFileName = result.deletedFile || 'unknown';

      setReuploadedFiles(prev => {
        const existingIndex = prev.findIndex(f => f.pdfNumber === pdfNumber);

        if (existingIndex !== -1) {
          const updatedFiles = prev[existingIndex].files.filter(
            fileName => fileName !== deletedFileName
          );

          if (updatedFiles.length === 0) {
            return prev.filter((_, idx) => idx !== existingIndex);
          } else {
            return prev.map((item, idx) =>
              idx === existingIndex
                ? { ...item, files: updatedFiles }
                : item
            );
          }
        }

        return prev;
      });

      // ✅ THÊM: Cập nhật form khi backend xóa DATE_PD5_HQ
      if (result.clearedDatePd5Hq) {
        form.setFieldsValue({
          DATE_PD5_HQ: null
        });
        toast.info('Ngày PD5 gửi tổng đã được xóa do xóa file PDF', {
          duration: 4000
        });
      }

      // ✅ THÊM: Cập nhật progress_id nếu revert về status 4
      if (result.revertedToStatus4) {
        form.setFieldsValue({
          PROGRESS_ID: 4
        });
        toast.info('Trạng thái đã chuyển về "Đang tổng hợp báo cáo"', {
          duration: 4000
        });
      }

      if (result.revertedToStatus3) {
        form.setFieldsValue({
          PD5_REPORT_ACTUAL_DATE: null,
          PROGRESS_ID: 3,
          DATE_PD5_HQ: null  // ✅ Đảm bảo xóa DATE_PD5_HQ
        });
        setReuploadedFiles([]);
        toast.warning('Đã xóa hết PDF. Trạng thái quay về "Đang đánh giá"', {
          duration: 6000
        });
      } else if (result.canResubmit) {
        form.setFieldsValue({
          PD5_REPORT_ACTUAL_DATE: null,
          DATE_PD5_HQ: null  // ✅ Đảm bảo xóa DATE_PD5_HQ
        });
        toast.info('Vui lòng upload lại file cần thiết và nộp báo cáo.', {
          duration: 5000
        });
      }

      handleFormChange();
    }
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    toast.error('Lỗi khi xóa file: ' + error.message);
  }
};


  const handlePDFDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(downloadUrl);

      toast.success('Tải file thành công');
    } catch (err) {
      console.error('Download error:', err);
      toast.error("Không thể tải file");
    }
  };

  const handlePreviewPDFFile = (fileUrl) => {
    window.open(fileUrl, '_blank');
  }

  const checkUploadHistory = useCallback(async () => {
  if (!certificationId) return;
  
  try {
    // Sử dụng API có sẵn
    const data = await fetchCertificationHistory(certificationId);
    
    // Kiểm tra xem có lịch sử upload PDF hoặc submit report không
    const hasHistory = data.data?.some(item => 
      ['UPLOAD_PDF', 'REUPLOAD_PDF', 'SUBMIT_REPORT', 'RESUBMIT_REPORT'].includes(item.actionType)
    );
    
    setHasUploadHistory(hasHistory);
    
    console.log('✅ Upload history check:', {
      certificationId,
      hasHistory,
      totalHistoryRecords: data.data?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error checking upload history:', error);
    // Nếu lỗi, set false để an toàn
    setHasUploadHistory(false);
  }
}, [certificationId]);

// Gọi khi component mount
useEffect(() => {
  checkUploadHistory();
}, [checkUploadHistory]);
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

  const handleFormSave = async () => {
    try {
      await form.validateFields();
      await onFinish(form.getFieldsValue());
      setIsDataSaved(true);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };
  const handleResubmitReport = async () => {
    try {
      setResubmittingReport(true);

      // ✅ Format data để gửi lên backend
      const formattedFiles = reuploadedFiles.map(item => ({
        pdfNumber: item.pdfNumber,
        label: item.label,
        fileNames: item.files // Array of file names
      }));

      const result = await resubmitReport(certificationId, formattedFiles);

      if (result.success) {
        toast.success('Nộp lại báo cáo thành công. Email đã được gửi.', {
          duration: 5000
        });

        const reportDate = result.data.reportDate;
        form.setFieldsValue({
          PD5_REPORT_ACTUAL_DATE: reportDate ? moment(reportDate) : null,
          PROGRESS_ID: 4
        });

        setReuploadedFiles([]);
        setCanResubmitReport(false);

        await loadPDFInfo();
      }
    } catch (error) {
      console.error('Error resubmitting report:', error);
      toast.error('Lỗi khi nộp lại báo cáo: ' + error.message);
    } finally {
      setResubmittingReport(false);
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
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" locale={locale} placeholder="10/16/2024" />
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
            {(shouldShowPDF(1) || shouldShowPDF(7)) && (
              <>
                <Col span={24}>
                  <Divider orientation="left" style={{ marginTop: 0 }}>
                    Báo cáo tính tin cậy
                  </Divider>
                </Col>
                <PDFUploadItem pdfNumber={1} label="Báo cáo tin cậy" />
              </>
            )}

            {(shouldShowPDF(2) || shouldShowPDF(3) || shouldShowPDF(4) ||
              shouldShowPDF(5) || shouldShowPDF(6) || shouldShowPDF(8) || shouldShowPDF(7)) && (
                <>
                  <Col span={24}>
                    <Divider orientation="left">Báo cáo tính gia công</Divider>
                  </Col>

                  {shouldShowPDF(2) && <PDFUploadItem pdfNumber={2} label="NC" />}
                  {shouldShowPDF(3) && <PDFUploadItem pdfNumber={3} label="Gia công ngoại hình" />}
                  {shouldShowPDF(4) && <PDFUploadItem pdfNumber={4} label="Mạ" />}
                  {shouldShowPDF(5) && <PDFUploadItem pdfNumber={5} label="Hàn điểm + Ép lớp" />}
                  {shouldShowPDF(6) && <PDFUploadItem pdfNumber={6} label="LAZER" />}
                  {shouldShowPDF(8) && <PDFUploadItem pdfNumber={8} label="Mực phủ sơn, lấp lỗ, in chữ (Ink)" />}
                  {shouldShowPDF(7) && <PDFUploadItem pdfNumber={7} label="Báo cáo khác" />}
                </>
              )}

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
      <Col>
      </Col>
      {canResubmitReport && (
        <Col span={24}>
          <Form.Item label="Nộp lại báo cáo đánh giá">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message={`Đã upload lại ${reuploadedFiles.reduce((sum, item) => sum + item.files.length, 0)} file PDF`}
                description={
                  <div>
                    <p style={{ marginBottom: '8px' }}>Danh sách file đã upload lại:</p>
                    <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                      {reuploadedFiles.map((item, index) => (
                        <li key={index}>
                          <strong>{item.label}</strong>:
                          <ul style={{ marginTop: '4px', marginBottom: '4px' }}>
                            {item.files.map((fileName, fileIdx) => (
                              <li key={fileIdx} style={{ fontSize: '13px', color: '#666' }}>
                                {fileName}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
                type="success"
                showIcon
              />
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleResubmitReport}
                loading={resubmittingReport}
                size="large"
                style={{
                  backgroundColor: '#10b981',
                  borderColor: '#10b981'
                }}
              >
                Nộp lại báo
              </Button>
            </Space>
          </Form.Item>
        </Col>
      )}

      {/* ===== EXISTING SUBMIT REPORT SECTION (for first time) ===== */}
      {!canResubmitReport && (
        <Col span={24}>
          {canSubmitReport ? (
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
                message={
                  form.getFieldValue('PD5_REPORT_ACTUAL_DATE')
                    ? 'Đã nộp báo cáo trước đó'
                    : 'Chưa đủ điều kiện nộp báo cáo'
                }
                description={
                  form.getFieldValue('PD5_REPORT_ACTUAL_DATE')
                    ? `Đã nộp ngày: ${moment(
                      form.getFieldValue('PD5_REPORT_ACTUAL_DATE')
                    ).format('DD/MM/YYYY')}`
                    : 'Vui lòng upload đầy đủ các file PDF yêu cầu trước khi nộp báo cáo'
                }
                type={form.getFieldValue('PD5_REPORT_ACTUAL_DATE') ? 'info' : 'warning'}
                showIcon
              />
            </Form.Item>
          )}
        </Col>
      )}

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
              locale={locale}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="ACTUAL_COMPLETION_DATE"
            label="Ngày hoàn thành thực tế"
            extra="Khi điền ngày và lưu, trạng thái sẽ tự động chuyển sang 'Hoàn thành'"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="PD5_REPORT_ACTUAL_DATE"
            label="Ngày gửi báo cáo tới PD5 thực tế"
            extra="Tự động cập nhật khi nộp đầy đủ báo cáo."
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
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" locale={locale}/>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="DATE_PD5_GET_REPORT"
            label="Ngày PD5 tổng hợp báo cáo"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" locale={locale}/>
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