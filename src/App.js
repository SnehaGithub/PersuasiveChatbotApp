// import logo from './logo.svg';
import './App.css';

import './App.css';
import React from 'react';
// import { useId } from 'react'

// import React, { useEffect, useState } from 'react';
// import firebase from 'firebase/app';
// import 'firebase/firestore';
import 'firebase/compat/database';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
// import Chatbot from './Chatbot';
// import { OpenAIAPIKey } from './config'; 
import OpenAI from "openai";

import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

import {
  MainContainer,
  Avatar,
  ChatContainer,
  Message,
  MessageInput,
  TypingIndicator,
  MessageList
} from "@chatscope/chat-ui-kit-react";


const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const firestore = firebase.firestore();
function App() {

// generate unique id for every chat session
// const id = useId();
 const id = crypto.randomUUID();

 // State to manage the typing indicator of the chatbot
 const [isChatbotTyping, setIsChatbotTyping] = useState(false);
 const [conversationId, setConversationId] = useState(id); // State to store conversation ID
 const openai = new OpenAI({ apiKey: '', dangerouslyAllowBrowser: true });
//  setConversationId(id);

 // State to store chat messages
 const [chatMessages, setChatMessages] = useState([
   {
     message: "Hello, I am Persuasive Chatbot!",
     sender: "ChatGPT",
     direction: "incoming",
     timestamp: firebase.database.ServerValue.TIMESTAMP // Add timestamp
   },
 ]);

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
   database.ref(conversationId).push(newUserMessage);


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
     content: "Explain all concept like a doctor or healthcare professional",
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
  const response = await fetch('http://127.0.0.1:5000/compare_message', {
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
    database.ref(conversationId).push(responseData.message);

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
            message: data.choices[0].message.content,
            sender: "ChatGPT",
            timestamp: firebase.database.ServerValue.TIMESTAMP, // Add timestamp
            direction: "incoming"
          },
        ]);
         // Push new message to Firebase
        database.ref(conversationId).push(data.choices[0].message.content);

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
      message: "Hello, I am Persuasive Chatbot!",
      sender: "ChatGPT",
      direction: "incoming",
      timestamp: firebase.database.ServerValue.TIMESTAMP // Add timestamp
    },
  ]);
  const new_id = crypto.randomUUID();//useId(); //new id
  setConversationId(new_id);

  // Clear chat messages in Firebase
  // firebase.database().ref().set([]);
};

 const mystyle = {
  color: "white",
  backgroundColor: "DodgerBlue",
  padding: "10px",
  fontFamily: "Arial"
};

 return (
   <>
     <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* Profile section for the chatbot */}
      <div style={{ width: "200px", backgroundColor: "#f3f3f3", padding: "20px" }}>
        <img src="https://cdn-icons-png.flaticon.com/512/8649/8649595.png" alt="Chatbot Avatar" style={{ borderRadius: "50%", width: "100px", height: "100px" }} />
        <p>Avatar Name</p>
        <p>Profile Description: insert here.</p>

        <button type="button"  onClick={startNewConversation}>
          <span>New Conversation</span>
        </button>
      </div>
      
     {/* A container for the chat window */}
     {/* <div style={{ position: "relative", height: "100vh", width: "700px" }}> */}
     <div style={{ flex: 1 }}>
       <MainContainer>
         <ChatContainer>
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
                // sender={message.sender} // Pass sender prop
                // text={message.message} // Pass text prop
                model={{ sender: message.sender, message: message.message, direction: message.direction }}
                // style={
                //   message.sender === "user"
                //     ? { textAlign: "left", color: "red", alignSelf: "flex-start" }
                //     : { textAlign: "right", color: "blue", alignSelf: "flex-end" }
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
             placeholder="Type Message here"
             onSend={handleUserMessage}
           />
         </ChatContainer>
       </MainContainer>
     </div>
     </div>
   </>
 );
}

export default App;

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
