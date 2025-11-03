import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, Descriptions, message, Popconfirm, Card, Space } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, } from '@ant-design/icons';
import axios from '../utils/axios';
import MainLayout from '../components/layout/MainLayout';
import { toast, Toaster } from 'sonner';


const DecideBoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validId, setValidId] = useState(null);
  const originalId = useRef(id);
  const [canConfirm, setCanConfirm] = useState(false);


  useEffect(() => {
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setCanConfirm(false);
        return;
      }
      const response = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const department = response.data?.department;
      setCanConfirm(department === 'PC');
    } catch (error) {
      setCanConfirm(false);
    }
  };
  fetchUserInfo();
}, []);

  // Validate ID đơn giản
  const validateId = (idParam) => {
    if (!idParam) return false;
    if (!/^\d+$/.test(idParam)) return false;
    const numId = parseInt(idParam, 10);
    if (isNaN(numId) || numId <= 0) return false;
    return true;
  };

  // Ngăn chặn sửa ID bằng cách theo dõi thay đổi URL
  const detectIdChange = () => {
    if (id !== originalId.current) {
      message.error('Không được phép thay đổi ID!');
      navigate('/decide-use', { replace: true });
      return false;
    }
    return true;
  };

  useEffect(() => {
    // Detect ID change
    const detectIdChange = () => {
      if (id !== originalId.current) {
        message.error('Không được phép thay đổi ID!');
        navigate('/decide-use', { replace: true });
        return false;
      }
      return true;
    };

    // Fetch detail
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/large-size/detail/${id}`);
        setRecord(res.data);
      } catch (err) {
        message.error('Không tìm thấy mã hàng');
        navigate('/decide-use', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (!detectIdChange()) {
      return;
    }

    // Validate ID
    if (!validateId(id)) {
      message.error('ID không hợp lệ!');
      navigate('/decide-use', { replace: true });
      return;
    }

    setValidId(id);
    fetchDetail();
  }, [id, navigate]);

  const handleConfirm = async (requestValue = 'TRUE') => {
    if (!detectIdChange() || !validateId(id) || id !== validId) {
      message.error('Phiên làm việc không hợp lệ!');
      navigate('/decide-use', { replace: true });
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const username = userInfo.username || '';
      if (!username) {
        message.error('Không tìm thấy thông tin người dùng!');
        return;
      }
      await axios.put(`/large-size/update/${id}`, { confirm_by: username, request: requestValue });
      message.success('Xác nhận thành công!');
      toast.success('Xác nhận thành công!');
      navigate('/decide-use');
    } catch (err) {
      message.error('Lỗi xác nhận!');
      toast.error('Lỗi xác nhận!');
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;

  if (!record || !validId) {
    return (
      <MainLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column'
        }}>
          <Card style={{ textAlign: 'center', padding: '40px', maxWidth: 400 }}>
            <h3 style={{ color: '#ff4d4f', marginBottom: 24 }}>Không tìm thấy mã hàng!</h3>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/decide-use')}
              style={{
                borderRadius: '8px',
                minWidth: 160,
                height: 48
              }}
            >
              Quay lại danh sách
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '16px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/decide-use')}
              style={{
                fontSize: 14,
                height: 32,
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                color: '#1890ff'
              }}
            >
              Quay lại danh sách
            </Button>

          </div>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '16px 24px',
            borderRadius: '8px',
            color: 'white',
            textAlign: 'center'
          }}>
            <h1 style={{
              color: 'white',
              margin: 0,
              fontSize: 22,
              fontWeight: 600
            }}>
              Chi tiết yêu cầu sử dụng bo to : {record.CUSTOMER_CODE}
            </h1>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', gap: 16, flex: 1 }}>
          {/* Left Column - Product Info */}
          <div style={{ flex: 1 }}>
            <Card
              title="Thông tin sản phẩm"
              size="small"
              style={{
                borderRadius: '8px',
                height: 'fit-content'
              }}
              headStyle={{
                backgroundColor: '#fafafa',
                borderRadius: '8px 8px 0 0',
                fontSize: 16,
                fontWeight: 600,
                padding: '8px 16px'
              }}
              bodyStyle={{ padding: '12px' }}
            >
              {/* Các trường còn lại */}
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <b>Mã sản phẩm:</b> <span style={{ fontWeight: 500, color: '#1890ff' }}>{record.CUSTOMER_CODE}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Loại bo:</b> <span style={{ fontWeight: 500 }}>{record.TYPE_BOARD}</span>
                </div>
              </div>
              {/* Nhóm Bo thường */}
              <div style={{ border: '1px solid #e6f7ff', borderRadius: 8, marginBottom: 16, background: '#f0f5ff', padding: 12 }}>
                <div style={{ fontWeight: 600, color: '#1890ff', marginBottom: 8, fontSize: 15 }}>Bo thường</div>
                <div style={{ marginBottom: 8 }}>
                  <b>Kích thước tối ưu:</b> <span style={{ fontWeight: 500 }}>{record.SIZE_NORMAL}</span>
                </div>
                <div>
                  <b>Tỷ lệ % (Bo thường):</b> <span style={{ fontWeight: 500, color: '#52c41a' }}>{record.RATE_NORMAL}</span>
                </div>
              </div>
              {/* Nhóm Bo to */}
              <div style={{ border: '1px solid #fff1b8', borderRadius: 8, background: '#fffbe6', padding: 12 }}>
                <div style={{ fontWeight: 600, color: '#fa8c16', marginBottom: 8, fontSize: 15 }}>Bo to</div>
                <div style={{ marginBottom: 8 }}>
                  <b>Kích thước bo to:</b> <span style={{ fontWeight: 500 }}>{record.SIZE_BIG}</span>
                </div>
                <div>
                  <b>Tỷ lệ % (Bo to):</b> <span style={{ fontWeight: 500, color: '#fa8c16' }}>{record.RATE_BIG}</span>
                </div>
              </div>
              <div style={{ border: '1px solid #e6f7ff', borderRadius: 8, background: '#fffbe6', padding: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <b>Ghi chú:</b> <span style={{ fontStyle: record.NOTE ? 'normal' : 'italic', color: record.NOTE ? 'inherit' : '#999' }}>{record.NOTE || 'Không có ghi chú'}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Status Info */}
          <div style={{ flex: 1 }}>
            <Card
              title="Trạng thái xác nhận của PC"
              size="small"
              style={{
                borderRadius: '8px',
                height: 'fit-content',
                marginBottom: 16
              }}
              headStyle={{
                backgroundColor: '#fafafa',
                borderRadius: '8px 8px 0 0',
                fontSize: 16,
                fontWeight: 600,
                padding: '8px 16px'
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Descriptions
                bordered
                column={1}
                size="small"
                labelStyle={{
                  backgroundColor: '#f8f9fa',
                  fontWeight: 600,
                  width: '45%',
                  padding: '8px 12px'
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  padding: '8px 12px'
                }}
              >
                <Descriptions.Item label="Yêu cầu bo to">
                  <span style={{
                    fontWeight: 600,
                    color: record.REQUEST === 'TRUE' ? '#52c41a' : '#ff4d4f',
                    fontSize: 14
                  }}>
                    {record.CONFIRM_BY
                      ? (record.REQUEST === 'TRUE' ? 'Có' : 'Không')
                      : ''}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Xác nhận">
                  <span style={{
                    fontWeight: 500,
                    color: record.CONFIRM_BY ? '#52c41a' : '#faad14'
                  }}>
                    {record.CONFIRM_BY || 'Chưa xác nhận'}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            {!record.CONFIRM_BY && canConfirm && !record.IS_CANCELED && (
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                <Popconfirm
                  title="Xác nhận sử dụng bo to"
                  description="Bạn chắc chắn sử dụng bo to cho mã này?"
                  onConfirm={() => handleConfirm('TRUE')}
                  okText="Xác nhận"
                  cancelText="Hủy"
                >
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    block
                    style={{
                      borderRadius: '6px',
                      height: 40,
                      fontSize: 14,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                      border: 'none'
                    }}
                  >
                    Có sử dụng bo to
                  </Button>
                </Popconfirm>

                <Popconfirm
                  title="Xác nhận không sử dụng bo to"
                  description="Bạn chắc chắn KHÔNG sử dụng bo to cho mã này?"
                  onConfirm={() => handleConfirm('FALSE')}
                  okText="Xác nhận"
                  cancelText="Hủy"
                >
                  <Button
                    icon={<CloseOutlined />}
                    block
                    style={{
                      borderRadius: '6px',
                      height: 40,
                      fontSize: 14,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    Không sử dụng bo to
                  </Button>
                </Popconfirm>
              </Space>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DecideBoardDetail;