import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Form, Button, Row, Col } from 'react-bootstrap';

const ChargeTypeForm = ({ addChargeType }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    addChargeType(name);
    setName('');
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

ChargeTypeForm.propTypes = {
  addChargeType: PropTypes.func.isRequired,
};

export default ChargeTypeForm;
