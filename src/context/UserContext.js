import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes


// Helper function to retrieve billUser from local storage
const getbillUserFromLocalStorage = () => {
  const storedbillUser = localStorage.getItem('billUser');
  return storedbillUser ? JSON.parse(storedbillUser) : null;
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize billUser state using the helper function
  const [billUser, setbillUser] = useState(getbillUserFromLocalStorage());

  // Function to log in a user and update billUser state
  const login = (userData) => {
    setbillUser(userData);
    localStorage.setItem('billUser', JSON.stringify(userData));
  };

  // Function to log out a user and clear billUser state
  const logout = () => {
    setbillUser(null);
    localStorage.removeItem('billUser');
  };

  // Function to check if a user is logged in
  const isLoggedIn = () => {
    return !!billUser; // Return true if billUser is not null or undefined
  };

  // Provide billUser, login, logout, and isLoggedIn functions to the context
  return (
    <UserContext.Provider value={{ billUser, login, logout, isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};

// Define propTypes for UserProvider
UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUser = () => {
  // Use the context to access billUser, login, logout, and isLoggedIn functions
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
