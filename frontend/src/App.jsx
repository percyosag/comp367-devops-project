import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import MyRegistrations from './pages/MyRegistrations';
import MyEvents from './pages/MyEvents';
import Profile from './pages/Profile';
import EditEvent from './pages/EditEvent';           
import ParticipantList from './pages/ParticipantList'; 
import AdminDashboard from './pages/AdminDashboard';   

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/my-registrations" element={<MyRegistrations />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/events/:id/edit" element={<EditEvent />} />               
        <Route path="/events/:id/participants" element={<ParticipantList />} /> 
        <Route path="/admin" element={<AdminDashboard />} />                    
      </Routes>
    </>
  );
}
