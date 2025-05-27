// frontend/src/components/auth/LoginPage.jsx
import React, { useState, useContext, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleFromForm, setRoleFromForm] = useState('student'); // Renamed for clarity
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // To prevent multiple submits

  const { login, isLoggedIn, role: authRole } = useContext(AuthContext); // Get isLoggedIn and authRole
  const navigate = useNavigate();

  // Effect to navigate AFTER AuthContext state is updated
  useEffect(() => {
    if (isLoggedIn) { // Check if login was successful and state is updated
      console.log('[LoginPage useEffect] Logged in. AuthContext Role:', authRole);
      if (authRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (authRole === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else if (authRole === 'instructor') {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true }); // Fallback
      }
    }
  }, [isLoggedIn, authRole, navigate]); // Depend on isLoggedIn and authRole

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      // 'login' function will update AuthContext state (isLoggedIn, authRole)
      await login({ name, email, password }, roleFromForm);
      // Navigation will now be handled by the useEffect above
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials and role.');
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Role:</label>
          <select value={roleFromForm} onChange={(e) => setRoleFromForm(e.target.value)}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option> {/* Ensure Admin option is here */}
          </select>
        </div>
        {/* Conditionally show Name input if not admin */}
        {(roleFromForm === 'student' || roleFromForm === 'instructor') && (
          <div className="form-group">
            <label>Username/Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={(roleFromForm === 'student' || roleFromForm === 'instructor')}
            />
          </div>
        )}
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
export default LoginPage;