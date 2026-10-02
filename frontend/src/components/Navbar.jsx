import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homePathForRole } from '../utils/roles';

const HOME_LABEL = {
  ADMIN: 'Dashboard',
  USER: 'Stores',
  STORE_OWNER: 'Dashboard',
};

const linkStyle = ({ isActive }) => ({
  color: 'white',
  textDecoration: 'none',
  padding: '6px 10px',
  borderRadius: 4,
  background: isActive ? 'rgba(255,255,255,0.25)' : 'transparent',
});

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        padding: '10px 20px',
        background: '#1f3864',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <strong style={{ marginRight: 16 }}>Roxiler Rating App</strong>

      <NavLink to={homePathForRole(user.role)} end style={linkStyle}>
        {HOME_LABEL[user.role]}
      </NavLink>

      {user.role === 'ADMIN' && (
        <>
          <NavLink to="/admin/users" end style={linkStyle}>
            Users
          </NavLink>
          <NavLink to="/admin/stores" end style={linkStyle}>
            Stores
          </NavLink>
          <NavLink to="/admin/add-user" style={linkStyle}>
            Add User
          </NavLink>
          <NavLink to="/admin/add-store" style={linkStyle}>
            Add Store
          </NavLink>
        </>
      )}

      <NavLink to="/change-password" style={linkStyle}>
        Change Password
      </NavLink>

      <span style={{ marginLeft: 'auto', fontSize: 14 }}>
        {user.name} ({user.role})
      </span>
      <button onClick={handleLogout} style={{ padding: '6px 12px' }}>
        Logout
      </button>
    </nav>
  );
}

export default Navbar;