import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_STYLES = {
  confirmed:  { color: '#276749', background: '#f0fff4', border: '1px solid #9ae6b4' },
  waitlisted: { color: '#975a16', background: '#fffff0', border: '1px solid #f6e05e' },
  cancelled:  { color: '#742a2a', background: '#fff5f5', border: '1px solid #feb2b2' },
};

export default function ParticipantList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [participants, setParticipants] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (user?.role !== 'organizer' && user?.role !== 'admin') { navigate('/'); return; }

    Promise.all([
      axios.get(`${API_URL}/events/${id}`),
      axios.get(`${API_URL}/registrations/event/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([eventRes, regRes]) => {
        setEventTitle(eventRes.data.title);
        setParticipants(regRes.data);
      })
      .catch(() => setError('Failed to load participant data.'))
      .finally(() => setLoading(false));
  }, [id, token]);

  function handleExport() {
    axios
      .get(`${API_URL}/registrations/event/${id}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `participants-${id}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(() => alert('Failed to export participant list.'));
  }

  const confirmed = participants.filter((p) => p.status === 'confirmed');
  const waitlisted = participants.filter((p) => p.status === 'waitlisted');

  if (loading) return <p>Loading participants...</p>;

  return (
    <div className="form-container">
      <h2>Participants — {eventTitle}</h2>
      {error && <p className="error-msg">{error}</p>}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '8px', padding: '12px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#276749' }}>{confirmed.length}</div>
          <div style={{ fontSize: '0.85rem', color: '#276749' }}>Confirmed</div>
        </div>
        <div style={{ background: '#fffff0', border: '1px solid #f6e05e', borderRadius: '8px', padding: '12px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#975a16' }}>{waitlisted.length}</div>
          <div style={{ fontSize: '0.85rem', color: '#975a16' }}>Waitlisted</div>
        </div>
      </div>

      {participants.length > 0 && (
        <button onClick={handleExport} style={{ background: '#276749', color: '#fff', marginBottom: '1rem' }}>
          Export as CSV
        </button>
      )}

      {participants.length === 0 ? (
        <p>No registrations yet for this event.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
          <thead>
            <tr style={{ background: '#edf2f7', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>#</th>
              <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Name</th>
              <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Email</th>
              <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Status</th>
              <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Registered On</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, index) => (
              <tr key={p._id} style={{ background: index % 2 === 0 ? '#fff' : '#f7fafc' }}>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{index + 1}</td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{p.user?.name || 'N/A'}</td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{p.user?.email || 'N/A'}</td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: '12px',
                    fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'capitalize',
                    ...STATUS_STYLES[p.status],
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                  {new Date(p.registrationDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={() => navigate('/my-events')} style={{ marginTop: '1.5rem' }}>
        Back to My Events
      </button>
    </div>
  );
}
