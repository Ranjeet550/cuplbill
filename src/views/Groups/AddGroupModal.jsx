import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
const apiUrl = process.env.REACT_APP_API_GROUPS; 

const AddGroupModal = ({ show, handleClose, handleAdd }) => {
  const [groupName, setGroupName] = useState('');
  const [groupEmail, setGroupEmail] = useState('');
  const [groupAddress, setGroupAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newGroup = {
      name: groupName,
      email: groupEmail,
      address: groupAddress
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGroup)
      });

      if (response.ok) {
        // If the request is successful, call the handleAdd function
        handleAdd(newGroup);
        // Reset the form fields
        setGroupName('');
        setGroupEmail('');
        setGroupAddress('');
        // Close the modal
        handleClose();
      } else {
        // Handle error response
        console.error('Failed to add group:', response.statusText);
        // Optionally, you can display an error message to the user
      }
    } catch (error) {
      // Handle network errors
      console.error('Network error:', error.message);
      // Optionally, you can display an error message to the user
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formGroupName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" placeholder="Enter group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} required />
          </Form.Group>
          <Form.Group controlId="formGroupEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Enter group email" value={groupEmail} onChange={(e) => setGroupEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group controlId="formGroupAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control type="text" placeholder="Enter group address" value={groupAddress} onChange={(e) => setGroupAddress(e.target.value)} required />
          </Form.Group>
          <div className='text-center'>
          <Button variant="primary" type="submit" className=' mt-3 w-50'>
            Add
          </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

AddGroupModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleAdd: PropTypes.func.isRequired
};

export default AddGroupModal;
