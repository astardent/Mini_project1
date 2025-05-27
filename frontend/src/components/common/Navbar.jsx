import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { isLoggedIn, user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          OASMES
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink to="/" className="nav-link" end>
              Home
            </NavLink>
          </li>
          {isLoggedIn ? (
            <>
              {role === 'student' && (
                <li className="nav-item">
                  <NavLink to="/student/dashboard" className="nav-link">
                    Student Dashboard
                  </NavLink>
                </li>
              )}
              {role === 'instructor' && (
                <li className="nav-item">
                  <NavLink to="/instructor/dashboard" className="nav-link">
                    Instructor Dashboard
                  </NavLink>
                </li>
              )}
              {role === 'admin' && (
                <li className="nav-item">
                  <NavLink to="/admin/dashboard" className="nav-link">
                    Admin Dashboard
                  </NavLink>
                </li>
              )}
              <li className="nav-item">
                <span style={{padding: '8px 12px', color: '#ddd'}}>Welcome, {user?.name || user?.coursename || user?.email}</span>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <NavLink to="/login" className="nav-link">
                  Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/register" className="nav-link">
                  Register
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;