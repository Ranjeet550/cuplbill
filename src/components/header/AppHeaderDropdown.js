import React, { useState, useEffect } from "react";
import { useUser } from "./../../context/UserContext";
import { fetchUserData } from "./../../context/UserData";
import DefaultAvatar from "./../../assets/images/avatars/defaultavatar.jpg";
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react";
import { Link } from "react-router-dom";

const AppHeaderDropdown = () => {
  const { billUser, logout } = useUser();
  const [profilePicturePath, setProfilePicturePath] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (billUser) {
          const userData = await fetchUserData(billUser.user_ID);
          const relativePath = userData.profilePicturePath;
          const baseURL = "https://localhost:7247/";

          // Set profile picture path based on condition
          setProfilePicturePath(
            relativePath ? baseURL + relativePath : DefaultAvatar
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [billUser, setProfilePicturePath]);

  const handleLogout = () => {
    logout();
    // Example: history.push('/login');
  };

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle
        placement="bottom-end"
        className="py-0 pe-0"
        caret={false}
      >
        <CAvatar src={DefaultAvatar} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem as={Link} to={`/users/view-user/${billUser.user_ID}`}>
          <i className="icon-user me-2"></i>
          Profile
        </CDropdownItem>
        <CDropdownItem href="#">
          <i className="icon-settings me-2"></i>
          Settings
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem className="c-pointer" onClick={handleLogout}>
          <i className="icon-arrow-thick-to-right me-2"></i>
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;
