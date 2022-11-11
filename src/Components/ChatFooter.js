import React, {useState} from 'react';

const ChatFooter = ({handleSendMsg}) => {
  const [message, setMessage] = useState ('');

  const sendMessage = e => {
    e.preventDefault ();

    if (message.length > 0) {
      handleSendMsg (message);
      setMessage ('');
    }
  };
  return (
    <div className="chat__footer">
      <form className="form" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Write message"
          className="message"
          value={message}
          onChange={e => setMessage (e.target.value)}
        />
        <button className="sendBtn">SEND</button>
      </form>
    </div>
  );
};

export default ChatFooter;
