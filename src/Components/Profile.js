import {useEffect, useState, useRef} from 'react';
import {auth} from '../firebase';
import {clearUser} from '../features/userSlice';
import {useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {io} from 'socket.io-client';

import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';
import axios from 'axios';
import './style.css';
import Welcome from './Welcome';

function Profile () {
  const [userList, setUserList] = useState ([]);
  const [currentUser, setCurrentUser] = useState ('');
  const [currentChat, setCurrentChat] = useState ([]);
  const socket = useRef ();

  useEffect (
    () => {
      axios
        .get ('http://localhost:5000/get')
        .then (response => {
          setUserList (response.data);
        })
        .catch (function (error) {});
    },
    [currentUser]
  );

  useEffect (() => {
    setCurrentUser (JSON.parse (localStorage.getItem ('user')));
  }, []);

  useEffect (
    () => {
      if (currentUser) {
        socket.current = io ('http://localhost:5000');
        socket.current.emit ('add-user', currentUser.email);
      }
    },[currentUser]);

  const handleChatChange = chat => {
    setCurrentChat (chat);
  };

  return (
    <div className="chat">
      <ChatBar userList={userList} changeChat={handleChatChange} />
      <div className="chat__main">
        {console.log (currentChat)}
        {currentUser === undefined
          ? <Welcome />
          : <ChatBody currentChat={currentChat} socket={socket} />}
      </div>
    </div>
  );
}

export default Profile;
