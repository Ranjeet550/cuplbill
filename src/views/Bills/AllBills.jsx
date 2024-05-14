import React, { useState, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const AllBills = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://localhost:7247/api/GeneratedBills');
        if (response.ok) {
          const data = await response.json();
          const resolvedData = await Promise.all(data.map(resolveData));
          setBills(resolvedData);
          // Store fetched data in local storage
          localStorage.setItem('bills', JSON.stringify(resolvedData));
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const resolveData = async (bill) => {
    const [groupName, sessionName, createdBy] = await Promise.all([
      getGroupName(bill.group_id),
      getSessionName(bill.session),
      getUserName(bill.created_By)
    ]);

    return {
      ...bill,
      groupName,
      sessionName,
      createdBy
    };
  };

  const getUserName = async (userId) => {
    try {
      const response = await fetch(`https://localhost:7247/api/Users/${userId}`);
      if (response.ok) {
        const user = await response.json();
        return `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`;
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return '';
    }
  };

  const getGroupName = async (groupId) => {
    try {
      const response = await fetch(`https://localhost:7247/api/Group/${groupId}`);
      if (response.ok) {
        const group = await response.json();
        return group.name;
      } else {
        throw new Error('Failed to fetch group data');
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
      return '';
    }
  };

  const getSessionName = async (sessionId) => {
    try {
      const response = await fetch(`https://localhost:7247/api/Session/${sessionId}`);
      if (response.ok) {
        const session = await response.json();
        return session.session_Name;
      } else {
        throw new Error('Failed to fetch session data');
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
      return '';
    }
  };

  const handleViewBill = async (bill) => {
    // Generate sequential invoice number and lot number
    const invoiceNo = await generateInvoiceNumber();
    const lotNo = await generateLotNumber();

    // Set addBillData in local storage
    localStorage.setItem('addBillData', JSON.stringify({
      groupId: bill.group_id,
      sessionId: bill.session,
      chargeType: bill.bilL_FOR,
      generated: true,
      invoiceNo,
      lotNo
    }));

    // Navigate to the GenerateBill route
    navigate('/Bills/GenerateBill');

    // Implement your logic to view the bill based on the billId
    console.log(`Viewing bill with ID: ${bill.bill_id}`);
  };

  const generateInvoiceNumber = async () => {
    // Get the last generated invoice number from local storage
    let lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber');
    if (!lastInvoiceNumber) {
      lastInvoiceNumber = 0;
    } else {
      lastInvoiceNumber = parseInt(lastInvoiceNumber);
    }
    const newInvoiceNumber = lastInvoiceNumber + 1;

    // Update the last generated invoice number in local storage
    localStorage.setItem('lastInvoiceNumber', newInvoiceNumber.toString());

    return `INV${newInvoiceNumber.toString().padStart(4, '0')}`;
  };

  const generateLotNumber = async () => {
    // Get the last generated lot number from local storage
    let lastLotNumber = localStorage.getItem('lastLotNumber');
    if (!lastLotNumber) {
      lastLotNumber = 0;
    } else {
      lastLotNumber = parseInt(lastLotNumber);
    }
    const newLotNumber = lastLotNumber + 1;

    // Update the last generated lot number in local storage
    localStorage.setItem('lastLotNumber', newLotNumber.toString());

    return `LOT${newLotNumber.toString().padStart(4, '0')}`;
  };

  const handleUpdateStatus = async (billId, newStatus) => {
    try {
      const billIndex = bills.findIndex((bill) => bill.bill_id === billId);

      if (billIndex === -1) {
        console.error('Bill data not found');
        return;
      }

      const updatedBills = [...bills];
      updatedBills[billIndex].status = newStatus;

      setBills(updatedBills);

      // Update local storage
      localStorage.setItem('bills', JSON.stringify(updatedBills));

      const requestBody = JSON.stringify({
        status: newStatus,
        ...updatedBills[billIndex],
      });

      console.log('Request Body:', requestBody);

      const response = await fetch(`https://localhost:7247/api/GeneratedBills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error updating status:', error);
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredBills = bills.filter((bill) => {
    const searchTermLC = searchTerm.toLowerCase();
    return (
      String(bill.groupName).toLowerCase().includes(searchTermLC) ||
      String(bill.sessionName).toLowerCase().includes(searchTermLC) ||
      String(bill.invoiceNo).toLowerCase().includes(searchTermLC) ||
      String(bill.lot_No).toLowerCase().includes(searchTermLC) ||
      String(bill.bilL_FOR).toLowerCase().includes(searchTermLC) ||
      String(bill.status).toLowerCase().includes(searchTermLC) ||
      String(bill.createdBy).toLowerCase().includes(searchTermLC) ||
      new Date(bill.created_Datetime).toLocaleString().toLowerCase().includes(searchTermLC)
    );
  });

  return (
    <div style={{ position: 'relative' }}>
      <h2>All Bills</h2>
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch style={{ marginLeft: '5px', cursor: 'pointer' }} />
      </div>
      <Table striped bordered hover style={{ tableLayout: 'auto' }}>
        <thead>
          <tr>
            <th style={{ whiteSpace: "nowrap" }}>Bill ID</th>
            <th style={{ whiteSpace: "nowrap" }}>Group Name</th>
            <th style={{ width: "15%" }}>Session</th>
            <th style={{ whiteSpace: "nowrap" }}>Invoice No</th>
            <th style={{ whiteSpace: "nowrap" }}>Lot No</th>
            <th style={{ whiteSpace: "nowrap" }}>Bill For</th>
            <th style={{ whiteSpace: "nowrap" }}>Status</th>
            <th style={{ whiteSpace: "nowrap" }}>Set Status</th>
            <th style={{ whiteSpace: "nowrap" }}>Created By</th>
            <th style={{ whiteSpace: "nowrap" }}>Created Datetime</th>
            <th style={{ whiteSpace: "nowrap" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredBills.map((bill) => (
            <tr key={bill.bill_id}>
              <td>{bill.bill_id}</td>
              <td>{bill.groupName}</td>
              <td>{bill.sessionName}</td>
              <td>{bill.invoiceNo}</td>
              <td>{bill.lot_No}</td>
              <td>{bill.bilL_FOR}</td>
              <td>{bill.status}</td>
              <td>
                {bill.status !== "Complete" && bill.status !== "Pending" ? (
                  <select
                    value={bill.status}
                    onChange={(e) => handleUpdateStatus(bill.bill_id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Complete">Complete</option>
                  </select>
                ) : (
                  <select disabled>
                    <option value={bill.status}>{bill.status}</option>
                  </select>
                )}
              </td>
              <td>{bill.createdBy}</td>
              <td>{new Date(bill.created_Datetime).toLocaleString()}</td>
              <td>
                <Button variant="primary" onClick={() => handleViewBill(bill)}>View</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AllBills;
