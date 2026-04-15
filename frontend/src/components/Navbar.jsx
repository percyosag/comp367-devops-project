import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">Event Platform</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {user ? (
          <>
            {user.role === 'organizer' && (
              <>
                <Link to="/create-event">Create Event</Link>
                <Link to="/my-events">My Events</Link>
              </>
            )}
            {user.role === 'community_member' && (
              <Link to="/my-registrations">My Registrations</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin">Admin</Link>
            )}
            <Link to="/profile">Profile</Link>
            <span className="nav-user">Hi, {user.name}</span>
            <button onClick={handleLogout} className="nav-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
