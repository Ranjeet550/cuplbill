import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// User
const AddUser = React.lazy(() => import('./views/Users/AddUser'))
const AllUsers = React.lazy(() => import('./views/Users/AllUsers'))
const ViewUser = React.lazy(() => import('./views/Users/ViewUser'))
const UpdateUser = React.lazy(() => import('./views/Users/UpdateUser'))
//Permissions
const Permission = React.lazy(()=>import('./views/Users/UserPermissons'))

//Gropus
// const AddGroup = React.lazy(()=>import('./views/Groups/AddGroup'))
const Groups = React.lazy(()=>import('./views/Groups/Groups'))
const ViewGroup = React.lazy(()=>import('./views/Groups/ViewGroup'))
// Master 
const ChargeTypes = React.lazy(()=>import('./views/Groups/Master/ChargeTypes'))
const AddMasterCharges = React.lazy(()=>import('./views/Groups/MasterCharges/AddMAsterCharges'))
const ChargeDetails = React.lazy(()=>import('./views/Groups/ChargeDetails'))

//bills
const AddBill = React.lazy(()=>import('./views/Bills/AddBill'))
const AllBills = React.lazy(()=>import('./views/Bills/AllBills'))
// const ChargeTypes = React.lazy(()=>import('./views/Bills/BillMaster/ChargeTypePage'))




const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  // MyRouts
  // user Routes
  { path: '/users', name: 'All Users', element: AllUsers },
  { path: '/users/add-user', name: 'Add User', element: AddUser },
  { path: '/users/view-user/:userId', name: 'view User', element: ViewUser },
  { path: '/users/update-user/:userId', name: 'Update User', element: UpdateUser },
  //Permission Page Route
  { path: '/users/AddPermissions/:userId', name: 'User Permissions', element: Permission},
  // bills
  { path: '/Bills', name: 'All Bills', element: AllBills},
  { path: '/Bills/AddBill', name: 'Add Bill', element: AddBill},
  { path: '/Bills/Master/ChargeTypes', name: 'Charge Types', element: ChargeTypes},

  // Groups 
  // { path: '/Groups/AddGroup', name: 'Add Group', element: AddGroup},
  { path: '/Groups', name: 'All Groups', element: Groups},
  { path: '/Groups/view-group/:groupId', name: 'View Groups', element: ViewGroup},
  // master 
  { path: '/Groups/ChargeTypes', name: 'Charge Types', element: ChargeTypes},
  { path: '/Groups/AddMasterCharges/:groupId', name: 'Add MAster', element: AddMasterCharges},
  { path: '/Groups/ChargeDetails/:groupId/:session', name: 'ChargeDetails', element: ChargeDetails},


]

export default routes
