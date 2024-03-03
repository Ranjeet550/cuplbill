import React, { useState } from "react";
import PropTypes from "prop-types";

const ChargesSummaryTable = ({ charges }) => {
  const [selectedCharges, setSelectedCharges] = useState([]);

  const handleChargeSelection = (chargeTypeName) => {
    if (selectedCharges.includes(chargeTypeName)) {
      setSelectedCharges(selectedCharges.filter((charge) => charge !== chargeTypeName));
    } else {
      setSelectedCharges([...selectedCharges, chargeTypeName]);
    }
  };

  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>Select</th> {/* Checkbox column */}
          <th>S.N.</th>
          <th>Details</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {charges.map((charge, index) => (
          <tr key={index}>
            <td>
              <input
                type="checkbox"
                checked={selectedCharges.includes(charge.chargeTypeName)}
                onChange={() => handleChargeSelection(charge.chargeTypeName)}
              />
            </td>
            <td>{index + 1}</td>
            <td>{charge.chargeTypeName}</td>
            <td>{charge.rate}</td> {/* Display the rate */}
            <td>{charge.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

ChargesSummaryTable.propTypes = {
  charges: PropTypes.arrayOf(
    PropTypes.shape({
      chargeTypeName: PropTypes.string.isRequired,
      rate: PropTypes.number.isRequired, // Add rate prop type
      amount: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ChargesSummaryTable;
