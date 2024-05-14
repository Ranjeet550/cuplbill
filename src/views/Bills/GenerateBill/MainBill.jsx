import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BillPdf from "../downloads/BillPdf";

const MainBill = ({ charges, totalPages, totalCharges, totalBill, bills, group, session, billfor }) => {
  const [selectedGST, setSelectedGST] = useState(() => {
    // Initialize with the value from localStorage or default to 0 if not found
    return localStorage.getItem("selectedGST") || 0;
  });

  // Fetch selected GST from the database when the component mounts
  useEffect(() => {
    // Example fetch operation
    fetchSelectedGSTFromDatabase()
      .then(gst => {
        setSelectedGST(parseFloat(gst)); // Update selected GST state
      })
      .catch(error => {
        console.error("Error fetching selected GST:", error);
        // Handle error
      });
  }, []); // Empty dependency array ensures the effect runs only once on mount

  // Save selected GST to localStorage whenever it changes
  // useEffect(() => {
  //   localStorage.setItem("selectedGST", selectedGST);
  // }, [selectedGST]);

  // Functions for calculating totals
  const calculateTotalAmountWithoutGST = () => {
    let totalAmountWithoutGST = 0;
    Object.values(totalCharges).forEach(totalCharge => {
      totalAmountWithoutGST += parseFloat(totalCharge);
    });
    return totalAmountWithoutGST.toFixed(2);
  };

  const calculateTotalGST = () => {
    const totalAmountWithoutGST = calculateTotalAmountWithoutGST();
    return (totalAmountWithoutGST * selectedGST / 100).toFixed(2);
  };

  const calculateTotalAmountWithGST = () => {
    const totalAmountWithoutGST = calculateTotalAmountWithoutGST();
    return (parseFloat(totalAmountWithoutGST) + parseFloat(calculateTotalGST())).toFixed(2);
  };

  const downloadExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const mainBillWorksheet = workbook.addWorksheet("Main Bill");
    const coverPageWorksheet = workbook.addWorksheet("Cover Page");

    // Populate Main Bill worksheet
    const mainBillHeaderStyle = {
      font: { bold: true },
      alignment: { horizontal: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFCCCCCC" } },
    };

    const mainBillDataStyle = {
      alignment: { horizontal: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" } },
    };

    // Add header row
    const mainBillHeaderRow = mainBillWorksheet.addRow([
      "S.N.",
      "Catch No",
      "Quantity",
      "Pages",
      ...charges.map((charge) => charge.chargeTypeName),
      "Total Charges",
    ]);
    mainBillHeaderRow.eachCell((cell) => {
      cell.style = mainBillHeaderStyle;
    });
    console.log(bills)
    // Add data rows
    bills.forEach((bill, index) => {
      const mainBillDataRow = mainBillWorksheet.addRow([
        index + 1,
        bill.catchNumber,
        bill.quantity,
        bill.pages,
        ...charges.map((charge) => parseFloat(bill.bill[charge.chargeTypeName]).toFixed(2)),
        parseFloat(bill.totalItemCharges).toFixed(2),
      ]);
      mainBillDataRow.eachCell((cell) => {
        cell.style = mainBillDataStyle;
      });
    });

    // Add cumulative total row
    const mainBillCumulativeTotalRow = mainBillWorksheet.addRow([
      "Cumulative Total",
      "---",
      "---",
      totalPages,
      ...charges.map((charge) => parseFloat(totalCharges[charge.chargeTypeName] || 0).toFixed(2)),
      parseFloat(totalBill).toFixed(2),
    ]);
    mainBillCumulativeTotalRow.eachCell((cell) => {
      cell.style = mainBillHeaderStyle;
    });

    // Set column widths
    mainBillWorksheet.columns.forEach((column) => {
      column.width = 25;
    });


    // Populate Cover Page worksheet
    // Add header row and apply styling
    const headerRow = coverPageWorksheet.addRow(["S.N.", "Particulars", "Rate(RS.)", "Amount in RS."]);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } };

    // Add data rows and apply styling
    Object.entries(totalCharges).forEach(([chargeType, totalCharge], index) => {
      const rate = parseFloat(charges.find(charge => charge.chargeTypeName === chargeType).rateBooklet || charges.find(charge => charge.chargeTypeName === chargeType).ratePaper || 0).toFixed(2);
      const amountWithoutGST = parseFloat(totalCharge).toFixed(2);
      const dataRow = coverPageWorksheet.addRow([index + 1, chargeType, rate, amountWithoutGST]);
      dataRow.alignment = { horizontal: 'center' };
    });

    // Add rows for total amounts and GST
    const totalAmountWithoutGST = calculateTotalAmountWithoutGST();
    const totalGST = calculateTotalGST();
    const totalAmountWithGST = calculateTotalAmountWithGST();
    const totalAmountWithoutGSTRow = coverPageWorksheet.addRow(["", "Total Amount without GST:", "", totalAmountWithoutGST]);
    const GSTPercentageRow = coverPageWorksheet.addRow(["", `GST(${selectedGST}%)`, "", totalGST]);
    const totalAmountWithGSTRow = coverPageWorksheet.addRow(["", "Total Amount with GST:", "", totalAmountWithGST]);

    // Apply styling to total amounts and GST rows
    [totalAmountWithoutGSTRow, GSTPercentageRow, totalAmountWithGSTRow].forEach(row => {
      row.font = { bold: true };
      row.alignment = { horizontal: 'right' };
    });

    // Apply borders to cells
    coverPageWorksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
    });

    // Customize column widths
    coverPageWorksheet.columns.forEach(column => {
      column.width = 25;
    });

    // Set print options to fit all columns and rows on one page
    coverPageWorksheet.pageSetup.fitToPage = true;
    coverPageWorksheet.pageSetup.fitToWidth = 1;
    coverPageWorksheet.pageSetup.fitToHeight = 0;

    // Write workbook to buffer and save
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "main_bill_with_cover_page.xlsx");
    });
  };

  return (

    <div>
      <h2>Main Bill</h2>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>S.N.</th>
              <th style={{ whiteSpace: "nowrap" }}>Catch No</th>
              <th>Quantity</th>
              <th>Pages</th>
              {charges.map((charge) => (
                <th key={charge.chargeDetailId}>{charge.chargeTypeName}</th>
              ))}
              <th>Total Charges</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td style={{ wordWrap: "break-word" }}>{bill.catchNumber}</td>
                <td>{bill.quantity}</td>
                <td>{bill.pages}</td>
                {charges.map((charge) => (
                  <td key={charge.chargeDetailId}>
                    {parseFloat(bill.bill[charge.chargeTypeName]).toFixed(2)}
                  </td>
                ))}
                <td>{parseFloat(bill.totalItemCharges).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="table-dark">
            <tr>
              <td colSpan={3}>Cumulative Total</td>
              <td>{totalPages}</td>
              {charges.map((charge) => (
                <td key={charge.chargeDetailId}>
                  {parseFloat(totalCharges[charge.chargeTypeName] || 0).toFixed(2)}
                </td>
              ))}
              <td>{parseFloat(totalBill).toFixed(2)}</td>
            </tr>
          </tfoot>
        </Table>
      </div>
      
        <div style={{ marginTop: "10px" }}>
          {/* <Button onClick={downloadExcel}>Download Excel</Button> */}
          <span style={{ marginLeft: "10px" }}></span>
          {/* <PDFDownloadLink
            document={
              <BillPdf
                charges={charges}
                totalPages={totalPages}
                totalCharges={totalCharges}
                totalBill={totalBill}
                bills={bills}
                group={group}
                session={session}
                billfor={billfor}
              />
            }
            fileName="main_bill.pdf"
          >
            {({ loading }) =>
              loading ? <Button>Loading...</Button> : <Button>Download PDF</Button>
            }
          </PDFDownloadLink> */}
        </div>
      
    </div>
  );
};



MainBill.propTypes = {
  charges: PropTypes.array.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalCharges: PropTypes.object.isRequired,
  totalBill: PropTypes.number.isRequired,
  bills: PropTypes.array.isRequired,
  group: PropTypes.string.isRequired,
  session: PropTypes.string.isRequired,
  billfor: PropTypes.string.isRequired,
};

// Function to fetch selected GST from the database
const fetchSelectedGSTFromDatabase = async () => {
  // Example fetch operation
  const response = await fetch("https://localhost:7247/api/GstTypes");
  const data = await response.json();
  return data.selectedGST;
};

export default MainBill;
