import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import './Chatbox.css';

import {Image, InputGroup, Button, Row, Col, Modal} from 'react-bootstrap';
import Textarea from 'react-expanding-textarea';
import { BsHeartFill, BsHeart } from "react-icons/bs";
import ReactTooltip from 'react-tooltip';

import Toolbar from '../Toolbar/Toolbar.js';
import InstagramContainer from '../InstagramContainer/InstagramContainer.js';
import { commentStorage, statusStorage } from '../Storage/Storage.js';

const Chatbox = ({view, setView, hide}) => {
  const [comments, setComments] = commentStorage();
  const [status, setStatus] = statusStorage();

  // Area for modal management
  const [showViewAll, setShowViewAll] = useState(false);
  const [showCommentSetting, setShowCommentSetting] = useState({open: false, index: null, rIndex: null});

  const handleCloseViewAll = () => setShowViewAll(false);
  const handleShowViewAll = () => setShowViewAll(true);
  const handleCloseSetting = (index, rIndex) => setShowCommentSetting({open: false, index, rIndex});
  const handleShowSetting = (index, rIndex) => setShowCommentSetting({open: true, index, rIndex});

  const textRef = useRef(null);
  const messageEnd = useRef(null);

  const timeConversion = milliseconds => {
    // Converts milliseconds into the largest unit of time (limited to days)
    const days = (milliseconds / (1000 * 60 * 60 * 24)).toFixed(0);
    if (days > 0) return `${days}d`;
    const hours = (milliseconds / (1000 * 60 * 60)).toFixed(0);
    if (hours > 0) return `${hours}h`;
    const minutes = (milliseconds / (1000 * 60)).toFixed(0);
    if (minutes > 0) return `${minutes}m`;
    const seconds = (milliseconds / 1000).toFixed(0);
    return `${seconds}s`;
  }

  const onReplyClick = (index, reply) => {
    // Focuses on the text box and remembers the current target for reply
    textRef.current.value = `@${reply.name} `;
    setStatus({...status, replyTarget: index});
    textRef.current.focus();
  }

  const onTextChange = e => {
    // Will check if the target of reply is still accurate, if the @ target is removed, also remove the target
    if (status.replyTarget !== -1 && !e.target.value.includes(`@${comments[status.replyTarget].name}`)) {
      setStatus({...status, replyTarget: -1});
    }
  }

  const tooltipClick = (index, rIndex) => {
    // Tooltips to show message settings i.e. deletion
    return (
      <div onClick={() => handleShowSetting(index, rIndex)}>
        ...
      </div>
    );
  }

  const portraitTable = values => {
    // Will display the chat in the portrait format
    let expand = false;
    return (values.map((comment, index) => {
      // Map out the comments into the chat box
      if ([0, 1, values.length - 2, values.length - 1].includes(index)) {
        return(
          <Row key={index}>
            <Col className="comment">
              <b>{comment.name}</b> {comment.comment}
            </Col>
            <Col xs="auto" className="heart">
              {isCommentLiked(index) ?
                <BsHeartFill onClick={() => likedComment(index)}/> :
                <BsHeart onClick={() => likedComment(index)}/>}
            </Col>
          </Row>
        );
      }
      if (!expand) {
        // Exceeds the length setaside for this view, give the option to show all
        // as a popup modal.
        expand = true;
        return(
          <Row key={index}>
            <Col>
              <p onClick={handleShowViewAll}>View all {values.length - 4} comments</p>
            </Col>
            <Modal className="lsmodal" centered show={showViewAll} onHide={handleCloseViewAll}>
              <Modal.Body>
                <InstagramContainer defaultView='landscape'/>
              </Modal.Body>
            </Modal>
          </Row>
        );
      }
      return false;
    }));
  }

  const toggleReplies = index => {
    // Decide whether comment should show all of the replies
    let newComments = comments;
    newComments[index].showAll = !newComments[index].showAll;
    setComments(newComments);
  }

  const handlePost = () => {
    // Handles message submission
    if(!/^\s*$/.test(textRef.current.value)) {
      // Prevents message submission if message only consists of empty space
      const messageObject = {
        name: status.currentUser.name,
        comment: textRef.current.value,
        replies: [],
        liked: [],
        image: status.currentUser.image,
        showAll: false,
        postTime: new Date().getTime(),
      }
      // Determine if this message was a reply or regular message
      if (status.replyTarget === -1) {
        setComments([...comments, messageObject]);
      } else {
        let newComments = comments;
        const replies = newComments[status.replyTarget].replies;
        newComments[status.replyTarget].replies = [...replies, messageObject];
        setComments(newComments);
      }
      // Empty the chat box
      textRef.current.value = '';
    }
    setStatus({...status, replyTarget: -1});
  }

  const isCommentLiked = liked => {
    // Determine if the current user liked the comment
    for (let i = 0; i < liked.length; i += 1) {
      if (liked[i].name === status.currentUser.name) {
        return true;
      }
    }
    return false;
  }

  const likedComment = (index, rIndex) => {
    // Check whether or not if message is comment or reply was liked and toggle them
    let newComments = comments;
    let addUser = true;
    if (rIndex === -1) {
      // Message is a comment, so add user to the liked
      for (let i = 0; i < comments[index].liked.length; i += 1) {
        if (comments[index].liked[i].name === status.currentUser.name) {
          newComments[index].liked.splice(i, 1);
          addUser = false;
        }
      }
      if (addUser) {
        newComments[index].liked = [...newComments[index].liked, status.currentUser];
      }
    } else {
      const replies = comments[index].replies[rIndex];
      for (let i = 0; i < replies.liked.length; i += 1) {
        if (replies.liked[i].name === status.currentUser.name) {
          replies.liked.splice(i, 1);
          addUser = false;
        }
      }
      if (addUser) {
        replies.liked = [...replies.liked, status.currentUser];
      }
      newComments[index].replies[rIndex] = replies;
    }
    setComments(newComments);
  }

  const deleteComment = (index, rIndex) => {
    // Delete comment from either the messages or replies of message
    let newComments = comments;
    if (rIndex > -1) {
      newComments[index].replies.splice(rIndex, 1);
    } else {
      newComments.splice(index, 1);
    }
    // Close the popup module
    handleCloseSetting();
    setComments(newComments);
  }

  const canDelete = (index, rIndex) => {
    // Check whether or not the user is the one who created the comment
    if (rIndex > -1) {
      return (comments[index].replies[rIndex].name === status.currentUser.name)
    }
    return comments[index].name === status.currentUser.name;
  }

  const getTableData = values => {
    // Generate the chat table
    const currentTime = new Date().getTime();
    if (view === 'portrait') {
      return portraitTable(values);
    }
    // Generate landscape view
    return (values.map((comment, index) => {
      return(
        <div key={index}>
          <Modal className='lsmodal' centered show={showCommentSetting.open} onHide={handleCloseSetting}>
            <Modal.Body>
              {
                // Modal view for settings, determine whether or not to show delete button
                showCommentSetting.open && canDelete(showCommentSetting.index, showCommentSetting.rIndex) && (
                  <Button
                    onClick={() => deleteComment(showCommentSetting.index, showCommentSetting.rIndex)}
                    className="settingsbutton" variant="outline-danger" size="lg" block
                  >
                    Delete
                  </Button>
                )
              }
              <Button onClick={handleCloseSetting} className="settingsbutton" variant="outline-secondary" size="lg" block>
                Cancel
              </Button>
            </Modal.Body>
          </Modal>
          <ReactTooltip
            arrowColor="transparent"
            className="rttooltip"
            id="rtTooltip"
            clickable={true}
            place='left'
            effect="solid"
            offset={{right:'380px'}}
          >
            {tooltipClick(index, -1)}
          </ReactTooltip>
          <Row data-tip data-for='rtTooltip'>
            <Col xs="auto">
              <Image className='chatimage' src={comment.image} roundedCircle />
            </Col>
            <Col className="lscomment">
              <b>{comment.name}</b> {comment.comment}
            </Col>
            <Col className="heart" xs="auto">
              {isCommentLiked(comment.liked) ?
                <BsHeartFill onClick={() => likedComment(index, -1)}/> :
                <BsHeart onClick={() => likedComment(index, -1)}/>}
            </Col>
          </Row>
          <Row>
            <Col className="commentdetails" xs="auto">
              {timeConversion(currentTime - comment.postTime)}
            </Col>
            <Col className="commentdetails" xs="auto">
              {comment.liked.length > 0 ? (
                <p>{comment.liked.length} Likes</p>
              ) : (
                ''
              )}
            </Col>
            <Col className="commentdetails" xs="auto" onClick={() => onReplyClick(index, comment)}>
              Reply
            </Col>
          </Row>
          {comment.replies.length > 0 ?
            <Row>
              {comment.showAll ?
                <div style={{width: '100%'}}>
                  <Col onClick={() => toggleReplies(index)} className="showall">Hide Replies</Col>
                  <div className="replydiv">
                    {
                      comment.replies.map((reply, rIndex) => {
                        return (
                          <div key={rIndex}>
                            <ReactTooltip
                              arrowColor="transparent"
                              className="rttooltip"
                              id="replyTooltip"
                              clickable={true}
                              place='left'
                              effect="solid"
                              offset={{right:'280px'}}
                            >
                              {tooltipClick(index, rIndex)}
                            </ReactTooltip>
                            <Row className="replyrow" data-tip data-for='replyTooltip'>
                              <Col className="icon" xs="auto">
                                <Image className='chatimage' src={reply.image} roundedCircle />
                              </Col>
                              <Col className="lscomment">
                                <b>{reply.name}</b> {reply.comment}
                              </Col>
                              <Col className="heart" xs="auto">
                                {isCommentLiked(reply.liked) ?
                                  <BsHeartFill onClick={() => likedComment(index, rIndex)}/> :
                                  <BsHeart onClick={() => likedComment(index, rIndex)}/>}
                              </Col>
                            </Row>
                            <Row>
                              <Col className="commentdetails" xs="auto">
                                {timeConversion(currentTime - reply.postTime)}
                              </Col>
                              <Col className="commentdetails" xs="auto">
                                {reply.liked.length > 0 ? (
                                  <p>{reply.liked.length} Likes</p>
                                ) : (
                                  ''
                                )}
                              </Col>
                              <Col className="commentdetails" xs="auto" onClick={() => onReplyClick(index, reply)}>
                                Reply
                              </Col>
                            </Row>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              :
                <Col onClick={() => toggleReplies(index)} className="showall">Show {comment.replies.length} Replies</Col>
              }
            </Row>
            :
            <br/>
          }
        </div>
      );
    }));
  }

  useEffect(() => {
    // Scroll to the end of the chat everytime the comments change
    if (!hide) {
      messageEnd.current.scrollIntoView();
    }
  }, [comments, hide]);

  return(
    <div className={view + 'chatbox'}>
      {view === 'portrait' && (<Toolbar view={view} textRef={textRef} setView={setView}/>)}
      {!hide && (
        <div className={view + "chatdiv"}>
          {getTableData(comments)}
          <div ref={messageEnd} />
        </div>
      )}
      {view === 'landscape' && (<Toolbar view={view} textRef={textRef} setView={setView}/>)}
      {!hide && (
        <InputGroup>
          <Textarea
            className="textarea"
            placeholder="Add a comment..."
            maxLength="128"
            onChange={e => onTextChange(e)}
            ref={textRef}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handlePost();
              }
            }}
          />
          <InputGroup.Append className="post">
            <Button onClick={() => handlePost()} variant="link">Post</Button>
          </InputGroup.Append>
        </InputGroup>
      )}
      </div>
  );
}

Chatbox.propTypes = {
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
  hide: PropTypes.bool,
}

Chatbox.defaultProps = {
  hide: false,
}

export default Chatbox;
