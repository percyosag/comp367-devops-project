import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [fields, setFields] = useState({
    title: '', description: '', date: '', time: '', location: '', capacity: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) navigate('/login');
    if (user && user.role !== 'organizer') navigate('/');
  }, [token, user, navigate]);

  const today = new Date().toISOString().split('T')[0];

  function handleChange(e) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { title, description, date, time, location, capacity } = fields;

    if (!title.trim() || !description.trim() || !date || !time || !location.trim() || !capacity) {
      setError('All fields are required.');
      return;
    }
    if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
      setError('Event date cannot be in the past.');
      return;
    }
    if (Number(capacity) < 1) {
      setError('Capacity must be at least 1.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/events`,
        {
          title: title.trim(),
          description: description.trim(),
          date,
          time,
          location: location.trim(),
          capacity: Number(capacity),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/my-events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <h2>Create Event</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" value={fields.title} onChange={handleChange} placeholder="Event title" required />

        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" value={fields.description} onChange={handleChange} placeholder="Event description" required />

        <label htmlFor="date">Date</label>
        <input id="date" name="date" type="date" value={fields.date} onChange={handleChange} min={today} required />

        <label htmlFor="time">Time</label>
        <input id="time" name="time" type="time" value={fields.time} onChange={handleChange} required />

        <label htmlFor="location">Location</label>
        <input id="location" name="location" type="text" value={fields.location} onChange={handleChange} placeholder="Event location" required />

        <label htmlFor="capacity">Capacity</label>
        <input id="capacity" name="capacity" type="number" value={fields.capacity} onChange={handleChange} placeholder="Max attendees" min="1" required />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
