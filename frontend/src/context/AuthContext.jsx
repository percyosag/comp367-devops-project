import { createContext, useState } from 'react';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  function login(userData, jwt) {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwt);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
