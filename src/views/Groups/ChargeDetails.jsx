import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Table } from "react-bootstrap";

const ChargeDetails = () => {
  const { groupId, session } = useParams();
  const [chargeDetails, setChargeDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7247/api/ChargeDetails/${groupId}/${session}`
        );
        setChargeDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [groupId, session]);

  return (
    <div>
      <h3 className="text-center">
        Charge Details for Group {groupId} and Session: {session}
      </h3>
      <hr />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr className="text-center align-items-center">
              <th className="align-middle">SN</th>
              <th className="align-middle">Charge Name</th>
              <th className="text-center align-middle">Rate_Booklet</th>
              <th className="text-center align-middle">Rate_Paper</th>
            </tr>
          </thead>
          <tbody>
            {chargeDetails.map((chargeType, index) => (
              <tr key={index}>
                <td className="text-center align-middle">{index + 1}</td>
                <td className="align-middle">{chargeType.chargeTypeName}</td>
                <td className="text-center align-middle">{chargeType.rateBooklet}</td>
                <td className="text-center align-middle">{chargeType.ratePaper}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ChargeDetails;
