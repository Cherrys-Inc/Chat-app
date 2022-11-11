import {useState, useRef} from 'react';
import {auth} from '../firebase';
import {useNavigate, Link} from 'react-router-dom';
import {createUserWithEmailAndPassword, EmailAuthProvider} from 'firebase/auth';
import {setUser} from '../features/userSlice';
import {useDispatch} from 'react-redux';
import axios from 'axios';
import {io} from 'socket.io-client';
import {socket} from 'socket.io-client';

function Register () {
  const [userData, setUserData] = useState ({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    isOnline: 0,
  });
  const [error, setError] = useState ('');
  const socket = useRef ();

  const navigate = useNavigate ();
  const dispatch = useDispatch ();

  const validatePassword = () => {
    let isValid = true;
    if (userData.password !== '' && userData.confirmPassword !== '') {
      if (userData.password !== userData.confirmPassword) {
        isValid = false;
        setError ('Passwords does not match');
      }
    }
    return isValid;
  };

  const register = e => {
    e.preventDefault ();
    setError ('');
    if (validatePassword ()) {
      createUserWithEmailAndPassword (auth, userData.email, userData.password)
        .then (result => {
          const user = result.user;
          localStorage.setItem (
            'user',
            JSON.stringify ({
              email: user.email,
              uid: user.uid,
            })
          );

          dispatch (setUser (localStorage.getItem ('user')));
          setUserData ({...userData, isOnline: 1});

          const object = {
            userName: userData.userName,
            email: JSON.parse (localStorage.getItem ('user')).email,
            uid: JSON.parse (localStorage.getItem ('user')).uid,
            isOnline: userData.isOnline,
          };

          axios
            .post ('http://localhost:5000/add', object)
            .then (navigate ('/profile'));
        })
        .catch (err => setError (err.message));
    }
    socket.current = io ('http://localhost:5000');
    socket.current.emit (
      'add-user',
      JSON.parse (localStorage.getItem ('user')).email
    );
    setUserData ({
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      isOnline: 0,
    });
  };

  return (
    <div className="center">
      <div className="auth">
        <h1>Register</h1>
        {error && <div className="auth__error">{error}</div>}
        <form onSubmit={register} name="registration_form">
          <input
            type="name"
            value={userData.userName}
            placeholder="Enter your username"
            required
            onChange={e =>
              setUserData ({...userData, userName: e.target.value})}
          />
          <input
            type="email"
            value={userData.email}
            placeholder="Enter your email"
            required
            onChange={e => setUserData ({...userData, email: e.target.value})}
          />

          <input
            type="password"
            value={userData.password}
            required
            placeholder="Enter your password"
            onChange={e =>
              setUserData ({...userData, password: e.target.value})}
          />

          <input
            type="password"
            value={userData.confirmPassword}
            required
            placeholder="Confirm password"
            onChange={e =>
              setUserData ({...userData, confirmPassword: e.target.value})}
          />

          <button type="submit">Register</button>
        </form>
        <span>
          Already have an account?
          <Link to="/login">login</Link>
        </span>
      </div>
    </div>
  );
}

export default Register;
