import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_STYLES = {
  confirmed:  { color: '#276749', background: '#f0fff4', border: '1px solid #9ae6b4' },
  waitlisted: { color: '#975a16', background: '#fffff0', border: '1px solid #f6e05e' },
  cancelled:  { color: '#742a2a', background: '#fff5f5', border: '1px solid #feb2b2' },
};

export default function MyRegistrations() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchRegistrations();
  }, [token]);

  function fetchRegistrations() {
    setLoading(true);
    axios
      .get(`${API_URL}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRegistrations(res.data))
      .catch(() => setError('Failed to load registrations.'))
      .finally(() => setLoading(false));
  }

  async function handleCancel(registrationId) {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;

    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await axios.patch(
        `${API_URL}/registrations/${registrationId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg(res.data.message); 
      fetchRegistrations(); 
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to cancel registration.'
      ); 
    }
  }

  if (loading) return <p>Loading...</p>;

  const active = registrations.filter((r) => r.status !== 'cancelled');
  const cancelled = registrations.filter((r) => r.status === 'cancelled');

  return (
    <div className="form-container">
      <h2>My Registrations</h2>

      {error && <p className="error-msg">{error}</p>}

      {successMsg && <p className="success-msg">{successMsg}</p>}
      {errorMsg && <p className="error-msg">{errorMsg}</p>}

      {registrations.length === 0 ? (
        <p>You have not registered for any events yet.</p>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <h3 style={{ marginTop: '1rem' }}>Active</h3>
              <div className="event-list">
                {active.map((reg) => (
                  <div key={reg._id} className="event-card">
                    <h3>{reg.event?.title || 'Event'}</h3>

                    <p>
                      <strong>Date:</strong>{' '}
                      {reg.event?.date
                        ? new Date(reg.event.date).toLocaleDateString()
                        : 'N/A'}
                    </p>

                    <p>
                      <strong>Time:</strong> {reg.event?.time || 'N/A'}
                    </p>

                    <p>
                      <strong>Location:</strong>{' '}
                      {reg.event?.location || 'N/A'}
                    </p>

                    <p>
                      <strong>Registered on:</strong>{' '}
                      {new Date(reg.registrationDate).toLocaleDateString()}
                    </p>

                    <p>
                      <strong>Status: </strong>
                      <span
                        style={{
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                          ...STATUS_STYLES[reg.status],
                        }}
                      >
                        {reg.status}
                      </span>
                    </p>

                    {reg.status === 'waitlisted' && (
                      <p style={{ fontSize: '0.85rem', color: '#975a16' }}>
                        You are on the waitlist. You will be automatically
                        confirmed if a spot opens up.
                      </p>
                    )}

                    <button
                      onClick={() => handleCancel(reg._id)}
                      style={{
                        background: '#e53e3e',
                        color: '#fff',
                        marginTop: '8px',
                      }}
                    >
                      Cancel Registration
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {cancelled.length > 0 && (
            <>
              <h3 style={{ marginTop: '1.5rem', color: '#718096' }}>
                Cancelled
              </h3>

              <div className="event-list">
                {cancelled.map((reg) => (
                  <div
                    key={reg._id}
                    className="event-card"
                    style={{ opacity: 0.6 }}
                  >
                    <h3>{reg.event?.title || 'Event'}</h3>

                    <p>
                      <strong>Date:</strong>{' '}
                      {reg.event?.date
                        ? new Date(reg.event.date).toLocaleDateString()
                        : 'N/A'}
                    </p>

                    <p>
                      <strong>Status: </strong>
                      <span
                        style={{
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          ...STATUS_STYLES.cancelled,
                        }}
                      >
                        Cancelled
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <button
        onClick={() => navigate('/')}
        style={{ marginTop: '1rem' }}
      >
        Browse More Events
      </button>
    </div>
  );
}
