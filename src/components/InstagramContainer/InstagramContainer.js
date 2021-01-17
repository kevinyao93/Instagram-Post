import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import './InstagramContainer.css'
import { Image, Row, Col } from "react-bootstrap";

import Header from '../Header/Header.js';
import Chatbox from '../Chatbox/Chatbox.js';

// Container for the entire instagram view
const InstagramContainer = ({defaultView}) => {
  const [view, setView] = useState(defaultView);
  const [hide, setHide] = useState(false);

  // Updates when window changes to know when to hide the chat window
  useEffect(() => {
    const resizeListener = () => {
      if (view === 'landscape') {
        if (window.innerWidth < 1000) {
          setHide(true);
        } else {
          setHide(false);
        }
      }
    }
    window.addEventListener('resize', resizeListener);
    return() => {
      window.removeEventListener('resize', resizeListener);
    }
  })
  return(
      <div>
        {view === "portrait" ?
          <div className={view}>
            <Header />
            <Image className="mimage" src="nvidia-communities.jpg" />
            <Chatbox view={view} setView={setView}/>
          </div>
          :
          <div>
            { !hide ? (
              <Row className={view}>
                <Col className="landscapeImage">
                  <Image className="mimage" src="nvidia-communities.jpg" />
                </Col>
                <Col className="landscapechat">
                  <Header />
                  <Chatbox view={view} setView={setView} />
                </Col>
              </Row>
            ) : (
              <div className={'portrait'}>
                <Header />
                <Image className="mimage" src="nvidia-communities.jpg" />
                <Chatbox view={view} setView={setView} hide={hide}/>
              </div>
            )}
          </div>
        }
      </div>

  );
}

InstagramContainer.propTypes = {
  defaultView: PropTypes.string,
}

InstagramContainer.defaultProps = {
  defaultView: 'portrait',
}

export default InstagramContainer;
