import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

import $ from 'jquery';
import { Link } from 'react-router-dom';

const GroupTable = ({ groups }) => {
  const tableRef = useRef(null);
  useEffect(() => {
    // Initialize DataTable
    $(tableRef.current).DataTable(); 
  }, []);

  const csvHeaders = [
    { label: 'Group ID', key: 'groupId' },
    { label: 'Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Address', key: 'address' }
  ];

  return (
    <div className="table-responsive">
      <Table striped bordered hover ref={tableRef}>
        <thead>
          <tr>
             <th>Group ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.groupId}>
              <td>{group.groupId}</td>
              <td>{group.name}</td>
              <td>{group.email}</td>
              <td>{group.address}</td>
              <td>
                <div className="d-flex gap-3 text-primary">
                    <Link to={`view-group/${group.groupId}`}>
                        <FontAwesomeIcon icon={faEye} className="text-success" />
                    </Link>
                  <FontAwesomeIcon icon={faPenToSquare} className="text-primary" />
                  <FontAwesomeIcon icon={faTrash} className="text-danger" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-end mt-3">
        <CSVLink
          data={groups}
          headers={csvHeaders}
          filename={'group_data.csv'}
          className="btn btn-primary"
        >
          Download CSV
        </CSVLink>
      </div>
    </div>
  );
};

GroupTable.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      groupId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired
    })
  ).isRequired
};

export default GroupTable;
