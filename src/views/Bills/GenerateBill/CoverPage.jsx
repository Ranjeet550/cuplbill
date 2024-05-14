import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ExcelJS from "exceljs";
import { saveAs } from 'file-saver';
import { PDFDownloadLink } from "@react-pdf/renderer";
import BillPdf from "../downloads/BillPdf";
import { Button, Dropdown } from 'react-bootstrap';

const CoverPage = ({ groupName, sessionName, chargeCategory, charges, totalCharges, bills, totalPages, totalBill, group, session, billfor }) => {
    const [selectedGST, setSelectedGST] = useState(0);
    const [isGSTSelected, setIsGSTSelected] = useState(false); // Track if GST is selected
    const [showToast, setShowToast] = useState(false); // Track whether to show toast notification

    useEffect(() => {
        // Initialize with the value from localStorage or default to 0 if not found
        const gst = localStorage.getItem("selectedGST");
        setSelectedGST(gst)
    }, [])
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
    //     console.log(selectedGST)
    //     localStorage.setItem("selectedGST", selectedGST);
    // }, [selectedGST]);

    const handleGSTChange = (event) => {
        setSelectedGST(parseFloat(event.target.value) || 0);
        localStorage.setItem("selectedGST", parseFloat(event.target.value)); // Update selected GST rate
    };

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
        const coverPageWorksheet = workbook.addWorksheet("Cover Page");
        const mainBillWorksheet = workbook.addWorksheet("Main Bill");

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


        // Add data rows if bills array is not empty or undefined
        if (bills && bills.length > 0) {
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
        } else {
            console.error("No bills found."); // Log an error message if bills array is empty or undefined
        }


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

        // Apply styling to each cell in the header row
        headerRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
            if (colNumber <= 4) { // Apply fill only to the first 4 columns
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } };
            }
        });

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
            // Apply styling to cells in columns A, B, C, and D
            for (let i = 1; i <= 4; i++) {
                const cell = row.getCell(i);
                row.font = { bold: true };
                row.alignment = { horizontal: 'right' };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCCCCCC" } };
            }
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

    const [isBillSaved, setIsBillSaved] = useState(false);

    const handleSaveCoverPage = () => {
        if (!isBillSaved && selectedGST !== 0) {
            setIsGSTSelected(true); // Indicate that GST is selected
            // Save bill to the API
            const billData = {
                groupName,
                sessionName,
                chargeCategory,
                charges,
                totalCharges,
                selectedGST
            };
            fetch("https://localhost:7247/api/Bill", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(billData)
            })
                .then(response => {
                    if (response.ok) {
                        setShowToast(true); // Show toast notification
                        setTimeout(() => {
                            setShowToast(false); // Hide toast notification after 2 seconds
                        }, 2000);
                        setIsBillSaved(true); // Update the state to indicate bill is saved
                        console.log("Bill saved successfully");
                    } else {
                        console.error("Failed to save bill");
                        // Handle error
                    }
                })
                .catch(error => {
                    console.error("Error saving bill:", error);
                    // Handle error
                });
        }
    };
    

    return (
        <div>
            {/* <h2>Cover Page</h2> */}

            <div className="mt-3 fw-bold row align-items-center">
                <div className="col">
                    <label htmlFor="gstSelect">Select GST:</label>
                    {isGSTSelected ? (
                        <select id="gstSelect" disabled>
                            <option value={selectedGST}>{selectedGST}% (Selected)</option>
                        </select>
                    ) : (
                        <select id="gstSelect" onChange={handleGSTChange} value={selectedGST}>
                            <option value="0">0%</option>
                            {/* <option value="5">5%</option> */}
                            {/* <option value="12">12%</option> */}
                            <option value="18">18%</option>
                            {/* <option value="28">28%</option> */}
                        </select>
                    )}
                    <button className="btn btn-primary" onClick={handleSaveCoverPage}>Save</button>
                    <div className={`toast ${showToast ? 'show' : ''}`}>
                        Bill saved successfully!
                    </div>
                </div>
                <div className="col-auto">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            Download
                        </Dropdown.Toggle>
                        <Dropdown.Menu >
                            <div className="d-flex flex-column align-items-center gap-2">
                                <button className="btn btn-primary" onClick={downloadExcel}>Download Excel</button>
                                <PDFDownloadLink
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
                                        loading ? <Button>Loading...</Button> : <Button>&nbsp;Download PDF </Button>
                                    }
                                </PDFDownloadLink>
                            </div>

                        </Dropdown.Menu>

                    </Dropdown>

                </div>
            </div>

            <div className="mt-3 table-responsive">


                <table className="table table-bordered">

                    <thead className="table-dark">
                        <tr>
                            <th>S.N.</th>
                            <th>Particulars</th>
                            <th>Rate(RS.)</th>
                            <th>Amount in RS.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(totalCharges).map(([chargeType, totalCharge], index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{chargeType}</td>
                                <td>{parseFloat(charges.find(charge => charge.chargeTypeName === chargeType).rateBooklet || charges.find(charge => charge.chargeTypeName === chargeType).ratePaper || 0).toFixed(2)}</td>
                                <td>{parseFloat(totalCharge).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" className="text-end">Total Amount without GST:</td>
                            <td>{calculateTotalAmountWithoutGST()}</td>
                        </tr>
                        <tr className="fw-bold">
                            <td colSpan="3" className="text-end ">GST({selectedGST}%)</td>
                            <td>{calculateTotalGST()}</td>
                        </tr>
                        <tr style={{ background: 'black', color: 'white' }}>
                            <td colSpan="3" className="text-end">Total Amount with GST:</td>
                            <td>{calculateTotalAmountWithGST()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* <button className="btn btn-primary me-2" onClick={downloadExcel}>Download Excel</button> */}


            {/* <button className="btn btn-primary" onClick={handleSaveCoverPage}>Save</button> */}

            {/* Toast Notification */}
            {/* <div className={`toast ${showToast ? 'show' : ''}`}>
                Bill saved successfully!
            </div> */}
        </div>
    );
};

CoverPage.propTypes = {
    groupName: PropTypes.string.isRequired,
    sessionName: PropTypes.string.isRequired,
    chargeCategory: PropTypes.string.isRequired,
    charges: PropTypes.array.isRequired,
    totalCharges: PropTypes.object.isRequired,
    bills: PropTypes.array.isRequired,
    totalPages: PropTypes.number.isRequired,
    totalBill: PropTypes.number.isRequired,
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

export default CoverPage;
