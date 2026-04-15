import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`${API_URL}/events`)
      .then((res) => setEvents(res.data))
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="form-container">
      <h2>Upcoming Events</h2>

      {error && <p className="error-msg">{error}</p>}

      {events.length === 0 ? (
        <p>No events available yet.</p>
      ) : (
        <div className="event-list">
          {events.map((event) => {
            const spotsLeft = event.spotsLeft ?? event.capacity;
            const isFull = spotsLeft <= 0;

            return (
              <div key={event._id} className="event-card">
                <h3>{event.title}</h3>
                <p>
                  <strong>Date:</strong> {event.date?.split('T')[0]}
                </p>

                <p>
                  <strong>Time:</strong> {event.time}
                </p>

                <p>
                  <strong>Location:</strong> {event.location}
                </p>

                <p>
                  <strong>Availability:</strong>{' '}
                  {isFull ? (
                    <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>
                      Full — Waitlist Available
                    </span>
                  ) : (
                    <span style={{ color: '#276749' }}>
                      {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                    </span>
                  )}
                </p>

                <Link to={`/events/${event._id}`}>View Details</Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
