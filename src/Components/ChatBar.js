import React, {useState, useEffect} from 'react';
import './style.css';

const ChatBar = ({userList, changeChat}) => {
  const [currentEmail, setCurrentEmail] = useState (undefined);
  const [currentSelected, setCurrentSelected] = useState (undefined);
  useEffect (() => {
    const data = JSON.parse (localStorage.getItem ('user'));
    setCurrentEmail (data.email);
  }, []);
  const changeCurrentChat = (index, contact) => {
    setCurrentEmail (index);
    changeChat (contact);
  };
  return (
    <div className="chat__sidebar">
      <h2>Open Chat</h2>

      <div>
        <h4 className="chat__header">USERS</h4>
        <div className="chat__users">

          {userList.map ((contact, index) => {
            return (
              <div
                key={contact}
                onClick={() => changeCurrentChat (index, contact)}
              >
                {contact}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default ChatBar;
