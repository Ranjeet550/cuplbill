// PermissionChecker.js
import React,{ useEffect, useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { useUser } from './UserContext';
import axios from 'axios';

const PermissionChecker = ({ children }) => {
  const { billUser } = useUser();
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const userId = billUser.user_ID; // Assuming you are using a fixed userId for now
        const response = await axios.get(`https://localhost:7247/api/Permissions/ByUser/${userId}`);
        setUserPermissions(response.data);
        setLoading(false);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [billUser]);

  const hasPermission = (moduleId, permissionType) => {
    const modulePermissions = userPermissions.find(p => p.module_Id === moduleId);
    return modulePermissions && modulePermissions[permissionType];
  };

  return typeof children === 'function' ? children({ hasPermission }) : null;
};

// Add prop type validation for the 'permissions' prop
PermissionChecker.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func
  ]).isRequired
};

export default PermissionChecker;