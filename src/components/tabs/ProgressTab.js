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
  getCertificationPDFUrl
} from '../../utils/material-certification-api';

const { TextArea } = Input;

const ProgressTab = ({
  form,
  onFinish,
  loading,
  options,
  currentProgressId,
  onApprovalSuccess,
  personAcceptQL2,
  certificationId
}) => {
  const navigate = useNavigate();
  const [canApprove, setCanApprove] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [loadingPDFs, setLoadingPDFs] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState({});

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
  }, [certificationId]); // chỉ thay đổi khi certificationId thay đổi

  useEffect(() => {
    loadPDFInfo();
  }, [loadPDFInfo]); // bây giờ ESLint sẽ không cảnh báo

  const handlePDFUpload = async (file, pdfNumber) => {
    console.log('📄 File info:', {
      name: file.name,
      type: file.type,
      size: file.size,
      pdfNumber: pdfNumber
    });

    const isPDF = file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

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
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi khi tải lên PDF: ' + (error.message || ''));
    } finally {
      setUploadingPDF(prev => ({ ...prev, [pdfNumber]: false }));
    }

    return false;
  };
  const handlePDFDelete = async (pdfNumber) => {
    try {
      await deleteCertificationPDF(certificationId, pdfNumber);
      toast.success(`Xoá ${getPDFLabel(pdfNumber)} thành công`);
      await loadPDFInfo();
    } catch (error) {
      toast.error('Lỗi khi xoá PDF' + error.message);
    }
  }

  const handlePDFDownload = async (pdfNumber, fileName) => {
    try {
      await downloadCertificationPDF(certificationId, pdfNumber, fileName);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Lỗi khi download PDF: ' + error.message);
    }
  };

  const handlePDFPreview = (pdfNumber) => {
    const url = getCertificationPDFUrl(certificationId, pdfNumber);
    if (url) {
      window.open(url, '_blank');
    }
  };

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

  // Reset saved status when form values change
  const handleFormChange = () => {
    setIsDataSaved(false);
    checkRequiredFields();
  };

  // Handle form save
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

      {(personAcceptQL2) && (
        <div style={{ marginBottom: '24px' }}>
          {personAcceptQL2 && (
            <Alert
              message="QL2-(PD5) đã phê duyệt"
              description={`Người phê duyệt: ${personAcceptQL2}`}
              type="success"
              showIcon
            />
          )}
        </div>
      )}
      <div style={{ backgroundColor: '#f0f8ff', borderRadius: '8px', marginBottom: '24px' }}>
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
          <Col span={24}>
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

      <div style={{ backgroundColor: '#f0f8ff', borderRadius: '8px', marginBottom: '24px' }}>
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
      <Divider orientation="left">Phân công thực hiện</Divider>
      <Row
        gutter={16}
        style={{
          backgroundColor: '#e6f7ff',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
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

        <Col span={24}>
          <Form.Item
            name="REPORT_LINK"
            label="Link gửi báo cáo đánh giá"
            extra="Khi điền link và lưu, sẽ tự động cập nhật 'Ngày gửi báo cáo tới PD5 thực tế'"
          >
            <TextArea rows={1} placeholder="https://example.com/bao-cao" />
          </Form.Item>
        </Col>
      </Row>
      <Divider orientation="left">Báo cáo tin cậy</Divider>
      <Row
        gutter={16}
        style={{
          backgroundColor: '#f8fff0ff',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        {loadingPDFs ? (
          <Col span={24} style={{ textAlign: 'center' }}>
            <Spin />
            <div style={{ marginTop: '12px', color: '#999' }}>
              Đang tải thông tin PDF files...
            </div>
          </Col>
        ) : (
          <>
            <Col span={12}>
              <Form.Item label="Báo cáo tin cậy">
                {pdfFiles.find(p => p.number === 1)?.hasFile ? (
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pdfFiles.find(p => p.number === 1)?.fileName}
                        </span>
                      </div>
                      <Space size="small">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handlePDFPreview(1)}
                        >
                          Xem
                        </Button>
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handlePDFDownload(1, pdfFiles.find(p => p.number === 1)?.fileName)}
                        >
                          Tải về
                        </Button>
                        <Popconfirm
                          title="Xác nhận xóa PDF"
                          description="Bạn có chắc chắn muốn xóa file này?"
                          onConfirm={() => handlePDFDelete(1)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </Space>
                    </Space>
                  </div>
                ) : (
                  <Upload
                    beforeUpload={(file) => handlePDFUpload(file, 1)}
                    showUploadList={false}
                    accept=".pdf"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploadingPDF[1]}
                      block
                    >
                      {uploadingPDF[1] ? 'Đang upload...' : 'Chọn file PDF'}
                    </Button>
                  </Upload>
                )}
              </Form.Item>
            </Col>

            <Divider orientation="left">Báo cáo gia công ngoại hình</Divider>
            <Col span={12}>
              <Form.Item label="NC">
                {pdfFiles.find(p => p.number === 2)?.hasFile ? (
                  <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pdfFiles.find(p => p.number === 2)?.fileName}
                        </span>
                      </div>
                      <Space size="small">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handlePDFPreview(2)}
                        >
                          Xem
                        </Button>
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handlePDFDownload(2, pdfFiles.find(p => p.number === 2)?.fileName)}
                        >
                          Tải về
                        </Button>
                        <Popconfirm
                          title="Xác nhận xóa PDF"
                          description="Bạn có chắc chắn muốn xóa file này?"
                          onConfirm={() => handlePDFDelete(2)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </Space>
                    </Space>
                  </div>
                ) : (
                  <Upload
                    beforeUpload={(file) => handlePDFUpload(file, 2)}
                    showUploadList={false}
                    accept=".pdf"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploadingPDF[2]}
                      block
                    >
                      {uploadingPDF[2] ? 'Đang upload...' : 'Chọn file PDF'}
                    </Button>
                  </Upload>
                )}
              </Form.Item>
            </Col>

            {/* PDF 3: Gia công ngoại hình */}
            <Col span={12}>
              <Form.Item label="Gia công ngoại hình">
                {pdfFiles.find(p => p.number === 3)?.hasFile ? (
                  <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pdfFiles.find(p => p.number === 3)?.fileName}
                        </span>
                      </div>
                      <Space size="small">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handlePDFPreview(3)}
                        >
                          Xem
                        </Button>
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handlePDFDownload(3, pdfFiles.find(p => p.number === 3)?.fileName)}
                        >
                          Tải về
                        </Button>
                        <Popconfirm
                          title="Xác nhận xóa PDF"
                          description="Bạn có chắc chắn muốn xóa file này?"
                          onConfirm={() => handlePDFDelete(3)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </Space>
                    </Space>
                  </div>
                ) : (
                  <Upload
                    beforeUpload={(file) => handlePDFUpload(file, 3)}
                    showUploadList={false}
                    accept=".pdf"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploadingPDF[3]}
                      block
                    >
                      {uploadingPDF[3] ? 'Đang upload...' : 'Chọn file PDF'}
                    </Button>
                  </Upload>
                )}
              </Form.Item>
            </Col>

            {/* PDF 4: Mạ */}
            <Col span={12}>
              <Form.Item label="Mạ">
                {pdfFiles.find(p => p.number === 4)?.hasFile ? (
                  <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pdfFiles.find(p => p.number === 4)?.fileName}
                        </span>
                      </div>
                      <Space size="small">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handlePDFPreview(4)}
                        >
                          Xem
                        </Button>
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handlePDFDownload(4, pdfFiles.find(p => p.number === 4)?.fileName)}
                        >
                          Tải về
                        </Button>
                        <Popconfirm
                          title="Xác nhận xóa PDF"
                          description="Bạn có chắc chắn muốn xóa file này?"
                          onConfirm={() => handlePDFDelete(4)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </Space>
                    </Space>
                  </div>
                ) : (
                  <Upload
                    beforeUpload={(file) => handlePDFUpload(file, 4)}
                    showUploadList={false}
                    accept=".pdf"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploadingPDF[4]}
                      block
                    >
                      {uploadingPDF[4] ? 'Đang upload...' : 'Chọn file PDF'}
                    </Button>
                  </Upload>
                )}
              </Form.Item>
            </Col>

            {/* PDF 5: Hàn điểm + Ép lớp */}
            <Col span={12}>
              <Form.Item label="Hàn điểm + Ép lớp">
                {pdfFiles.find(p => p.number === 5)?.hasFile ? (
                  <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pdfFiles.find(p => p.number === 5)?.fileName}
                        </span>
                      </div>
                      <Space size="small">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handlePDFPreview(5)}
                        >
                          Xem
                        </Button>
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handlePDFDownload(5, pdfFiles.find(p => p.number === 5)?.fileName)}
                        >
                          Tải về
                        </Button>
                        <Popconfirm
                          title="Xác nhận xóa PDF"
                          description="Bạn có chắc chắn muốn xóa file này?"
                          onConfirm={() => handlePDFDelete(5)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </Space>
                    </Space>
                  </div>
                ) : (
                  <Upload
                    beforeUpload={(file) => handlePDFUpload(file, 5)}
                    showUploadList={false}
                    accept=".pdf"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploadingPDF[5]}
                      block
                    >
                      {uploadingPDF[5] ? 'Đang upload...' : 'Chọn file PDF'}
                    </Button>
                  </Upload>
                )}
              </Form.Item>
            </Col>

            {/* PDF 6: LAZER */}
            <Col span={12}>
              <Form.Item label="LAZER ">
                {pdfFiles.find(p => p.number === 6)?.hasFile ? (
                  <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pdfFiles.find(p => p.number === 6)?.fileName}
                        </span>
                      </div>
                      <Space size="small">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handlePDFPreview(6)}
                        >
                          Xem
                        </Button>
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handlePDFDownload(6, pdfFiles.find(p => p.number === 6)?.fileName)}
                        >
                          Tải về
                        </Button>
                        <Popconfirm
                          title="Xác nhận xóa PDF"
                          description="Bạn có chắc chắn muốn xóa file này?"
                          onConfirm={() => handlePDFDelete(6)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </Space>
                    </Space>
                  </div>
                ) : (
                  <Upload
                    beforeUpload={(file) => handlePDFUpload(file, 6)}
                    showUploadList={false}
                    accept=".pdf"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploadingPDF[6]}
                      block
                    >
                      {uploadingPDF[6] ? 'Đang upload...' : 'Chọn file PDF'}
                    </Button>
                  </Upload>
                )}
              </Form.Item>
            </Col>

            {/* PDF 7: Other */}
            <Col span={12}>
              <Form.Item label="Other">
                {pdfFiles.find(p => p.number === 7)?.hasFile ? (
                  <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pdfFiles.find(p => p.number === 7)?.fileName}
                        </span>
                      </div>
                      <Space size="small">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handlePDFPreview(7)}
                        >
                          Xem
                        </Button>
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handlePDFDownload(7, pdfFiles.find(p => p.number === 7)?.fileName)}
                        >
                          Tải về
                        </Button>
                        <Popconfirm
                          title="Xác nhận xóa PDF"
                          description="Bạn có chắc chắn muốn xóa file này?"
                          onConfirm={() => handlePDFDelete(7)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </Space>
                    </Space>
                  </div>
                ) : (
                  <Upload
                    beforeUpload={(file) => handlePDFUpload(file, 7)}
                    showUploadList={false}
                    accept=".pdf"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploadingPDF[7]}
                      block
                    >
                      {uploadingPDF[7] ? 'Đang upload...' : 'Chọn file PDF'}
                    </Button>
                  </Upload>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mực phủ sơn, lấp lỗ, in chữ">
                {pdfFiles.find(p => p.number === 8)?.hasFile ? (
                  <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pdfFiles.find(p => p.number === 8)?.fileName}
                        </span>
                      </div>
                      <Space size="small">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handlePDFPreview(8)}
                        >
                          Xem
                        </Button>
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handlePDFDownload(8, pdfFiles.find(p => p.number === 8)?.fileName)}
                        >
                          Tải về
                        </Button>
                        <Popconfirm
                          title="Xác nhận xóa PDF"
                          description="Bạn có chắc chắn muốn xóa file này?"
                          onConfirm={() => handlePDFDelete(8)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </Space>
                    </Space>
                  </div>
                ) : (
                  <Upload
                    beforeUpload={(file) => handlePDFUpload(file, 8)}
                    showUploadList={false}
                    accept=".pdf"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploadingPDF[8]}
                      block
                    >
                      {uploadingPDF[8] ? 'Đang upload...' : 'Chọn file PDF'}
                    </Button>
                  </Upload>
                )}
              </Form.Item>
            </Col>

            {/* Summary */}
            <Col span={24}>
              <Alert
                message={`Đã upload ${pdfFiles.filter(p => p.hasFile).length}/8 file PDF`}
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            </Col>
          </>
        )}
      </Row>
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