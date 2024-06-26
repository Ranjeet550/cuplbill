import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';


const UserPermissions = () => {
  const { userId } = useParams();
  const [dupliError, setDupliError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [modulePermissions, setModulePermissions] = useState([]);
  const [errorText, setErrorText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updatePermissions, setUpdatePermissions] = useState(false);


  useEffect(() => {
    axios.get('https://localhost:7247/api/Modules')
      .then(response => {
        // setModules(response.data);
        // Initialize modulePermissions based on modules
        setModulePermissions(response.data.map(module => ({
          module_Id: module.module_Id,
          module_Name: module.module_Name,
          can_Add: false,
          can_View: false,
          can_Update: false,
          can_Delete: false,
        })));
      })
      .catch(error => console.error(error));
  }, []);

  const handleInputChange = (module_Id, permissionType, checked) => {
    setModulePermissions((prevPermissions) =>
      prevPermissions.map((module) =>
        module.module_Id === module_Id
          ? { ...module, [permissionType]: checked }
          : module
      )
    );
  };


  const onAddPermissions = () => {
    const permissionsArray = modulePermissions.map(({ module_Id, can_Add, can_View, can_Update, can_Delete }) => ({
      user_Id: userId,
      module_Id,
      can_Add,
      can_View,
      can_Update,
      can_Delete,
    }));

    console.log('Adding permissions for user:', userId);
    console.log('Permissions to be added:', permissionsArray);

    axios.post(`https://localhost:7247/api/Permissions`, permissionsArray)
      .then(response => {
        console.log('Permissions added successfully:', response.data);
        setSuccess(true);
        setDupliError(false);
        setSuccessMessage('Permissions added successfully!');
        // Reset the modulePermissions state if needed
        setModulePermissions([]);
      })
      .catch(error => {
        console.error(error);
        setDupliError(true);
        if (error.response && error.response.status === 500) {
          setErrorText('Permissions Already Added!');
          setUpdatePermissions(true)
        }
        setSuccess(false);
      })
      .finally(() => {
        // Reset other states or perform any cleanup if needed
        // setErrorText(''); // You may reset the error text here if required
      });
  };


  return (
    <div>
      <Container className="userform border border-3 p-4 my-3">
        <Form>
          <Form.Group controlId="formPermissions" className="text-center">
            <Form.Label className="userform border border-3 w-100 font-weight-bold"><h4>Permissions</h4></Form.Label>
            {/* success alert  */}
            {success && (
              <Alert
                variant="success"
                onClose={() => setSuccess(false)}
                dismissible
              >
                {successMessage}
              </Alert>
            )}
            {/* error alert  */}
            {dupliError && (
              <Alert
                variant="danger"
                onClose={() => setDupliError(false)}
                dismissible
              >
                {errorText}
                {
                  updatePermissions && (
                    <>&nbsp; Pls. Update Permissions. <br />
                   <Link to={`/UpdatePermissions/${userId}`}>Update Permissions</Link>
                    </>
                  )
                }
              </Alert>
            )}
            <Table bordered responsive className="text-center">

              <thead>
                <tr>
                  <th>Module Name</th>
                  <th>Add</th>
                  <th>View</th>
                  <th>Update</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {modulePermissions.map((module) => (
                  <tr key={module.module_Id}>
                    <td>{module.module_Name}</td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={module.can_Add}
                        onChange={(e) =>
                          handleInputChange(
                            module.module_Id,
                            'can_Add',
                            e.target.checked
                          )
                        }
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={module.can_View}
                        onChange={(e) =>
                          handleInputChange(
                            module.module_Id,
                            'can_View',
                            e.target.checked
                          )
                        }
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={module.can_Update}
                        onChange={(e) =>
                          handleInputChange(
                            module.module_Id,
                            'can_Update',
                            e.target.checked
                          )
                        }
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={module.can_Delete}
                        onChange={(e) =>
                          handleInputChange(
                            module.module_Id,
                            'can_Delete',
                            e.target.checked
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button variant="primary" type="button" onClick={onAddPermissions}>
              Add Permissions
            </Button>
          </Form.Group>
        </Form>
      </Container>
    </div>
  );
};

export default UserPermissions;