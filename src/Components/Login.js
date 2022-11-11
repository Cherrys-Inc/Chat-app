import {useState} from 'react';
import {Link} from 'react-router-dom';
import './forms.css';
import {signInWithEmailAndPassword, EmailAuthProvider} from 'firebase/auth';
import {auth} from '../firebase';
import {useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {setUser} from '../features/userSlice';
import axios from 'axios';

function Login () {
  const [userData, setUserData] = useState ({
    email: '',
    password: '',
  });
  const [error, setError] = useState ('');
  const navigate = useNavigate ();
  const dispatch = useDispatch ();
  const login = e => {
    e.preventDefault ();
    signInWithEmailAndPassword (auth, userData.email, userData.password)
      .then (result => {
        const user = result.user;
        localStorage.setItem (
          'user',
          JSON.stringify ({
            email: userData.email,
            uid: user.uid
          })
        );
        axios.post ('https://localhost:5000/status', userData.email);
        dispatch (setUser (localStorage.getItem ('user')));
        navigate ('/profile');
      })
      .catch (err => setError (err.message));
  };

  return (
    <div className="center">
      <div className="auth">
        <h1>Log in</h1>
        {error && <div className="auth__error">{error}</div>}
        <form onSubmit={login} name="login_form">
          <input
            type="email"
            value={userData.email}
            required
            placeholder="Enter your email"
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

          <button type="submit">Login</button>
        </form>
        <p>
          Don't have and account?
          <Link to="/register">Create one here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
