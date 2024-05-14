import React from "react";
import PropTypes from "prop-types";

const CoverChargesTable = ({ selectedCharges, charges }) => {
  // Calculate total amount for each charge type
  const calculateTotalAmount = (chargeTypeName) => {
    let totalAmount = 0;
    selectedCharges.forEach((chargeName) => {
      const charge = charges.find((c) => c.chargeTypeName === chargeName);
      if (charge) {
        totalAmount += charge[chargeTypeName] || 0;
      }
    });
    return totalAmount.toFixed(2); // Format to two decimal places
  };

  return (
    <div className="mt-3 table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Charge Name</th>
            <th>Rate (Rs.)</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {selectedCharges.map((chargeName) => {
            const charge = charges.find(
              (c) => c.chargeTypeName === chargeName
            );
            return (
              <tr key={charge.chargeDetailId}>
                <td>{charge.chargeTypeName}</td>
                <td>
                  {charge.rateBooklet || charge.ratePaper} {/* Display rate */}
                </td>
                <td>
                  {calculateTotalAmount(charge.chargeTypeName)} {/* Display total amount */}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

CoverChargesTable.propTypes = {
  selectedCharges: PropTypes.array.isRequired,
  charges: PropTypes.array.isRequired,
};

export default CoverChargesTable;
