import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilGroup,
  cilPlus,
  cilHamburgerMenu,
  cilCalculator,
  // cilNewspaper,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { faHamburger } from '@fortawesome/free-solid-svg-icons'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Management',
  },
  {
    component: CNavGroup,
    name: 'Users',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Add User',
        to: '/users/add-user',
        icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'All Users',
        to: '/users',
        icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Groups',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Groups',
        to: '/Groups',
        icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      },
      // {
      //   component: CNavItem,
      //   name: 'Charge Types',
      //   to: '/Groups/ChargeTypes',
      //   icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      // },
      // {
      //   component: CNavItem,
      //   name: 'Bill Master',
      //   to: '/Bills/Master/ChargeTypes',
      //   icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      // },
    ],
  },
  {
    component: CNavGroup,
    name: 'Bills',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Create Bill',
        to: '/Bills/AddBill',
        icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'All Bills',
        to: '/Bills',
        icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      },
      // {
      //   component: CNavItem,
      //   name: 'Bill Master',
      //   to: '/Bills/Master/ChargeTypes',
      //   icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      // },
    ],
  },
  {
    component: CNavGroup,
    name: 'Master',
    icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Manage Sessions',
        to: '/Master/Sessions',
        icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
      },
      // {
      //   component: CNavItem,
      //   name: 'All Bills',
      //   to: '/Bills',
      //   icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      // },
      // {
      //   component: CNavItem,
      //   name: 'Bill Master',
      //   to: '/Bills/Master/ChargeTypes',
      //   icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      // },
    ],
  },
  
]

export default _nav
