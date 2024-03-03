// BillButtons.js
import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";

const BillButtons = ({ calculateBill, printTable }) => {
  return (
    <div className="mt-3">
      <Button onClick={calculateBill}>Generate Bill</Button>{" "}
      <Button onClick={printTable}>Print</Button>
    </div>
  );
};

BillButtons.propTypes = {
  calculateBill: PropTypes.func.isRequired,
  printTable: PropTypes.func.isRequired,
};

export default BillButtons;
