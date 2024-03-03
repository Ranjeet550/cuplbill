import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

import { Table } from 'react-bootstrap';

const ChargeTypeTable = ({ chargeTypes }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {chargeTypes.map((chargeType, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{chargeType.name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

// Prop types validation
ChargeTypeTable.propTypes = {
  chargeTypes: PropTypes.array.isRequired, // chargeTypes should be an array and is required
};

export default ChargeTypeTable;
