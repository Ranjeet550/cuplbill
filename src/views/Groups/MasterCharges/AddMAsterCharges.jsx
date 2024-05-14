import React, { useState, useEffect } from "react";
import {
  Button,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
  Table,
  Toast,
} from "react-bootstrap";
import Select from "react-select";
import { useParams } from "react-router-dom";

const AddMasterCharges = () => {
  const [chargeTypes, setChargeTypes] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedData, setSubmittedData] = useState([]);
  const { groupId } = useParams();
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [autofilledData, setAutofilledData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChargeName, setNewChargeName] = useState("");

  useEffect(() => {
    const fetchChargeTypes = async () => {
      try {
        const response = await fetch("https://localhost:7247/api/ChargeType");
        if (response.ok) {
          const data = await response.json();
          // Add default show in main bill property to charge types
          const chargeTypesWithShowInMainBill = data.map(chargeType => ({ ...chargeType, showInMainBill: 1 }));
          setChargeTypes(chargeTypesWithShowInMainBill);
        } else {
          throw new Error("Failed to fetch charge types");
        }
      } catch (error) {
        console.error("Error fetching charge types:", error);
      }
    };

    const fetchSessions = async () => {
      try {
        const response = await fetch("https://localhost:7247/api/Session");
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        } else {
          throw new Error("Failed to fetch sessions");
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchChargeTypes();
    fetchSessions();
  }, []);

  useEffect(() => {
    const fetchChargeDetails = async () => {
      try {
        const response = await fetch(`https://localhost:7247/api/ChargeDetails/${groupId}/${selectedOption.value}`);
        if (response.ok) {
          const data = await response.json();
          setAutofilledData(data);
        } else {
          throw new Error("Failed to fetch charge details");
        }
      } catch (error) {
        console.error("Error fetching charge details:", error);
      }
    };

    if (selectedOption) {
      fetchChargeDetails();
    }
  }, [groupId, selectedOption]);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Check if session is selected
    if (!selectedOption) {
      setErrorMessage("Session is required.");
      return;
    }
  
    const matchedChargeType = chargeTypes.find(
      (chargeType) =>
        chargeType.charge_Name.toLowerCase() === searchTerm.toLowerCase()
    );
  
    if (matchedChargeType) {
      const isInSubmittedData = submittedData.some(
        (data) => data.charge_Name === matchedChargeType.charge_Name
      );
      const isInAutofilledData = autofilledData.some(
        (data) => data.chargeTypeName === matchedChargeType.charge_Name
      );
  
      if (!isInSubmittedData && !isInAutofilledData) {
        setErrorMessage("");
        setSubmittedData([
          ...submittedData,
          {
            ...matchedChargeType,
            rate_Booklet: "",
            rate_Paper: "",
            rate_Quantity: "",
          },
        ]);
      } else {
        setErrorMessage("Charge type already exists in the table.");
      }
    } else {
      setErrorMessage(
        "Entered charge type does not match any option in charge data."
      );
    }
    setSearchTerm("");
  };
  

  const saveTableData = async () => {
    if (!selectedOption) {
      setErrorMessage("Session is required.");
      return;
    }

    try {
      const response = await fetch("https://localhost:7247/api/ChargeDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: groupId,
          session_Id: selectedOption.value,
          chargeDetails: submittedData.map((chargeType) => ({
            chargeTypeId: chargeType.charge_Id,
            ratePaper: chargeType.rate_Paper,
            rateBooklet: chargeType.rate_Booklet,
            rateQuantity: chargeType.rate_Quantity,
            showInMainBill: chargeType.showInMainBill ? 1 : 0,
          })),
        }),
      });
      if (response.ok) {
        console.log("Table data saved successfully");
        setShowSaveAlert(true);
        setTimeout(() => {
          setShowSaveAlert(false);
          window.location.reload();
        }, 3000);
      } else {
        throw new Error("Failed to save table data");
      }
    } catch (error) {
      console.error("Error saving table data:", error);
    }
  };

  const handleRateChange = (index, field, value) => {
    const updatedSubmittedData = [...submittedData];
    updatedSubmittedData[index][field] = value;
    setSubmittedData(updatedSubmittedData);
  };

  const handleShowInMainBillChange = (index, value) => {
    const updatedSubmittedData = [...submittedData];
    updatedSubmittedData[index].showInMainBill = value === "1" ? 1 : 0;
    setSubmittedData(updatedSubmittedData);
  };

  const removeItem = (index) => {
    const updatedData = [...submittedData];
    updatedData.splice(index, 1);
    setSubmittedData(updatedData);
  };

  const removeItemfromdb = async (chargeDetailId) => {
    try {
      const response = await fetch(`https://localhost:7247/api/ChargeDetails/${chargeDetailId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        console.log("Item removed successfully from the database");
        // You may want to refresh the autofilled data after removing the item
        const updatedAutofilledData = autofilledData.filter(chargeType => chargeType.chargeDetailId !== chargeDetailId);
        setAutofilledData(updatedAutofilledData);
      } else {
        throw new Error("Failed to remove item from the database");
      }
    } catch (error) {
      console.error("Error removing item from the database:", error);
    }
  };
  

  const handleAddCharge = async () => {
    try {
      const response = await fetch("https://localhost:7247/api/ChargeType", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          charge_Name: newChargeName,
          // Add other properties of the new charge here
        }),
      });
      if (response.ok) {
        setChargeTypes([...chargeTypes, { charge_Name: newChargeName }]);
        setShowAddModal(false);
      } else {
        throw new Error("Failed to add new charge");
      }
    } catch (error) {
      console.error("Error adding new charge:", error);
    }
  };

  return (
    <div className="border border-3 p-4 my-3">
      <h2 className="text-center">Add Master Charges</h2>
      <hr />
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>
                Select Session Year <span className="text-danger">*</span>
              </Form.Label>
              <Select
                value={selectedOption}
                onChange={setSelectedOption}
                options={sessions.map((session) => ({
                  value: session.session_id,
                  label: session.session_Name,
                }))}
                placeholder="Select Session"
                isClearable
                isRequired // Add this prop
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Label>Select Charge Types<span className="text-danger">*</span></Form.Label>
            <InputGroup className="mb-3">
              <Select
                styles={{
                  container: (provided) => ({
                    ...provided,
                    flex: "1",
                  }),
                }}
                onChange={(selectedOption) =>
                  setSearchTerm(selectedOption ? selectedOption.value : "")
                }
                options={chargeTypes.map((chargeType) => ({
                  value: chargeType.charge_Name,
                  label: chargeType.charge_Name,
                }))}
                placeholder="Search charges..."
                isClearable
              />

              <Button className="btn-primary" type="submit">
                Add
              </Button>
            </InputGroup>
            {errorMessage && (
              <div
                className="alert alert-danger alert-dismissible"
                role="alert"
              >
                {errorMessage}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setErrorMessage("")}
                  aria-label="Close"
                ></button>
              </div>
            )}
          </Col>
        </Row>
        <Row className="my-3">
        <Col md={12} className="text-end">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add New Charge
          </Button>
        </Col>
      </Row>

      
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Charge</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Charge Name</Form.Label>
            <Form.Control
              type="text"
              value={newChargeName}
              onChange={(e) => setNewChargeName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCharge}>
            Add Charge
          </Button>
        </Modal.Footer>
      </Modal>
      </Form>
      <div>
        <Table striped bordered hover>
          <thead>
            <tr className="text-center align-items-center">
              <th rowSpan="2" className="align-middle">
                SN
              </th>
              <th rowSpan="2" className="align-middle">
                Charge Name
              </th>
              <th colSpan="3">Rates</th>
              <th rowSpan="2" className="align-middle">
                Show In
              </th>
              <th rowSpan="2" className="align-middle">
                Actions
              </th>
            </tr>
            <tr className="text-center">
              <th>Rate Quantity</th>
              <th>Booklet Rate</th>
              <th>Paper Rate</th>
            </tr>
          </thead>
          <tbody>
            {autofilledData.map((chargeType, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{chargeType.chargeTypeName}</td>
                <td>
                  <span>{chargeType.rateQuantity}</span>
                </td>
                <td>
                  <span>{chargeType.rateBooklet}</span>
                </td>
                <td>
                  <span>{chargeType.ratePaper}</span>
                </td>
                <td>
                  <span>{chargeType.showInMainBill ? "Main Bill" : "Cover Page"}</span>
                </td>
                <td className="text-center">
                  <Button  variant="danger" onClick={() => removeItemfromdb(chargeType.chargeDetailId)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
            {submittedData.map((chargeType, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{chargeType.charge_Name}</td>
                <td>
                  <Form.Control
                    type="text"
                    value={chargeType.rate_Quantity}
                    onChange={(e) =>
                      handleRateChange(index, "rate_Quantity", e.target.value)
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={chargeType.rate_Booklet}
                    onChange={(e) =>
                      handleRateChange(index, "rate_Booklet", e.target.value)
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={chargeType.rate_Paper}
                    onChange={(e) =>
                      handleRateChange(index, "rate_Paper", e.target.value)
                    }
                  />
                </td>
                <td>
                  <Form.Select
                    value={chargeType.showInMainBill ? "1" : "0"}
                    onChange={(e) =>
                      handleShowInMainBillChange(index, e.target.value)
                    }
                  >
                    <option value="1">Main Bill</option>
                    <option value="0">Cover Page</option>
                  </Form.Select>
                </td>
                <td className="text-center">
                  <Button variant="danger" onClick={() => removeItem(index)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Row className="text-center justify-content-center">
          <Col md={6}>
            <Button className="btn-primary w-50" onClick={saveTableData}>
              Save
            </Button>
          </Col>
        </Row>
      </div>
      {showSaveAlert && (
        <Toast
          position="bottom-end"
          onClose={() => setShowSaveAlert(false)}
          show={showSaveAlert}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto text-success">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-success">
            Data Saved Successfully.
          </Toast.Body>
        </Toast>
      )}

      
      {/* <Row className="my-3">
        <Col md={12} className="text-end">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add New Charge
          </Button>
        </Col>
      </Row>

      
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Charge</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Charge Name</Form.Label>
            <Form.Control
              type="text"
              value={newChargeName}
              onChange={(e) => setNewChargeName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCharge}>
            Add Charge
          </Button>
        </Modal.Footer>
      </Modal> */}
    </div>
  );
};

export default AddMasterCharges;
