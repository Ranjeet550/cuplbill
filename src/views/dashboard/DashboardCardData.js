import { useState, useEffect } from "react";

const apiUrl = process.env.REACT_APP_API_USERS;
const groupApiUrl = process.env.REACT_APP_API_GROUP;
const generatedBillsApiUrl = 'https://localhost:7247/api/GeneratedBills';

const DashboardCardData = () => {
  const [userCount, setUserCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [generatedBillsCount, setGeneratedBillsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, groupsResponse, generatedBillsResponse] = await Promise.all([
          fetch(apiUrl),
          fetch(groupApiUrl),
          fetch(generatedBillsApiUrl)
        ]);
        const users = await usersResponse.json();
        const groups = await groupsResponse.json();
        const generatedBills = await generatedBillsResponse.json();

        setUserCount(users.length);
        setGroupCount(groups.length);
        setGeneratedBillsCount(generatedBills.length);

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
      color: "blue",
      iconClass: "fa-user",
      link: "/users",
      value: userCount,
      title: "Total Users",
    },
    {
      color: "lightgreen",
      iconClass: "fa-university",
      link: "/groups",
      value: groupCount,
      title: "Groups",
    },
    {
      color: "yellow",
      iconClass: "fa-calculator",
      link: "/Bills",
      value: generatedBillsCount,
      title: "Generated Bills",
    },
  ];

  return { cardData, loading };
};

export default DashboardCardData;
