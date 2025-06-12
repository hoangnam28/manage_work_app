import { useState, useEffect } from 'react';
import { Modal, Upload, Button, Table, Alert, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Dragger } = Upload;
const { Title } = Typography;

const ImportImpedanceModal = ({ visible, onCancel, onImport }) => {
  const [fileList, setFileList] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
          const data = XLSX.utils.sheet_to_json(firstSheet, {
            header: 1, // Sử dụng array index làm header
            raw: true, // Lấy giá trị thông tin thô
            blankrows: false, // Bỏ qua các hàng trống
            defval: null // Giá trị mặc định cho ô trống
          });
          if (!data || data.length === 0) {
            reject(new Error('File không có dữ liệu.'));
            return;
          }
          const transformedData = data.map((row, rowIndex) => {
            console.log(`Processing row ${rowIndex}:`, row); // Debug log
            const transformedRow = {};

            // Thêm IMP_1 với giá trị null để giữ nguyên kích thước ô
            transformedRow['IMP_1'] = null;

            // Map từ IMP_2 đến IMP_135
            for (let i = 0; i < 134; i++) {
              const value = row[i];
              const impKey = `IMP_${i + 2}`;

              // Xử lý các trường hợp giá trị không hợp lệ
              if (
                value === undefined ||
                value === null ||
                value === '' ||
                value === '-' ||
                String(value).toLowerCase() === 'nan' ||
                String(value).toLowerCase() === 'null'
              ) {
                transformedRow[impKey] = null;
                continue;
              }

              // Nếu là số, kiểm tra tính hợp lệ
              if (typeof value === 'number') {
                if (Number.isFinite(value) && !isNaN(value)) {
                  transformedRow[impKey] = value;
                } else {
                  transformedRow[impKey] = null;
                }
                continue;
              }

              // Nếu là chuỗi, thử parse thành số
              if (typeof value === 'string') {
                const trimmedValue = value.trim();
                const numValue = parseFloat(trimmedValue.replace(/,/g, ''));

                if (!isNaN(numValue) && Number.isFinite(numValue) && trimmedValue.match(/^[-+]?\d*\.?\d+$/)) {
                  transformedRow[impKey] = numValue;
                } else {
                  transformedRow[impKey] = trimmedValue;
                }
                continue;
              }
            }
            const noteValue = row[134];
            if (noteValue !== undefined && noteValue !== null && String(noteValue).trim() !== '' && String(noteValue).toLowerCase() !== 'nan' && String(noteValue).toLowerCase() !== 'null') {
              transformedRow['NOTE'] = String(noteValue).trim();
            } else {
              transformedRow['NOTE'] = null;
            }
            return transformedRow;
          });

          resolve(transformedData);
        } catch (error) {
          console.error('Error parsing Excel:', error);
          reject(new Error('File không đúng định dạng. Vui lòng kiểm tra lại.'));
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);
      const data = await readExcelFile(file);
      
      // Thêm dữ liệu từ file mới vào allData
      setAllData(prevData => [...prevData, ...data]);
      
      // Chỉ hiển thị preview của file mới nhất
      setPreviewData(data);
      return false; // Prevent upload
    } catch (err) {
      setError('Lỗi khi đọc file: ' + err.message);
      return Upload.LIST_IGNORE;
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Import tất cả dữ liệu đã tích lũy
      if (allData.length === 0) {
        throw new Error('Không có dữ liệu để import');
      }
      
      await onImport(allData);
      setAllData([]); // Reset sau khi import thành công
      setFileList([]); 
      setPreviewData([]);
    } catch (err) {
      setError('Lỗi khi import: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'JobName',
      dataIndex: 'IMP_1',
      key: 'imp_1',
      width: 100,
      align: 'center',
    },
    {
      title: 'Mã Hàng',
      dataIndex: 'IMP_2',
      key: 'imp_2',
      width: 100,
      align: 'center',
    },
    {
      title: 'Mã hàng tham khảo',
      dataIndex: 'IMP_3',
      key: 'imp_3',
      width: 100,
      align: 'center',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'IMP_4',
      key: 'imp_4',
      width: 100,
      align: 'center',
    },
    {
      title: 'Loại khách hàng',
      dataIndex: 'IMP_5',
      key: 'imp_5',
      width: 100,
      align: 'center',
    },
    {
      title: 'Ứng dụng',
      dataIndex: 'IMP_6',
      key: 'imp_6',
      width: 100,
      align: 'center',
    },
    {
      title: 'Phân loại sản xuất',
      dataIndex: 'IMP_7',
      key: 'imp_7',
      width: 100,
      align: 'center',
    },
    {
      title: 'Độ dày bo (µm)',
      dataIndex: 'IMP_8',
      key: 'imp_8',
      width: 100,
      align: 'center',
    },
    {
      title: 'Cấu trúc lớp',
      dataIndex: 'IMP_9',
      key: 'imp_9',
      width: 100,
      align: 'center',
    },
    {
      title: 'CCL',
      dataIndex: 'IMP_10',
      key: 'imp_10',
      width: 100,
      align: 'center',
    },
    {
      title: 'PP',
      dataIndex: 'IMP_11',
      key: 'imp_11',
      width: 100,
      align: 'center',
    },
    {
      title: 'Mực phủ sơn',
      dataIndex: 'IMP_12',
      key: 'imp_12',
      width: 100,
      align: 'center',
    },
    {
      title: 'Lấp lỗ vĩnh viễn BVH',
      dataIndex: 'IMP_13',
      key: 'imp_13',
      width: 100,
      align: 'center',
    },
    {
      title: 'Lấp lỗ vĩnh viễn TH',
      dataIndex: 'IMP_14',
      key: 'imp_14',
      width: 100,
      align: 'center',
    },
    {
      title: 'Thông số vật liệu',
      children: [
        {
          title: 'Đồng',
          children: [
            {
              title: 'Lá đồng (µm)',
              dataIndex: 'IMP_15',
              key: 'imp_15',
              width: 100,
              align: 'center',
            },
            {
              title: 'Tỷ lệ đồng còn lại lớp IMP',
              dataIndex: 'IMP_16',
              key: 'imp_16',
              width: 100,
              align: 'center',
            },
            {
              title: 'Tỷ lệ đồng còn lại lớp GND1',
              dataIndex: 'IMP_17',
              key: 'imp_17',
              width: 100,
              align: 'center',
            },
            {
              title: 'Tỷ lê đồng còn lại lớp GND2',
              dataIndex: 'IMP_18',
              key: 'imp_18',
              width: 100,
              align: 'center',
            },

          ],
        },
        {
          title: 'Lớp GND1',
          children: [
            {
              title: 'Mắt lưới',
              dataIndex: 'IMP_19',
              key: 'imp_19',
              width: 100,
              align: 'center',
            },
            {
              title: 'Độ dày (µm)',
              dataIndex: 'IMP_20',
              key: 'imp_20',
              width: 100,
              align: 'center',
            },
            {
              title: '% Nhựa',
              dataIndex: 'IMP_21',
              key: 'imp_21',
              width: 100,
              align: 'center',
            },
          ]
        },
        {
          title: 'Lớp GND2',
          children: [
            {
              title: 'Mắt lưới',
              dataIndex: 'IMP_22',
              key: 'imp_22',
              width: 100,
              align: 'center',
            },
            {
              title: 'Độ dày (µm)',
              dataIndex: 'IMP_23',
              key: 'imp_23',
              width: 100,
              align: 'center',
            },
            {
              title: '% Nhựa',
              dataIndex: 'IMP_24',
              key: 'imp_24',
              width: 100,
              align: 'center',
            },
          ]
        },

      ]
    },
    {
      title: 'Thông tin IMP yêu cầu của khách hàng',
      children: [
        {
          title: 'Giá trị IMP',
          dataIndex: 'IMP_25',
          key: 'imp_25',
          width: 100,
          align: 'center',
        },
        {
          title: 'Dung sai IMP',
          dataIndex: 'IMP_26',
          key: 'imp_26',
          width: 100,
          align: 'center',
        },
        {
          title: 'Loại IMP',
          dataIndex: 'IMP_27',
          key: 'imp_27',
          width: 100,
          align: 'center',
        },
        {
          title: 'Lớp IMP',
          dataIndex: 'IMP_28',
          key: 'imp_28',
          width: 100,
          align: 'center',
        },
        {
          title: 'GAP',
          dataIndex: 'IMP_29',
          key: 'imp_29',
          width: 100,
          align: 'center',
        },
        {
          title: 'Lớp IMP',
          dataIndex: 'IMP_30',
          key: 'imp_30',
          width: 100,
          align: 'center',
        },
        {
          title: 'Lớp GND1',
          dataIndex: 'IMP_31',
          key: 'imp_31',
          width: 100,
          align: 'center',
        },
        {
          title: 'Lớp GND2',
          dataIndex: 'IMP_32',
          key: 'imp_32',
          width: 100,
          align: 'center',
        },
        {
          title: 'L (µm)',
          dataIndex: 'IMP_33',
          key: 'imp_33',
          width: 100,
          align: 'center',
        },
        {
          title: 'S (µm)',
          dataIndex: 'IMP_34',
          key: 'imp_34',
          width: 100,
          align: 'center',
        },
        {
          title: 'GAP',
          dataIndex: 'IMP_35',
          key: 'imp_35',
          width: 100,
          align: 'center',
        },
      ],
    },
    {
      title: 'Tổng hợp kết quả mô phỏng',
      children: [
        {
          title: 'Giá trị IMP',
          dataIndex: 'IMP_36',
          key: 'imp_36',
          width: 100,
          align: 'center',
        },
        {
          title: 'Phủ sơn',
          children: [
            {
              title: 'Độ dày phủ sơn trên PP',
              dataIndex: 'IMP_37',
              key: 'imp_37',
              width: 100,
              align: 'center',
            },
            {
              title: 'Độ dày phủ sơn trên đồng',
              dataIndex: 'IMP_38',
              key: 'imp_38',
              width: 100,
              align: 'center',
            },
            {
              title: 'Độ dày phủ sơn trên PP',
              dataIndex: 'IMP_39',
              key: 'imp_39',
              width: 100,
              align: 'center',
            },
            {
              title: 'DK',
              dataIndex: 'IMP_40',
              key: 'imp_40',
              width: 100,
              align: 'center',
            },
          ]
        },
        {
          title: 'Độ dày đồng (µm)',
          dataIndex: 'IMP_41',
          key: 'imp_41',
          width: 100,
          align: 'center',
        },
        {
          title: 'Lớp GND1',
          children: [
            {
              title: 'Loại',
              dataIndex: 'IMP_42',
              key: 'imp_42',
              width: 100,
              align: 'center',
            },
            {
              title: 'Độ dày(µm)',
              dataIndex: 'IMP_43',
              key: 'imp_43',
              width: 100,
              align: 'center',
            },
            {
              title: 'DK',
              dataIndex: 'IMP_44',
              key: 'imp_44',
              width: 100,
              align: 'center',
            },
          ]
        },
        {
          title: 'Lớp GND2',
          children: [
            {
              title: 'Loại',
              dataIndex: 'IMP_45',
              key: 'imp_45',
              width: 100,
              align: 'center',
            },
            {
              title: 'Độ dày (µm)',
              dataIndex: 'IMP_46',
              key: 'imp_46',
              width: 100,
              align: 'center',
            },
            {
              title: 'DK',
              dataIndex: 'IMP_47',
              key: 'imp_47',
              width: 100,
              align: 'center',
            },
          ]
        },
        {
          title: 'L (µm)',
          children: [
            {
              title: 'Đỉnh đường mạch',
              dataIndex: 'IMP_48',
              key: 'imp_48',
              width: 100,
              align: 'center',
            },
            {
              title: 'Chân đường mạch',
              dataIndex: 'IMP_49',
              key: 'imp_49',
              width: 100,
              align: 'center',
            },
          ]
        },
        {
          title: 'S (µm)',
          dataIndex: 'IMP_50',
          key: 'imp_50',
          width: 100,
          align: 'center',
        },
        {
          title: 'GAP',
          dataIndex: 'IMP_51',
          key: 'imp_51',
          width: 100,
          align: 'center',
        },
      ],
    },
    {
      title: 'Tổng hợp kết quả đo thực tế',
      children: [
        {
          title: 'Giá trị IMP',
          children: [
            {
              title: 'No 1',
              dataIndex: 'IMP_52',
              key: 'imp_52',
              width: 100,
              align: 'center',
            },
            {
              title: 'No 2',
              dataIndex: 'IMP_53',
              key: 'imp_53',
              width: 100,
              align: 'center',
            },
            {
              title: 'No 3',
              dataIndex: 'IMP_54',
              key: 'imp_54',
              width: 100,
              align: 'center',
            },
            {
              title: 'No 4',
              dataIndex: 'IMP_55',
              key: 'imp_55',
              width: 100,
              align: 'center',
            },
            {
              title: 'No 5',
              dataIndex: 'IMP_56',
              key: 'imp_56',
              width: 100,
              align: 'center',
            },
            {
              title: 'AVG',
              dataIndex: 'IMP_57',
              key: 'imp_57',
              width: 100,
              align: 'center',
            },
            {
              title: 'Result',
              dataIndex: 'IMP_58',
              key: 'imp_58',
              width: 100,
              align: 'center',
            },
          ]
        }, {
          title: 'Phủ sơn',
          children: [{
            title: 'Độ dày phủ sơn trên PP',
            children: [
              {
                title: 'No 1',
                dataIndex: 'IMP_59',
                key: 'imp_59',
                width: 100,
                align: 'center',
              },
              {
                title: 'No 2',
                dataIndex: 'IMP_60',
                key: 'imp_60',
                width: 100,
                align: 'center',
              },
              {
                title: 'No 3',
                dataIndex: 'IMP_61',
                key: 'imp_61',
                width: 100,
                align: 'center',
              },
              {
                title: 'No 4',
                dataIndex: 'IMP_62',
                key: 'imp_62',
                width: 100,
                align: 'center',
              },
              {
                title: 'No 5',
                dataIndex: 'IMP_63',
                key: 'imp_63',
                width: 100,
                align: 'center',
              },
              {
                title: 'AVG',
                dataIndex: 'IMP_64',
                key: 'imp_64',
                width: 100,
                align: 'center',
              },
            ]
          },
          {
            title: 'Độ dày phủ sơn trên đồng',
            children: [
              {
                title: 'No 1',
                dataIndex: 'IMP_65',
                key: 'imp_65',
                width: 100,
                align: 'center',
              },
              {
                title: 'No 2',
                dataIndex: 'IMP_66',
                key: 'imp_66',
                width: 100,
                align: 'center',
              },
              {
                title: 'No 3',
                dataIndex: 'IMP_67',
                key: 'imp_67',
                width: 100,
                align: 'center',
              },
              {
                title: 'No 4',
                dataIndex: 'IMP_68',
                key: 'imp_68',
                width: 100,
                align: 'center',
              },
              {
                title: 'No 5',
                dataIndex: 'IMP_69',
                key: 'imp_69',
                width: 100,
                align: 'center',
              },
              {
                title: 'AVG',
                dataIndex: 'IMP_70',
                key: 'imp_70',
                width: 100,
                align: 'center',
              },
            ]
          },
          {
            title: 'Độ dày phủ sơn trên PP',
            children: [
              {
                title: 'No 1',
                dataIndex: 'IMP_71',
                key: 'imp_71',
                width: 100,
                align: 'center',
              },
              {
                title: 'No 2',
                dataIndex: 'IMP_72',
                key: 'imp_72',
                width: 100,
                align: 'center',
              },
              {
                title: 'No 3',
                dataIndex: 'IMP_73',
                key: 'imp_73',
                width: 100,
                align: 'center',
              },
              {
                title: 'No 4',
                dataIndex: 'IMP_74',
                key: 'imp_74',
                width: 100,
                align: 'center',
              },
              {
                title: 'No 5',
                dataIndex: 'IMP_75',
                key: 'imp_75',
                width: 100,
                align: 'center',
              },
              {
                title: 'AVG',
                dataIndex: 'IMP_76',
                key: 'imp_76',
                width: 100,
                align: 'center',
              },
            ]
          },
          {
            title: 'DK',
            dataIndex: 'IMP_77',
            key: 'imp_77',
            width: 100,
          },
          ]
        },
        {
          title: 'Độ dày đồng',
          children: [
            {
              title: 'No 1',
              dataIndex: 'IMP_78',
              key: 'imp_78',
              width: 100,
            },
            {
              title: 'No 2',
              dataIndex: 'IMP_79',
              key: 'imp_79',
              width: 100,
            },
            {
              title: 'No 3',
              dataIndex: 'IMP_80',
              key: 'imp_80',
              width: 100,
            },
            {
              title: 'No 4',
              dataIndex: 'IMP_81',
              key: 'imp_81',
              width: 100,
            },
            {
              title: 'No 5',
              dataIndex: 'IMP_82',
              key: 'imp_82',
              width: 100,
            },
            {
              title: 'AVG',
              dataIndex: 'IMP_83',
              key: 'imp_83',
              width: 100,
            },
          ]
        },
        {
          title: 'Lớp GND1',
          children: [
            {
              title: 'Độ dày PP',
              children: [
                {
                  title: 'No 1',
                  dataIndex: 'IMP_84',
                  key: 'imp_84',
                  width: 100,
                },
                {
                  title: 'No 2',
                  dataIndex: 'IMP_85',
                  key: 'imp_85',
                  width: 100,
                },
                {
                  title: 'No 3',
                  dataIndex: 'IMP_86',
                  key: 'imp_86',
                  width: 100,
                },
                {
                  title: 'No 4',
                  dataIndex: 'IMP_87',
                  key: 'imp_87',
                  width: 100,
                },
                {
                  title: 'No 5',
                  dataIndex: 'IMP_88',
                  key: 'imp_88',
                  width: 100,
                },
                {
                  title: 'AVG',
                  dataIndex: 'IMP_89',
                  key: 'imp_89',
                  width: 100,
                },
              ]
            },
            {
              title: 'DK',
              dataIndex: 'IMP_90',
              key: 'imp_90',
              width: 100,
            }
          ]
        },
        {
          title: 'Lớp GND2',
          children: [
            {
              title: 'Độ dày PP',
              children: [
                {
                  title: 'No 1',
                  dataIndex: 'IMP_91',
                  key: 'imp_91',
                  width: 100,
                },
                {
                  title: 'No 2',
                  dataIndex: 'IMP_92',
                  key: 'imp_92',
                  width: 100,
                },
                {
                  title: 'No 3',
                  dataIndex: 'IMP_93',
                  key: 'imp_93',
                  width: 100,
                },
                {
                  title: 'No 4',
                  dataIndex: 'IMP_94',
                  key: 'imp_94',
                  width: 100,
                },
                {
                  title: 'No 5',
                  dataIndex: 'IMP_95',
                  key: 'imp_95',
                  width: 100,
                },
                {
                  title: 'AVG',
                  dataIndex: 'IMP_96',
                  key: 'imp_96',
                  width: 100,
                },
              ]
            },
            {
              title: 'DK',
              dataIndex: 'IMP_97',
              key: 'imp_97',
              width: 100,
            }
          ]
        },
        {
          title: 'L (µm)',
          children: [
            {
              title: 'Đỉnh đường mạch',
              children: [
                {
                  title: 'No 1',
                  dataIndex: 'IMP_98',
                  key: 'imp_98',
                  width: 100,
                },
                {
                  title: 'No 2',
                  dataIndex: 'IMP_99',
                  key: 'imp_99',
                  width: 100,
                },
                {
                  title: 'No 3',
                  dataIndex: 'IMP_100',
                  key: 'imp_100',
                  width: 100,
                },
                {
                  title: 'No 4',
                  dataIndex: 'IMP_101',
                  key: 'imp_101',
                  width: 100,
                },
                {
                  title: 'No 5',
                  dataIndex: 'IMP_102',
                  key: 'imp_102',
                  width: 100,
                },
                {
                  title: 'AVG',
                  dataIndex: 'IMP_103',
                  key: 'imp_103',
                  width: 100,
                },
              ]
            },
            {
              title: 'Chân đường mạch',
              children: [
                {
                  title: 'No 1',
                  dataIndex: 'IMP_104',
                  key: 'imp_104',
                  width: 100,
                },
                {
                  title: 'No 2',
                  dataIndex: 'IMP_105',
                  key: 'imp_105',
                  width: 100,
                },
                {
                  title: 'No 3',
                  dataIndex: 'IMP_106',
                  key: 'imp_106',
                  width: 100,
                },
                {
                  title: 'No 4',
                  dataIndex: 'IMP_107',
                  key: 'imp_107',
                  width: 100,
                },
                {
                  title: 'No 5',
                  dataIndex: 'IMP_108',
                  key: 'imp_108',
                  width: 100,
                },
                {
                  title: 'AVG',
                  dataIndex: 'IMP_109',
                  key: 'imp_109',
                  width: 100,
                },
              ]
            }
          ]
        },
        {
          title: 'S (µm)',
          children: [
            {
              title: 'No 1',
              dataIndex: 'IMP_110',
              key: 'imp_110',
              width: 100,
            },
            {
              title: 'No 2',
              dataIndex: 'IMP_111',
              key: 'imp_111',
              width: 100,
            },
            {
              title: 'No 3',
              dataIndex: 'IMP_112',
              key: 'imp_112',
              width: 100,
            },
            {
              title: 'No 4',
              dataIndex: 'IMP_113',
              key: 'imp_113',
              width: 100,
            },
            {
              title: 'No 5',
              dataIndex: 'IMP_114',
              key: 'imp_114',
              width: 100,
            },
            {
              title: 'AVG',
              dataIndex: 'IMP_115',
              key: 'imp_115',
              width: 100,
            },
          ]
        },
        {
          title: 'GAP ',
          children: [
            {
              title: 'No 1',
              dataIndex: 'IMP_116',
              key: 'imp_116',
              width: 100,
            },
            {
              title: 'No 2',
              dataIndex: 'IMP_117',
              key: 'imp_117',
              width: 100,
            },
            {
              title: 'No 3',
              dataIndex: 'IMP_118',
              key: 'imp_118',
              width: 100,
            },
            {
              title: 'No 4',
              dataIndex: 'IMP_119',
              key: 'imp_119',
              width: 100,
            },
            {
              title: 'No 5',
              dataIndex: 'IMP_120',
              key: 'imp_120',
              width: 100,
            },
            {
              title: 'AVG',
              dataIndex: 'IMP_121',
              key: 'imp_121',
              width: 100,
            },
          ]
        }
      ]
    },
    {
      title: 'So sánh kết quả giữ mô phỏng và thực tế',
      children: [
        {
          title: 'Giá trị IMP',
          dataIndex: 'IMP_122',
          key: 'imp_122',
          width: 100,
          align: 'center',
        },
        {
          title: 'Phủ sơn',
          children: [
            {
              title: 'Độ dày phủ sơn trên PP',
              dataIndex: 'IMP_123',
              key: 'imp_123',
              width: 100,
              align: 'center',
            },
            {
              title: 'Độ dày phủ sơn trên đồng',
              dataIndex: 'IMP_124',
              key: 'imp_124',
              width: 100,
              align: 'center',
            },
            {
              title: 'Độ dày phủ sơn trên PP',
              dataIndex: 'IMP_125',
              key: 'imp_125',
              width: 100,
              align: 'center',
            },
            {
              title: 'DK',
              dataIndex: 'IMP_126',
              key: 'imp_126',
              width: 100,
              align: 'center',
            },
          ]
        },
        {
          title: 'Độ dày đồng (µm)',
          dataIndex: 'IMP_127',
          key: 'imp_127',
          width: 100,
          align: 'center',
        },
        {
          title: 'Lớp GND1',
          children: [
            {
              title: 'Độ dày PP',
              dataIndex: 'IMP_128',
              key: 'imp_128',
              width: 100,
              align: 'center',
            },
            {
              title: 'DK',
              dataIndex: 'IMP_129',
              key: 'imp_129',
              width: 100,
              align: 'center',
            },
          ]
        },
        {
          title: 'Lớp GND2',
          children: [
            {
              title: 'Độ dày PP',
              dataIndex: 'IMP_130',
              key: 'imp_130',
              width: 100,
              align: 'center',
            },
            {
              title: 'DK',
              dataIndex: 'IMP_131',
              key: 'imp_131',
              width: 100,
              align: 'center',
            },
          ]
        },
        {
          title: 'L (µm)',
          children: [
            {
              title: 'Đỉnh đường mạch',
              dataIndex: 'IMP_132',
              key: 'imp_132',
              width: 100,
              align: 'center',
            },
            {
              title: 'Chân đường mạch',
              dataIndex: 'IMP_133',
              key: 'imp_133',
              width: 100,
              align: 'center',
            },
          ]
        },
        {
          title: 'S (µm)',
          dataIndex: 'IMP_134',
          key: 'imp_134',
          width: 100,
          align: 'center',
        },
        {
          title: 'GAP',
          dataIndex: 'IMP_135',
          key: 'imp_135',
          width: 100,
          align: 'center',
        },
      ]
    },
    {
      title: 'Ghi chú',
      dataIndex: 'NOTE',
      key: 'note',
      width: 200,
    },

  ];

  const uploadProps = {
    accept: '.xlsx,.xls',
    fileList,
    beforeUpload: handleUpload,
    onRemove: () => {
      setFileList([]);
      setPreviewData([]);
      setError(null);
    },
    onChange: (info) => {
      setFileList(info.fileList.slice(-1));
    }
  };

  // Reset state khi đóng modal
  useEffect(() => {
    if (!visible) {
      setAllData([]);
      setFileList([]);
      setPreviewData([]);
      setError(null);
    }
  }, [visible]);

  return (
    <Modal
      title="Import dữ liệu từ Excel"
      visible={visible}
      onCancel={() => {
        setFileList([]);
        setPreviewData([]);
        setError(null);
        onCancel();
      }}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="import"
          type="primary"
          onClick={handleImport}
          loading={loading}
          disabled={previewData.length === 0}
        >
          Import
        </Button>
      ]}
    >
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click hoặc kéo thả file Excel vào đây để tải lên
        </p>
        <p className="ant-upload-hint">
          Chỉ hỗ trợ file Excel (.xlsx, .xls)
        </p>
      </Dragger>

      {previewData.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Title level={4}>Xem trước dữ liệu</Title>
          <Table
            columns={columns}
            dataSource={previewData.map((item, index) => ({
              ...item,
              key: index
            }))}
            scroll={{ y: 400 }}
            pagination={{
              defaultPageSize: 5,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} dòng`
            }}
          />
        </div>
      )}
    </Modal>
  );
};

export default ImportImpedanceModal;
