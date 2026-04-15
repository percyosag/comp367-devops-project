import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MyEvents() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'organizer') {
      navigate('/');
      return;
    }
    fetchEvents();
  }, [token]);

  function fetchEvents() {
    setLoading(true);
    axios
      .get(`${API_URL}/events/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEvents(res.data))
      .catch(() => setError('Failed to load your events.'))
      .finally(() => setLoading(false));
  }

  async function handleDelete(eventId, eventTitle) {
    if (!window.confirm(`Delete "${eventTitle}"? This will also remove all registrations for this event.`)) return;

    setDeleteMsg('');

    try {
      await axios.delete(`${API_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDeleteMsg(`"${eventTitle}" has been deleted.`);
      fetchEvents();
    } catch (err) {
      setDeleteMsg(err.response?.data?.message || 'Failed to delete event.');
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="form-container">
      <h2>My Events</h2>

      {error && <p className="error-msg">{error}</p>}
      {deleteMsg && <p className="success-msg">{deleteMsg}</p>}

      {events.length === 0 ? (
        <p>You have not created any events yet.</p>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <div key={event._id} className="event-card">
              <h3>{event.title}</h3>

              {/* ✅ FIXED DATE FORMAT */}
              <p>
                <strong>Date:</strong> {event.date?.split('T')[0]}
              </p>

              <p>
                <strong>Time:</strong> {event.time}</p>

              <p>
                <strong>Location:</strong> {event.location}</p>

              <p>
                <strong>Capacity:</strong> {event.capacity}</p>

              <p>
                <strong>Description:</strong> {event.description}</p>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '10px',
                  flexWrap: 'wrap',
                  alignItems: 'flex-end',
                }}
              >
                <Link
                  to={`/events/${event._id}/participants`}
                  style={{ textDecoration: 'none', display: 'flex' }}
                >
                  <button
                    style={{
                      background: '#3182ce',
                      color: '#fff',
                      padding: '10px 16px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      flex: '0 0 auto',
                    }}
                  >
                    View Participants
                  </button>
                </Link>

                <Link
                  to={`/events/${event._id}/edit`}
                  style={{ textDecoration: 'none', display: 'flex' }}
                >
                  <button
                    style={{
                      background: '#d69e2e',
                      color: '#fff',
                      padding: '10px 16px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      flex: '0 0 auto',
                    }}
                  >
                    Edit Event
                  </button>
                </Link>

                <button
                  onClick={() => handleDelete(event._id, event.title)}
                  style={{
                    background: '#e53e3e',
                    color: '#fff',
                    padding: '10px 16px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    flex: '0 0 auto',
                  }}
                >
                  Delete Event
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate('/create-event')} style={{ marginTop: '1rem' }}>
        Create New Event
      </button>
    </div>
  );
}
