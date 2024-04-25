import React, { useState } from 'react';
// import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LoginPage from './LoginPage';
import ChatApp from './ChatApp';
import "./styles.css";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LoginPage/>} />
        <Route path="/chat" element={<ChatApp/>} />
         {/* Add a default route to render LoginPage */}
         <Route component={LoginPage} />
      </Routes>
    </Router>
  );
};

export default App;