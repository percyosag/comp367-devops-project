import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ROLE_LABELS = {
  community_member: 'Community Member',
  organizer: 'Organizer',
  admin: 'Admin',
};


export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [filter, setFilter] = useState('all'); 

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (user?.role !== 'admin') { navigate('/'); return; }
    fetchUsers();
  }, [token]);

  function fetchUsers() {
    setLoading(true);
    axios
      .get(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUsers(res.data))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }

  async function handleDeactivate(userId, userName) {
    if (!window.confirm(`Deactivate account for "${userName}"? They will not be able to log in.`)) return;
    setActionMsg('');
    try {
      const res = await axios.patch(
        `${API_URL}/admin/users/${userId}/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg(res.data.message);
      fetchUsers();
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Action failed.');
    }
  }

  async function handleReactivate(userId, userName) {
    if (!window.confirm(`Reactivate account for "${userName}"?`)) return;
    setActionMsg('');
    try {
      const res = await axios.patch(
        `${API_URL}/admin/users/${userId}/reactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg(res.data.message);
      fetchUsers();
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Action failed.');
    }
  }

  async function handleDelete(userId, userName) {
    if (!window.confirm(`Permanently delete "${userName}" and all their data? This cannot be undone.`)) return;
    setActionMsg('');
    try {
      const res = await axios.delete(
        `${API_URL}/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg(res.data.message);
      fetchUsers();
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Action failed.');
    }
  }

  const filtered = users.filter((u) => {
    if (filter === 'active') return u.isActive;
    if (filter === 'inactive') return !u.isActive;
    return true;
  });

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="form-container" style={{ maxWidth: '900px' }}>
      <h2>Admin Dashboard — User Management</h2>
      {error && <p className="error-msg">{error}</p>}
      {actionMsg && <p className="success-msg">{actionMsg}</p>}

      {/* Summary counts */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Users', value: users.length, color: '#3182ce', bg: '#ebf8ff' },
          { label: 'Active', value: users.filter((u) => u.isActive).length, color: '#276749', bg: '#f0fff4' },
          { label: 'Deactivated', value: users.filter((u) => !u.isActive).length, color: '#c53030', bg: '#fff5f5' },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '8px', padding: '12px 20px', textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: s.color }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        {['all', 'active', 'inactive'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? '#3182ce' : '#e2e8f0',
              color: filter === f ? '#fff' : '#4a5568',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1F3864', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Name</th>
              <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Email</th>
              <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Role</th>
              <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Status</th>
              <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Joined</th>
              <th style={{ padding: '10px', border: '1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, index) => (
              <tr key={u._id} style={{ background: index % 2 === 0 ? '#fff' : '#f7fafc' }}>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{u.name}</td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{u.email}</td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{ROLE_LABELS[u.role] || u.role}</td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                    background: u.isActive ? '#f0fff4' : '#fff5f5',
                    color: u.isActive ? '#276749' : '#c53030',
                    border: `1px solid ${u.isActive ? '#9ae6b4' : '#feb2b2'}`,
                  }}>
                    {u.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                  {u._id !== user.id && u.role !== 'admin' ? (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {u.isActive ? (
                        <button
                          onClick={() => handleDeactivate(u._id, u.name)}
                          style={{ background: '#dd6b20', color: '#fff', padding: '4px 10px', fontSize: '0.8rem' }}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(u._id, u.name)}
                          style={{ background: '#276749', color: '#fff', padding: '4px 10px', fontSize: '0.8rem' }}
                        >
                          Reactivate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        style={{ background: '#e53e3e', color: '#fff', padding: '4px 10px', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
