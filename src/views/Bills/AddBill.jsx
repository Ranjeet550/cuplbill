import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Table, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AddBill = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedType, setSelectedType] = useState("paper");
  const [items, setItems] = useState([
    {
      serialNo: 1,
      quantity: 0,
      pages: 0,
      catchNumber: "",
      envelopeQuantity: 0,
      numberOfPlates: 0,
      techSurcharge: 0,
      itemsInEnvelope: 0, // Default value for items in one envelope
    },
  ]);
  const [previousData, setPreviousData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [catchNumberError, setCatchNumberError] = useState("");
  const [showNewDataTable, setShowNewDataTable] = useState(false); // State variable to control visibility of the new data table
  const navigate = useNavigate();

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

  const fetchDataForGroupAndSession = async (groupId, sessionId) => {
    try {
      const response = await fetch(
        `https://localhost:7247/api/BillData/ByGroupAndSession/${groupId}/${sessionId}`
      );
      if (response.ok) {
        const data = await response.json();
        setPreviousData(data);
      } else {
        throw new Error("Failed to fetch previous data");
      }
    } catch (error) {
      console.error("Error fetching previous data:", error);
    }
  };

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setSelectedGroup(groupId);
    fetchSessions(groupId);
  };

  const handleSessionChange = (e) => {
    const sessionId = e.target.value;
    setSelectedSession(sessionId);
    if (selectedGroup && sessionId) {
      fetchDataForGroupAndSession(selectedGroup, sessionId);
    }
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const addRow = () => {
    const lastItem = items[items.length - 1]; // Get the last item in the array
    const newSerialNo = lastItem.serialNo + 1; // Increment the serial number
    const newItem = { ...lastItem, serialNo: newSerialNo }; // Copy data from the last item and update the serial number
    setItems([...items, newItem]); // Add the new item to the items array
  };
  

  const removeRow = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleInputChange = (e, index, field) => {
    const value = e.target.value;
    const newItems = [...items];
    newItems[index][field] = value;
  
    if (field === "quantity" || field === "itemsInEnvelope") {
      const quantity = parseInt(newItems[index]["quantity"]);
      const itemsInEnvelope = parseInt(newItems[index]["itemsInEnvelope"]);
      const numberOfEnvelopes = Math.round(quantity / itemsInEnvelope);
      newItems[index]["envelopeQuantity"] = numberOfEnvelopes;
    }
  
    // Check for duplicate catch numbers
    const catchNumbers = newItems.map((item) => item.catchNumber);
    const isDuplicate = catchNumbers.some(
      (catchNumber, idx) =>
        catchNumbers.indexOf(catchNumber) !== idx &&
        catchNumber !== "" &&
        catchNumber === value
    );
  
    // Check if catch number already exists in old data
    const isAlreadyInOldData = previousData.some(
      (item) => item.catchNo === value && item.dataFor === selectedType
    );
  
    if (isDuplicate || isAlreadyInOldData) {
      setCatchNumberError("Duplicate catch number");
    } else {
      setCatchNumberError("");
    }
  
    // Update items state
    setItems(newItems);
  };
  

  const handleSubmit = async () => {
    // Check if any required fields are empty
    const requiredFields = [selectedGroup, selectedSession, selectedType];
    const areFieldsEmpty = requiredFields.some((field) => field === "");
    const areItemsEmpty = items.some(
      (item) => item.catchNumber === "" || item.quantity === "" || item.pages === ""
    );

    // Check for duplicate catch numbers
    const catchNumbers = items.map((item) => item.catchNumber);
    const isDuplicate = catchNumbers.some(
      (catchNumber, idx) => catchNumbers.indexOf(catchNumber) !== idx
    );

    if (areFieldsEmpty || areItemsEmpty || isDuplicate) {
      setShowAlert(true);
      return;
    }

    try {
      const formData = {
        group_Id: selectedGroup,
        session_Id: selectedSession,
        dataFor: selectedType,
        items: items.map((item) => ({
          catchNo: item.catchNumber,
          quantity: parseInt(item.quantity),
          numberOfPages: parseInt(item.pages),
          numberOfEnvelopes: parseInt(item.envelopeQuantity),
          numberOfPlates: parseInt(item.numberOfPlates),
          techSurcharge: parseFloat(item.techSurcharge),
        })),
      };

      const response = await fetch("https://localhost:7247/api/BillData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Data submitted successfully:", data);
        setItems([]);

        const addBillData = {
          groupId: selectedGroup,
          sessionId: selectedSession,
          chargeType: selectedType,
        };

        localStorage.setItem("addBillData", JSON.stringify(addBillData));

        navigate(`/Bills/GenerateBill`);
      } else {
        throw new Error("Failed to submit data");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const deleteBillData = async (billDataId) => {
    try {
      const response = await fetch(`https://localhost:7247/api/BillData/${billDataId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        console.log("Data deleted successfully");
        // After successful deletion, you may want to update the previous data state to reflect the changes
        setPreviousData(previousData.filter((item) => item.billData_id !== billDataId));
      } else {
        throw new Error("Failed to delete data");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  // Function to handle toggling the visibility of the new data table
  const toggleNewDataTable = () => {
    setShowNewDataTable(true);
  };

  return (
    <div className="border border-3 p-4 my-3">
      <h2 className="text-center">Create Bill</h2>
      <hr />
      <Form>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="selectGroup">
            <Form.Label>Select Group<span className="text-danger">*</span></Form.Label>
            <Form.Select onChange={handleGroupChange} value={selectedGroup} required>
              <option value="">Select Group</option>
              {groups.map((group) => (
                <option key={group.groupId} value={group.groupId}>
                  {group.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} controlId="selectSession">
            <Form.Label>Select Session <span className="text-danger">*</span></Form.Label>
            <Form.Select
              onChange={handleSessionChange}
              value={selectedSession}
              required
            >
              <option value="">Select Session</option>
              {sessions.map((session) => (
                <option key={session.sessionId} value={session.sessionId}>
                  {session.sessionName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} controlId="selectType">
            <Form.Label>Select Type<span className="text-danger">*</span></Form.Label>
            <Form.Select onChange={handleTypeChange} value={selectedType} required>
              <option value="paper">Paper</option>
              <option value="booklet">Booklet</option>
            </Form.Select>
          </Form.Group>
        </Row>
      </Form>
      
      {previousData.length > 0 && (
        <div className="mt-3 table-responsive">
          <h4>Previous Data</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Serial No</th>
                <th>Catch Number</th>
                <th>Quantity</th>
                <th>No. of Pages</th>
                <th>No. of Envelopes</th>
                <th>No. of Plates</th>
                <th>Tech Surcharge</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {previousData
                .filter((item) => item.dataFor === selectedType) // Filter based on selectedType
                .map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.catchNo}</td>
                    <td>{item.quantity}</td>
                    <td>{item.numberOfPages}</td>
                    <td>{item.numberOfEnvelopes}</td>
                    <td>{item.numberOfPlates}</td>
                    <td>{item.techSurcharge}</td>
                    <td>
                    <Button variant="danger" onClick={() => deleteBillData(item.billData_id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      )}
      {showAlert && (
        <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
          Please fill in all the required fields and ensure there are no duplicate catch numbers.
        </Alert>
      )}
      {/* New data table */}
      {selectedType && showNewDataTable && (
        <div className="mt-3 table-responsive">
          <h4>New Data</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Serial No</th>
                <th>Catch Number</th>
                <th>Quantity</th>
                <th>No. of Pages</th>
                <th>Items in One Envelope</th>
                <th>No. of Envelopes</th>
                <th>No. of Plates</th>
                <th>Tech Surcharge</th>
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
                      value={item.catchNumber}
                      onChange={(e) =>
                        handleInputChange(e, index, "catchNumber")
                      }
                      required
                    />
                    {index === items.length - 1 && catchNumberError && (
                      <span className="text-danger">{catchNumberError}</span>
                    )}
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(e, index, "quantity")}
                      required
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={item.pages}
                      onChange={(e) => handleInputChange(e, index, "pages")}
                      required
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={item.itemsInEnvelope}
                      onChange={(e) =>
                        handleInputChange(e, index, "itemsInEnvelope")
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      disabled
                      value={item.envelopeQuantity}
                      readOnly
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={item.numberOfPlates}
                      onChange={(e) =>
                        handleInputChange(e, index, "numberOfPlates")
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={item.techSurcharge}
                      onChange={(e) =>
                        handleInputChange(e, index, "techSurcharge")
                      }
                    />
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => removeRow(index)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button onClick={addRow}>Add Row</Button>
        </div>
      )}
      {/* Add Row Button */}
      {!showNewDataTable && (
        <div className="mt-3">
          <Button onClick={toggleNewDataTable}>Add Row</Button>
        </div>
      )}
      {/* Submit Button */}
      <div className="mt-3">
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  );
};

export default AddBill;
