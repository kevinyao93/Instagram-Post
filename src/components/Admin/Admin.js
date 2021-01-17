import React from 'react';

import './Admin.css'

import { Dropdown, Button, Row } from 'react-bootstrap';

import { userStorage, statusStorage, commentStorage } from '../Storage/Storage.js';

// Administrative panel to make testing easier
const Admin = () => {
  const [users] = userStorage();
  const [status, setStatus] = statusStorage();
  const [comments, setComments] = commentStorage();

  return(
    <div className="adminBox">
      <h3>Admin</h3>
      <Row>
        User:
        <Dropdown>
          <Dropdown.Toggle variant="success">
            {status.currentUser.name}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {
              users.map(user => {
                return(
                  <Dropdown.Item key={user.name} onClick={() =>
                    setStatus({...status, currentUser: user})
                  }>
                    {user.name}
                  </Dropdown.Item>
                )
              })
            }
          </Dropdown.Menu>
        </Dropdown>
      </Row>
      <Row>
        Chat Control: <Button onClick={() => setComments([])}>Clear chat</Button>
      </Row>
      <Row>
        Chat Control: <Button onClick={() => console.log(comments)}>Log comment objects </Button>
      </Row>
    </div>
  );
}

export default Admin;
