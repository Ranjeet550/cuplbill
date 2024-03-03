import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Container, Card, Row, Col, CardBody, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const groupApiUrl = "https://localhost:7247/api/Group";
const chargeDetailsApiUrl = `https://localhost:7247/api/ChargeDetails/SessionsInGroup`;

const ViewGroup = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [groupSessions, setGroupSessions] = useState([]);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [errorGroup, setErrorGroup] = useState(null);
  const [errorSessions, setErrorSessions] = useState(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await axios.get(`${groupApiUrl}/${groupId}`);
        if (response.status === 200) {
          const data = response.data;
          setGroup(data);
          setErrorGroup(null); // Reset error if group is found
        } else {
          setErrorGroup("Failed to fetch group data");
        }
      } catch (error) {
        setErrorGroup("Error fetching group data");
      } finally {
        setLoadingGroup(false);
      }
    };

    const fetchGroupSessions = async () => {
      try {
        const response = await axios.get(`${chargeDetailsApiUrl}/${groupId}`);
        if (response.status === 200) {
          const data = response.data;
          setGroupSessions(data.groupSessions);
          setErrorSessions(null); // Reset error if sessions are found
        } else {
          setErrorSessions("Failed to fetch group sessions");
        }
      } catch (error) {
        setErrorSessions("Error fetching group sessions");
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchGroupData();
    fetchGroupSessions();
  }, [groupId]);

  return (
    <Container className="border border-3 p-4 my-3">
      {loadingGroup || loadingSessions ? (
        <div>Loading...</div>
      ) : (
        <>
          {group ? (
            <>
              <Card>
                <CardBody>
                  <Row>
                    <Col>
                      <p>
                        <strong>Group Name:</strong> {group.name}
                      </p>
                    </Col>
                    <Col>
                      <p>
                        <strong>Email:</strong> {group.email}
                      </p>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <p>
                        <strong>Address:</strong> {group.address}
                      </p>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
              <Row className="row-cols-1 row-cols-md-2 row-cols-lg-4 my-3">
                <Col>
                  <Link to={`/Groups/AddMasterCharges/${groupId}`}>
                    <Card>
                      <CardBody className="text-center p-5">
                        <FontAwesomeIcon icon={faPlus} className="fs-2" />
                      </CardBody>
                    </Card>
                  </Link>
                </Col>
                {/* Display group sessions */}
                {groupSessions.map((session, index) => (
                  <Col key={index}>
                    <Link to={`/Groups/ChargeDetails/${groupId}/${session}`}>
                      <Card>
                        <CardBody className="text-center p-4">
                          <h3 className="mb-3">Charge Table</h3>
                          <h4>{session}</h4>
                        </CardBody>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </>
          ) : (
            <Alert variant="danger">Group does not exist.</Alert>
          )}
        </>
      )}
    </Container>
  );
};

export default ViewGroup;
