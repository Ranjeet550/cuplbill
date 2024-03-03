// ItemsTable.js
import React from "react";
import PropTypes from "prop-types";
import { Table, Form, Button } from "react-bootstrap";

const ItemsTable = ({ items, handleQuantityChange, handlePagesChange, handleCatchNumberChange, handleEnvelopeChange, removeRow, addRow }) => {
  return (
    <div className="mt-3 table-responsive">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Serial No</th>
            <th>Catch Number</th>
            <th>Quantity</th>
            <th>No. of Pages</th>
            <th>Envelope</th>
            <th>Remove Row</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.serialNo}</td>
              <td>
                <Form.Control
                  type="text"
                  onChange={(e) => handleCatchNumberChange(e, index)}
                  value={item.catchNumber}
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  onChange={(e) => handleQuantityChange(e, index)}
                  value={item.quantity}
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  onChange={(e) => handlePagesChange(e, index)}
                  value={item.pages}
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  onChange={(e) => handleEnvelopeChange(e, index)} // Call handleEnvelopeChange
                  value={item.envelope} // Add value attribute for envelope
                />
              </td>
              <td>
                <Button onClick={() => removeRow(index)}>Remove</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button onClick={addRow}>Add Row</Button>
    </div>
  );
};

ItemsTable.propTypes = {
  items: PropTypes.array.isRequired,
  handleQuantityChange: PropTypes.func.isRequired,
  handlePagesChange: PropTypes.func.isRequired,
  handleCatchNumberChange: PropTypes.func.isRequired,
  handleEnvelopeChange: PropTypes.func.isRequired, // Add PropTypes for handleEnvelopeChange
  removeRow: PropTypes.func.isRequired,
  addRow: PropTypes.func.isRequired,
};

export default ItemsTable;
