import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const roleLabel =
    user.role === 'organizer'
      ? 'Event Organizer'
      : user.role === 'admin'
      ? 'Administrator'
      : 'Community Member';

  return (
    <div className="form-container">
      <h2>My Profile</h2>
      <div style={{ marginTop: '16px' }}>
        <p><strong>Full Name:</strong> {user.name}</p>
        <p style={{ marginTop: '10px' }}><strong>Email:</strong> {user.email}</p>
        <p style={{ marginTop: '10px' }}><strong>Role:</strong> {roleLabel}</p>
      </div>
    </div>
  );
}
