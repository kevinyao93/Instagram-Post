import React, { useState } from 'react';
import PropTypes from 'prop-types';

import './Toolbar.css';

import { statusStorage } from '../Storage/Storage.js';

import { BsHeartFill, BsHeart, BsUpload, BsBookmark, BsBookmarkFill, BsChat } from "react-icons/bs";
import { Modal } from "react-bootstrap";

// Toolbar with all the icons in it
const Toolbar = ({view, setView, textRef}) => {
  const [status, setStatus] = statusStorage();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const toggleComment = field => {
    // Toggles whether or not the user has liked/bookmarked the post
    let addUser = true;
    let newStatus = status;
    for (let i = 0; i < newStatus[field].length; i += 1) {
      if (newStatus[field][i].name === newStatus.currentUser.name) {
        // User has already liked the post, have them unlike it
        newStatus[field].splice(i, 1);
        addUser = false;
      }
    }
    if (addUser) {
      // The user is not within the liked array, add them to it.
      newStatus[field] = [...newStatus[field], status.currentUser];
    }
    setStatus(newStatus)
  }

  const fieldIncludesUser = field => {
    // Check if the user is liked
    for (let i = 0; i < status[field].length; i += 1) {
      if (status[field][i].name === status.currentUser.name) {
        return true;
      }
    }
    return false;
  }

  const chatClicked = () => {
    // Switch to landscape view, and focus on the input area
    if (view == 'portrait') {
      setView('landscape');
    }
    textRef.current.focus();
  }

  return(
    <div>
      <table>
        <tbody>
          <tr>
            <td className="lefticons">
              {fieldIncludesUser('liked') ?
                <BsHeartFill onClick={() => toggleComment('liked')}/> :
                <BsHeart onClick={() => toggleComment('liked')}/>}
            </td>
            <td className="lefticons">
              <BsChat onClick={() => chatClicked()}/>
            </td>
            <td className="lefticons">
              <Modal show={show} centered onHide={handleClose}>
                <Modal.Body>
                  Sharing
                </Modal.Body>
              </Modal>
              <BsUpload onClick={handleShow}/>
            </td>
            <td className="righticon">
              {fieldIncludesUser('bookmarked') ?
                <BsBookmarkFill onClick={() => toggleComment('bookmarked')}/> :
                <BsBookmark onClick={() => toggleComment('bookmarked')}/>}
            </td>
          </tr>
          <tr>
            <td className="liketext" colSpan="2"><b>{status.liked.length} {status.liked.length === 1 ? 'like' : 'likes'}</b></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

Toolbar.propTypes = {
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
  textRef: PropTypes.object,
}

export default Toolbar;
