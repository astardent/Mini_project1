import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Function to initialize state from localStorage
  const getInitialAuthState = () => {
    const storedToken = localStorage.getItem('token');
    const storedUserString = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');

    if (storedToken && storedUserString && storedRole) {
      try {
        const storedUser = JSON.parse(storedUserString);
        return { token: storedToken, user: storedUser, role: storedRole };
      } catch (e) {
        console.error("AuthProvider: Failed to parse stored user data on init.", e);
        // Clear potentially corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      }
    }
    return { token: null, user: null, role: null };
  };

  const initialState = getInitialAuthState();
  const [user, setUser] = useState(initialState.user);
  const [role, setRole] = useState(initialState.role);
  const [token, setToken] = useState(initialState.token);
  const [loading, setLoading] = useState(true); // Still useful for initial async checks if you add them

  // Effect for initial load (already good)
  useEffect(() => {
    // This effect primarily sets loading to false after initial state setup.
    // The actual state is already initialized by getInitialAuthState.
    setLoading(false);
  }, []);

  // Effect to listen for storage changes from other tabs
  // AuthContext.jsx
// ...
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.storageArea === localStorage) {
        if (event.key === 'token' || event.key === 'user' || event.key === 'role') {
          console.log(`AuthProvider: localStorage key '${event.key}' changed. Old value: ${event.oldValue}, New value: ${event.newValue}`);

          const currentToken = localStorage.getItem('token');
          const currentUserStr = localStorage.getItem('user');
          const currentRole = localStorage.getItem('role');
          let currentUser = null;
          try {
            if (currentUserStr) currentUser = JSON.parse(currentUserStr);
          } catch (e) {
            console.error("Error parsing user from storage event", e);
            // Potentially clear corrupted storage here if needed
            localStorage.removeItem('user');
          }

          // Only update state if the values actually changed from what's currently in React state
          // This helps prevent loops if the event fires for a change we just made.
          if (currentToken !== token) {
            console.log("Updating token from storage event");
            setToken(currentToken);
          }
          // Deep comparison for user object is tricky, could compare stringified versions or specific IDs
          // For simplicity, if user string changes, update. A more robust check might be needed if user objects are complex.
          if (currentUserStr !== JSON.stringify(user)) { // Compare stringified user
             console.log("Updating user from storage event");
             setUser(currentUser);
          }
          if (currentRole !== role) {
            console.log("Updating role from storage event");
            setRole(currentRole);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token, user, role]); // Keep dependencies: if state changes, we want useEffect to re-run with new state in closure for comparisons
// ... // Add current auth state to deps to avoid stale closures if needed, though event handler is broad

  const login = useCallback(async (credentials, userRole) => {
    console.log("Attempting login with role:", userRole, "and credentials:", credentials);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
          role: userRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed and could not parse error response' }));
        throw new Error(errorData.error || `Login failed for ${userRole}`);
      }

      const data = await response.json();

      if (!data.token || !data.user) {
        throw new Error('Login response did not include token or user information.');
      }

      // These setItem calls will trigger the 'storage' event in other tabs
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);

      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role);

      return data.user;
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setToken(null);
      setUser(null);
      setRole(null);
      throw error;
    }
  }, []); // No dependencies needed for login as it sets state directly

  const register = useCallback(async (userData, userRole) => {
    let endpoint = '';
    if (userRole === 'student') endpoint = '/api/students/addstudent';
    else if (userRole === 'instructor') endpoint = '/api/instructors/addinstructor';
    else throw new Error('Invalid role for registration');

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
            throw new Error(errorData.error || 'Registration failed');
        }
        const data = await response.json();
        alert(`${userRole} registered successfully! Please log in.`);
        return data;
    } catch (error) {
        console.error("Registration error:", error);
        throw error; // Re-throw for the RegisterPage to catch
    }
  }, []);

  const logout = useCallback(() => {
    // These removeItem calls will trigger the 'storage' event in other tabs
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    setToken(null);
    setUser(null);
    setRole(null);
  }, []);

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout, register, loading, isLoggedIn: !!user && !!token }}>
      {children}
    </AuthContext.Provider>
  );
};