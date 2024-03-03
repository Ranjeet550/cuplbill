import React from "react";
import PropTypes from "prop-types";

const CoverChargesTable = ({ selectedCharges, charges }) => {
  return (
    <div className="mt-3 table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Charge Name</th>
            <th>Rate (Rs.)</th>
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
                  { charge.rateBooklet || charge.ratePaper} {/* Display rate */}
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
