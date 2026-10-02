import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Navbar on top, the current page below it.
function DashboardLayout() {
  return (
    <div>
      <Navbar />
      <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;