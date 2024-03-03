import React from "react";
import { Table } from "react-bootstrap";
import PropTypes from "prop-types";

const MainBillTable = ({ charges, bills, selectedCharges, totalCharges }) => {
  // Function to calculate the total bill
  const calculateTotalBill = () => {
    let totalBill = 0;
    charges.forEach(charge => {
      if (selectedCharges.includes(charge.chargeTypeName)) {
        totalBill += totalCharges[charge.chargeTypeName] || 0;
      }
    });
    return totalBill;
  };

  return (
    <div>
      <Table striped bordered hover>
        <thead>
          <tr className="text-center">
            <th>S.N.</th>
            <th>Catch Number</th>
            <th>Quantity</th>
            <th>No. of Pages</th>
            {charges.map(
              (charge) =>
                selectedCharges.includes(charge.chargeTypeName) && (
                  <th key={charge.chargeDetailId}>
                    {charge.chargeTypeName} (Rs.)
                  </th>
                )
            )}
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, index) => (
            <tr key={index}>
              <td>{bill.serialNo}</td>
              <td>{bill.catchNumber}</td>
              <td>{bill.quantityReal}</td>
              <td>{bill.pages}</td>
              {charges.map(
                (charge) =>
                  selectedCharges.includes(charge.chargeTypeName) && (
                    <td key={charge.chargeDetailId}>
                      {bill[charge.chargeTypeName]}
                    </td>
                  )
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4">Total</td>
            {charges.map(
              (charge) =>
                selectedCharges.includes(charge.chargeTypeName) && (
                  <td key={charge.chargeDetailId}>
                    {totalCharges[charge.chargeTypeName] || 0}
                  </td>
                )
            )}
          </tr>
          <tr>
            <td colSpan="4">Total Bill</td>
            <td
              colSpan={
                charges.filter((charge) =>
                  selectedCharges.includes(charge.chargeTypeName)
                ).length
              }
            >
              {calculateTotalBill()} {/* Display the calculated total bill */}
            </td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
};

MainBillTable.propTypes = {
  charges: PropTypes.array.isRequired,
  bills: PropTypes.array.isRequired,
  selectedCharges: PropTypes.array.isRequired,
  totalCharges: PropTypes.object.isRequired,
};

export default MainBillTable;