import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Profile from './Components/Profile';
import Register from './Components/Register';
import Login from './Components/Login';
import {useState, useEffect} from 'react';
import {auth} from '../src/firebase';
import {io} from 'socket.io-client';

function App () {
  const [loggedIn, setLoggedIn] = useState (false);
  const socket = io.connect ('http://localhost:5000');

  useEffect (() => {
    auth.onAuthStateChanged (user => {
      if (user) {
        return setLoggedIn (true);
      } else {
        setLoggedIn (false);
      }
    });
  }, []);

  return (
    <div>

      <Router>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route
            path="/profile"
            element={loggedIn ? <Profile /> : <Register />}
          />
          <Route path="/login" element={<Login />} />

        </Routes>
      </Router>
    </div>
  );
}

export default App;
