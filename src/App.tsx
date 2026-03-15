import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Tickets from './pages/Tickets';
import Tracking from './pages/Tracking';
import Employees from './pages/Employees';
import AbsensiList from './pages/AbsensiList';
import Shifts from './pages/Shifts';
import Timesheet from './pages/Timesheet';
import Placeholder from './pages/Placeholder';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (data: any) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('dashboard');
  };

  if (loading) return null;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'attendance': return <Attendance />;
      case 'tickets': return <Tickets />;
      case 'tracking': return <Tracking />;
      case 'employees': return <Employees />;
      case 'shifts': return <Shifts />;
      case 'absensi_list': return <AbsensiList />;
      case 'timesheet': return <Timesheet />;
      case 'calendar': return <Placeholder title="Google Calendar" />;
      case 'survey': return <Placeholder title="Survey" />;
      case 'serah_terima': return <Placeholder title="Serah Terima" />;
      case 'arsip': return <Placeholder title="Arsip Surat Menyurat" />;
      case 'lead': return <Placeholder title="Lead Management" />;
      case 'proyek': return <Placeholder title="Proyek" />;
      case 'katalog': return <Placeholder title="Katalog Listing" />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}
