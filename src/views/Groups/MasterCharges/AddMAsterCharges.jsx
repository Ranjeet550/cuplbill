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

const currentYear = new Date().getFullYear();
const Sessionyears = [];

for (let i = -5; i < 10; i++) {
  const startYear = currentYear + i;
  const endYear = startYear + 1;
  const sessionYear = `${startYear.toString()}-${endYear.toString().slice(-2)}`;
  Sessionyears.push({
    Sessionyear_id: i + 6, // Adjusted to start from 1
    Sessionyear_Name: sessionYear,
  });
}

const AddMasterCharges = () => {
  const [chargeTypes, setChargeTypes] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedData, setSubmittedData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newChargeTypeName, setNewChargeTypeName] = useState("");
  const { groupId } = useParams();
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  // const [rateQuantity, setRateQuantity] = useState(""); // Step 1

  const fetchChargeTypes = async () => {
    try {
      const response = await fetch("https://localhost:7247/api/ChargeType");
      if (response.ok) {
        const data = await response.json();
        setChargeTypes(data);
      } else {
        throw new Error("Failed to fetch charge types");
      }
    } catch (error) {
      console.error("Error fetching charge types:", error);
    }
  };

  useEffect(() => {
    const fetchGroupSessions = async () => {
      try {
        const response = await fetch(
          `https://localhost:7247/api/ChargeDetails/SessionsInGroup/${groupId}`
        );
        if (response.ok) {
          const data = await response.json();
          // Filter out the years that are already in groupSessions
          const updatedSessionYears = Sessionyears.filter(
            (year) => !data.groupSessions.includes(year.Sessionyear_Name)
          );
          setSessionYears(updatedSessionYears);
        } else {
          throw new Error("Failed to fetch group sessions");
        }
      } catch (error) {
        console.error("Error fetching group sessions:", error);
      }
    };

    fetchChargeTypes();
    fetchGroupSessions();
  }, [groupId]); // Include groupId as a dependency

  const setSessionYears = (updatedSessionYears) => {
    Sessionyears.splice(0, Sessionyears.length, ...updatedSessionYears);
  };

  const handleSelectChange = (selectedOption) => {
    setSelectedOption(selectedOption ? selectedOption : "");
  };

  const handleSearchChange = (selectedOption) => {
    setSearchTerm(selectedOption ? selectedOption.value : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const matchedChargeType = chargeTypes.find(
      (chargeType) =>
        chargeType.charge_Name.toLowerCase() === searchTerm.toLowerCase()
    );

    if (matchedChargeType) {
      // Check if the charge type is already present in submittedData
      const isDuplicate = submittedData.some(
        (data) => data.charge_Name === matchedChargeType.charge_Name
      );

      if (!isDuplicate) {
        console.log("Selected option:", matchedChargeType);
        setErrorMessage("");
        setSubmittedData([
          ...submittedData,
          {
            ...matchedChargeType,
            rate_Booklet: "",
            rate_Paper: "",
            rate_Quantity: "",
          }, // Step 1
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
    try {
      const response = await fetch("https://localhost:7247/api/ChargeDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: groupId,
          session: selectedOption ? selectedOption.value : "",
          chargeDetails: submittedData.map((chargeType) => ({
            chargeTypeId: chargeType.charge_Id,
            ratePaper: chargeType.rate_Paper,
            rateBooklet: chargeType.rate_Booklet,
            rateQuantity: chargeType.rate_Quantity, // Step 1
          })),
        }),
      });
      if (response.ok) {
        console.log("Table data saved successfully");
        // Show the save alert
        setShowSaveAlert(true);
        // Hide the alert after 3 seconds
        setTimeout(() => {
          setShowSaveAlert(false);
        }, 3000);
      } else {
        throw new Error("Failed to save table data");
      }
    } catch (error) {
      console.error("Error saving table data:", error);
    }
  };

  const handleAddChargeType = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://localhost:7247/api/ChargeType", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ charge_Name: newChargeTypeName }),
      });
      if (response.ok) {
        const data = await response.json();
        setChargeTypes([
          ...chargeTypes,
          { charge_Id: data.charge_Id, charge_Name: data.charge_Name },
        ]);
        setShowModal(false);
        setNewChargeTypeName("");
      } else {
        console.error("Failed to add charge type:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding charge type:", error.message);
    }
  };

  const handleRateChange = (index, field, value) => {
    const updatedSubmittedData = [...submittedData];
    updatedSubmittedData[index][field] = value;
    setSubmittedData(updatedSubmittedData);
  };

  const removeItem = (index) => {
    const updatedData = [...submittedData];
    updatedData.splice(index, 1);
    setSubmittedData(updatedData);
  };

  return (
    <div className="border border-3 p-4 my-3">
      <h2 className="text-center">Add Master Charges</h2>
      <hr />
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Select Session Year</Form.Label>
              <Select
                value={selectedOption}
                onChange={handleSelectChange}
                options={Sessionyears.map((Sessionyear) => ({
                  value: Sessionyear.Sessionyear_Name,
                  label: Sessionyear.Sessionyear_Name,
                }))}
                placeholder="Select Session"
                isClearable
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Label>Select Charge Types</Form.Label>
            <InputGroup className="mb-3">
              <Select
                styles={{
                  container: (provided) => ({
                    ...provided,
                    flex: "1", // Occupy remaining space
                  }),
                }}
                onChange={handleSearchChange}
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
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}
          </Col>
          <Col md={3}>
            <Form.Label>Add New Charge</Form.Label>
            <Button onClick={() => setShowModal(true)}>Add New Charge</Button>
          </Col>
        </Row>
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
                Actions
              </th>
            </tr>
            <tr className="text-center">
              <th>Rate_Quantity</th>
              <th>Rate_Booklet</th>
              <th>Rate_Paper</th>
            </tr>
          </thead>
          <tbody>
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
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Charge Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddChargeType}>
            <Form.Group controlId="chargeTypeName">
              <Form.Label>Name:</Form.Label>
              <Form.Control
                type="text"
                value={newChargeTypeName}
                onChange={(e) => setNewChargeTypeName(e.target.value)}
              />
            </Form.Group>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                className="px-4 mx-2"
                variant="primary"
                type="submit"
                style={{ marginRight: "10px" }}
              >
                Add
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AddMasterCharges;
