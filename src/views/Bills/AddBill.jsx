import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Table } from "react-bootstrap";
import { CSVLink } from "react-csv";
import XlsxStyle from 'xlsx-js-style';

const AddBill = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [charges, setCharges] = useState([]);
  const [items, setItems] = useState([
    {
      serialNo: 1,
      quantity: 0,
      pages: 0,
      catchNumber: "",
      envelopeQuantity: 0,
    },
  ]);
  const [selectedType, setSelectedType] = useState("paper"); // Default to paper
  const [rateData, setRateData] = useState({});
  const [bills, setBills] = useState([]);
  const [totalCharges, setTotalCharges] = useState({});
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch("https://localhost:7247/api/Group");
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        throw new Error("Failed to fetch groups");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchSessions = async (groupId) => {
    try {
      const response = await fetch(
        `https://localhost:7247/api/ChargeDetails/SessionsInGroup/${groupId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSessions(data.groupSessions);
      } else {
        throw new Error("Failed to fetch sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchCharges = async (groupId, session) => {
    try {
      const response = await fetch(
        `https://localhost:7247/api/ChargeDetails/${groupId}/${session}`
      );
      if (response.ok) {
        const data = await response.json();
        setCharges(data);
        const rates = {};
        data.forEach((charge) => {
          rates[charge.chargeTypeName] = {
            ratePaper: charge.ratePaper,
            rateBooklet: charge.rateBooklet,
          };
        });
        setRateData(rates);
        setCsvHeaders(data.map((charge) => charge.chargeTypeName));
      } else {
        throw new Error("Failed to fetch charges");
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
    }
  };

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setSelectedGroup(groupId);
    fetchSessions(groupId);
  };

  const handleSessionChange = (e) => {
    const session = e.target.value;
    setSelectedSession(session);
    fetchCharges(selectedGroup, session);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleQuantityChange = (e, index) => {
    const { value } = e.target;
    const newItems = [...items];
    newItems[index].quantity = value;
    setItems(newItems);
  };

  const handlePagesChange = (e, index) => {
    const { value } = e.target;
    const newItems = [...items];
    newItems[index].pages = value;
    setItems(newItems);
  };

  const handleCatchNumberChange = (e, index) => {
    const { value } = e.target;
    const newItems = [...items];
    newItems[index].catchNumber = value;
    setItems(newItems);
  };
  const handleEnvelopeQuantityChange = (e, index) => {
    const { value } = e.target;
    const newItems = [...items];
    newItems[index].envelopeQuantity = value;
    setItems(newItems);
  };

  const addRow = () => {
    const newSerialNo = items.length + 1;
    setItems([
      ...items,
      { serialNo: newSerialNo, quantity: 0, pages: 0, catchNumber: "" },
    ]);
  };

  const removeRow = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const calculateBill = () => {
    let billData = [];
    let totalCharges = {};

    items.forEach(
      ({ serialNo, quantity, pages, catchNumber, envelopeQuantity }) => {
        let bill = {};
        bill.serialNo = serialNo;
        bill.catchNumber = catchNumber;
        bill.quantityReal = parseInt(quantity); // Convert to integer
        const roundedQuantity = Math.ceil(quantity / 100) * 100; // Round up to the nearest multiple of 100
        bill.quantity = roundedQuantity;
        bill.pages = parseInt(pages);
        bill.envelopeQuantity = parseInt(envelopeQuantity);
        bill.paperCharges = 0;
        bill.composingCharges = 0;

        charges.forEach((charge) => {
          if (selectedCharges.includes(charge.chargeTypeName)) {
            const rateObj = rateData[charge.chargeTypeName];
            if (rateObj && rateObj.ratePaper !== undefined) {
              let rate =
                selectedType === "paper"
                  ? rateObj.ratePaper
                  : rateObj.rateBooklet;
              let chargeAmount = 0;

              if (charge.chargeTypeName === "Composing Charges") {
                chargeAmount = bill.pages * rate;
              } else if (charge.chargeTypeName === "Paper Charges") {
                const roundfactor = parseInt(charge.rateQuantity) / 2 - 1;
                chargeAmount =
                  ((Math.round(
                    (bill.quantityReal + roundfactor) /
                      parseInt(charge.rateQuantity)
                  ) *
                    (Math.round(bill.pages / 2) *
                      parseInt(charge.rateQuantity) *
                      2)) /
                    parseInt(charge.rateQuantity)) *
                  rate;
              } else if (
                charge.chargeTypeName === "Printing Charges" ||
                charge.chargeTypeName === "Folding Charges" ||
                charge.chargeTypeName === "Wrapping Charges" ||
                charge.chargeTypeName === "Binding Charges"
              ) {
                const roundfactor = parseInt(charge.rateQuantity) / 2 - 1;
                chargeAmount =
                  Math.round(
                    (bill.quantityReal + roundfactor) /
                      parseInt(charge.rateQuantity),
                    0
                  ) *
                  bill.pages *
                  rate;
              } else if (
                charge.chargeTypeName === "Cost of Inner Envelopes" ||
                charge.chargeTypeName === "Cost of Outer Envelopes" ||
                charge.chargeTypeName === "Sealing Charges per Envelope"
              ) {
                chargeAmount = (bill.envelopeQuantity * rate).toFixed(2); // Format to two decimal places
              }

              bill[charge.chargeTypeName] = parseFloat(chargeAmount).toFixed(2); // Convert to float and assign
              if (
                ![
                  "Serial No",
                  "Catch Number",
                  "Quantity",
                  "No. of Pages",
                ].includes(charge.chargeTypeName)
              ) {
                totalCharges[charge.chargeTypeName] =
                  (totalCharges[charge.chargeTypeName] || 0) +
                  parseFloat(chargeAmount); // Convert to float and add
              }
            } else {
              console.error(
                `Rate data or ratePaper not found for charge type: ${charge.chargeTypeName}`
              );
            }
          }
        });
        billData.push(bill);
      }
    );

    setBills(billData);
    setTotalCharges(totalCharges);
  };

  const printTable = () => {
    window.print();
  };

  const handleChargeSelection = (chargeTypeName) => {
    const index = selectedCharges.indexOf(chargeTypeName);
    if (index === -1) {
      setSelectedCharges([...selectedCharges, chargeTypeName]);
    } else {
      const updatedSelectedCharges = [...selectedCharges];
      updatedSelectedCharges.splice(index, 1);
      setSelectedCharges(updatedSelectedCharges);
    }
  };


// Function to generate CSV data from bills state
const generateCSVData = () => {
  // Prepare header row with bold text indicator
  const headers = ["Serial No", "Catch Number", "Quantity", "No. of Pages"];
  const selectedChargesHeaders = charges
    .filter((charge) => selectedCharges.includes(charge.chargeTypeName))
    .map((charge) => `${charge.chargeTypeName} (Rs.)`);
  const csvHeaders = [...headers, ...selectedChargesHeaders];

  // Prepare data rows
  const data = bills.map((bill) => {
    const rowData = [
      bill.serialNo,
      bill.catchNumber,
      bill.quantityReal,
      bill.pages,
    ];
    selectedCharges.forEach((chargeTypeName) => {
      rowData.push(bill[chargeTypeName] || ""); // Push bill data corresponding to each charge
    });
    return rowData;
  });

  // Append total row
  const totalRow = ["Total", "", "", ""];
  charges.forEach((charge) => {
    if (selectedCharges.includes(charge.chargeTypeName)) {
      totalRow.push(totalCharges[charge.chargeTypeName] || ""); // Push total charge corresponding to each selected charge
    }
  });

  // Combine header, data, and total rows into CSV format
  const csvData = [csvHeaders, ...data, totalRow];

  // Convert CSV data to text format
  const csvText = csvData.map(row => row.join(',')).join('\n');

  return csvText;
};


  return (
    <div className="border border-3 p-4 my-3">
      <h2 className="text-center">Add Bill</h2>
      <hr />
      <Form>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="selectGroup">
            <Form.Label>Select Group</Form.Label>
            <Form.Select onChange={handleGroupChange} value={selectedGroup}>
              <option value="">Select Group</option>
              {groups.map((group) => (
                <option key={group.groupId} value={group.groupId}>
                  {group.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} controlId="selectSession">
            <Form.Label>Select Session</Form.Label>
            <Form.Select onChange={handleSessionChange} value={selectedSession}>
              <option value="">Select Session</option>
              {sessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} controlId="selectType">
            <Form.Label>Select Type</Form.Label>
            <Form.Select onChange={handleTypeChange} value={selectedType}>
              <option value="paper">Paper</option>
              <option value="booklet">Booklet</option>
            </Form.Select>
          </Form.Group>
        </Row>
      </Form>
      <div className="mt-3 table-responsive">
        <h3>Charges for the selected session:</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Charge Type</th>
              <th>Rate (Rs.)</th>
              <th>Show Charge</th>
            </tr>
          </thead>
          <tbody>
            {charges.map((charge) => (
              <tr key={charge.chargeDetailId}>
                <td>{charge.chargeTypeName}</td>
                <td>
                  {selectedType === "paper"
                    ? charge.ratePaper
                    : charge.rateBooklet}
                </td>
                <td>
                  <Form.Check
                    type="checkbox"
                    id={`check-${charge.chargeDetailId}`}
                    label=""
                    onChange={() =>
                      handleChargeSelection(charge.chargeTypeName)
                    }
                    checked={selectedCharges.includes(charge.chargeTypeName)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="mt-3 table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Serial No</th>
              <th>Catch Number</th>
              <th>Quantity</th>
              <th>No. of Pages</th>
              <th>No. of Envalop</th>
              <th>Remove Row</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.serialNo}</td>
                <td>
                  <Form.Control
                    type="text"
                    onChange={(e) => handleCatchNumberChange(e, index)}
                    value={item.catchNumber}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    onChange={(e) => handleQuantityChange(e, index)}
                    value={item.quantity}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    onChange={(e) => handlePagesChange(e, index)}
                    value={item.pages}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    onChange={(e) => handleEnvelopeQuantityChange(e, index)}
                    value={item.envelopeQuantity}
                  />
                </td>
                <td>
                  <Button onClick={() => removeRow(index)}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button onClick={addRow}>Add Row</Button>
      </div>
      <div className="mt-3">
        <Button onClick={calculateBill}>Generate Bill</Button>{" "}
        <Button onClick={printTable}>Print</Button>{" "}
        <CSVLink
          data={generateCSVData()}
          filename={"bill_data.csv"}
          className="btn btn-primary"
        >
          Download CSV
        </CSVLink>
        
        
      </div>
      <div className="mt-3 table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr className="text-center">
              <th>S.N.</th>
              <th>Catch Number</th>
              <th>Quantity</th>
              <th>No. of Pages</th>
              {charges.map(
                (charge) =>
                  selectedCharges.includes(charge.chargeTypeName) && (
                    <th key={charge.chargeDetailId}>
                      {charge.chargeTypeName} (Rs.)
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody>
            {bills.map((bill, index) => (
              <tr key={index}>
                <td>{bill.serialNo}</td>
                <td>{bill.catchNumber}</td>
                <td>{bill.quantityReal}</td>
                <td>{bill.pages}</td>
                {charges.map(
                  (charge) =>
                    selectedCharges.includes(charge.chargeTypeName) && (
                      <td key={charge.chargeDetailId}>
                        {bill[charge.chargeTypeName]}
                      </td>
                    )
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4">Total</td>
              {charges.map(
                (charge) =>
                  selectedCharges.includes(charge.chargeTypeName) && (
                    <td key={charge.chargeDetailId}>
                      {totalCharges[charge.chargeTypeName] || 0}
                    </td>
                  )
              )}
            </tr>
            <tr>
              <td colSpan="4">Total Bill</td>
              <td
                colSpan={
                  charges.filter((charge) =>
                    selectedCharges.includes(charge.chargeTypeName)
                  ).length
                }
              >
                {/* Calculate the sum of total charges excluding excluded columns */}
                {Number(
                  Object.values(totalCharges).reduce((acc, curr, index) => {
                    if (
                      selectedCharges.includes(charges[index].chargeTypeName)
                    ) {
                      return acc + curr;
                    }
                    return acc;
                  }, 0)
                ).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </Table>
      </div>
    </div>
  );
};

export default AddBill;
