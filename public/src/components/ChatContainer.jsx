import React,{useState,useEffect,useRef} from 'react'
import styled from 'styled-components'
import LogOut from './LogOut';
import ChatInput from './ChatInput';
import { getAllMessagesRoute, sendMessageRoute } from '../utils/APIRoutes';
import axios from 'axios';
import Messages from './Messages';
import { v4 as uuidv4 } from "uuid";


const ChatContainer = ({currentChat,currentUser,socket}) => {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {

    const fetchMessages = async () => {
      try {
        const response = await axios.post(getAllMessagesRoute, {
          from: currentUser._id,
          to: currentChat._id,
        });
        console.log(response.data);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
  
    if (currentChat) {
      fetchMessages();
    }
  }, [currentChat]);
  const handleSendMsg = async(msg)=>{
    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });

    socket.current.emit("send-msg",
      {
        to:currentChat._id,
        from:currentUser._id,
        message: msg,
      }
    );


    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages (msgs);
};
useEffect(() => {
  if (socket.current) {
    socket.current.on("msg-recieve", (msg) => {
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

  return (
    <Container> 
        <div className="chat-header" ref={scrollRef} key={uuidv4()}>
            <div className="user-details">
                <div className="avatar">
                <img
                      src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                      alt="avatar"
                    />
                </div>
                <div className="username">
                    <h3>{currentChat.username}</h3>
                </div>
            </div>
            <LogOut/>
        </div>
        <div className="chat-messages"> 
             {messages.map((message) => {
          return (
            <div >
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content ">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
            
          </div>  
        <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  )
}

export default ChatContainer

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  background: linear-gradient(135deg, #1f1c2c, #928dab);
  animation: gradientAnimation 10s ease infinite;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  
  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: rgba(0, 0, 0, 0.5); /* Add semi-transparent background */
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: #f0f0f0; /* Softer white for username */
        }
      }
    }
  }
  
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.3); /* Add semi-transparent background */
    border-radius: 0.5rem;
    
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        background-color: rgba(255, 255, 255, 0.1); /* Subtle dark background for messages */
        color: #d1d1d1;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); /* Add subtle shadow */
        
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    
    .sended {
      justify-content: flex-end;
      .content {
        background-color: rgba(79, 4, 255, 0.25); /* Purple tint for sent messages */
      }
    }
    
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: rgba(153, 0, 255, 0.25); /* Pinkish tint for received messages */
      }
    }
  }
`;
