import React from 'react';
import { Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'sonner';

const ConfirmReviewResetButton = ({ columnId, field, onResetSuccess }) => {
  const handleConfirmReviewReset = async () => {
    try {
      // Call the reset-review API for the specific field
      await axios.post('http://192.84.105.173:5000/api/document/reset-review-field', {
        column_id: columnId,
        field
      });

      // Notify success
      toast.success(`Đã xác nhận review lại cho thông tin ${field}`);

      // Trigger callback to update the parent component
      if (onResetSuccess) {
        onResetSuccess();
      }
    } catch (error) {
      console.error('Error resetting review status:', error);
      toast.error('Lỗi khi xác nhận review lại');
    }
  };

  return (
    <Button
      type="primary"
      icon={<CheckOutlined />}
      onClick={handleConfirmReviewReset}
      size="small"
      style={{ position: 'absolute', right: '8px', bottom: '8px' }}
    />
  );
};

export default ConfirmReviewResetButton;