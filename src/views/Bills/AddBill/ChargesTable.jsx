// ChargesTable.js
import React from "react";
import PropTypes from "prop-types";
import { Table, Form } from "react-bootstrap";

const ChargesTable = ({ charges, selectedType, handleChargeSelection, selectedCharges }) => {
  return (
    <div className="mt-3 table-responsive">
      <h3>Charges for the selected session:</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Charge Type</th>
            <th>Rate (Rs.)</th>
            <th>Rate for Quantity</th>
            <th>Show Charge</th>
          </tr>
        </thead>
        <tbody>
          {charges.map((charge) => (
            <tr key={charge.chargeDetailId}>
              <td>{charge.chargeTypeName}</td>
              <td>
                {selectedType === "paper" ? charge.ratePaper : charge.rateBooklet}
              </td>
              <td>
                {charge.rateQuantity}
              </td>
              <td>
                <Form.Check
                  type="checkbox"
                  id={`check-${charge.chargeDetailId}`}
                  label=""
                  onChange={() => handleChargeSelection(charge.chargeTypeName)}
                  checked={selectedCharges.includes(charge.chargeTypeName)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

ChargesTable.propTypes = {
  charges: PropTypes.array.isRequired,
  selectedType: PropTypes.string.isRequired,
  handleChargeSelection: PropTypes.func.isRequired,
  selectedCharges: PropTypes.array.isRequired,
};

export default ChargesTable;
