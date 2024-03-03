import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Form, Button, Row, Col } from 'react-bootstrap';

const ChargeTypeForm = ({ addChargeType }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      const response = await fetch('https://localhost:7247/api/ChargeType', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ charge_Name: name }), // Send the charge name in the request body
      });
      
      if (response.ok) {
        const data = await response.json();
        addChargeType(data); // Add the new charge type to the state
        setName(''); // Clear the input field
      } else {
        console.error('Failed to add charge type');
      }
    } catch (error) {
      console.error('Error adding charge type:', error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Group as={Col} controlId="name" className="mb-0">
          <Form.Control
            type="text"
            placeholder="Charge Type Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Col className="d-flex align-items-end">
          <Button variant="primary" type="submit" className="mb-0">
            Add Charge Type
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

// Prop types validation
ChargeTypeForm.propTypes = {
  addChargeType: PropTypes.func.isRequired, // addChargeType should be a function and is required
};

export default ChargeTypeForm;
