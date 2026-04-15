import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [fields, setFields] = useState({
    title: '', description: '', date: '', time: '', location: '', capacity: '',
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (user?.role !== 'organizer') { navigate('/'); return; }

    axios
      .get(`${API_URL}/events/${id}`)
      .then((res) => {
        const e = res.data;
        const dateFormatted = e.date.split('T')[0];
        setFields({
          title: e.title,
          description: e.description,
          date: dateFormatted,
          time: e.time,
          location: e.location,
          capacity: e.capacity,
        });
      })
      .catch(() => setError('Failed to load event data.'))
      .finally(() => setLoadingData(false));
  }, [id, token]);

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
    if (Number(capacity) < 1) {
      setError('Capacity must be at least 1.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/events/${id}`,
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
      setSuccessMsg('Event updated successfully!');
      setTimeout(() => navigate('/my-events'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingData) return <p>Loading event data...</p>;

  return (
    <div className="form-container">
      <h2>Edit Event</h2>
      {error && <p className="error-msg">{error}</p>}
      {successMsg && <p className="success-msg">{successMsg}</p>}
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" value={fields.title} onChange={handleChange} required />

        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" value={fields.description} onChange={handleChange} required />

        <label htmlFor="date">Date</label>
        <input id="date" name="date" type="date" value={fields.date} onChange={handleChange} required />

        <label htmlFor="time">Time</label>
        <input id="time" name="time" type="time" value={fields.time} onChange={handleChange} required />

        <label htmlFor="location">Location</label>
        <input id="location" name="location" type="text" value={fields.location} onChange={handleChange} required />

        <label htmlFor="capacity">Capacity</label>
        <input id="capacity" name="capacity" type="number" value={fields.capacity} onChange={handleChange} min="1" required />
        <p style={{ fontSize: '0.85rem', color: '#718096' }}>
          Note: Capacity cannot be reduced below the current number of confirmed registrations.
        </p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/my-events')} style={{ background: '#718096', color: '#fff' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
