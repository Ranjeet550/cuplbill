import React, { useState, useEffect } from "react";
import GroupTable from "./GroupTable";
import { Container, Button, Spinner } from "react-bootstrap";
import AddGroupModal from "./AddGroupModal";

const apiUrl = process.env.REACT_APP_API_GROUP;

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Function to fetch group data from the API
    const fetchGroups = async () => {
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          setGroups(data);
          console.log(data)
          setLoading(false);
        } else {
          throw new Error('Failed to fetch group data');
        }
      } catch (error) {
        console.error("Error fetching group data:", error);
        setLoading(false);
      }
    };

    fetchGroups(); // Call the fetchGroups function

  }, []); // Re-run the effect whenever the groups state changes

  const handleAddGroup = (newGroupData) => {
    // Update the groups state with the new group data
    setGroups([...groups, newGroupData]);
  };

  return (
    <Container className="groupform border border-3 p-4 my-3">
      <div className="d-flex justify-content-between m-3">
        <h3>Groups</h3>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Group
        </Button>
      </div>
      <hr />

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <GroupTable groups={groups} />
      )}

      <AddGroupModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleAdd={handleAddGroup}
      />
    </Container>
  );
};

export default Groups;
