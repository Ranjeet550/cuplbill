import ExcelJS from 'exceljs';
import PropTypes from 'prop-types';

const BillExcel = ({ charges, totalPages, totalCharges, totalBill, bills, group, session, billfor }) => {
  const generateExcel = () => {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Main Bill');

    // Set up header row
    const headerRow = worksheet.addRow(['S.N.', 'Catch No', 'Quantity', 'Pages', ...charges.map(charge => charge.chargeTypeName), 'Total Charges']);

    // Add data rows
    bills.forEach((bill, index) => {
      const dataRow = worksheet.addRow([
        index + 1,
        bill.catchNumber,
        bill.quantity,
        bill.pages,
        ...charges.map(charge => parseFloat(bill.bill[charge.chargeTypeName]).toFixed(2)),
        parseFloat(bill.totalItemCharges).toFixed(2)
      ]);
    });

    // Add cumulative total row
    const cumulativeTotalRow = worksheet.addRow(['Cumulative Total', '', '', totalPages, ...charges.map(charge => parseFloat(totalCharges[charge.chargeTypeName] || 0).toFixed(2)), parseFloat(totalBill).toFixed(2)]);

    // Set column widths
    worksheet.columns.forEach(column => {
      column.width = 15; // Adjust the width as needed
    });

    // Save the workbook
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const filename = 'main_bill.xlsx';
      saveAs(blob, filename);
    });
  };

  return (
    <div>
      <button onClick={generateExcel}>Download Excel</button>
    </div>
  );
};

BillExcel.propTypes = {
  charges: PropTypes.array.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalCharges: PropTypes.object.isRequired,
  totalBill: PropTypes.number.isRequired,
  bills: PropTypes.array.isRequired,
  group: PropTypes.string.isRequired,
  session: PropTypes.string.isRequired,
  billfor: PropTypes.string.isRequired,
};

export default BillExcel;
