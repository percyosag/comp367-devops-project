import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [token]);

  function fetchNotifications() {
    setLoading(true);
    axios
      .get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNotifications(res.data))
      .catch(() => setError('Failed to load notifications.'))
      .finally(() => setLoading(false));
  }

  async function handleMarkRead(notificationId) {
    setActionMsg('');
    if (!notificationId || typeof notificationId !== 'string') return;
    try {
      await axios.patch(
        `${API_URL}/notifications/${encodeURIComponent(notificationId)}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch {
      setActionMsg('Failed to mark notification as read.');
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="form-container">
      <h2>Notifications</h2>

      {error && <p className="error-msg">{error}</p>}
      {actionMsg && <p className="error-msg">{actionMsg}</p>}

      {notifications.length === 0 ? (
        <p>You have no notifications.</p>
      ) : (
        <div className="event-list">
          {notifications.map((n) => (
            <div
              key={n._id}
              className="event-card"
              style={{ opacity: n.read ? 0.6 : 1 }}
            >
              <h3>{n.title}</h3>
              <p>{n.message}</p>
              <p style={{ fontSize: '0.85rem', color: '#718096' }}>
                {new Date(n.createdAt).toLocaleString()}
              </p>
              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n._id)}
                  style={{ marginTop: '8px' }}
                >
                  Mark as Read
                </button>
              )}
              {n.read && (
                <p style={{ fontSize: '0.85rem', color: '#276749', marginTop: '8px' }}>
                  Read
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
