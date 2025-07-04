import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, Descriptions, message, Popconfirm } from 'antd';
import axios from '../utils/axios';
import MainLayout from '../components/layout/MainLayout';
import { toast, Toaster } from 'sonner';

const DecideBoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/large-size/detail/${id}`);
        setRecord(res.data);
      } catch (err) {
        message.error('Không tìm thấy mã hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleConfirm = async (requestValue = 'TRUE') => {

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

  if (loading) return <Spin />;

  if (!record) return <div>Không tìm thấy mã hàng</div>;

  return (
    <MainLayout>
      <Toaster position="top-right" richColors />
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <h2>Chi tiết yêu cầu sử dụng bo to của mã hàng: {record.CUSTOMER_CODE}</h2>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Mã sản phẩm">{record.CUSTOMER_CODE}</Descriptions.Item>
          <Descriptions.Item label="Loại bo">{record.TYPE_BOARD}</Descriptions.Item>
          <Descriptions.Item label="Kích thước Tối ưu">{record.SIZE_NORMAL}</Descriptions.Item>
          <Descriptions.Item label="Tỷ lệ % (Bo thường)">{record.RATE_NORMAL}</Descriptions.Item>
          <Descriptions.Item label="Kích thước bo to">{record.SIZE_BIG}</Descriptions.Item>
          <Descriptions.Item label="Tỷ lệ % (Bo to)">{record.RATE_BIG}</Descriptions.Item>
          <Descriptions.Item label="Yêu cầu sử dụng bo to">{record.REQUEST === 'TRUE' ? 'Có' : 'Không'}</Descriptions.Item>
          <Descriptions.Item label="Xác nhận">{record.CONFIRM_BY || 'Chưa xác nhận'}</Descriptions.Item>
          <Descriptions.Item label="Ghi chú">{record.NOTE}</Descriptions.Item>
        </Descriptions>
        {!record.CONFIRM_BY && (
          <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
            <Popconfirm
              title="Bạn chắc chắn sử dụng bo to cho mã này?"
              onConfirm={() => handleConfirm('TRUE')}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button type="primary" size="large">Có sử dụng bo to</Button>
            </Popconfirm>
            <Popconfirm
              title="Bạn chắc chắn KHÔNG sử dụng bo to cho mã này?"
              onConfirm={() => handleConfirm('FALSE')}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button type="default" size="large">Không sử dụng bo to</Button>
            </Popconfirm>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DecideBoardDetail;