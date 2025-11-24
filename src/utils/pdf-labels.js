
export const PDF_LABELS = {
  1: 'RELABILITY FILE',
  2: 'NC FILE',
  3: 'GCNG FILE',
  4: 'PLATING FILE',
  5: 'LAMINATE + SPOT WELDING FILE',
  6: 'LAZER FILE',
  7: 'Other FILE',
  8: 'Mực phủ sơn, lấp lỗ, in chữ'
};

/**
 * Lấy label cho PDF number
 */
export const getPDFLabel = (pdfNumber) => {
  return PDF_LABELS[pdfNumber] || `PDF ${pdfNumber}`;
};

/**
 * Lấy tất cả PDF configs
 */
export const getAllPDFConfigs = () => {
  return Object.keys(PDF_LABELS).map(num => ({
    number: parseInt(num),
    label: PDF_LABELS[num],
    fieldName: `PDF_FILE_${num}`
  }));
};