import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');

    if (storedToken && storedUser && storedRole) {
      try {
        // Optional: You could add a quick token validation check here with the backend
        // or decode the token on the client to check expiry (though backend validation is king)
        // For now, we trust what's in localStorage if it exists.
        setUser(JSON.parse(storedUser));
        setRole(storedRole);
        setToken(storedToken);
      } catch (e) {
        // If JSON.parse fails, clear bad data
        console.error("Failed to parse stored user data:", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      }
    }
    setLoading(false);
  }, []); // Run only once on initial load

  const login = useCallback(async (credentials, userRole) => {
    console.log("Attempting login with role:", userRole, "and credentials:", credentials);
    try {
      const response = await fetch('/api/auth/login', { // Use the new backend login endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          name: credentials.name, // Send name if your backend login logic uses it
          role: userRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed and could not parse error response' }));
        throw new Error(errorData.error || `Login failed for ${userRole}`);
      }

      const data = await response.json(); // Expect { token, user: {id, name, email, role} }

      if (!data.token || !data.user) {
        throw new Error('Login response did not include token or user information.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role); // Role now comes from backend via token/user object

      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role);

      return data.user; // Return the user object
    } catch (error) {
      console.error("Login error:", error);
      // Clear any potentially partially set auth state on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setToken(null);
      setUser(null);
      setRole(null);
      throw error; // Re-throw for the LoginPage to catch
    }
  }, []);

  const register = async (userData, userRole) => {
    // Registration endpoint would be something like /api/students/addstudent or /api/instructors/addinstructor
    // It should now hash the password on the backend.
    // The frontend does not need to change much for register, assuming backend handles hashing.
    let endpoint = '';
    if (userRole === 'student') endpoint = '/api/students/addstudent';
    else if (userRole === 'instructor') endpoint = '/api/instructors/addinstructor';
    else throw new Error('Invalid role for registration');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData), // Send plain password, backend will hash
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(errorData.error || 'Registration failed');
    }
    const data = await response.json();
    alert(`${userRole} registered successfully! Please log in.`); // User needs to login separately
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    setRole(null);
    // Optional: Send a request to a backend /logout endpoint to invalidate token server-side if using a blacklist
  }, []);

  if (loading) {
    return <div>Loading authentication...</div>; // Or a spinner component
  }

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout, register, loading, isLoggedIn: !!user && !!token }}>
      {children}
    </AuthContext.Provider>
  );
};