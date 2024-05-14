import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  page: {
    padding: 10,
  },
  title: {
    fontSize: 6,
    textAlign: 'center',
  },
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableHeader: {
    fontWeight: 'bold',
    fontSize: 6,
    width: 'auto',
    wordWrap: 'break-word',
    textAlign: 'center',
    alignItems: 'center',
    borderWidth: 0.2,
    borderColor: 'black',
    paddingVertical: 2,
    paddingHorizontal: 4,
    flex: 1,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 6,
    width: 'auto',
    wordWrap: 'break-word',
    textAlign: 'center',
    alignItems: 'center',
    borderWidth: 0.2,
    borderColor: 'black',
    paddingVertical: 2,
    paddingHorizontal: 4,
    flex: 1,
    margin: 0,
  },
});

const BillPdf = ({ charges, totalPages, totalCharges, totalBill, bills, group, session, billfor }) => {
  // Define helper functions
  const calculateTotalAmountWithoutGST = () => {
    let totalAmountWithoutGST = 0;
    Object.values(totalCharges).forEach(totalCharge => {
      totalAmountWithoutGST += parseFloat(totalCharge);
    });
    return totalAmountWithoutGST.toFixed(2);
  };

  const calculateTotalGST = () => {
    const totalAmountWithoutGST = calculateTotalAmountWithoutGST();
    return (totalAmountWithoutGST * selectedGST / 100).toFixed(2);
  };

  const calculateTotalAmountWithGST = () => {
    const totalAmountWithoutGST = calculateTotalAmountWithoutGST();
    return (parseFloat(totalAmountWithoutGST) + parseFloat(calculateTotalGST())).toFixed(2);
  };
  // Placeholder value for selectedGST
  const selectedGST = 18; // Assuming 18% GST

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Main Bill</Text>
        <Text style={styles.title}>Group:{group} & Session:{session} & Bill For:{billfor}</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>S.N.</Text>
            <Text style={styles.tableHeader}>Catch No</Text>
            <Text style={styles.tableHeader}>Quantity</Text>
            <Text style={styles.tableHeader}>Pages</Text>
            {charges.map(charge => (
              <Text key={charge.chargeDetailId} style={styles.tableHeader}>
                {charge.chargeTypeName}
              </Text>
            ))}
            <Text style={styles.tableHeader}>Total Charges</Text>
          </View>
          {bills.map((bill, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{index + 1}</Text>
              <Text style={styles.tableCell}>{bill.catchNumber}</Text>
              <Text style={styles.tableCell}>{bill.quantity}</Text>
              <Text style={styles.tableCell}>{bill.pages}</Text>
              {charges.map(charge => (
                <Text key={charge.chargeDetailId} style={styles.tableCell}>
                  {parseFloat(bill.bill[charge.chargeTypeName]).toFixed(2)}
                </Text>
              ))}
              <Text style={styles.tableCell}>{parseFloat(bill.totalItemCharges).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>Cumulative Total</Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}>{totalPages}</Text>
            {charges.map(charge => (
              <Text key={charge.chargeDetailId} style={styles.tableCell}>
                {parseFloat(totalCharges[charge.chargeTypeName] || 0).toFixed(2)}
              </Text>
            ))}
            <Text style={styles.tableCell}>{parseFloat(totalBill).toFixed(2)}</Text>
          </View>
        </View>
      </Page>

      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        {/* <Text style={styles.title}>Cover Page</Text> */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>S.N.</Text>
            <Text style={styles.tableHeader}>Particulars</Text>
            <Text style={styles.tableHeader}>Rate(RS.)</Text>
            <Text style={styles.tableHeader}>Amount in RS.</Text>
          </View>
          {Object.entries(totalCharges).map(([chargeType, totalCharge], index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{index + 1}</Text>
              <Text style={styles.tableCell}>{chargeType}</Text>
              <Text style={styles.tableCell}>
                {parseFloat(charges.find(charge => charge.chargeTypeName === chargeType).rateBooklet || charges.find(charge => charge.chargeTypeName === chargeType).ratePaper || 0).toFixed(2)}
              </Text>
              <Text style={styles.tableCell}>{parseFloat(totalCharge).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>Total Amount without GST:</Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}>{calculateTotalAmountWithoutGST()}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>GST({selectedGST}%)</Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}>{calculateTotalGST()}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, fontWeight: 'bold', backgroundColor: 'black', color: 'white' }}>Total Amount with GST:</Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}>{calculateTotalAmountWithGST()}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

BillPdf.propTypes = {
  charges: PropTypes.array.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalCharges: PropTypes.object.isRequired,
  totalBill: PropTypes.number.isRequired,
  bills: PropTypes.array.isRequired,
  group: PropTypes.string.isRequired,
  session: PropTypes.string.isRequired,
  billfor: PropTypes.string.isRequired,
};

export default BillPdf;
