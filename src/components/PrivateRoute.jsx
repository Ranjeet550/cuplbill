// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types'; // Import PropTypes
import { useUser } from '../context/UserContext';

const PrivateRoute = ({ element }) => {
  const { billUser } = useUser();

  // Check if the user is authenticated, otherwise redirect to the login page
  if (!billUser) {
    return <Navigate to="/login" />;
  }

  // If authenticated, render the provided element (which could be a Route or any other component)
  return element;
};

// Define propTypes
PrivateRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default PrivateRoute;
