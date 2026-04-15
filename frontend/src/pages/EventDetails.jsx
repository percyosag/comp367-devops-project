import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regMsg, setRegMsg] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch(() => setError('Failed to load event details.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRegister() {
    if (!token) { navigate('/login'); return; }
    setRegMsg('');
    setRegistering(true);
    try {
      const res = await axios.post(
        `${API_URL}/registrations`,
        { eventId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRegMsg(res.data.message);
      setRegSuccess(true);
      const updated = await axios.get(`${API_URL}/events/${id}`);
      setEvent(updated.data);
    } catch (err) {
      setRegMsg(err.response?.data?.message || 'Registration failed.');
      setRegSuccess(false);
    } finally {
      setRegistering(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <div className="form-container"><p className="error-msg">{error}</p></div>;
  if (!event) return <div className="form-container"><p>Event not found.</p></div>;

  const spotsLeft = event.spotsLeft ?? event.capacity;
  const isFull = spotsLeft <= 0;
  const isPast = new Date(event.date) < new Date().setHours(0, 0, 0, 0);

  return (
    <div className="form-container">
      <h2>{event.title}</h2>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> {event.time}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Description:</strong> {event.description}</p>
      <p>
        <strong>Capacity:</strong> {event.capacity} total —{' '}
        {isPast ? (
          <span style={{ color: '#718096' }}>Event has passed</span>
        ) : isFull ? (
          <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>Full (waitlist open)</span>
        ) : (
          <span style={{ color: '#276749' }}>{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining</span>
        )}
      </p>
      {event.organizer?.name && (
        <p><strong>Organizer:</strong> {event.organizer.name}</p>
      )}

      {regMsg && (
        <p className={regSuccess ? 'success-msg' : 'error-msg'}>{regMsg}</p>
      )}

      {user?.role === 'community_member' && !regSuccess && (
        isPast ? (
          <p className="error-msg">This event has already taken place.</p>
        ) : (
          <button onClick={handleRegister} disabled={registering}>
            {registering ? 'Processing...' : isFull ? 'Join Waitlist' : 'Register for Event'}
          </button>
        )
      )}

      {user?.role === 'organizer' && (
        <p style={{ color: '#718096' }}>Organizers cannot register for events.</p>
      )}

      {!user && (
        <p>
          Please{' '}
          <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/login')}>
            login
          </span>{' '}
          to register for this event.
        </p>
      )}

      <button onClick={() => navigate('/')} style={{ marginLeft: '10px', marginTop: '10px' }}>
        Back to Events
      </button>
    </div>
  );
}
