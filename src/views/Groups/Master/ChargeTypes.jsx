import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Container } from 'react-bootstrap';

const ChargeTypes = () => {
  const [chargeTypes, setChargeTypes] = useState([]); // State for storing charge types
  const [modalIsOpen, setModalIsOpen] = useState(false); // State for managing modal visibility
  const [newChargeTypeName, setNewChargeTypeName] = useState(''); // State for the new charge type name

  // Function to fetch charge types from the API
  const fetchChargeTypes = async () => {
    try {
      const response = await fetch('https://localhost:7247/api/ChargeType');
      if (response.ok) {
        const data = await response.json();
        setChargeTypes(data);
      } else {
        console.error('Failed to fetch charge types:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching charge types:', error.message);
    }
  };

  useEffect(() => {
    fetchChargeTypes(); // Fetch charge types on component mount
  }, []); // Empty dependency array ensures the effect runs only once

  // Function to open modal
  const openModal = () => {
    setModalIsOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setModalIsOpen(false);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://localhost:7247/api/ChargeType', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ charge_Name: newChargeTypeName }) // Send the new charge type name to the API
      });
      if (response.ok) {
        const data = await response.json();
        // Add the new charge type to the list
        setChargeTypes([...chargeTypes, { charge_Id: data.charge_Id, charge_Name: data.charge_Name }]);
        closeModal(); // Close the modal
        setNewChargeTypeName(''); // Reset input field
      } else {
        console.error('Failed to add charge type:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding charge type:', error.message);
    }
  };

  return (
    <Container className=' border border-3 p-4 my-1'>
      <div className="d-flex justify-content-between m-3">
        <h3>Charge Types</h3>
        <Button variant="primary" onClick={openModal}>Add Charge Type</Button>
      </div>
      <hr />
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Charge Types</th>
          </tr>
        </thead>
        <tbody>
          {chargeTypes.map(chargeType => (
            <tr key={chargeType.charge_Id}>
              <td>{chargeType.charge_Name}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={modalIsOpen} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Charge Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="chargeTypeName">
              <Form.Label>Name:</Form.Label>
              <Form.Control type="text" value={newChargeTypeName} onChange={(e) => setNewChargeTypeName(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit" style={{ marginRight: '10px' }}>Add</Button>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>

          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ChargeTypes;
