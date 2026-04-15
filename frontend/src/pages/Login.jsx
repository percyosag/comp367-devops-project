import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

// US2: Login form. Posts credentials to /api/auth/login, stores token via AuthContext, redirects home.
export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [fields, setFields] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fields.email.trim() || !fields.password) {
      setError('Email and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: fields.email.trim().toLowerCase(),
        password: fields.password,
      });
      // Store user and token in context, then go to home page.
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <h2>Log In</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={fields.email}
          onChange={handleChange}
          placeholder="jane@example.com"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={fields.password}
          onChange={handleChange}
          placeholder="Your password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <p>
        No account yet? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
