import { useState, useEffect } from "react";

const apiUrl = process.env.REACT_APP_API_CUSTOMERS;
const invoiceUrl = process.env.REACT_APP_API_INVOICES;

const DashboardCardData = () => {
  const [customerCount, setCustomerCount] = useState(0);
  const [paidBillCount, setPaidBillCount] = useState(0);
  const [unpaidBillCount, setUnpaidBillCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerDataResponse, invoiceDataResponse] = await Promise.all([
          fetch(apiUrl),
          fetch(invoiceUrl)
        ]);
        const customerData = await customerDataResponse.json();
        const invoiceData = await invoiceDataResponse.json();

        setCustomerCount(customerData.length);
        setInvoiceCount(invoiceData.length);

        // Assuming invoice data has a property indicating whether the bill is paid or not
        const paidBills = invoiceData.filter(invoice => invoice.isPaid);
        setPaidBillCount(paidBills.length);

        // Calculating the count of unpaid bills
        const unpaidBills = invoiceData.filter(invoice => !invoice.isPaid);
        setUnpaidBillCount(unpaidBills.length);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cardData = [
    {
      color: "green",
      iconClass: "fa-user",
      link: "/users",
      value: customerCount,
      title: "Total Users",
    },
    {
      color: "blue",
      iconClass: "fa-money-bill-wave", // Assuming this icon represents paid bills
      link: "/paidbill",
      value: paidBillCount,
      title: "Paid Bills",
    },
    {
      color: "yellow",
      iconClass: "fa-exclamation-circle", // Assuming this icon represents unpaid bills
      link: "/unpaidbill",
      value: unpaidBillCount,
      title: "Unpaid Bills",
    },
    {
      color: "purple",
      iconClass: "fa-indian-rupee", // Changed to represent Indian Rupees
      link: "/invoices",
      value: invoiceCount,
      title: "Total Invoices",
    },
    // You can add more card data as needed for your application
  ];

  return { cardData, loading };
};

export default DashboardCardData;