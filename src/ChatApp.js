// import logo from './logo.svg';
import './App.css';

import 'firebase/compat/database';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import OpenAI from "openai";

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

import {
  MainContainer,
  Avatar,
  ChatContainer,
  ConversationHeader,
  Message,
  MessageInput,
  TypingIndicator,
  MessageList,
  SendButton
} from "@chatscope/chat-ui-kit-react";


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function ChatApp() {

  // const [loggedIn, setLoggedIn] = useState(false);
  // const [userId, setUserId] = useState(null); // State to store the logged-in user ID

  // const handleLogin = (userId) => {
  //   setUserId(userId);
  //   setLoggedIn(true);
  // };

  // // if (!loggedIn) {
  // //   return <LoginPage onLogin={handleLogin} />;
  // // }

// generate unique id for every chat session
// const id = useId();
 const id = crypto.randomUUID();

 // State to manage the typing indicator of the chatbot
 const location = useLocation();
const navigate = useNavigate();
const [userId, setUserId] = useState('');
 const [isChatbotTyping, setIsChatbotTyping] = useState(false);
 const [conversationId, setConversationId] = useState(id); // State to store conversation ID
 const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
//  setConversationId(id);

 // State to store chat messages
 const [chatMessages, setChatMessages] = useState([
   
   {
    message: "Hi, I'm Dr. Sky, an AI chatbot developed by researchers at Cornell University, aims to support individuals in maintaining a healthy lifestyle. Drawing on extensive knowledge, Dr. Sky offers exercise recommendations, daily routines, and nutrition plans. Whether you are interested in understanding the effects of vaping on health, seeking advice for your daily routine, or looking for nutritional guidance, Dr. Sky is here to provide assistance and support.",
    sender: "ChatGPT",
    direction: "incoming",
    timestamp: firebase.database.ServerValue.TIMESTAMP // Add timestamp
  },
  {
    message: "So now, what would you like to talk about?",
    sender: "ChatGPT",
    direction: "incoming",
    timestamp: firebase.database.ServerValue.TIMESTAMP // Add timestamp
  },
  {
    message: "Some suggestions are: \n Is vaping the same as smoking? \n Is vaping as addictive as smoking? \n Is vaping healthier than smoking?",
    sender: "ChatGPT",
    direction: "incoming",
    timestamp: firebase.database.ServerValue.TIMESTAMP // Add timestamp
  }
 ]);

 useEffect(() => {
  console.log(location.state)
  const { userId } = location.state || {};
  if (userId===null) {
    // If userId is not present in location state, redirect to login page
    // history.push('/');
    console.log("!userId so navigate to /")
    navigate('/');
    
  } else {
    setUserId(location.state);
    const id = crypto.randomUUID();
    setConversationId(id);
  }
}, [location, navigate]);

 // Function to handle user messages
 const handleUserMessage = async (userMessage) => {
   // Create a new user message object
   const newUserMessage = {
     message: userMessage,
     sender: "user",
     direction: "outgoing",
    timestamp: firebase.database.ServerValue.TIMESTAMP // Add timestamp
   };

   // Update chat messages state with the new user message
   const updatedChatMessages = [...chatMessages, newUserMessage,  ];
   setChatMessages(updatedChatMessages);
   // Push new message to Firebase
  //  database.ref(conversationId).push(newUserMessage);
  console.log(userId)
  console.log(typeof userId)

  console.log(conversationId.toString())
  console.log(userId.toString()+'/'+conversationId.toString())

   database.ref(userId.toString()+'/'+conversationId.toString()).push().set({
    message: newUserMessage.message,
    sender: 'User',
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
   


   // Set the typing indicator for the chatbot
   setIsChatbotTyping(true);
   await processUserMessageToChatGPT(updatedChatMessages, userMessage);
 };

 // Function to send the user message to ChatGPT API
 async function processUserMessageToChatGPT(updatedChatMessages, userMessage) {
   // Prepare the messages in the required format for the API
   let apiMessages = updatedChatMessages.map((messageObject) => {
     let role = "";
     let direction="";
     if (messageObject.sender === "ChatGPT") {
       role = "assistant";
       direction= "incoming"
     } else {
       role = "user";
       direction = "outgoing"
     }
     return { role: role, content: messageObject.message };
   });

   console.log(apiMessages)
   console.log(chatMessages)

   // System message for ChatGPT
   const systemMessage = {
     role: "system",
     content: "You represent a professional doctor who has many years of experience in the field of nutrition and health coaching. You will chat with people on a variety of health and wellness topics. You will avoid using pronouns such as I, me, you, we. You will avoid using hedges and hesitations.",
   };

   // Prepare the API request body
   const apiRequestBody = {
     model: "gpt-3.5-turbo",
    //  response_format: { type: "json_object"},
     messages: [
       systemMessage, // System message should be in front of user messages
       ...apiMessages,
     ],
   };

   // Send the user message to the Flask backend
  const response = await fetch(process.env.REACT_APP_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: userMessage })
  });

  const responseData = await response.json();

  // If a similar message is found in the CSV file, update chat messages and return
  if (responseData.message !== 'No similar message found in the CSV file') {
    
    console.log('got response from Flask')
    console.log(responseData)
    setChatMessages([
      ...updatedChatMessages,
      { message: responseData.message, 
        sender: 'ChatGPT', 
        timestamp: firebase.database.ServerValue.TIMESTAMP, // Add timestamp
        direction:'incoming' 
      }
    ]);
    // Push new message to Firebase
    // database.ref(conversationId).push(responseData.message);
    database.ref(userId.toString()+'/'+conversationId.toString()).push().set({
      message: responseData.message,
      sender: 'Chatbot',
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    // setChatMessages([
    //   ...apiMessages,
    //   {
    //     message: responseData.message,
    //     sender: "ChatGPT",
    //   },
    // ]);
    setIsChatbotTyping(false);
    return;
  }

   else{

    // If no similar message is found, send the message to ChatGPT API
    // Process user message with ChatGPT
    console.log('get response form chat gpt api')
   
    // Send the user message to ChatGPT API
    await openai.chat.completions.create(//{fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
      //method: "POST",
      //headers: {
      //    Authorization: 'Bearer ' + '{OpenAIAPIKey}',
      //    "Content-Type": "application/json",
      //  },
      //  body: JSON.stringify(apiRequestBody),
      apiRequestBody
    //})
    )
      .then((data) => {
        return data;//.json();
      })
      .then((data) => {
        // Update chat messages with ChatGPT's response
        setChatMessages([
          ...updatedChatMessages,
          {
            message: "*This message is powered by Open AI. Some may be inaccurate or inappropriate. We cannot guarantee the accuracy, completeness, or up-to-date nature of the information provided*\n\n" + data.choices[0].message.content,
            sender: "ChatGPT",
            timestamp: firebase.database.ServerValue.TIMESTAMP, // Add timestamp
            direction: "incoming"
          },
        ]);
         // Push new message to Firebase
        // database.ref(conversationId).push(data.choices[0].message.content);
        database.ref(userId.toString()+'/'+conversationId.toString()).push().set({
          message: "*This message is powered by Open AI. Some may be inaccurate or inappropriate. We cannot guarantee the accuracy, completeness, or up-to-date nature of the information provided*\n\n" + data.choices[0].message.content,
          sender: 'Chatbot',
          timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        // Set the typing indicator to false after getting the response
        setIsChatbotTyping(false);
      });
    }
    console.log(chatMessages)

 }

 // add a method to your component for resetting state
const startNewConversation = () => {
  // Clear chat messages state
  setChatMessages([
    {
      message: "Hi, I'm Dr. Sky, an AI chatbot developed by researchers at Cornell University, aims to support individuals in maintaining a healthy lifestyle. Drawing on extensive knowledge, Dr. Sky offers exercise recommendations, daily routines, and nutrition plans. Whether you are interested in understanding the effects of vaping on health, seeking advice for your daily routine, or looking for nutritional guidance, Dr. Sky is here to provide assistance and support.",
      sender: "ChatGPT",
      direction: "incoming",
      timestamp: firebase.database.ServerValue.TIMESTAMP // Add timestamp
    },
    {
      message: "So now, what would you like to talk about?",
      sender: "ChatGPT",
      direction: "incoming",
      timestamp: firebase.database.ServerValue.TIMESTAMP // Add timestamp
    },
  ]);
  const new_id = crypto.randomUUID();//useId(); //new id
  setConversationId(new_id);
  navigate('/');
  // Transition back to the login page
  // setLoggedIn(false);
  // Clear chat messages in Firebase
  // firebase.database().ref().set([]);
};

 return (
  <div 
    style={{
      position: 'absolute', left: '0.2%', top: '1%', bottom: '1%' 
    }}
  >
    <div id="parent">
      {/* Profile section for the chatbot */}
      <div id="profile">
        <img src="https://cdn-icons-png.flaticon.com/512/8649/8649595.png" alt="Chatbot Avatar" style={{ borderRadius: "50%", width: "100px", height: "100px" }} />
        <p>Avatar Name</p>
        <p>Profile Description: I can share tips on nutrition, health & wellness.</p>

        <button type="button" class="custom-button"  onClick={startNewConversation}>
          <span>New Conversation</span>
        </button>
      </div>
      
     {/* A container for the chat window */}
     <div id="chatcontainer">
        <ConversationHeader>          
          <ConversationHeader.Content 
            info="Welcome!"
            userName="Persuasive Chatbot Application"
          />
        </ConversationHeader>
       <MainContainer>
         <ChatContainer
          style={{
            backgroundColor: 'green'
          }}
         >
           {/* Display chat messages and typing indicator */}
           <MessageList
             typingIndicator={
               isChatbotTyping ? (
                 <TypingIndicator content="Chatbot is thinking" />
               ) : null
             }
           >
             {/* Map through chat messages and render each message */}
             {chatMessages.map((message, i) => {
               return (
                <Message
                key={i}
                model={{ sender: message.sender, message: message.message, direction: message.direction }}
                // style={
                //   message.direction === "incoming"
                //     ? { color:'green' }
                //     : { color:'blue'}
                // }
              >
                {message.sender === "user" ? (
                    <Avatar src={require("./images/user.png")} name="user" size="sm"/>
                ) : (
                   <Avatar src={require("./images/chatbot.png")} name="ChatGPT" size="sm" status="available"/>                )}
              </Message>
               );
             })}
           </MessageList>
           {/* Input field for the user to type messages */}
           <MessageInput
             attachButton="false"
             placeholder="Type Message here"
             onSend={handleUserMessage}
           />
         </ChatContainer>
       </MainContainer>
     </div>
    </div>
   </div>
 );
}

export default ChatApp;

