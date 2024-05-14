import React, { useState, useEffect } from "react";
import { Table, Button, Form, Alert } from "react-bootstrap";
import MainBill from "./GenerateBill/MainBill";
import CoverPage from "./GenerateBill/CoverPage";
import { useUser } from "./../../context/UserContext";

const GenerateBill = () => {
  const { billUser } = useUser();
  const [charges, setCharges] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [chargeCategory, setChargeCategory] = useState("");
  const [view, setView] = useState("main");
  const [bills, setBills] = useState([]);
  const [totalBill, setTotalBill] = useState(0);
  const [totalCharges, setTotalCharges] = useState({});
  const [totalPages, setTotalPages] = useState(0);
  const [lotNumber, setLotNumber] = useState(""); // State for lot number
  const [generated, setGenerated] = useState(false); // State for lot number
  const [duplicateLotError, setDuplicateLotError] = useState(""); // State for duplicate lot number error

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("addBillData"));
    if (storedData) {
      setGroupId(storedData.groupId);
      setSessionId(storedData.sessionId);
      setChargeCategory(storedData.chargeType);
      setGenerated(storedData.generated);
    }
  }, []);

  useEffect(() => {
    if (generated) {
      const fetchData = async () => {
        try {
          const billResponse = await fetch(
            `https://localhost:7247/api/BillData/ByGroupAndSession/${groupId}/${sessionId}`
          );

          if (billResponse.ok) {
            const data = await billResponse.json();
            const filteredData = data.filter(
              (item) => item.dataFor === chargeCategory
            ); // Filter the data
            calculateBill(filteredData, charges);
          } else {
            throw new Error("Failed to fetch bill data");
          }
        } catch (error) {
          console.error("Error generating bill:", error);
        }
      };

      fetchData();
    }
  }, [generated, groupId, sessionId, charges]);

  useEffect(() => {
    if (groupId) {
      fetchGroupName(groupId);
    }
    if (sessionId) {
      fetchSessionName(sessionId);
    }
    if (groupId && sessionId && chargeCategory) {
      fetchCharges(groupId, sessionId, chargeCategory, view);
    }
  }, [groupId, sessionId, chargeCategory, view]);

  const fetchGroupName = async (groupId) => {
    try {
      const response = await fetch(
        `https://localhost:7247/api/Group/${groupId}`
      );
      if (response.ok) {
        const data = await response.json();
        setGroupName(data.name);
      } else {
        throw new Error("Failed to fetch group name");
      }
    } catch (error) {
      console.error("Error fetching group name:", error);
    }
  };

  const fetchSessionName = async (sessionId) => {
    try {
      const response = await fetch(
        `https://localhost:7247/api/Session/${sessionId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSessionName(data.session_Name);
      } else {
        throw new Error("Failed to fetch session name");
      }
    } catch (error) {
      console.error("Error fetching session name:", error);
    }
  };

  const fetchCharges = async (groupId, sessionId, chargeCategory, view) => {
    try {
      const response = await fetch(
        `https://localhost:7247/api/ChargeDetails/${groupId}/${sessionId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (view === "main") {
          setCharges(data.filter((charge) => charge.showInMainBill === 1));
        } else {
          setCharges(data);
        }
      } else {
        throw new Error("Failed to fetch charges");
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
    }
  };

  const toggleView = (selectedView) => {
    setView(selectedView);
  };

  const calculateBill = (items, charges) => {
    let totalBill = 0;
    const bill = {}; // Initialize bill object
    const totalCharges = {}; // Initialize totalCharges object
    let totalPageCount = 0; // Initialize total page count

    // Map all Bill data
    const billData = items.map((item) => {
      const {
        catchNo,
        quantity,
        numberOfPages,
        numberOfEnvelopes,
        techSurcharge,
      } = item;
      let totalItemCharges = 0;

      // Calculate charges for each item
      charges.forEach((charge) => {
        let chargeAmount = 0;
        const rate =
          chargeCategory === "booklet" ? charge.rateBooklet : charge.ratePaper; // Assuming ratePaper is the default rate

        switch (charge.chargeTypeName) {
          case "Composing Charges":
            chargeAmount = numberOfPages * rate;
            break;
          case "Paper Charges":
            const roundfactor = parseInt(charge.rateQuantity) / 2 - 1;
            chargeAmount =
              ((Math.round(
                (quantity + roundfactor) / parseInt(charge.rateQuantity)
              ) *
                (Math.round(numberOfPages / 2) *
                  parseInt(charge.rateQuantity) *
                  2)) /
                parseInt(charge.rateQuantity)) *
              rate;
            break;
          case "Printing Charges":
          case "Folding Charges":
          case "Wrapping Charges":
          case "Binding Charges": {
            const roundfactor = parseInt(charge.rateQuantity) / 2 - 1;
            chargeAmount =
              Math.round(
                (quantity + roundfactor) / parseInt(charge.rateQuantity)
              ) *
              numberOfPages *
              rate;
            break;
          }
          case "Cost of Inner Envelopes":
          case "Cost of Outer Envelopes":
          case "Sealing Charges per Envelope":
            chargeAmount = numberOfEnvelopes * rate;
            break;
          default:
            console.error(`Invalid charge type: ${charge.chargeTypeName}`);
        }

        totalItemCharges += chargeAmount;
        bill[charge.chargeTypeName] = parseFloat(chargeAmount).toFixed(2); // Assign charge amount to respective charge type in bill object
        if (
          !["Serial No", "Catch Number", "Quantity", "No. of Pages"].includes(
            charge.chargeTypeName
          )
        ) {
          totalCharges[charge.chargeTypeName] =
            (totalCharges[charge.chargeTypeName] || 0) +
            parseFloat(chargeAmount); // Accumulate total charges excluding specific types
        }
      });

      totalBill += totalItemCharges;
      totalPageCount += numberOfPages; // Accumulate total page count

      return {
        catchNumber: catchNo,
        quantity,
        pages: numberOfPages,
        envelopes: numberOfEnvelopes,
        totalItemCharges,
        bill: { ...bill }, // Save the bill object for each item
      };
    });

    setBills(billData);
    setTotalBill(totalBill);
    setTotalCharges(totalCharges); // Set the total charges
    setTotalPages(totalPageCount); // Set the total page count
  };

  const handleGenerateBill = async () => {
    try {
      if (!lotNumber) {
        throw new Error("Lot number is required.");
      }

      const response = await fetch("https://localhost:7247/api/GeneratedBills");
      if (!response.ok) {
        throw new Error("Failed to fetch generated bills data");
      }
      const generatedBills = await response.json();

      const isDuplicateLotNumber = generatedBills.some(
        (bill) => bill.lot_No === lotNumber
      );
      if (isDuplicateLotNumber) {
        setDuplicateLotError(
          "Lot number already exists. Please enter a different one."
        );
        return;
      } else {
        setDuplicateLotError("");
      }

      const requestData = {
        group_id: groupId,
        session: sessionId,
        invoiceNo: `${Math.floor(Math.random() * 10000)}`,
        lot_No: lotNumber,
        bill_FOR: chargeCategory,
        status: "pending",
        created_By: billUser.user_ID,
        created_Datetime: new Date().toISOString(),
      };

      const postResponse = await fetch(
        "https://localhost:7247/api/GeneratedBills",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (postResponse.ok) {
        const billResponse = await fetch(
          `https://localhost:7247/api/BillData/ByGroupAndSession/${groupId}/${sessionId}`
        );

        if (billResponse.ok) {
          const data = await billResponse.json();
          const filteredData = data.filter(
            (item) => item.dataFor === chargeCategory
          ); // Filter the data
          calculateBill(filteredData, charges);
        } else {
          throw new Error("Failed to fetch bill data");
        }
      } else {
        throw new Error("Failed to generate bill");
      }
    } catch (error) {
      console.error("Error generating bill:", error);
    }
  };

  const handleLotNumberChange = (e) => {
    setLotNumber(e.target.value);
  };

  return (
    <div className="border border-3 p-4 my-3">
      <h5 className="d-flex align-items-center justify-content-between">
        <div className="d-grid gap-2">
          <span>Group Name: {groupName}</span>
          <span>Session: {sessionName}</span>
        </div>
        <span>Bill For: {chargeCategory}</span>
      </h5>

      <hr />
      <div className="d-flex justify-content-between mb-3 gap-2">
        <Button
          variant={view === "main" ? "primary" : "outline-primary"}
          onClick={() => toggleView("main")}
          style={{ width: "50%" }}
        >
          Main Bill
        </Button>
        <Button
          variant={view === "cover" ? "primary" : "outline-primary"}
          onClick={() => toggleView("cover")}
          style={{ width: "50%" }}
        >
          Cover Page
        </Button>
      </div>

      {view === "main" ? (
        <>
          {/* <div className="mt-3 table-responsive">
          <h2>Charge Table</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Charge Type</th>
                <th>Rate</th>
                <th>Rate Quantity</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((charge) => (
                <tr key={charge.chargeDetailId}>
                  <td>{charge.chargeTypeName}</td>
                  <td>
                    {chargeCategory.toLowerCase() === "booklet"
                      ? charge.rateBooklet
                      : charge.ratePaper}
                  </td>
                  <td>{charge.rateQuantity}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div> */}
        </>
      ) : (
        <CoverPage
          groupName={groupName}
          sessionName={sessionName}
          chargeCategory={chargeCategory}
          charges={charges}
          totalCharges={totalCharges}
          bills={bills}
          totalPages={totalPages}
          totalBill={totalBill}
          group={groupName}
          session={sessionName}
          billfor={chargeCategory}

        />
      )}

      {/* Input field for lot number */}
      <Form.Group className="mb-3" controlId="lotNumber">
        <Form.Label>Lot Number</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter lot number"
          value={lotNumber}
          onChange={handleLotNumberChange}
          disabled={generated}
        />
      </Form.Group>
      {duplicateLotError && <Alert variant="danger">{duplicateLotError}</Alert>}
      <Button disabled={generated} onClick={handleGenerateBill}>
        Generate Bill
      </Button>

      <div className="mt-3">
        {view === "main" ? (
          <MainBill
            charges={charges}
            totalPages={totalPages}
            totalCharges={totalCharges}
            totalBill={totalBill}
            bills={bills}
            group={groupName}
            session={sessionName}
            billfor={chargeCategory}
          />
        ) : (
          <>{/* Additional components for cover page */}</>
        )}
      </div>

    </div>
  );
};

export default GenerateBill;
