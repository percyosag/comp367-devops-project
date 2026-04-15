import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Returns an error string if validation fails, otherwise null.
function validate({ name, email, password, confirmPassword, role }) {
  if (!name.trim() || !email.trim() || !password || !confirmPassword || !role)
    return 'All fields are required.';
  if (!/\S+@\S+\.\S+/.test(email))
    return 'Enter a valid email address.';
  if (password.length < 6)
    return 'Password must be at least 6 characters.';
  if (password !== confirmPassword)
    return 'Passwords do not match.';
  return null;
}

// US1: New user registration form. Posts to /api/auth/register and redirects to login on success.
export default function Register() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'community_member',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate(fields);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name: fields.name.trim(),
        email: fields.email.trim().toLowerCase(),
        password: fields.password,
        role: fields.role,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <h2>Create Account</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={fields.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          required
        />
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
          placeholder="Min. 6 characters"
          required
        />
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={fields.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter password"
          required
        />
        <label htmlFor="role">I am a...</label>
        <select
          id="role"
          name="role"
          value={fields.role}
          onChange={handleChange}
          required
        >
          <option value="community_member">Community Member</option>
          <option value="organizer">Event Organizer</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
