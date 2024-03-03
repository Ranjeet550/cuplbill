// Form.js
import React from "react";
import PropTypes from "prop-types";
import { Form, Row, Col } from "react-bootstrap";

const FormComponent = ({ groups, selectedGroup, handleGroupChange, sessions, selectedSession, handleSessionChange, selectedType, handleTypeChange }) => {
  return (
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
  );
};

FormComponent.propTypes = {
  groups: PropTypes.array.isRequired,
  selectedGroup: PropTypes.string.isRequired,
  handleGroupChange: PropTypes.func.isRequired,
  sessions: PropTypes.array.isRequired,
  selectedSession: PropTypes.string.isRequired,
  handleSessionChange: PropTypes.func.isRequired,
  selectedType: PropTypes.string.isRequired,
  handleTypeChange: PropTypes.func.isRequired,
};

export default FormComponent;
