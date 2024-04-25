import React, { useState } from 'react';
// import { useHistory } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import "./LoginForm.css";


const LoginPage = () => {
  const [userId, setUserId] = useState('');
//   const history = useHistory();
  const navigate = useNavigate();


  const handleLogin = () => {
    // Perform login logic here
    // For simplicity, assume login is successful
    console.log("in handle login")
    console.log(userId)

    navigate('/chat', {state: userId });
    // history.push('/chat', { userId }); // Pass userId as state to chat page
  };

  return (
    // <div class="container">
    <div style={{
      position: 'absolute', left: '50%', top: '40%',
      transform: 'translate(-50%, -50%)'
    }}>
      <h1>Hello, Welcome to Persuasive Chatbot!</h1>
      <h3> We are working to test our conversational agent and its ability to persuade users to consider all relevant facts when considering an issue. </h3>
      <h4>Please enter the user id you were given below: </h4>
      <h4></h4>

      <div id="login-form">
        <h1>Login</h1>
        <form>
        <label htmlFor="username">Enter Given User Id:</label>
        <input type="text" id="username" name="username" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="" />
        <button type="submit" onClick={handleLogin}>Login</button>
        </form>
      </div>
    </div>
    
  );
};

export default LoginPage;