import React, { useState } from 'react';
import { Container, Row, Col, Image, Modal} from 'react-bootstrap';

import './Header.css';

import { statusStorage } from '../Storage/Storage.js';


const Header = () => {
  // Header showing the current user and their info.
  const [status] = statusStorage();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return(
    <Container>
      <Row className='titlerow'>
        <Col className='logocol' xs="auto">
          <Image className='logo' src={status.currentUser.image} roundedCircle />
        </Col>
        <Col className='titlecol'>
          <Row>
            <b>{status.currentUser.name}</b>
          </Row>
          <Row>
            {status.currentUser.comment}
          </Row>
        </Col>
        <Col className="logocol" xs="auto">
          <button onClick={handleShow}className="dotbutton">...</button>
          <Modal show={show} centered onHide={handleClose}>
            <Modal.Body>
              Message Settings
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default Header;
