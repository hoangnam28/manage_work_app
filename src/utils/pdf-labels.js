
export const PDF_LABELS = {
  1: 'Báo cáo tin cậy',
  2: 'NC',
  3: 'Gia công ngoại hình',
  4: 'Mạ',
  5: 'Hàn điểm + ép lớp',
  6: 'Lazer',
  7: 'Báo cáo khác',
  8: 'Mực phủ sơn, lấp lỗ, in chữ'
};

export const getPDFLabel = (pdfNumber) => {
  return PDF_LABELS[pdfNumber] || `PDF ${pdfNumber}`;
};

export const getAllPDFConfigs = () => {
  return Object.keys(PDF_LABELS).map(num => ({
    number: parseInt(num),
    label: PDF_LABELS[num],
    fieldName: `PDF_FILE_${num}`
  }));
};