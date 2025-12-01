import { useState, useEffect, useCallback } from 'react';

export const useUserAuth = (t) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Verificación silenciosa
  useEffect(() => {
    const verifyUserSilently = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.removeItem('userData');
        setUser(null);
        return;
      }

      try {
        const response = await fetch("https://localhost:4000/api/v1/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('userData', JSON.stringify(userData));
        } else if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setUser(null);
        }
      } catch (error) {
        console.error("Error verifying user:", error);
      }
    };

    verifyUserSilently();
  }, []);

  // Guardar cuando cambia el user
  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    }
  }, [user]);

  const handleLogout = useCallback((lang, setAnchorEl) => {
    setAnchorEl(null);

    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setUser(null);

      try {
        fetch('https://localhost:4000/api/v1/sign_out', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => { });
      } catch { }

      window.location.href = `/${lang}/login`;
    }, 150);
  }, []);

  return {
    user,
    setUser,
    handleLogout,
    isLoggedIn: !!user
  };
};