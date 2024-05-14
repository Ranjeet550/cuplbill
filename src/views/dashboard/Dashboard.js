import React from 'react';
import { Container } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import DashboardCardData from './DashboardCardData';

const Dashboard = () => {
  const { cardData, loading } = DashboardCardData();
  return (
    <Container fluid>
      <div className="dashboard-container"> {/* Apply a class for container styling */}
        <div className="row">
          {!loading ? (
            cardData.map((card, index) => (
              <DashboardCard
                key={index}
                link={card.link}
                color={card.color}
                iconClass={card.iconClass}
                value={card.value}
                title={card.title}
              />
            ))
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
