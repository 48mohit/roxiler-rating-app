import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ChangePassword from './pages/auth/ChangePassword';
import Stores from './pages/user/Stores';
import OwnerDashboard from './pages/owner/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import UserDetails from './pages/admin/UserDetails';
import AdminStores from './pages/admin/Stores';
import AddUser from './pages/admin/AddUser';
import AddStore from './pages/admin/AddStore';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import { ROLES } from './utils/roles';

const ALL_ROLES = [ROLES.ADMIN, ROLES.USER, ROLES.STORE_OWNER];

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Every page inside here needs login and shows the navbar */}
      <Route
        element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminStores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-user"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-store"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AddStore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores"
          element={
            <ProtectedRoute allowedRoles={[ROLES.USER]}>
              <Stores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STORE_OWNER]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;