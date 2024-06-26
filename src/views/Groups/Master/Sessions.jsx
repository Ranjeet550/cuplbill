import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button, Alert } from 'react-bootstrap'; // Import Alert component

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState('');
  const [existingSessions, setExistingSessions] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  
  useEffect(() => {
    fetchSessions();
  }, [sessions]); // Fetch sessions whenever there's a change in the sessions state

  const fetchSessions = async () => {
    try {
      const response = await axios.get('https://localhost:7247/api/Session');
      if (response.data) {
        setSessions(response.data);
        setLoading(false);
        const existing = response.data.map(session => session.session_Name);
        setExistingSessions(existing);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleAddSession = async () => {
    if (!selectedSession || existingSessions.includes(selectedSession)) {
      // If the selected session is empty or already exists, return early
      return;
    }
  
    try {
      const response = await axios.post('https://localhost:7247/api/Session', { session_Name: selectedSession });
      if (response.status === 200) {
        setSelectedSession(''); // Clear the selected session
        setShowSuccessAlert(true); // Show success alert
        setTimeout(() => {
          setShowSuccessAlert(false); // Hide success alert after a delay
        }, 3000); // Adjust the delay as needed
        // Fetch sessions again to update the list
        fetchSessions();
      }
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-6">
          <h3 className="text-center mb-3">Sessions</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Session Name</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.session_id}>
                  <td>{session.session_id}</td>
                  <td>{session.session_Name}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="col-md-6">
          <Card>
            <Card.Body>
              {showSuccessAlert && (
                <Alert variant="success" onClose={() => setShowSuccessAlert(true)} dismissible>
                  Session added successfully!
                </Alert>
              )}
              <h5 className="card-title">Add Session</h5>
              <Form>
                <Form.Group controlId="formSession">
                  <Form.Select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                  >
                    <option value="">Select Year</option>
                    {[...Array(15)].map((_, index) => {
                      const year = new Date().getFullYear() + index;
                      const label = `${year}-${String(year + 1).slice(-2)}`;
                      const isDisabled = existingSessions.includes(label);
                      return <option key={index} value={label} disabled={isDisabled}>{label}</option>;
                    })}
                  </Form.Select>
                </Form.Group>
                <div className='mt-4 text-end'>
                  <Button variant="primary" onClick={handleAddSession} disabled={loading}>
                    {loading? 'Adding Session...' : 'Add Session'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Sessions;
