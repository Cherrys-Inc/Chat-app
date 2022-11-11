import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";
import { useDispatch } from "react-redux";
import { clearUser } from "../features/userSlice";
import { useEffect, useState, useRef } from "react";
import { uuidv4 } from "@firebase/util";
import ChatFooter from "./ChatFooter";

const ChatBody = ({ currentChat, socket }) => {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));

    axios
      .post("http://localhost:5000/response", {
        from: data.email,
        to: currentChat,
      })
      .then((response) => setMessages(response.data));
  }, [currentChat]);

  const getCurrentChat = async () => {
    if (currentChat) {
      await JSON.parse(localStorage.getItem("user")).uid;
    }
  };
  useEffect(() => {
    getCurrentChat();
  }, [currentChat]);

  const handleSendMsg = (msg) => {
    const data = JSON.parse(localStorage.getItem("user"));
    socket.current.emit("send-msg", {
      to: currentChat,
      from: data.email,
      msg,
    });
    axios
      .post("http://localhost:5000/send", {
        from: data.email,
        to: currentChat,
        message: msg,
      })
  

    const msgs = [messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-receive", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const handleLeaveChat = () => {
    auth.signOut();

    var email = JSON.parse(localStorage.getItem("user")).email;
    axios.post("http://localhost:5000/signout", email);
    localStorage.clear();
    dispatch(clearUser());
    navigate("/");
  };

  return (
    <>
      <div className="message__container">
        <div className="chat-header">
          <div className="user-details">
            <div className="username">
              <h3>{currentChat}</h3>
            </div>
          </div>
          <button className="leaveChat__btn" onClick={handleLeaveChat}>
            Leave Chat
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((message) => {
            return (
              <div ref={scrollRef} key={uuidv4()}>
                <div
                  className={`message ${
                    message.fromSelf ? "sended" : "recieved"
                  }`}
                >
                  <div>
                    <p>{message.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <ChatFooter handleSendMsg={handleSendMsg} />
      </div>
    </>
  );
};

export default ChatBody;
